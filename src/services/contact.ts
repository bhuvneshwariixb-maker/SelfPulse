import { apiClient } from './api.js'
import { logger } from '../utils/logger.js'

class ContactService {
  async createTrustedContact(
    name: string,
    phone?: string,
    email?: string,
    relationship?: string,
    priority?: number
  ): Promise<any> {
    try {
      const response = await apiClient.createTrustedContact(name, phone, email, relationship, priority)
      if (response.success) {
        return { success: true, data: response.data }
      }
      return { success: false, error: response.error }
    } catch (err) {
      logger.error('Create trusted contact failed', err)
      return { success: false, error: 'Failed to create contact' }
    }
  }

  async getTrustedContacts(): Promise<any[]> {
    try {
      const response = await apiClient.getTrustedContacts()
      if (response.success) {
        return response.data || []
      }
      return []
    } catch (err) {
      logger.error('Get trusted contacts failed', err)
      return []
    }
  }

  async updateTrustedContact(contactId: string, updates: Record<string, any>): Promise<boolean> {
    try {
      const response = await apiClient.updateTrustedContact(contactId, updates)
      return response.success || false
    } catch (err) {
      logger.error('Update trusted contact failed', err)
      return false
    }
  }

  async deleteTrustedContact(contactId: string): Promise<boolean> {
    try {
      const response = await apiClient.deleteTrustedContact(contactId)
      return response.success || false
    } catch (err) {
      logger.error('Delete trusted contact failed', err)
      return false
    }
  }
}

export const contactService = new ContactService()
