import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth.js'
import { analyzeRouteSafety, getRouteAnalysis } from '../services/routeSafety.js'
import { db } from '../db/init.js'
import { v4 as uuidv4 } from 'uuid'
import { AppError } from '../middleware/errorHandler.js'
import { logger } from '../services/logger.js'

const router = Router()

const routeSchema = z.object({
  journeyId: z.string().optional(),
  origin: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  destination: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  distance: z.number(),
  duration: z.number(),
})

router.post('/analyze', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized')
    }

    const body = routeSchema.parse(req.body)

    const routeId = uuidv4()
    const now = new Date().toISOString()

    // Store route
    await db.run(
      `INSERT INTO routes (id, journey_id, user_id, origin, destination, distance, duration, provider, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        routeId,
        body.journeyId || null,
        req.user.userId,
        JSON.stringify(body.origin),
        JSON.stringify(body.destination),
        body.distance,
        body.duration,
        'user-provided',
        now,
      ]
    )

    // Analyze route safety
    const analysis = await analyzeRouteSafety(
      routeId,
      body.origin,
      body.destination,
      body.distance,
      body.duration
    )

    logger.info({ userId: req.user.userId, routeId }, 'Route analyzed')

    res.status(201).json({
      success: true,
      data: {
        routeId,
        origin: body.origin,
        destination: body.destination,
        distance: body.distance,
        duration: body.duration,
        analysis,
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.errors })
    }
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    logger.error(err, 'Route analysis error')
    res.status(500).json({ error: 'Failed to analyze route' })
  }
})

router.get('/:routeId', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized')
    }

    const analysis = await getRouteAnalysis(req.params.routeId)
    if (!analysis) {
      throw new AppError(404, 'Route analysis not found')
    }

    res.json({
      success: true,
      data: analysis,
    })
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    logger.error(err, 'Get route analysis error')
    res.status(500).json({ error: 'Failed to fetch route analysis' })
  }
})

export default router
