import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'
import path from 'path'
import { fileURLToPath } from 'url'
import { logger } from '../services/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let db: Database | null = null

export async function initializeDatabase(): Promise<Database> {
  if (db) return db

  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/selfpulse.db')

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  })

  await db.exec('PRAGMA foreign_keys = ON')
  await createSchema()

  return db
}

async function createSchema() {
  if (!db) throw new Error('Database not initialized')

  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  // Trusted contacts table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS trusted_contacts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      relationship TEXT,
      priority INTEGER DEFAULT 0,
      verified INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Emergency events table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS emergency_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      activation_method TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      status TEXT NOT NULL,
      activated_at TEXT NOT NULL,
      resolved_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Emergency notifications table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS emergency_notifications (
      id TEXT PRIMARY KEY,
      emergency_event_id TEXT NOT NULL,
      trusted_contact_id TEXT NOT NULL,
      channel TEXT NOT NULL,
      status TEXT NOT NULL,
      provider_message_id TEXT,
      attempted_at TEXT NOT NULL,
      delivered_at TEXT,
      failure_reason TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (emergency_event_id) REFERENCES emergency_events(id) ON DELETE CASCADE,
      FOREIGN KEY (trusted_contact_id) REFERENCES trusted_contacts(id) ON DELETE CASCADE
    )
  `)

  // Journeys table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS journeys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      status TEXT NOT NULL,
      safety_status TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Journey locations table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS journey_locations (
      id TEXT PRIMARY KEY,
      journey_id TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      accuracy REAL,
      timestamp TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE
    )
  `)

  // Routes table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS routes (
      id TEXT PRIMARY KEY,
      journey_id TEXT,
      user_id TEXT NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      distance REAL,
      duration INTEGER,
      polyline TEXT,
      provider TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (journey_id) REFERENCES journeys(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Route analysis table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS route_analysis (
      id TEXT PRIMARY KEY,
      route_id TEXT NOT NULL,
      lighting TEXT,
      crowd_activity TEXT,
      isolation TEXT,
      nearby_help_points INTEGER DEFAULT 0,
      community_reports INTEGER DEFAULT 0,
      safety_score INTEGER,
      preferences_match INTEGER,
      recommendation_reason TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE
    )
  `)

  // Protectors table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS protectors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      area TEXT,
      latitude REAL,
      longitude REAL,
      availability TEXT,
      status TEXT,
      response_time TEXT,
      verified INTEGER DEFAULT 0,
      contact_info TEXT,
      created_at TEXT NOT NULL
    )
  `)

  // Safety points table (hospitals, police, etc.)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS safety_points (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      address TEXT,
      phone TEXT,
      availability TEXT,
      status TEXT,
      created_at TEXT NOT NULL
    )
  `)

  // Community reports table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS community_reports (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      severity TEXT,
      status TEXT,
      verified INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Notifications table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Create indexes for performance
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_trusted_contacts_user ON trusted_contacts(user_id);
    CREATE INDEX IF NOT EXISTS idx_emergency_events_user ON emergency_events(user_id);
    CREATE INDEX IF NOT EXISTS idx_journeys_user ON journeys(user_id);
    CREATE INDEX IF NOT EXISTS idx_journey_locations_journey ON journey_locations(journey_id);
    CREATE INDEX IF NOT EXISTS idx_routes_user ON routes(user_id);
    CREATE INDEX IF NOT EXISTS idx_community_reports_user ON community_reports(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  `)

  logger.info('Database schema created/verified')
}

export async function getDatabase(): Promise<Database> {
  if (!db) {
    db = await initializeDatabase()
  }
  return db
}

export { db }
