const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api'

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>
}

class APIClient {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
  }

  clearToken() {
    this.token = null
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    const url = `${API_BASE_URL}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const body = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: body.error || `HTTP ${response.status}`,
        }
      }

      return body
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }
    }
  }

  // Auth
  async register(name: string, email: string, password: string, phone?: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    })
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  // Users
  async getCurrentUser() {
    return this.request('/users/me')
  }

  // Emergency
  async activateEmergency(activationMethod: string, latitude?: number, longitude?: number) {
    return this.request('/emergency/activate', {
      method: 'POST',
      body: JSON.stringify({ activationMethod, latitude, longitude }),
    })
  }

  async getEmergencyEvent(eventId: string) {
    return this.request(`/emergency/${eventId}`)
  }

  async resolveEmergency(eventId: string) {
    return this.request(`/emergency/${eventId}/resolve`, {
      method: 'POST',
    })
  }

  // Journey
  async startJourney(origin: string, destination: string) {
    return this.request('/journey/start', {
      method: 'POST',
      body: JSON.stringify({ origin, destination }),
    })
  }

  async getActiveJourney() {
    return this.request('/journey/active')
  }

  async getJourney(journeyId: string) {
    return this.request(`/journey/${journeyId}`)
  }

  async addJourneyLocation(journeyId: string, latitude: number, longitude: number, accuracy?: number) {
    return this.request(`/journey/${journeyId}/location`, {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, accuracy }),
    })
  }

  async endJourney(journeyId: string) {
    return this.request(`/journey/${journeyId}/end`, {
      method: 'POST',
    })
  }

  // Routes
  async analyzeRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }, distance: number, duration: number, journeyId?: string) {
    return this.request('/routes/analyze', {
      method: 'POST',
      body: JSON.stringify({ origin, destination, distance, duration, journeyId }),
    })
  }

  async getRouteAnalysis(routeId: string) {
    return this.request(`/routes/${routeId}`)
  }

  // Safety Map
  async getNearbyLocations(latitude: number, longitude: number, radius?: number) {
    const params = new URLSearchParams()
    params.append('latitude', String(latitude))
    params.append('longitude', String(longitude))
    if (radius) params.append('radius', String(radius))
    return this.request(`/safety-map/nearby?${params}`)
  }

  // Trusted Contacts
  async createTrustedContact(name: string, phone?: string, email?: string, relationship?: string, priority?: number) {
    return this.request('/trusted-contacts', {
      method: 'POST',
      body: JSON.stringify({ name, phone, email, relationship, priority }),
    })
  }

  async getTrustedContacts() {
    return this.request('/trusted-contacts')
  }

  async updateTrustedContact(contactId: string, updates: Record<string, any>) {
    return this.request(`/trusted-contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteTrustedContact(contactId: string) {
    return this.request(`/trusted-contacts/${contactId}`, {
      method: 'DELETE',
    })
  }

  // Protectors
  async getProtectors() {
    return this.request('/protectors')
  }

  async getProtector(protectorId: string) {
    return this.request(`/protectors/${protectorId}`)
  }

  // Community Reports
  async createCommunityReport(latitude: number, longitude: number, category: string, description: string, severity?: string) {
    return this.request('/community-reports', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, category, description, severity }),
    })
  }

  async getNearbyReports(latitude: number, longitude: number, radius?: number) {
    const params = new URLSearchParams()
    params.append('latitude', String(latitude))
    params.append('longitude', String(longitude))
    if (radius) params.append('radius', String(radius))
    return this.request(`/community-reports/nearby?${params}`)
  }

  // Notifications
  async getNotifications(limit?: number) {
    const params = new URLSearchParams()
    if (limit) params.append('limit', String(limit))
    return this.request(`/notifications?${params}`)
  }
}

export const apiClient = new APIClient()
