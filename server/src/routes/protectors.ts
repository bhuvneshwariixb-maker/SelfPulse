import { Router, Request, Response } from 'express'
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js'
import { db } from '../db/init.js'
import { AppError } from '../middleware/errorHandler.js'
import { logger } from '../services/logger.js'

const router = Router()

router.get('/', optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const protectors = await db.all(
      `SELECT id, name, type, area, availability, response_time, verified, contact_info
       FROM protectors WHERE status = 'active' ORDER BY verified DESC, name ASC`
    )

    if (req.user) {
      logger.info({ userId: req.user.userId }, 'Protectors list fetched')
    }

    res.json({
      success: true,
      data: (protectors || []).map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        area: p.area,
        availability: p.availability,
        responseTime: p.response_time,
        verified: Boolean(p.verified),
        contactInfo: p.contact_info,
      })),
    })
  } catch (err) {
    logger.error(err, 'Get protectors error')
    res.status(500).json({ error: 'Failed to fetch protectors' })
  }
})

router.get('/:protectorId', optionalAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const protector = await db.get(
      `SELECT id, name, type, area, latitude, longitude, availability, response_time, verified, contact_info
       FROM protectors WHERE id = ? AND status = 'active'`,
      [req.params.protectorId]
    )

    if (!protector) {
      throw new AppError(404, 'Protector not found')
    }

    res.json({
      success: true,
      data: {
        id: protector.id,
        name: protector.name,
        type: protector.type,
        area: protector.area,
        latitude: protector.latitude,
        longitude: protector.longitude,
        availability: protector.availability,
        responseTime: protector.response_time,
        verified: Boolean(protector.verified),
        contactInfo: protector.contact_info,
      },
    })
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    logger.error(err, 'Get protector error')
    res.status(500).json({ error: 'Failed to fetch protector' })
  }
})

export default router
