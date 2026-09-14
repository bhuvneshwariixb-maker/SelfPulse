import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { authMiddleware } from '../middleware/auth.js'
import { db } from '../db/init.js'
import { v4 as uuidv4 } from 'uuid'
import { AppError } from '../middleware/errorHandler.js'
import { logger } from '../services/logger.js'

const router = Router()

const createContactSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  relationship: z.string().optional(),
  priority: z.number().int().min(0).optional().default(0),
})

const updateContactSchema = createContactSchema.partial()

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized')
    }

    const body = createContactSchema.parse(req.body)
    const contactId = uuidv4()
    const now = new Date().toISOString()

    await db.run(
      `INSERT INTO trusted_contacts (id, user_id, name, phone, email, relationship, priority, verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [contactId, req.user.userId, body.name, body.phone || null, body.email || null, body.relationship || null, body.priority || 0, 0, now, now]
    )

    logger.info({ userId: req.user.userId, contactId }, 'Trusted contact created')

    res.status(201).json({
      success: true,
      data: {
        id: contactId,
        userId: req.user.userId,
        name: body.name,
        phone: body.phone || null,
        email: body.email || null,
        relationship: body.relationship || null,
        priority: body.priority || 0,
        verified: false,
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
    logger.error(err, 'Create trusted contact error')
    res.status(500).json({ error: 'Failed to create trusted contact' })
  }
})

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized')
    }

    const contacts = await db.all(
      `SELECT id, name, phone, email, relationship, priority, verified, created_at, updated_at
       FROM trusted_contacts WHERE user_id = ? ORDER BY priority ASC, created_at DESC`,
      [req.user.userId]
    )

    res.json({
      success: true,
      data: (contacts || []).map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        relationship: c.relationship,
        priority: c.priority,
        verified: Boolean(c.verified),
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })),
    })
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    logger.error(err, 'Get trusted contacts error')
    res.status(500).json({ error: 'Failed to fetch trusted contacts' })
  }
})

router.put('/:contactId', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized')
    }

    const contact = await db.get(
      `SELECT user_id FROM trusted_contacts WHERE id = ?`,
      [req.params.contactId]
    )

    if (!contact) {
      throw new AppError(404, 'Contact not found')
    }

    if (contact.user_id !== req.user.userId) {
      throw new AppError(403, 'Forbidden')
    }

    const body = updateContactSchema.parse(req.body)
    const now = new Date().toISOString()

    const updates = []
    const values = []

    if (body.name !== undefined) {
      updates.push('name = ?')
      values.push(body.name)
    }
    if (body.phone !== undefined) {
      updates.push('phone = ?')
      values.push(body.phone || null)
    }
    if (body.email !== undefined) {
      updates.push('email = ?')
      values.push(body.email || null)
    }
    if (body.relationship !== undefined) {
      updates.push('relationship = ?')
      values.push(body.relationship || null)
    }
    if (body.priority !== undefined) {
      updates.push('priority = ?')
      values.push(body.priority)
    }

    updates.push('updated_at = ?')
    values.push(now)
    values.push(req.params.contactId)

    await db.run(
      `UPDATE trusted_contacts SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    logger.info({ userId: req.user.userId, contactId: req.params.contactId }, 'Trusted contact updated')

    res.json({
      success: true,
      message: 'Contact updated',
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.errors })
    }
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    logger.error(err, 'Update trusted contact error')
    res.status(500).json({ error: 'Failed to update contact' })
  }
})

router.delete('/:contactId', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Unauthorized')
    }

    const contact = await db.get(
      `SELECT user_id FROM trusted_contacts WHERE id = ?`,
      [req.params.contactId]
    )

    if (!contact) {
      throw new AppError(404, 'Contact not found')
    }

    if (contact.user_id !== req.user.userId) {
      throw new AppError(403, 'Forbidden')
    }

    await db.run(`DELETE FROM trusted_contacts WHERE id = ?`, [req.params.contactId])

    logger.info({ userId: req.user.userId, contactId: req.params.contactId }, 'Trusted contact deleted')

    res.json({
      success: true,
      message: 'Contact deleted',
    })
  } catch (err) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    logger.error(err, 'Delete trusted contact error')
    res.status(500).json({ error: 'Failed to delete contact' })
  }
})

export default router
