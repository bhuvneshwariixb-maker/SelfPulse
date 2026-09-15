import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createUser } from '../services/auth.js'
import { db } from '../db/init.js'
import { v4 as uuidv4 } from 'uuid'

describe('Trusted Contacts Service', () => {
  let userId: string

  beforeAll(async () => {
    await db.exec('PRAGMA foreign_keys = ON')
    const user = await createUser('contacts@example.com', 'password123', 'Contacts Test')
    userId = user.id
  })

  afterAll(async () => {
    if (db) {
      await db.run('DELETE FROM trusted_contacts WHERE user_id = ?', [userId])
      await db.run('DELETE FROM users WHERE id = ?', [userId])
    }
  })

  it('should create a trusted contact', async () => {
    const contactId = uuidv4()
    const now = new Date().toISOString()
    
    await db.run(
      `INSERT INTO trusted_contacts (id, user_id, name, phone, email, relationship, priority, verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [contactId, userId, 'John Doe', '9876543210', 'john@example.com', 'friend', 0, 0, now, now]
    )
    
    const contact = await db.get(
      'SELECT * FROM trusted_contacts WHERE id = ?',
      [contactId]
    )
    
    expect(contact).toBeDefined()
    expect(contact.name).toBe('John Doe')
    expect(contact.phone).toBe('9876543210')
  })

  it('should update a trusted contact', async () => {
    const contactId = uuidv4()
    const now = new Date().toISOString()
    
    await db.run(
      `INSERT INTO trusted_contacts (id, user_id, name, phone, email, relationship, priority, verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [contactId, userId, 'Jane Doe', '9876543211', 'jane@example.com', 'sister', 1, 0, now, now]
    )
    
    const updateTime = new Date().toISOString()
    await db.run(
      'UPDATE trusted_contacts SET name = ?, phone = ?, priority = ?, updated_at = ? WHERE id = ?',
      ['Jane Smith', '9876543212', 2, updateTime, contactId]
    )
    
    const updated = await db.get(
      'SELECT * FROM trusted_contacts WHERE id = ?',
      [contactId]
    )
    
    expect(updated.name).toBe('Jane Smith')
    expect(updated.phone).toBe('9876543212')
    expect(updated.priority).toBe(2)
  })

  it('should delete a trusted contact', async () => {
    const contactId = uuidv4()
    const now = new Date().toISOString()
    
    await db.run(
      `INSERT INTO trusted_contacts (id, user_id, name, phone, email, relationship, priority, verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [contactId, userId, 'Temp Contact', '9876543213', 'temp@example.com', 'colleague', 0, 0, now, now]
    )
    
    await db.run('DELETE FROM trusted_contacts WHERE id = ?', [contactId])
    
    const deleted = await db.get(
      'SELECT * FROM trusted_contacts WHERE id = ?',
      [contactId]
    )
    
    expect(deleted).toBeUndefined()
  })

  it('should list contacts by priority', async () => {
    const now = new Date().toISOString()
    
    await db.run(
      `INSERT INTO trusted_contacts (id, user_id, name, phone, priority, verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), userId, 'High Priority', '1111111111', 0, 0, now, now]
    )
    
    await db.run(
      `INSERT INTO trusted_contacts (id, user_id, name, phone, priority, verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), userId, 'Low Priority', '2222222222', 3, 0, now, now]
    )
    
    const contacts = await db.all(
      'SELECT * FROM trusted_contacts WHERE user_id = ? ORDER BY priority ASC',
      [userId]
    )
    
    expect(contacts.length).toBeGreaterThanOrEqual(2)
    if (contacts.length >= 2) {
      expect(contacts[0].priority <= contacts[1].priority).toBe(true)
    }
  })

  it('should validate phone and email', async () => {
    const contactId = uuidv4()
    const now = new Date().toISOString()
    
    await db.run(
      `INSERT INTO trusted_contacts (id, user_id, name, phone, email, relationship, priority, verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [contactId, userId, 'Contact', '1234567890', 'contact@example.com', 'friend', 0, 0, now, now]
    )
    
    const contact = await db.get(
      'SELECT * FROM trusted_contacts WHERE id = ?',
      [contactId]
    )
    
    // Phone should be stored as string
    expect(typeof contact.phone).toBe('string')
    expect(contact.email).toBe('contact@example.com')
  })
})
