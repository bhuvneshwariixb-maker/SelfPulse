import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth.js'
import { db } from '../db/init.js'
import { v4 as uuidv4 } from 'uuid'
import { AppError } from '../middleware/errorHandler.js'
import { logger } from '../services/logger.js'

const router = Router()

const reportSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  category: z.enum(['harassment', 'theft', 'assault', 'suspicious-activity', 'road-hazard', 'other']),
  description: z.string().max(500),
  severity: z.enum(['low', 'medium', 'high']).optional().default('medium'),
})

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized')
    }

    const body = reportSchema.parse(req.body)
    const reportId = uuidv4()
    const now = new Date().toISOString()

    // Validate location
    if (Math.abs(body.latitude) > 90 || Math.abs(body.longitude) > 180) {
      throw new AppError(400, 'Invalid coordinates')
    }

    await db.run(
      `INSERT INTO community_reports (id, user_id, latitude, longitude, category, description, severity, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reportId, req.user.userId, body.latitude, body.longitude, body.category, body.description, body.severity, 'pending', now]
    )

    logger.info({ userId: req.user.userId, reportId, category: body.category }, 'Community report created')

    res.status(201).json({
      success: true,
      data: {
        id: reportId,
        userId: req.user.userId,
        latitude: body.latitude,
        longitude: body.longitude,
        category: body.category,
        description: body.description,
        severity: body.severity,
        status: 'pending',
        createdAt: now,
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.errors })
    }
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    logger.error(err, 'Create community report error')
    res.status(500).json({ error: 'Failed to create report' })
  }
})

router.get('/nearby', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized')
    }

    const { latitude, longitude, radius = 5 } = req.query

    if (!latitude || !longitude) {
      throw new AppError(400, 'latitude and longitude required')
    }

    const lat = parseFloat(String(latitude))
    const lng = parseFloat(String(longitude))
    const rad = parseInt(String(radius))

    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
      throw new AppError(400, 'Invalid query parameters')
    }

    const radiusInDegrees = rad / 111 // Rough approximation

    const reports = await db.all(
      `SELECT id, user_id, latitude, longitude, category, description, severity, status, created_at
       FROM community_reports
       WHERE status = 'verified' AND verified = 1
       AND latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?
       ORDER BY created_at DESC
       LIMIT 20`,
      [
        lat - radiusInDegrees,
        lat + radiusInDegrees,
        lng - radiusInDegrees,
        lng + radiusInDegrees,
      ]
    )

    logger.info({ userId: req.user.userId, lat, lng }, 'Nearby reports fetched')

    res.json({
      success: true,
      data: (reports || []).map(r => ({
        id: r.id,
        userId: r.user_id,
        latitude: r.latitude,
        longitude: r.longitude,
        category: r.category,
        description: r.description,
        severity: r.severity,
        status: r.status,
        createdAt: r.created_at,
      })),
    })
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    logger.error(err, 'Get nearby reports error')
    res.status(500).json({ error: 'Failed to fetch reports' })
  }
})

export default router
