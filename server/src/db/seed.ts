import { getDatabase } from './init.js'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '../services/logger.js'

const SAFETY_POINTS_DATA = [
  {
    type: 'police',
    name: 'Central Police Station',
    latitude: 19.0136,
    longitude: 72.8697,
    address: 'Fort, Mumbai',
    phone: '100',
  },
  {
    type: 'hospital',
    name: 'Breach Candy Hospital',
    latitude: 19.0177,
    longitude: 72.8259,
    address: 'Breach Candy, Mumbai',
    phone: '022-XXXX-XXXX',
  },
  {
    type: 'metro',
    name: 'Central Station',
    latitude: 19.0176,
    longitude: 72.8362,
    address: 'Central Mumbai',
    phone: null,
  },
]

const PROTECTORS_DATA = [
  {
    name: 'Safe Ride Partners',
    type: 'ride-verification',
    area: 'Mumbai',
    availability: 'Available',
    response_time: '5-10 minutes',
    verified: 1,
    contact_info: 'support@saferide.in',
  },
  {
    name: 'Women Safety Helpline',
    type: 'counseling',
    area: 'National',
    availability: '24/7',
    response_time: 'Immediate',
    verified: 1,
    contact_info: '+91-1800-1801',
  },
  {
    name: 'Local Community Watch',
    type: 'patrol',
    area: 'Dadar, Mumbai',
    availability: '6 PM - 6 AM',
    response_time: '15-30 minutes',
    verified: 1,
    contact_info: 'patrol@localwatch.org',
  },
]

export async function seedDatabase() {
  const db = await getDatabase()

  try {
    // Check if already seeded
    const count = await db.get('SELECT COUNT(*) as count FROM safety_points')
    if (count && count.count > 0) {
      logger.info('Database already seeded')
      return
    }

    // Seed safety points
    for (const point of SAFETY_POINTS_DATA) {
      const id = uuidv4()
      const now = new Date().toISOString()
      await db.run(
        `INSERT INTO safety_points (id, type, name, latitude, longitude, address, phone, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, point.type, point.name, point.latitude, point.longitude, point.address, point.phone, 'active', now]
      )
    }

    // Seed protectors
    for (const protector of PROTECTORS_DATA) {
      const id = uuidv4()
      const now = new Date().toISOString()
      await db.run(
        `INSERT INTO protectors (id, name, type, area, availability, status, response_time, verified, contact_info, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, protector.name, protector.type, protector.area, protector.availability, 'active', protector.response_time, protector.verified, protector.contact_info, now]
      )
    }

    logger.info('Database seeded successfully')
  } catch (err) {
    logger.error(err, 'Failed to seed database')
    throw err
  }
}
