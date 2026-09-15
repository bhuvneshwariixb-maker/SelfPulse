import { v4 as uuidv4 } from 'uuid'
import { db } from '../db/init.js'
import { logger } from './logger.js'

export interface Journey {
  id: string
  userId: string
  origin: string
  destination: string
  startedAt: string
  endedAt: string | null
  status: 'active' | 'completed' | 'paused'
  safetyStatus: string
  createdAt: string
}

export interface JourneyLocation {
  id: string
  journeyId: string
  latitude: number
  longitude: number
  accuracy: number
  timestamp: string
  createdAt: string
}

export async function startJourney(
  userId: string,
  origin: string,
  destination: string
): Promise<Journey> {
  const journeyId = uuidv4()
  const now = new Date().toISOString()

  await db.run(
    `INSERT INTO journeys (id, user_id, origin, destination, status, safety_status, started_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [journeyId, userId, origin, destination, 'active', 'safe', now, now]
  )

  logger.info({ journeyId, userId }, 'Journey started')

  return {
    id: journeyId,
    userId,
    origin,
    destination,
    startedAt: now,
    endedAt: null,
    status: 'active',
    safetyStatus: 'safe',
    createdAt: now,
  }
}

export async function endJourney(journeyId: string): Promise<void> {
  const now = new Date().toISOString()
  await db.run(
    `UPDATE journeys SET status = ?, ended_at = ? WHERE id = ?`,
    ['completed', now, journeyId]
  )
  logger.info({ journeyId }, 'Journey ended')
}

export async function getJourney(journeyId: string): Promise<Journey | null> {
  const row = await db.get(
    `SELECT id, user_id, origin, destination, started_at, ended_at, status, safety_status, created_at
     FROM journeys WHERE id = ?`,
    [journeyId]
  )

  if (!row) return null

  return {
    id: row.id,
    userId: row.user_id,
    origin: row.origin,
    destination: row.destination,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    status: row.status,
    safetyStatus: row.safety_status,
    createdAt: row.created_at,
  }
}

export async function addJourneyLocation(
  journeyId: string,
  latitude: number,
  longitude: number,
  accuracy: number
): Promise<JourneyLocation> {
  const locationId = uuidv4()
  const now = new Date().toISOString()

  await db.run(
    `INSERT INTO journey_locations (id, journey_id, latitude, longitude, accuracy, timestamp, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [locationId, journeyId, latitude, longitude, accuracy, now, now]
  )

  return {
    id: locationId,
    journeyId,
    latitude,
    longitude,
    accuracy,
    timestamp: now,
    createdAt: now,
  }
}

export async function getRecentJourneyLocations(journeyId: string, limit = 100): Promise<JourneyLocation[]> {
  const rows = await db.all(
    `SELECT id, journey_id, latitude, longitude, accuracy, timestamp, created_at
     FROM journey_locations WHERE journey_id = ? ORDER BY timestamp DESC LIMIT ?`,
    [journeyId, limit]
  )
  return (rows || []).map(r => ({
    id: r.id,
    journeyId: r.journey_id,
    latitude: r.latitude,
    longitude: r.longitude,
    accuracy: r.accuracy,
    timestamp: r.timestamp,
    createdAt: r.created_at,
  }))
}

export async function getUserActiveJourney(userId: string): Promise<Journey | null> {
  const row = await db.get(
    `SELECT id, user_id, origin, destination, started_at, ended_at, status, safety_status, created_at
     FROM journeys WHERE user_id = ? AND status = 'active' ORDER BY started_at DESC LIMIT 1`,
    [userId]
  )

  if (!row) return null

  return {
    id: row.id,
    userId: row.user_id,
    origin: row.origin,
    destination: row.destination,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    status: row.status,
    safetyStatus: row.safety_status,
    createdAt: row.created_at,
  }
}
