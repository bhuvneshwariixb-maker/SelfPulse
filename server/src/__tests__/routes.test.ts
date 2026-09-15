import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { analyzeRouteSafety, getRouteAnalysis } from '../services/routeSafety.js'
import { createUser } from '../services/auth.js'
import { db } from '../db/init.js'
import { v4 as uuidv4 } from 'uuid'

describe('Route Safety Service', () => {
  let userId: string

  beforeAll(async () => {
    await db.exec('PRAGMA foreign_keys = ON')
    const user = await createUser('routes@example.com', 'password123', 'Routes Test')
    userId = user.id
  })

  afterAll(async () => {
    if (db) {
      await db.run('DELETE FROM route_analysis WHERE route_id IN (SELECT id FROM routes WHERE user_id = ?)', [userId])
      await db.run('DELETE FROM routes WHERE user_id = ?', [userId])
      await db.run('DELETE FROM users WHERE id = ?', [userId])
    }
  })

  it('should analyze route safety', async () => {
    const routeId = uuidv4()
    const origin = { lat: 19.0760, lng: 72.8777 }
    const destination = { lat: 19.0850, lng: 72.8850 }
    
    const analysis = await analyzeRouteSafety(routeId, origin, destination, 5, 15)
    
    expect(analysis).toBeDefined()
    expect(analysis.safetyScore).toBeGreaterThan(0)
    expect(analysis.safetyScore).toBeLessThanOrEqual(100)
  })

  it('should generate route analysis with factors', async () => {
    const routeId = uuidv4()
    const analysis = await analyzeRouteSafety(
      routeId,
      { lat: 19.0760, lng: 72.8777 },
      { lat: 19.0850, lng: 72.8850 },
      10,
      20
    )
    
    expect(analysis.lighting).toBeDefined()
    expect(analysis.crowdActivity).toBeDefined()
    expect(analysis.isolation).toBeDefined()
    expect(analysis.nearbyHelpPoints).toBeGreaterThanOrEqual(0)
    expect(analysis.recommendationReason).toBeDefined()
  })

  it('should get route analysis', async () => {
    const routeId = uuidv4()
    await analyzeRouteSafety(
      routeId,
      { lat: 19.0760, lng: 72.8777 },
      { lat: 19.0850, lng: 72.8850 },
      5,
      15
    )
    
    const analysis = await getRouteAnalysis(routeId)
    expect(analysis).toBeDefined()
    expect(analysis?.id).toBe(routeId)
  })

  it('should return null for non-existent route', async () => {
    const analysis = await getRouteAnalysis('nonexistent-route')
    expect(analysis).toBeNull()
  })

  it('should handle different route distances', async () => {
    const shortRoute = await analyzeRouteSafety(
      uuidv4(),
      { lat: 19.0760, lng: 72.8777 },
      { lat: 19.0765, lng: 72.8782 },
      1,
      5
    )
    
    const longRoute = await analyzeRouteSafety(
      uuidv4(),
      { lat: 19.0760, lng: 72.8777 },
      { lat: 19.1000, lng: 72.9000 },
      20,
      45
    )
    
    expect(shortRoute.safetyScore).toBeDefined()
    expect(longRoute.safetyScore).toBeDefined()
  })
})
