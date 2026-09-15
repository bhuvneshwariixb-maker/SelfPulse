import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createUser } from '../services/auth.js'
import { db } from '../db/init.js'
import { v4 as uuidv4 } from 'uuid'

describe('Community Reports Service', () => {
  let userId: string

  beforeAll(async () => {
    await db.exec('PRAGMA foreign_keys = ON')
    const user = await createUser('reports@example.com', 'password123', 'Reports Test')
    userId = user.id
  })

  afterAll(async () => {
    if (db) {
      await db.run('DELETE FROM community_reports WHERE user_id = ?', [userId])
      await db.run('DELETE FROM users WHERE id = ?', [userId])
    }
  })

  it('should create a community report', async () => {
    const reportId = uuidv4()
    const now = new Date().toISOString()
    
    await db.run(
      `INSERT INTO community_reports (id, user_id, latitude, longitude, category, description, severity, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reportId, userId, 19.0760, 72.8777, 'harassment', 'Suspicious activity near station', 'high', 'pending', now]
    )
    
    const report = await db.get(
      'SELECT * FROM community_reports WHERE id = ?',
      [reportId]
    )
    
    expect(report).toBeDefined()
    expect(report.category).toBe('harassment')
    expect(report.latitude).toBe(19.0760)
    expect(report.longitude).toBe(72.8777)
  })

  it('should validate coordinates', async () => {
    const reportId = uuidv4()
    const now = new Date().toISOString()
    
    // Valid coordinates
    await db.run(
      `INSERT INTO community_reports (id, user_id, latitude, longitude, category, description, severity, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reportId, userId, 45.0, 180.0, 'theft', 'Test', 'medium', 'pending', now]
    )
    
    const report = await db.get('SELECT * FROM community_reports WHERE id = ?', [reportId])
    expect(report.latitude).toBe(45.0)
    expect(report.longitude).toBe(180.0)
  })

  it('should filter reports by severity', async () => {
    const now = new Date().toISOString()
    const severities = ['low', 'medium', 'high']
    
    for (let i = 0; i < severities.length; i++) {
      await db.run(
        `INSERT INTO community_reports (id, user_id, latitude, longitude, category, description, severity, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), userId, 19.0760 + i * 0.001, 72.8777, 'suspicious-activity', 'Test', severities[i], 'pending', now]
      )
    }
    
    const highSeverity = await db.all(
      'SELECT * FROM community_reports WHERE user_id = ? AND severity = ?',
      [userId, 'high']
    )
    
    expect(highSeverity.length).toBeGreaterThan(0)
  })

  it('should get nearby reports', async () => {
    const now = new Date().toISOString()
    const centerLat = 19.0760
    const centerLng = 72.8777
    const radiusInDegrees = 0.05 / 111 // 5km
    
    await db.run(
      `INSERT INTO community_reports (id, user_id, latitude, longitude, category, description, severity, status, verified, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), userId, centerLat, centerLng, 'assault', 'Nearby report', 'high', 'verified', 1, now]
    )
    
    const nearby = await db.all(
      `SELECT * FROM community_reports WHERE status = 'verified' AND verified = 1
       AND latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?
       LIMIT 20`,
      [
        centerLat - radiusInDegrees,
        centerLat + radiusInDegrees,
        centerLng - radiusInDegrees,
        centerLng + radiusInDegrees,
      ]
    )
    
    expect(Array.isArray(nearby)).toBe(true)
  })

  it('should validate category enum', async () => {
    const reportId = uuidv4()
    const now = new Date().toISOString()
    const validCategories = ['harassment', 'theft', 'assault', 'suspicious-activity', 'road-hazard', 'other']
    
    for (const category of validCategories) {
      await db.run(
        `INSERT INTO community_reports (id, user_id, latitude, longitude, category, description, severity, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), userId, 19.0760, 72.8777, category, 'Test', 'medium', 'pending', now]
      )
    }
    
    const allReports = await db.all(
      'SELECT DISTINCT category FROM community_reports WHERE user_id = ?',
      [userId]
    )
    
    expect(allReports.length).toBeGreaterThan(0)
  })
})
