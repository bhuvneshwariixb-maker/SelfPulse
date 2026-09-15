import { apiClient } from './api.js'
import { logger } from '../utils/logger.js'

export interface AuthState {
  token: string | null
  user: any | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

class AuthService {
  async register(name: string, email: string, password: string, phone?: string): Promise<any> {
    try {
      const response = await apiClient.register(name, email, password, phone)
      if (response.success && response.data) {
        apiClient.setToken(response.data.token)
        return { success: true, data: response.data }
      }
      return { success: false, error: response.error }
    } catch (err) {
      logger.error('Registration failed', err)
      return { success: false, error: 'Registration failed' }
    }
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const response = await apiClient.login(email, password)
      if (response.success && response.data) {
        apiClient.setToken(response.data.token)
        localStorage.setItem('auth_token', response.data.token)
        return { success: true, data: response.data }
      }
      return { success: false, error: response.error }
    } catch (err) {
      logger.error('Login failed', err)
      return { success: false, error: 'Login failed' }
    }
  }

  async logout(): Promise<void> {
    apiClient.clearToken()
    localStorage.removeItem('auth_token')
  }

  async getCurrentUser(): Promise<any> {
    try {
      const response = await apiClient.getCurrentUser()
      if (response.success) {
        return response.data
      }
      return null
    } catch (err) {
      logger.error('Get current user failed', err)
      return null
    }
  }

  restoreToken(): void {
    const token = localStorage.getItem('auth_token')
    if (token) {
      apiClient.setToken(token)
    }
  }
}

export const authService = new AuthService()
