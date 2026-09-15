import { apiClient } from './api.js'
import { logger } from '../utils/logger.js'

class EmergencyService {
  async activateEmergency(
    activationMethod: string,
    latitude?: number,
    longitude?: number
  ): Promise<any> {
    try {
      const response = await apiClient.activateEmergency(activationMethod, latitude, longitude)
      if (response.success) {
        logger.info('Emergency activated successfully')
        return { success: true, data: response.data }
      }
      return { success: false, error: response.error }
    } catch (err) {
      logger.error('Emergency activation failed', err)
      return { success: false, error: 'Emergency activation failed' }
    }
  }

  async getEmergencyStatus(eventId: string): Promise<any> {
    try {
      const response = await apiClient.getEmergencyEvent(eventId)
      if (response.success) {
        return response.data
      }
      return null
    } catch (err) {
      logger.error('Get emergency status failed', err)
      return null
    }
  }

  async resolveEmergency(eventId: string): Promise<boolean> {
    try {
      const response = await apiClient.resolveEmergency(eventId)
      if (response.success) {
        logger.info('Emergency resolved')
        return true
      }
      return false
    } catch (err) {
      logger.error('Resolve emergency failed', err)
      return false
    }
  }
}

export const emergencyService = new EmergencyService()
