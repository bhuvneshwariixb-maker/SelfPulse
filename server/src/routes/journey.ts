import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth.js'
import { startJourney, endJourney, getJourney, addJourneyLocation, getRecentJourneyLocations, getUserActiveJourney } from '../services/journey.js'
import { AppError } from '../middleware/errorHandler.js'
import { logger } from '../services/logger.js'

const router = Router()

const startJourneySchema = z.object({
  origin: z.string().min(1),
  destination: z.string().min(1),
})

const addLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional(),
})

router.post('/start', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized')
    }

    const body = startJourneySchema.parse(req.body)
    const journey = await startJourney(req.user.userId, body.origin, body.destination)

    logger.info({ userId: req.user.userId, journeyId: journey.id }, 'Journey started')

    res.status(201).json({
      success: true,
      data: journey,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.errors })
    }
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    logger.error(err, 'Start journey error')
    res.status(500).json({ error: 'Failed to start journey' })
  }
})

router.get('/active', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized')
    }

    const journey = await getUserActiveJourney(req.user.userId)
    res.json({
      success: true,
      data: journey,
    })
  } catch (err) {
    logger.error(err, 'Get active journey error')
    res.status(500).json({ error: 'Failed to fetch active journey' })
  }
})

router.get('/:journeyId', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized')
    }

    const journey = await getJourney(req.params.journeyId)
    if (!journey) {
      throw new AppError(404, 'Journey not found')
    }

    if (journey.userId !== req.user.userId) {
      throw new AppError(403, 'Forbidden')
    }

    const locations = await getRecentJourneyLocations(journey.id, 100)

    res.json({
      success: true,
      data: {
        ...journey,
        locations,
      },
    })
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    logger.error(err, 'Get journey error')
    res.status(500).json({ error: 'Failed to fetch journey' })
  }
})

router.post('/:journeyId/location', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized')
    }

    const journey = await getJourney(req.params.journeyId)
    if (!journey) {
      throw new AppError(404, 'Journey not found')
    }

    if (journey.userId !== req.user.userId) {
      throw new AppError(403, 'Forbidden')
    }

    const body = addLocationSchema.parse(req.body)
    const location = await addJourneyLocation(
      req.params.journeyId,
      body.latitude,
      body.longitude,
      body.accuracy || 0
    )

    res.status(201).json({
      success: true,
      data: location,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.errors })
    }
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    logger.error(err, 'Add location error')
    res.status(500).json({ error: 'Failed to add location' })
  }
})

router.post('/:journeyId/end', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized')
    }

    const journey = await getJourney(req.params.journeyId)
    if (!journey) {
      throw new AppError(404, 'Journey not found')
    }

    if (journey.userId !== req.user.userId) {
      throw new AppError(403, 'Forbidden')
    }

    await endJourney(req.params.journeyId)

    logger.info({ userId: req.user.userId, journeyId: req.params.journeyId }, 'Journey ended')

    res.json({
      success: true,
      message: 'Journey ended',
    })
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    logger.error(err, 'End journey error')
    res.status(500).json({ error: 'Failed to end journey' })
  }
})

export default router
