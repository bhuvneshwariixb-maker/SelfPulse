import { v4 as uuidv4 } from 'uuid'
import { db } from '../db/init.js'
import { logger } from './logger.js'
import { notificationService } from './notifications.js'

export interface EmergencyEvent {
  id: string
  userId: string
  activatedAt: string
  activationMethod: string
  latitude: number | null
  longitude: number | null
  status: 'active' | 'resolved'
  resolvedAt: string | null
  createdAt: string
}

export async function createEmergencyEvent(
  userId: string,
  activationMethod: string,
  latitude?: number,
  longitude?: number
): Promise<EmergencyEvent> {
  const eventId = uuidv4()
  const now = new Date().toISOString()

  await db.run(
    `INSERT INTO emergency_events (id, user_id, activation_method, latitude, longitude, status, activated_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [eventId, userId, activationMethod, latitude || null, longitude || null, 'active', now, now]
  )

  logger.info({ eventId, userId }, 'Emergency event created')

  // Get user's trusted contacts
  const contacts = await db.all(
    `SELECT id, name, phone, email FROM trusted_contacts WHERE user_id = ? AND verified = 1 ORDER BY priority ASC`,
    [userId]
  )

  // Notify contacts
  for (const contact of contacts) {
    try {
      await notificationService.notifyEmergency(eventId, contact.id, userId, contact.phone, contact.email)
    } catch (err) {
      logger.error(err, `Failed to notify contact ${contact.id}`)
    }
  }

  return {
    id: eventId,
    userId,
    activatedAt: now,
    activationMethod,
    latitude: latitude || null,
    longitude: longitude || null,
    status: 'active',
    resolvedAt: null,
    createdAt: now,
  }
}

export async function resolveEmergencyEvent(eventId: string): Promise<void> {
  const now = new Date().toISOString()
  await db.run(
    `UPDATE emergency_events SET status = ?, resolved_at = ? WHERE id = ?`,
    ['resolved', now, eventId]
  )
  logger.info({ eventId }, 'Emergency event resolved')
}

export async function getEmergencyEvent(eventId: string): Promise<EmergencyEvent | null> {
  const row = await db.get(
    `SELECT id, user_id, activation_method, latitude, longitude, status, activated_at, resolved_at, created_at
     FROM emergency_events WHERE id = ?`,
    [eventId]
  )

  if (!row) return null

  return {
    id: row.id,
    userId: row.user_id,
    activatedAt: row.activated_at,
    activationMethod: row.activation_method,
    latitude: row.latitude,
    longitude: row.longitude,
    status: row.status,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
  }
}

export async function getEmergencyEventNotifications(eventId: string) {
  const rows = await db.all(
    `SELECT id, emergency_event_id, trusted_contact_id, channel, status, attempted_at, delivered_at, failure_reason
     FROM emergency_notifications WHERE emergency_event_id = ?`,
    [eventId]
  )
  return rows || []
}
