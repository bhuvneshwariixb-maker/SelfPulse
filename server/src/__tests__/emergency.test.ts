import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createEmergencyEvent, resolveEmergencyEvent, getEmergencyEvent, getEmergencyEventNotifications } from '../services/emergency.js'
import { createUser } from '../services/auth.js'
import { db } from '../db/init.js'

describe('Emergency Service', () => {
  let userId: string

  beforeAll(async () => {
    await db.exec('PRAGMA foreign_keys = ON')
    const user = await createUser('emergency@example.com', 'password123', 'Emergency Test')
    userId = user.id
  })

  afterAll(async () => {
    if (db) {
      await db.run('DELETE FROM emergency_events WHERE user_id = ?', [userId])
      await db.run('DELETE FROM users WHERE id = ?', [userId])
    }
  })

  it('should create emergency event', async () => {
    const event = await createEmergencyEvent(
      userId,
      'hold-button',
      19.0760,
      72.8777
    )
    
    expect(event).toBeDefined()
    expect(event.userId).toBe(userId)
    expect(event.activationMethod).toBe('hold-button')
    expect(event.status).toBe('active')
    expect(event.latitude).toBe(19.0760)
    expect(event.longitude).toBe(72.8777)
  })

  it('should get emergency event by ID', async () => {
    const created = await createEmergencyEvent(userId, 'triple-tap')
    const fetched = await getEmergencyEvent(created.id)
    
    expect(fetched).toBeDefined()
    expect(fetched?.id).toBe(created.id)
    expect(fetched?.userId).toBe(userId)
  })

  it('should resolve emergency event', async () => {
    const event = await createEmergencyEvent(userId, 'voice')
    await resolveEmergencyEvent(event.id)
    
    const resolved = await getEmergencyEvent(event.id)
    expect(resolved?.status).toBe('resolved')
    expect(resolved?.resolvedAt).toBeDefined()
  })

  it('should not find non-existent emergency event', async () => {
    const event = await getEmergencyEvent('nonexistent-id')
    expect(event).toBeNull()
  })

  it('should get emergency event notifications', async () => {
    const event = await createEmergencyEvent(userId, 'gesture')
    const notifications = await getEmergencyEventNotifications(event.id)
    
    expect(Array.isArray(notifications)).toBe(true)
  })

  it('should handle multiple emergency events', async () => {
    const event1 = await createEmergencyEvent(userId, 'hold-button')
    const event2 = await createEmergencyEvent(userId, 'triple-tap')
    
    expect(event1.id).not.toBe(event2.id)
    
    const fetched1 = await getEmergencyEvent(event1.id)
    const fetched2 = await getEmergencyEvent(event2.id)
    
    expect(fetched1?.id).toBe(event1.id)
    expect(fetched2?.id).toBe(event2.id)
  })
})
