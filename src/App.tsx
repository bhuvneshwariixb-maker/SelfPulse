import { useReducer, useState } from 'react'
import type { AppState, Action, Screen, ThreatType } from './types'

import { StatusBar, BottomNav, C, batteryBg } from './components/ui'
import DemoPanel from './components/DemoPanel'
import VoiceAssistant from './components/VoiceAssistant'

import OnboardingScreen from './screens/Onboarding'
import HomeScreen from './screens/Home'
import {
  ContextQuestionsScreen,
  RouteComparisonScreen,
  RouteDetailScreen,
} from './screens/RouteFlow'
import SafetyMapScreen from './screens/SafetyMap'
import {
  OfflinePackScreen,
  ActiveJourneyScreen,
  LowConnectivityScreen,
  OfflineNavigationScreen,
  DeviationAlertScreen,
  CheckInScreen,
  MissedCheckinScreen,
} from './screens/Journey'
import {
  EmergencyGestureScreen,
  EmergencyScreen,
} from './screens/Emergency'
import { ProtectorNetworkScreen, ProtectorCommandScreen } from './screens/Protector'
import PrivacyScreen from './screens/Privacy'
import EmergencyContactsScreen from './screens/EmergencyContacts'
import ThreatAlertScreen from './screens/ThreatAlert'

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: AppState = {
  screen: 'home',
  battery: 82,
  network: 'good',
  timeOfDay: 'night',
  journeyStatus: 'none',
  checkInMissed: false,
  userName: 'Priya',
  destination: 'Home, Dadar West',
  selectedRoute: 'B',
  offlinePackReady: false,
  onboardingComplete: true,
  situation: 'returning-home',
  showWhyPanel: false,
  isProtectorMode: false,
  activeThreat: null,
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, screen: action.screen, showWhyPanel: false }
    case 'SET_BATTERY':
      return { ...state, battery: action.battery }
    case 'SET_NETWORK':
      return { ...state, network: action.network }
    case 'SET_TIME':
      return { ...state, timeOfDay: action.timeOfDay }
    case 'SET_JOURNEY':
      return { ...state, journeyStatus: action.journeyStatus }
    case 'SET_CHECKIN_MISSED':
      return { ...state, checkInMissed: action.missed }
    case 'SET_DESTINATION':
      return { ...state, destination: action.destination }
    case 'SELECT_ROUTE':
      return { ...state, selectedRoute: action.route }
    case 'SET_OFFLINE_PACK':
      return { ...state, offlinePackReady: true }
    case 'SET_SITUATION':
      return { ...state, situation: action.situation }
    case 'TOGGLE_WHY':
      return { ...state, showWhyPanel: action.show }
    case 'SET_PROTECTOR_MODE':
      return { ...state, isProtectorMode: action.isProtector }
    case 'COMPLETE_ONBOARDING':
      return { ...state, onboardingComplete: true, userName: action.name, screen: 'home' }
    case 'SET_THREAT':
      return { ...state, activeThreat: action.threat, screen: action.threat ? 'threat-alert' : state.screen }
    default:
      return state
  }
}

// ─── Screens that hide the nav bar ───────────────────────────────────────────

const NO_NAV: Screen[] = [
  'onboarding',
  'emergency-gesture',
  'emergency',
  'offline-navigation',
  'deviation-alert',
  'missed-checkin',
  'protector-command',
  'threat-alert',
]

const NO_STATUS: Screen[] = ['onboarding']

// ─── Screen Renderer ──────────────────────────────────────────────────────────

function renderScreen(
  state: AppState,
  dispatch: (a: Action) => void,
  navigate: (s: Screen) => void
) {
  const props = { state, dispatch, navigate }
  switch (state.screen) {
    case 'onboarding': return <OnboardingScreen dispatch={dispatch} />
    case 'home': return <HomeScreen {...props} />
    case 'context-questions': return <ContextQuestionsScreen {...props} />
    case 'route-comparison': return <RouteComparisonScreen {...props} />
    case 'route-detail': return <RouteDetailScreen {...props} />
    case 'safety-map': return <SafetyMapScreen {...props} />
    case 'active-journey': return <ActiveJourneyScreen {...props} />
    case 'offline-pack': return <OfflinePackScreen {...props} />
    case 'low-connectivity': return <LowConnectivityScreen {...props} />
    case 'offline-navigation': return <OfflineNavigationScreen {...props} />
    case 'deviation-alert': return <DeviationAlertScreen {...props} />
    case 'checkin': return <CheckInScreen {...props} />
    case 'missed-checkin': return <MissedCheckinScreen {...props} />
    case 'emergency-gesture': return <EmergencyGestureScreen {...props} />
    case 'emergency': return <EmergencyScreen {...props} />
    case 'protector-network': return <ProtectorNetworkScreen {...props} />
    case 'protector-command': return <ProtectorCommandScreen {...props} />
    case 'privacy': return <PrivacyScreen {...props} />
    case 'emergency-contacts': return <EmergencyContactsScreen {...props} />
    case 'threat-alert': return (
      <ThreatAlertScreen
        {...props}
        threatType={(state.activeThreat as ThreatType) || 'snatching'}
      />
    )
    default: return <HomeScreen {...props} />
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [demoPanelOpen, setDemoPanelOpen] = useState(true)

  const navigate = (screen: Screen) => dispatch({ type: 'NAVIGATE', screen })

  const showNav = !NO_NAV.includes(state.screen) && state.battery > 5
  const showStatus = !NO_STATUS.includes(state.screen)
  const isCritical = state.battery <= 5
  const bgColor = batteryBg(state.battery)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#04040C',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 16,
      paddingBottom: demoPanelOpen ? 200 : 60,
    }}>
      {/* App header (outside phone) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
        padding: '0 16px',
      }}>
        <span className="font-display" style={{
          fontSize: 18,
          fontWeight: 600,
          color: C.primary,
          letterSpacing: '0.02em',
        }}>SafePulse</span>
        <span style={{ fontSize: 11, color: C.muted, fontFamily: 'Outfit, sans-serif' }}>·</span>
        <span style={{ fontSize: 11, color: C.muted, fontFamily: 'Outfit, sans-serif', fontStyle: 'italic' }}>
          Your journey, understood.
        </span>
      </div>

      {/* Phone frame */}
      <div
        style={{
          width: '100%',
          maxWidth: 390,
          height: 780,
          borderRadius: 40,
          overflow: 'hidden',
          background: bgColor,
          border: `1px solid ${isCritical ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: isCritical
            ? '0 0 40px rgba(239,68,68,0.15), 0 20px 60px rgba(0,0,0,0.6)'
            : '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.5s ease',
          position: 'relative',
        }}
      >
        {/* Notch bar */}
        {showStatus && (
          <div style={{ background: bgColor, borderBottom: `1px solid ${C.border}` }}>
            {/* Notch */}
            <div style={{
              width: 120,
              height: 6,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '0 0 8px 8px',
              margin: '8px auto 0',
            }} />
            <StatusBar
              battery={state.battery}
              network={state.network}
              timeOfDay={state.timeOfDay}
              critical={isCritical}
            />
          </div>
        )}

        {/* Screen content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {renderScreen(state, dispatch, navigate)}
          {/* Voice assistant — shows on most screens */}
          {!['onboarding', 'threat-alert', 'emergency-gesture'].includes(state.screen) && (
            <VoiceAssistant
              state={state}
              navigate={navigate}
              onCheckIn={() => dispatch({ type: 'SET_CHECKIN_MISSED', missed: false })}
            />
          )}
        </div>

        {/* Bottom navigation */}
        {showNav && (
          <BottomNav
            active={state.screen}
            navigate={navigate}
            battery={state.battery}
          />
        )}

        {/* Low power overlay indicator */}
        {state.battery <= 10 && state.battery > 5 && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.15)',
            pointerEvents: 'none',
          }} />
        )}
      </div>

      {/* Battery / mode label */}
      <div style={{ marginTop: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
        {isCritical && (
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            color: C.danger,
            fontWeight: 700,
            letterSpacing: '0.12em',
            padding: '3px 10px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 20,
          }}>CRITICAL MODE</span>
        )}
        {state.battery <= 10 && !isCritical && (
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            color: C.warning,
            fontWeight: 700,
            letterSpacing: '0.12em',
            padding: '3px 10px',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 20,
          }}>LOW POWER MODE</span>
        )}
        {state.network === 'offline' && (
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            color: C.danger,
            letterSpacing: '0.1em',
            padding: '3px 10px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 20,
          }}>OFFLINE MODE</span>
        )}
      </div>

      {/* Demo panel */}
      <DemoPanel
        state={state}
        dispatch={dispatch}
        navigate={navigate}
        open={demoPanelOpen}
        setOpen={setDemoPanelOpen}
      />
    </div>
  )
}
