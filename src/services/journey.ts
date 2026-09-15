import { apiClient } from './api.js'
import { logger } from '../utils/logger.js'

class JourneyService {
  async startJourney(origin: string, destination: string): Promise<any> {
    try {
      const response = await apiClient.startJourney(origin, destination)
      if (response.success) {
        return { success: true, data: response.data }
      }
      return { success: false, error: response.error }
    } catch (err) {
      logger.error('Start journey failed', err)
      return { success: false, error: 'Failed to start journey' }
    }
  }

  async getActiveJourney(): Promise<any> {
    try {
      const response = await apiClient.getActiveJourney()
      if (response.success) {
        return response.data
      }
      return null
    } catch (err) {
      logger.error('Get active journey failed', err)
      return null
    }
  }

  async getJourney(journeyId: string): Promise<any> {
    try {
      const response = await apiClient.getJourney(journeyId)
      if (response.success) {
        return response.data
      }
      return null
    } catch (err) {
      logger.error('Get journey failed', err)
      return null
    }
  }

  async updateLocation(journeyId: string, latitude: number, longitude: number, accuracy?: number): Promise<boolean> {
    try {
      const response = await apiClient.addJourneyLocation(journeyId, latitude, longitude, accuracy)
      return response.success || false
    } catch (err) {
      logger.error('Update location failed', err)
      return false
    }
  }

  async endJourney(journeyId: string): Promise<boolean> {
    try {
      const response = await apiClient.endJourney(journeyId)
      if (response.success) {
        return true
      }
      return false
    } catch (err) {
      logger.error('End journey failed', err)
      return false
    }
  }
}

export const journeyService = new JourneyService()
