export type Screen =
  | 'onboarding'
  | 'home'
  | 'context-questions'
  | 'route-comparison'
  | 'route-detail'
  | 'safety-map'
  | 'active-journey'
  | 'offline-pack'
  | 'low-connectivity'
  | 'offline-navigation'
  | 'deviation-alert'
  | 'checkin'
  | 'missed-checkin'
  | 'emergency-gesture'
  | 'emergency'
  | 'emergency-contacts'
  | 'protector-network'
  | 'protector-command'
  | 'privacy'
  | 'threat-alert'

export type ThreatType = 'snatching' | 'bad-behaviour' | 'crime-suspected'

export type NetworkStatus = 'good' | 'weak' | 'offline'
export type TimeOfDay = 'day' | 'night'
export type JourneyStatus = 'none' | 'normal' | 'deviation'

export interface AppState {
  screen: Screen
  battery: number
  network: NetworkStatus
  timeOfDay: TimeOfDay
  journeyStatus: JourneyStatus
  checkInMissed: boolean
  userName: string
  destination: string
  selectedRoute: 'A' | 'B' | 'C' | null
  offlinePackReady: boolean
  onboardingComplete: boolean
  situation: string
  showWhyPanel: boolean
  isProtectorMode: boolean
  activeThreat: ThreatType | null
}

export type Action =
  | { type: 'NAVIGATE'; screen: Screen }
  | { type: 'SET_THREAT'; threat: ThreatType | null }
  | { type: 'SET_BATTERY'; battery: number }
  | { type: 'SET_NETWORK'; network: NetworkStatus }
  | { type: 'SET_TIME'; timeOfDay: TimeOfDay }
  | { type: 'SET_JOURNEY'; journeyStatus: JourneyStatus }
  | { type: 'SET_CHECKIN_MISSED'; missed: boolean }
  | { type: 'SET_DESTINATION'; destination: string }
  | { type: 'SELECT_ROUTE'; route: 'A' | 'B' | 'C' }
  | { type: 'SET_OFFLINE_PACK' }
  | { type: 'SET_SITUATION'; situation: string }
  | { type: 'TOGGLE_WHY'; show: boolean }
  | { type: 'SET_PROTECTOR_MODE'; isProtector: boolean }
  | { type: 'COMPLETE_ONBOARDING'; name: string }

export interface MockRoute {
  id: 'A' | 'B' | 'C'
  label: string
  duration: number
  distance: string
  tags: string[]
  lighting: string
  crowd: string
  connectivity: string
  helpPoints: number
  isolated: string
  color: string
  score: number
  recommended?: boolean
}

export interface MockProtector {
  id: string
  name: string
  role: string
  organization?: string
  area: string
  availability: string
  status: string
  responseTime: string
  verified: boolean
  avatar: string
}

export interface EmergencyRequest {
  id: string
  userName: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  time: string
  battery: number
  connectivity: string
  situation: string
  location: string
  reasons: string[]
}
