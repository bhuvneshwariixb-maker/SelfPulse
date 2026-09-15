import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { authLimiter } from '../middleware/rateLimiter.js'
import { AppError } from '../middleware/errorHandler.js'
import { createUser, getUserByEmail, verifyPassword, generateToken } from '../services/auth.js'
import { logger } from '../services/logger.js'

const router = Router()

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body)

    // Check if user already exists
    const existing = await getUserByEmail(body.email)
    if (existing) {
      throw new AppError(409, 'User with this email already exists')
    }

    const user = await createUser(body.email, body.password, body.name, body.phone)
    const auth = generateToken({ userId: user.id, email: user.email })

    logger.info({ userId: user.id, email: user.email }, 'User registered')

    res.status(201).json({
      success: true,
      data: auth,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.errors })
    }
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    logger.error(err, 'Registration error')
    res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body)

    const user = await getUserByEmail(body.email)
    if (!user) {
      throw new AppError(401, 'Invalid email or password')
    }

    const passwordValid = await verifyPassword(body.password, user.password_hash)
    if (!passwordValid) {
      throw new AppError(401, 'Invalid email or password')
    }

    const auth = generateToken({ userId: user.id, email: user.email })

    logger.info({ userId: user.id, email: user.email }, 'User logged in')

    res.json({
      success: true,
      data: auth,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.errors })
    }
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    logger.error(err, 'Login error')
    res.status(500).json({ error: 'Login failed' })
  }
})

export default router
