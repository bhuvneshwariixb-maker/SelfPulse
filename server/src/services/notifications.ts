import { v4 as uuidv4 } from 'uuid'
import { db } from '../db/init.js'
import { logger } from './logger.js'

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  createdAt: string
}

class NotificationService {
  async notifyEmergency(
    emergencyEventId: string,
    trustedContactId: string,
    userId: string,
    contactPhone?: string,
    contactEmail?: string
  ): Promise<void> {
    const notificationId = uuidv4()
    const now = new Date().toISOString()

    // Try SMS first if phone available
    let channel = 'sms'
    let status = 'pending'
    let failureReason = null

    if (contactPhone) {
      try {
        await this.sendSMS(contactPhone, userId, emergencyEventId)
        status = 'sent'
        logger.info({ emergencyEventId, contactPhone }, 'Emergency SMS sent')
      } catch (err) {
        failureReason = `SMS failed: ${String(err)}`
        logger.warn({ emergencyEventId, contactPhone }, 'Emergency SMS failed')

        // Fallback to email
        if (contactEmail) {
          channel = 'email'
          try {
            await this.sendEmail(contactEmail, userId, emergencyEventId)
            status = 'sent'
            logger.info({ emergencyEventId, contactEmail }, 'Emergency email sent')
          } catch (emailErr) {
            failureReason = `SMS failed, Email failed: ${String(emailErr)}`
            status = 'failed'
            logger.warn({ emergencyEventId, contactEmail }, 'Emergency email failed')
          }
        } else {
          status = 'failed'
        }
      }
    } else if (contactEmail) {
      channel = 'email'
      try {
        await this.sendEmail(contactEmail, userId, emergencyEventId)
        status = 'sent'
      } catch (err) {
        failureReason = `Email failed: ${String(err)}`
        status = 'failed'
        logger.warn({ emergencyEventId, contactEmail }, 'Emergency email failed')
      }
    } else {
      status = 'failed'
      failureReason = 'No contact phone or email available'
    }

    // Record notification attempt
    await db.run(
      `INSERT INTO emergency_notifications (id, emergency_event_id, trusted_contact_id, channel, status, attempted_at, failure_reason)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [notificationId, emergencyEventId, trustedContactId, channel, status, now, failureReason]
    )
  }

  private async sendSMS(phone: string, userId: string, emergencyEventId: string): Promise<void> {
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error('Twilio credentials not configured')
    }

    // In production, use actual Twilio API
    // For now, log the intent
    logger.info({ phone, userId, emergencyEventId }, 'SMS would be sent via Twilio')
  }

  private async sendEmail(email: string, userId: string, emergencyEventId: string): Promise<void> {
    const smtpHost = process.env.SMTP_HOST

    if (!smtpHost) {
      throw new Error('Email provider not configured')
    }

    // In production, use actual email provider (SendGrid, AWS SES, etc.)
    // For now, log the intent
    logger.info({ email, userId, emergencyEventId }, 'Email would be sent via SMTP')
  }

  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string
  ): Promise<Notification> {
    const notificationId = uuidv4()
    const now = new Date().toISOString()

    await db.run(
      `INSERT INTO notifications (id, user_id, type, title, message, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [notificationId, userId, type, title, message, 'pending', now]
    )

    return {
      id: notificationId,
      userId,
      type,
      title,
      message,
      status: 'pending',
      createdAt: now,
    }
  }

  async getUserNotifications(userId: string, limit = 50): Promise<Notification[]> {
    const rows = await db.all(
      `SELECT id, user_id, type, title, message, status, created_at
       FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
      [userId, limit]
    )
    return (rows || []).map(r => ({
      id: r.id,
      userId: r.user_id,
      type: r.type,
      title: r.title,
      message: r.message,
      status: r.status,
      createdAt: r.created_at,
    }))
  }
}

export const notificationService = new NotificationService()
