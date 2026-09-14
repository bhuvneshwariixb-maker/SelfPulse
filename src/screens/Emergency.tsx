import { useState } from 'react'
import type { AppState, Action, Screen } from '../types'
import { C, Card, Button, ScreenWrapper, StatusIndicator } from '../components/ui'

interface Props {
  state: AppState
  dispatch: (a: Action) => void
  navigate: (s: Screen) => void
}

// ─── Emergency Gesture Screen ─────────────────────────────────────────────────

export function EmergencyGestureScreen({ state, dispatch, navigate }: Props) {
  const [activated, setActivated] = useState(false)
  const [pressTimer, setPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [pressProgress, setPressProgress] = useState(0)

  const startPress = () => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 4
      setPressProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setActivated(true)
      }
    }, 60)
    const timer = setTimeout(() => {
      clearInterval(interval)
    }, 2000)
    setPressTimer(timer)
  }

  const endPress = () => {
    if (pressTimer) clearTimeout(pressTimer)
    if (!activated) setPressProgress(0)
  }

  const handleEmergency = () => navigate('emergency')
  const handleCancel = () => { setActivated(false); setPressProgress(0); navigate('home') }

  return (
    <div style={{
      flex: 1,
      background: activated ? 'rgba(239,68,68,0.05)' : C.bg,
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 20px',
      gap: 20,
    }}>
      {!activated ? (
        <>
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <div style={{ display: 'inline-flex', padding: '4px 14px', background: 'rgba(239,68,68,0.12)', border: `1px solid ${C.danger}44`, borderRadius: 20, marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: C.danger, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Emergency Gesture</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: C.text, margin: 0 }}>Do you need assistance?</h2>
            <p style={{ fontSize: 13, color: C.secondary, margin: '8px 0 0', lineHeight: 1.5 }}>
              Hold the button below for 2 seconds to activate emergency mode.
            </p>
          </div>

          {/* Hold button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, flex: 1, justifyContent: 'center' }}>
            <div
              onMouseDown={startPress}
              onMouseUp={endPress}
              onTouchStart={startPress}
              onTouchEnd={endPress}
              className={pressProgress > 0 ? 'emergency-pulse' : ''}
              style={{
                width: 120, height: 120,
                borderRadius: '50%',
                background: `conic-gradient(${C.danger} ${pressProgress * 3.6}deg, rgba(239,68,68,0.15) ${pressProgress * 3.6}deg)`,
                border: `3px solid ${C.danger}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                transition: 'transform 0.1s',
                transform: pressProgress > 0 ? 'scale(0.95)' : 'scale(1)',
              }}
            >
              <div style={{
                width: 100, height: 100,
                borderRadius: '50%',
                background: pressProgress > 0 ? 'rgba(239,68,68,0.2)' : C.card,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 4,
              }}>
                <span style={{ fontSize: 32 }}>🚨</span>
                <span style={{ fontSize: 10, color: C.danger, fontWeight: 700, letterSpacing: '0.05em', textAlign: 'center', lineHeight: 1.3 }}>
                  {pressProgress > 0 ? `${Math.round(pressProgress)}%` : 'HOLD'}
                </span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: C.muted, textAlign: 'center' }}>
              Hold for 2 seconds · or triple-tap to activate
            </p>
          </div>

          <Button onClick={handleCancel} variant="ghost" fullWidth>Cancel — I&apos;m safe</Button>
        </>
      ) : (
        <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <div style={{
              width: 72, height: 72,
              borderRadius: '50%',
              background: 'rgba(239,68,68,0.15)',
              border: `2px solid ${C.danger}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32,
              margin: '0 auto 12px',
            }} className="emergency-pulse">
              🚨
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: C.danger, margin: 0 }}>EMERGENCY MODE</h2>
            <p style={{ fontSize: 13, color: C.secondary, margin: '6px 0 0', lineHeight: 1.5 }}>
              Your location is being tracked. Select what you need.
            </p>
          </div>

          {/* Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <StatusIndicator label="Battery" value={`${state.battery}%`} color={state.battery <= 15 ? C.danger : C.success} icon="⚡" />
            <StatusIndicator label="GPS" value="Sharing" color={C.success} icon="📍" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Button onClick={handleEmergency} variant="danger" size="lg" fullWidth style={{ height: 56 }}>
              📞 Call Emergency Services
            </Button>
            <Button onClick={handleEmergency} variant="danger" size="md" fullWidth>
              📍 Share Location with Contacts
            </Button>
            <Button onClick={() => navigate('protector-network')} variant="secondary" size="md" fullWidth>
              🛡 Contact a Protector
            </Button>
            <Button onClick={handleCancel} variant="ghost" size="md" fullWidth>
              ✕ Cancel — I&apos;m safe
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Emergency Screen ─────────────────────────────────────────────────────────

export function EmergencyScreen({ state, dispatch, navigate }: Props) {
  const [smsSent, setSmsSent] = useState(false)
  const [step, setStep] = useState<'active' | 'sent'>('active')

  const handleSMS = () => {
    setSmsSent(true)
    setTimeout(() => setStep('sent'), 1500)
  }

  return (
    <div style={{
      flex: 1,
      background: '#0F0206',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 20px 32px',
      gap: 14,
    }}>
      {/* Emergency header */}
      <div style={{
        background: 'rgba(239,68,68,0.2)',
        border: '1px solid rgba(239,68,68,0.5)',
        borderRadius: 14,
        padding: '14px 16px',
        textAlign: 'center',
      }}>
        <span className="font-mono" style={{ fontSize: 14, color: C.danger, fontWeight: 800, letterSpacing: '0.12em' }}>
          🚨 EMERGENCY ACTIVE
        </span>
      </div>

      {/* Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <StatusIndicator label="Battery" value={`${state.battery}%`} color={state.battery <= 5 ? C.danger : C.warning} icon="⚡" />
        <StatusIndicator label="GPS" value="Active" color={C.success} icon="📍" />
        <StatusIndicator label="Internet" value={state.network === 'offline' ? 'OFFLINE' : state.network === 'weak' ? 'WEAK' : 'OK'} color={state.network === 'offline' ? C.danger : state.network === 'weak' ? C.warning : C.success} icon="📶" />
        <StatusIndicator label="SOS" value="Active" color={C.danger} icon="🆘" />
      </div>

      {/* SMS fallback */}
      <Card style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <p style={{ fontSize: 12, color: C.danger, fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Emergency communication
        </p>
        {state.network === 'offline' ? (
          <p style={{ fontSize: 12, color: C.secondary, margin: 0, lineHeight: 1.4 }}>
            Internet offline. If cellular signal is available, SMS fallback will be attempted.
          </p>
        ) : (
          <p style={{ fontSize: 12, color: C.secondary, margin: 0, lineHeight: 1.4 }}>
            Alert sent via internet. SMS backup available if connection drops.
          </p>
        )}
        <div style={{
          background: C.card,
          borderRadius: 10,
          padding: '10px 12px',
          marginTop: 10,
          border: `1px solid ${C.border}`,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          color: C.secondary,
          lineHeight: 1.6,
        }}>
          <div style={{ color: C.danger, fontWeight: 700, marginBottom: 4 }}>SHEVIBES EMERGENCY</div>
          <div>Assistance requested.</div>
          <div>Location: Near Dadar Stn</div>
          <div>Time: {state.timeOfDay === 'night' ? '11:48 PM' : '2:48 PM'}</div>
          <div>Battery: {state.battery}%</div>
          {state.network === 'offline' && <div style={{ color: C.warning }}>Internet: OFFLINE</div>}
        </div>
        {!smsSent ? (
          <button
            onClick={handleSMS}
            style={{
              marginTop: 8,
              width: '100%',
              background: 'rgba(239,68,68,0.15)',
              border: `1px solid ${C.danger}44`,
              borderRadius: 8,
              padding: '8px',
              cursor: 'pointer',
              fontSize: 12,
              color: C.danger,
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
            }}
          >
            {state.network === 'offline' ? 'Attempt SMS fallback (simulated)' : 'Send SMS backup (simulated)'}
          </button>
        ) : (
          <div style={{ marginTop: 8, padding: '8px', textAlign: 'center', color: step === 'sent' ? C.success : C.warning, fontSize: 12 }}>
            {step === 'active' ? '⏳ Sending...' : '✓ SMS sent to emergency contacts'}
          </div>
        )}
        {state.network === 'offline' && (
          <p style={{ fontSize: 10, color: C.muted, margin: '6px 0 0', lineHeight: 1.4 }}>
            Note: SMS requires cellular signal. This is simulated in the prototype. SMS will not work with zero signal.
          </p>
        )}
      </Card>

      {/* Communication priority */}
      <Card>
        <p style={{ fontSize: 12, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>
          Communication priority
        </p>
        {[
          { n: '1', label: 'Internet alert', status: state.network !== 'offline' ? 'Active' : 'Unavailable', ok: state.network !== 'offline' },
          { n: '2', label: 'SMS (cellular)', status: 'Attempting...', ok: null },
          { n: '3', label: 'Phone call option', status: 'Available', ok: true },
          { n: '4', label: 'Offline information', status: 'Ready', ok: true },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '7px 0', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none' }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: item.ok === true ? 'rgba(34,197,94,0.15)' : item.ok === false ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, color: item.ok === true ? C.success : item.ok === false ? C.danger : C.warning,
              fontWeight: 700, flexShrink: 0,
            }}>{item.n}</div>
            <span style={{ fontSize: 13, color: C.secondary, flex: 1 }}>{item.label}</span>
            <span style={{ fontSize: 11, color: item.ok === true ? C.success : item.ok === false ? C.danger : C.warning }}>{item.status}</span>
          </div>
        ))}
      </Card>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Button onClick={() => navigate('protector-network')} variant="primary" size="lg" fullWidth>
          🛡 Contact a Protector
        </Button>
        <Button onClick={() => navigate('active-journey')} variant="secondary" size="md" fullWidth>
          ✕ I&apos;m safe — Cancel emergency
        </Button>
      </div>
    </div>
  )
}
