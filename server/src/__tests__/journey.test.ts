import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { startJourney, endJourney, getJourney, addJourneyLocation, getUserActiveJourney } from '../services/journey.js'
import { createUser } from '../services/auth.js'
import { db } from '../db/init.js'

describe('Journey Service', () => {
  let userId: string

  beforeAll(async () => {
    await db.exec('PRAGMA foreign_keys = ON')
    const user = await createUser('journey@example.com', 'password123', 'Journey Test')
    userId = user.id
  })

  afterAll(async () => {
    if (db) {
      await db.run('DELETE FROM journey_locations WHERE journey_id IN (SELECT id FROM journeys WHERE user_id = ?)', [userId])
      await db.run('DELETE FROM journeys WHERE user_id = ?', [userId])
      await db.run('DELETE FROM users WHERE id = ?', [userId])
    }
  })

  it('should start a journey', async () => {
    const journey = await startJourney(userId, 'Home', 'Office')
    
    expect(journey).toBeDefined()
    expect(journey.userId).toBe(userId)
    expect(journey.origin).toBe('Home')
    expect(journey.destination).toBe('Office')
    expect(journey.status).toBe('active')
  })

  it('should get journey by ID', async () => {
    const started = await startJourney(userId, 'Point A', 'Point B')
    const fetched = await getJourney(started.id)
    
    expect(fetched).toBeDefined()
    expect(fetched?.id).toBe(started.id)
    expect(fetched?.userId).toBe(userId)
  })

  it('should add location to journey', async () => {
    const journey = await startJourney(userId, 'Start', 'End')
    const location = await addJourneyLocation(journey.id, 19.0760, 72.8777, 10)
    
    expect(location).toBeDefined()
    expect(location.journeyId).toBe(journey.id)
    expect(location.latitude).toBe(19.0760)
    expect(location.longitude).toBe(72.8777)
  })

  it('should end a journey', async () => {
    const journey = await startJourney(userId, 'Start', 'End')
    await endJourney(journey.id)
    
    const ended = await getJourney(journey.id)
    expect(ended?.status).toBe('completed')
    expect(ended?.endedAt).toBeDefined()
  })

  it('should get user active journey', async () => {
    await startJourney(userId, 'Origin', 'Destination')
    const active = await getUserActiveJourney(userId)
    
    expect(active).toBeDefined()
    expect(active?.userId).toBe(userId)
    expect(active?.status).toBe('active')
  })

  it('should return null when no active journey', async () => {
    const tempUser = await createUser('temp@example.com', 'pass123', 'Temp')
    const active = await getUserActiveJourney(tempUser.id)
    
    expect(active).toBeNull()
  })

  it('should track multiple locations in journey', async () => {
    const journey = await startJourney(userId, 'Multi Start', 'Multi End')
    
    const loc1 = await addJourneyLocation(journey.id, 19.0760, 72.8777)
    const loc2 = await addJourneyLocation(journey.id, 19.0761, 72.8778)
    const loc3 = await addJourneyLocation(journey.id, 19.0762, 72.8779)
    
    expect(loc1.id).not.toBe(loc2.id)
    expect(loc2.id).not.toBe(loc3.id)
  })
})
