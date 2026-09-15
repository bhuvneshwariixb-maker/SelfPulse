import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createUser, getUserByEmail, verifyPassword, generateToken } from '../services/auth.js'
import { db } from '../db/init.js'

describe('Auth Service', () => {
  beforeAll(async () => {
    // Initialize test database
    await db.exec('PRAGMA foreign_keys = ON')
  })

  afterAll(async () => {
    // Clean up
    if (db) {
      await db.run('DELETE FROM users')
    }
  })

  it('should create a new user', async () => {
    const user = await createUser('test@example.com', 'password123', 'Test User', '1234567890')
    expect(user).toBeDefined()
    expect(user.email).toBe('test@example.com')
    expect(user.name).toBe('Test User')
  })

  it('should hash password correctly', async () => {
    const email = 'hash@example.com'
    const password = 'mySecurePassword123'
    const user = await createUser(email, password, 'Hash Test')
    expect(user.password_hash).not.toBe(password)
  })

  it('should verify password correctly', async () => {
    const email = 'verify@example.com'
    const password = 'verifyPassword123'
    await createUser(email, password, 'Verify Test')
    
    const user = await getUserByEmail(email)
    expect(user).toBeDefined()
    
    if (user) {
      const isValid = await verifyPassword(password, user.password_hash)
      expect(isValid).toBe(true)
      
      const isInvalid = await verifyPassword('wrongPassword', user.password_hash)
      expect(isInvalid).toBe(false)
    }
  })

  it('should get user by email', async () => {
    const email = 'getuser@example.com'
    await createUser(email, 'password123', 'Get User')
    
    const user = await getUserByEmail(email)
    expect(user).toBeDefined()
    expect(user?.email).toBe(email)
  })

  it('should return null for non-existent user', async () => {
    const user = await getUserByEmail('nonexistent@example.com')
    expect(user).toBeNull()
  })

  it('should generate valid JWT token', () => {
    const payload = { userId: 'user-123', email: 'test@example.com' }
    const token = generateToken(payload)
    expect(token).toBeDefined()
    expect(typeof token).toBe('string')
    expect(token.split('.').length).toBe(3) // JWT has 3 parts
  })
})
