import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth.js'
import { sosLimiter } from '../middleware/rateLimiter.js'
import { createEmergencyEvent, resolveEmergencyEvent, getEmergencyEvent, getEmergencyEventNotifications } from '../services/emergency.js'
import { AppError } from '../middleware/errorHandler.js'
import { logger } from '../services/logger.js'

const router = Router()

const emergencySchema = z.object({
  activationMethod: z.enum(['hold-button', 'triple-tap', 'voice', 'gesture']),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

router.post('/activate', authMiddleware, sosLimiter, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized')
    }

    const body = emergencySchema.parse(req.body)

    const event = await createEmergencyEvent(
      req.user.userId,
      body.activationMethod,
      body.latitude,
      body.longitude
    )

    logger.info({ userId: req.user.userId, eventId: event.id }, 'Emergency activated')

    res.status(201).json({
      success: true,
      data: event,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.errors })
    }
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    logger.error(err, 'Emergency activation error')
    res.status(500).json({ error: 'Emergency activation failed' })
  }
})

router.get('/:eventId', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized')
    }

    const event = await getEmergencyEvent(req.params.eventId)
    if (!event) {
      throw new AppError(404, 'Emergency event not found')
    }

    if (event.userId !== req.user.userId) {
      throw new AppError(403, 'Forbidden')
    }

    const notifications = await getEmergencyEventNotifications(event.id)

    res.json({
      success: true,
      data: {
        ...event,
        notifications,
      },
    })
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    logger.error(err, 'Get emergency event error')
    res.status(500).json({ error: 'Failed to fetch emergency event' })
  }
})

router.post('/:eventId/resolve', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized')
    }

    const event = await getEmergencyEvent(req.params.eventId)
    if (!event) {
      throw new AppError(404, 'Emergency event not found')
    }

    if (event.userId !== req.user.userId) {
      throw new AppError(403, 'Forbidden')
    }

    await resolveEmergencyEvent(event.id)

    logger.info({ userId: req.user.userId, eventId: event.id }, 'Emergency resolved')

    res.json({
      success: true,
      message: 'Emergency event resolved',
    })
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    logger.error(err, 'Resolve emergency error')
    res.status(500).json({ error: 'Failed to resolve emergency' })
  }
})

export default router
