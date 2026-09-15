import { apiClient } from './api.js'
import { logger } from '../utils/logger.js'

class SafetyService {
  async analyzeRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    distance: number,
    duration: number,
    journeyId?: string
  ): Promise<any> {
    try {
      const response = await apiClient.analyzeRoute(origin, destination, distance, duration, journeyId)
      if (response.success) {
        return { success: true, data: response.data }
      }
      return { success: false, error: response.error }
    } catch (err) {
      logger.error('Route analysis failed', err)
      return { success: false, error: 'Failed to analyze route' }
    }
  }

  async getNearbyLocations(latitude: number, longitude: number, radius: number = 5): Promise<any> {
    try {
      const response = await apiClient.getNearbyLocations(latitude, longitude, radius)
      if (response.success) {
        return response.data
      }
      return null
    } catch (err) {
      logger.error('Get nearby locations failed', err)
      return null
    }
  }

  async getProtectors(): Promise<any[]> {
    try {
      const response = await apiClient.getProtectors()
      if (response.success) {
        return response.data || []
      }
      return []
    } catch (err) {
      logger.error('Get protectors failed', err)
      return []
    }
  }

  async getCommunityReports(latitude: number, longitude: number, radius?: number): Promise<any[]> {
    try {
      const response = await apiClient.getNearbyReports(latitude, longitude, radius)
      if (response.success) {
        return response.data || []
      }
      return []
    } catch (err) {
      logger.error('Get community reports failed', err)
      return []
    }
  }

  async reportIncident(
    latitude: number,
    longitude: number,
    category: string,
    description: string,
    severity?: string
  ): Promise<any> {
    try {
      const response = await apiClient.createCommunityReport(latitude, longitude, category, description, severity)
      if (response.success) {
        return { success: true, data: response.data }
      }
      return { success: false, error: response.error }
    } catch (err) {
      logger.error('Report incident failed', err)
      return { success: false, error: 'Failed to submit report' }
    }
  }
}

export const safetyService = new SafetyService()
