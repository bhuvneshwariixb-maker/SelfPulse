import { useState } from 'react'
import type { AppState, Action, Screen } from '../types'
import { C, batteryColor, networkColor, Card, Button, EmergencyFAB, ScreenWrapper, SectionHeader, StatusIndicator } from '../components/ui'

interface Props {
  state: AppState
  dispatch: (a: Action) => void
  navigate: (s: Screen) => void
}

const quickActions = [
  { icon: '↗', label: 'AI Routes', screen: 'context-questions' as Screen, color: C.primary },
  { icon: '◉', label: 'Safety Map', screen: 'safety-map' as Screen, color: '#A855F7' },
  { icon: '◈', label: 'Protectors', screen: 'protector-network' as Screen, color: '#22C55E' },
  { icon: '📞', label: 'Emergency', screen: 'emergency-contacts' as Screen, color: C.danger },
]

export default function HomeScreen({ state, dispatch, navigate }: Props) {
  const [dest, setDest] = useState(state.destination || '')
  const isCritical = state.battery <= 5
  const isLowPower = state.battery <= 10 && !isCritical

  const handleStartJourney = () => {
    if (dest.trim()) {
      dispatch({ type: 'SET_DESTINATION', destination: dest })
      navigate('context-questions')
    }
  }

  // Critical mode — minimal UI
  if (isCritical) {
    return (
      <div style={{ flex: 1, background: C.bgCritical, display: 'flex', flexDirection: 'column', padding: 20, gap: 16 }}>
        <div style={{
          background: 'rgba(239,68,68,0.15)',
          border: '1px solid rgba(239,68,68,0.4)',
          borderRadius: 12, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span className="font-mono" style={{ fontSize: 11, color: C.danger, letterSpacing: '0.1em', fontWeight: 700 }}>CRITICAL JOURNEY MODE</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <StatusIndicator label="Battery" value="5%" color={C.danger} icon="⚡" />
          <StatusIndicator label="Internet" value={state.network === 'offline' ? 'OFFLINE' : 'Weak'} color={C.danger} icon="📶" />
          <StatusIndicator label="GPS" value="Active" color={C.success} icon="📍" />
          <StatusIndicator label="Route" value="Saved" color={C.success} icon="🗺" />
        </div>
        <p style={{ fontSize: 13, color: C.secondary, textAlign: 'center', lineHeight: 1.5 }}>
          Essential journey mode active. Route and emergency contacts available offline.
        </p>
        <Button onClick={() => navigate('active-journey')} variant="primary" size="lg" fullWidth>Continue Journey</Button>
        <Button onClick={() => navigate('emergency')} variant="danger" size="lg" fullWidth>🚨 Emergency</Button>
      </div>
    )
  }

  return (
    <ScreenWrapper state={state} style={{ position: 'relative' }}>
      <div style={{ padding: '16px 20px 100px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Greeting */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, color: C.muted, margin: 0, fontWeight: 500 }}>
                {state.timeOfDay === 'night' ? '🌙 Good evening' : '☀️ Good day'}, {state.userName}
              </p>
              <h1 className="font-display" style={{ fontSize: 28, fontWeight: 600, color: C.text, margin: '4px 0 0', lineHeight: 1.1 }}>
                Where are<br />
                <em style={{ color: C.primaryLight, fontStyle: 'italic' }}>you going?</em>
              </h1>
            </div>
            <button
              onClick={() => navigate('protector-command')}
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: C.primaryMuted,
                border: `1.5px solid ${C.primary}44`,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}
              title="Switch to Protector mode"
            >⚙</button>
          </div>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: C.card,
            border: `1.5px solid ${dest ? C.primary : C.border}`,
            borderRadius: 14,
            padding: '12px 16px',
            transition: 'border-color 0.2s',
          }}>
            <span style={{ fontSize: 16 }}>🔍</span>
            <input
              value={dest}
              onChange={e => setDest(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStartJourney()}
              placeholder="Enter destination..."
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                fontSize: 15,
                color: C.text,
                fontFamily: 'Outfit, sans-serif',
              }}
            />
            {dest && <button onClick={() => setDest('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 14 }}>✕</button>}
          </div>
          <Button
            onClick={handleStartJourney}
            disabled={!dest.trim()}
            size="lg"
            fullWidth
            style={{ background: dest.trim() ? `linear-gradient(135deg, ${C.primary}, #8B0F5A)` : C.surface }}
          >
            ↗ Start Journey
          </Button>
        </div>

        {/* Status grid */}
        <div>
          <SectionHeader title="Current Status" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <StatusIndicator
              label="Battery"
              value={`${state.battery}%`}
              color={batteryColor(state.battery)}
              icon="⚡"
            />
            <StatusIndicator
              label="Network"
              value={state.network === 'good' ? 'Good' : state.network === 'weak' ? 'Weak' : 'Offline'}
              color={networkColor(state.network)}
              icon="📶"
            />
            <StatusIndicator label="GPS" value="Available" color={C.success} icon="📍" />
            <StatusIndicator
              label="Journey"
              value={state.journeyStatus === 'none' ? 'Not started' : state.journeyStatus === 'normal' ? 'Active' : 'Deviation'}
              color={state.journeyStatus === 'deviation' ? C.warning : state.journeyStatus === 'normal' ? C.success : C.muted}
              icon="🗺"
            />
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <SectionHeader title="Quick Actions" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {quickActions.map(a => (
              <button
                key={a.label}
                onClick={() => navigate(a.screen)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  padding: '14px 8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: 20, color: a.color }}>{a.icon}</span>
                <span style={{ fontSize: 10, color: C.secondary, fontFamily: 'Outfit, sans-serif', fontWeight: 600, textAlign: 'center', letterSpacing: '0.03em' }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active journey card (if journey in progress) */}
        {state.journeyStatus !== 'none' && (
          <Card glow style={{ cursor: 'pointer' }} onClick={() => navigate('active-journey')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.primary, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Journey Active</span>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.success }} className="soft-pulse" />
            </div>
            <p style={{ fontSize: 14, color: C.text, margin: 0 }}>Heading to {state.destination || 'Home'}</p>
            <p style={{ fontSize: 12, color: C.muted, margin: '4px 0 0' }}>Route B · ~18 min remaining · Tap to view</p>
          </Card>
        )}

        {/* Feature highlight */}
        <Card style={{ background: 'linear-gradient(135deg, rgba(224,21,122,0.08), rgba(168,85,247,0.08))', border: `1px solid ${C.primaryMuted}` }}>
          <p style={{ fontSize: 11, color: C.primaryLight, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 6px' }}>AI-Powered</p>
          <p style={{ fontSize: 14, color: C.text, margin: 0, lineHeight: 1.5 }}>
            SafePulse doesn&apos;t just find a route.<br />
            <span style={{ color: C.secondary }}>It understands the journey you&apos;re in.</span>
          </p>
        </Card>

      </div>

      {/* Emergency FAB */}
      <EmergencyFAB navigate={navigate} />
    </ScreenWrapper>
  )
}
