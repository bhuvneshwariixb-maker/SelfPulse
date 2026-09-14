import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { notificationService } from '../services/notifications.js'
import { AppError } from '../middleware/errorHandler.js'
import { logger } from '../services/logger.js'

const router = Router()

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized')
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100)
    const notifications = await notificationService.getUserNotifications(req.user.userId, limit)

    logger.info({ userId: req.user.userId }, 'Notifications fetched')

    res.json({
      success: true,
      data: notifications,
    })
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    logger.error(err, 'Get notifications error')
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
})

export default router
