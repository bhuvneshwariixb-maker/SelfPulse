import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth.js'
import { db } from '../db/init.js'
import { AppError } from '../middleware/errorHandler.js'
import { logger } from '../services/logger.js'

const router = Router()

const querySchema = z.object({
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  radius: z.coerce.number().optional().default(5),
  types: z.string().optional(),
})

router.get('/nearby', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized')
    }

    const query = querySchema.parse(req.query)

    // Simple distance-based query (Haversine formula approximation)
    // In production, use PostGIS or similar for true spatial queries
    const radiusInDegrees = query.radius / 111 // Rough conversion: 1 degree ≈ 111 km

    const safetyPoints = await db.all(
      `SELECT id, type, name, latitude, longitude, address, phone, availability, status
       FROM safety_points
       WHERE latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?
       LIMIT 20`,
      [
        query.latitude - radiusInDegrees,
        query.latitude + radiusInDegrees,
        query.longitude - radiusInDegrees,
        query.longitude + radiusInDegrees,
      ]
    )

    const protectors = await db.all(
      `SELECT id, name, type, area, availability, response_time, verified, contact_info
       FROM protectors
       WHERE status = 'active'
       ORDER BY verified DESC
       LIMIT 10`
    )

    const communityReports = await db.all(
      `SELECT id, latitude, longitude, category, description, severity, created_at
       FROM community_reports
       WHERE status = 'verified' AND verified = 1
       AND latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [
        query.latitude - radiusInDegrees,
        query.latitude + radiusInDegrees,
        query.longitude - radiusInDegrees,
        query.longitude + radiusInDegrees,
      ]
    )

    logger.info({ userId: req.user.userId, lat: query.latitude, lng: query.longitude }, 'Safety map queried')

    res.json({
      success: true,
      data: {
        safetyPoints,
        protectors,
        communityReports,
        query: {
          latitude: query.latitude,
          longitude: query.longitude,
          radius: query.radius,
        },
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.errors })
    }
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    logger.error(err, 'Safety map query error')
    res.status(500).json({ error: 'Failed to fetch safety map data' })
  }
})

export default router
