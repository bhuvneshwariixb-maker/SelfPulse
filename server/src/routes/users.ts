import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { getUserById } from '../services/auth.js'
import { AppError } from '../middleware/errorHandler.js'
import { logger } from '../services/logger.js'

const router = Router()

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized')
    }

    const user = await getUserById(req.user.userId)
    if (!user) {
      throw new AppError(404, 'User not found')
    }

    res.json({
      success: true,
      data: user,
    })
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    logger.error(err, 'Get user error')
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

export default router
