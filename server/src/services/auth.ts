import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../db/init.js'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-min-32-chars-xxxx'
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d'

export interface TokenPayload {
  userId: string
  email: string
}

export interface AuthToken {
  token: string
  expiresIn: string
  user: {
    id: string
    name: string
    email: string
    phone: string | null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}

export function generateToken(payload: TokenPayload): AuthToken {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY })
  return {
    token,
    expiresIn: JWT_EXPIRY,
    user: {
      id: payload.userId,
      name: '',
      email: payload.email,
      phone: null,
    },
  }
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export async function createUser(email: string, password: string, name: string, phone?: string) {
  const userId = uuidv4()
  const passwordHash = await hashPassword(password)
  const now = new Date().toISOString()

  await db.run(
    `INSERT INTO users (id, name, email, phone, password_hash, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, name, email, phone || null, passwordHash, now, now]
  )

  return {
    id: userId,
    name,
    email,
    phone: phone || null,
  }
}

export async function getUserByEmail(email: string) {
  const row = await db.get(
    `SELECT id, name, email, phone, password_hash, created_at, updated_at FROM users WHERE email = ?`,
    [email]
  )
  return row || null
}

export async function getUserById(id: string) {
  const row = await db.get(
    `SELECT id, name, email, phone, created_at, updated_at FROM users WHERE id = ?`,
    [id]
  )
  return row || null
}
