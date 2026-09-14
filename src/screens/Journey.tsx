import { useState, useEffect } from 'react'
import type { AppState, Action, Screen } from '../types'
import { C, Card, Button, BackButton, ScreenWrapper, CityMap, StatusIndicator } from '../components/ui'
import { OFFLINE_PACK_ITEMS } from '../data'

interface Props {
  state: AppState
  dispatch: (a: Action) => void
  navigate: (s: Screen) => void
}

// ─── Offline Pack Preparation ─────────────────────────────────────────────────

export function OfflinePackScreen({ state, dispatch, navigate }: Props) {
  const [checkedItems, setCheckedItems] = useState<number[]>([])
  const [allDone, setAllDone] = useState(false)

  useEffect(() => {
    OFFLINE_PACK_ITEMS.forEach((item, i) => {
      setTimeout(() => {
        setCheckedItems(prev => [...prev, i])
        if (i === OFFLINE_PACK_ITEMS.length - 1) {
          setTimeout(() => {
            setAllDone(true)
            dispatch({ type: 'SET_OFFLINE_PACK' })
          }, 400)
        }
      }, item.delay + 200)
    })
  }, [dispatch])

  return (
    <ScreenWrapper state={state}>
      <div style={{ padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32, height: 32,
              borderRadius: '50%',
              border: `2px solid ${allDone ? C.success : C.primary}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}
            className={allDone ? '' : 'spin'}
          >
            {allDone ? '✓' : '◎'}
          </div>
          <div>
            <p style={{ fontSize: 11, color: C.primary, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
              {allDone ? 'Ready' : 'Preparing...'}
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: C.text, margin: '2px 0 0' }}>Offline Journey Pack</h2>
          </div>
        </div>

        {/* Connectivity prediction */}
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '12px 14px' }}>
          <p style={{ fontSize: 12, color: C.warning, fontWeight: 600, margin: '0 0 4px' }}>🟡 Low-connectivity area ahead</p>
          <p style={{ fontSize: 12, color: C.secondary, margin: 0, lineHeight: 1.4 }}>
            Connectivity may become unstable in approximately 8 minutes. Saving essential journey information now.
          </p>
          <p style={{ fontSize: 10, color: C.muted, margin: '4px 0 0' }}>This is a prediction based on historical coverage data, not a guarantee.</p>
        </div>

        {/* Pack items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {OFFLINE_PACK_ITEMS.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                background: checkedItems.includes(i) ? 'rgba(34,197,94,0.06)' : C.card,
                border: `1px solid ${checkedItems.includes(i) ? 'rgba(34,197,94,0.2)' : C.border}`,
                borderRadius: 10,
                transition: 'all 0.4s',
              }}
            >
              <div
                style={{
                  width: 22, height: 22, borderRadius: '50%',
                  border: `2px solid ${checkedItems.includes(i) ? C.success : C.border}`,
                  background: checkedItems.includes(i) ? C.success : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: '#fff', flexShrink: 0,
                  transition: 'all 0.3s',
                }}
              >
                {checkedItems.includes(i) ? '✓' : ''}
              </div>
              <span style={{ fontSize: 13, color: checkedItems.includes(i) ? C.text : C.muted, transition: 'color 0.3s' }}>{item.label}</span>
            </div>
          ))}
        </div>

        {allDone && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: C.success, fontWeight: 600, margin: '0 0 4px' }}>✓ Offline journey pack ready</p>
              <p style={{ fontSize: 12, color: C.secondary, margin: 0 }}>Your journey will continue even if internet disappears.</p>
            </div>
            <Button onClick={() => navigate('active-journey')} size="lg" fullWidth>Begin Journey →</Button>
          </div>
        )}
      </div>
    </ScreenWrapper>
  )
}

// ─── Active Journey ───────────────────────────────────────────────────────────

export function ActiveJourneyScreen({ state, dispatch, navigate }: Props) {
  const isLowPower = state.battery <= 10 && state.battery > 5
  const isCritical = state.battery <= 5

  if (isCritical) {
    return (
      <div style={{ flex: 1, background: C.bgCritical, display: 'flex', flexDirection: 'column', padding: 16, gap: 12 }}>
        <div style={{
          background: 'rgba(239,68,68,0.2)',
          border: '1px solid rgba(239,68,68,0.5)',
          borderRadius: 12,
          padding: '10px 14px',
          textAlign: 'center',
        }}>
          <span className="font-mono" style={{ fontSize: 12, color: C.danger, fontWeight: 700, letterSpacing: '0.12em' }}>CRITICAL JOURNEY MODE</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <StatusIndicator label="Battery" value="5%" color={C.danger} icon="⚡" />
          <StatusIndicator label="Internet" value={state.network === 'offline' ? 'OFFLINE' : state.network.toUpperCase()} color={state.network === 'offline' ? C.danger : C.warning} icon="📶" />
          <StatusIndicator label="GPS" value="Active" color={C.success} icon="📍" />
          <StatusIndicator label="Route" value="Saved ✓" color={C.success} icon="🗺" />
        </div>

        <p style={{ fontSize: 13, color: C.secondary, textAlign: 'center', lineHeight: 1.5, flex: 1 }}>
          Essential journey mode active. Only critical functions are running to preserve battery.
        </p>

        <Button onClick={() => navigate('checkin')} variant="secondary" size="lg" fullWidth>I&apos;m Safe — Check In</Button>
        <Button onClick={() => navigate('emergency')} variant="danger" size="lg" fullWidth>🚨 Emergency</Button>
      </div>
    )
  }

  return (
    <ScreenWrapper state={state} style={{ background: isLowPower ? C.bgDeep : C.bg }}>
      <div style={{ padding: '12px 20px 90px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Journey header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 11, color: C.primary, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
              {isLowPower ? '⚡ LOW POWER MODE' : 'Journey Active'}
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: C.text, margin: '2px 0 0' }}>
              Heading to {state.destination || 'Home'}
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="font-mono" style={{ fontSize: 28, fontWeight: 700, color: C.primary }}>18</span>
            <span style={{ fontSize: 12, color: C.muted, display: 'block' }}>min left</span>
          </div>
        </div>

        {/* Route B map with connectivity */}
        {!isLowPower && (
          <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.border}` }}>
            <CityMap showRoute="B" showConnectivity height={160} />
          </div>
        )}

        {/* Connectivity prediction */}
        <Card style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.warning }} />
            <span style={{ fontSize: 12, color: C.warning, fontWeight: 600 }}>Connectivity weakening ahead</span>
          </div>
          <p style={{ fontSize: 12, color: C.secondary, margin: 0, lineHeight: 1.4 }}>
            Signal may become unstable in ~{state.network === 'weak' ? '2' : '8'} min. Offline journey pack is active and ready.
          </p>
        </Card>

        {/* Status cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <StatusIndicator label="Battery" value={`${state.battery}%`} color={isLowPower ? C.warning : C.success} icon="⚡" />
          <StatusIndicator
            label="Network"
            value={state.network === 'good' ? 'Good' : state.network === 'weak' ? 'Weak' : 'Offline'}
            color={state.network === 'good' ? C.success : state.network === 'weak' ? C.warning : C.danger}
            icon="📶"
          />
          <StatusIndicator label="GPS" value="Active" color={C.success} icon="📍" />
          <StatusIndicator label="Offline Pack" value="Ready ✓" color={C.success} icon="📦" />
        </div>

        {/* Turn directions */}
        <div>
          <p style={{ fontSize: 12, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Next turns</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { turn: 'Continue straight', dist: '0.4 km', bold: true },
              { turn: 'Turn left at main crossing', dist: '0.9 km', bold: false },
              { turn: 'Pass hospital junction', dist: '1.2 km', bold: false },
            ].map((t, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px',
                background: t.bold ? C.primaryMuted : C.card,
                border: `1px solid ${t.bold ? C.primary + '44' : C.border}`,
                borderRadius: 10,
              }}>
                <span style={{ fontSize: 13, color: t.bold ? C.text : C.secondary, fontWeight: t.bold ? 600 : 400 }}>
                  {i === 0 ? '↑ ' : i === 1 ? '← ' : '◆ '}{t.turn}
                </span>
                <span className="font-mono" style={{ fontSize: 12, color: C.muted }}>{t.dist}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Help points */}
        {!isLowPower && (
          <div>
            <p style={{ fontSize: 12, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
              Nearby help points
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { icon: '🏥', name: 'Sion Hospital', dist: '0.8 km', type: 'Hospital' },
                { icon: '🚔', name: 'Dadar Police Post', dist: '1.2 km', type: 'Police' },
                { icon: '🛡', name: 'Community Safe Zone', dist: '0.4 km', type: 'Safe Zone' },
              ].map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 12px', background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, alignItems: 'center' }}>
                  <span style={{ fontSize: 18 }}>{h.icon}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{h.name}</span>
                    <span style={{ fontSize: 11, color: C.muted, display: 'block' }}>{h.type}</span>
                  </div>
                  <span className="font-mono" style={{ fontSize: 12, color: C.secondary }}>{h.dist}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Check-in button */}
        <Button onClick={() => navigate('checkin')} variant="secondary" size="lg" fullWidth>
          ✓ Quick Check-in
        </Button>
        <Button onClick={() => navigate('emergency')} variant="danger" size="md" fullWidth>
          🚨 Emergency
        </Button>
      </div>
    </ScreenWrapper>
  )
}

// ─── Low Connectivity Mode ────────────────────────────────────────────────────

export function LowConnectivityScreen({ state, dispatch, navigate }: Props) {
  return (
    <ScreenWrapper state={state}>
      <div style={{ padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
          <div style={{
            width: 64, height: 64,
            borderRadius: '50%',
            background: 'rgba(245,158,11,0.15)',
            border: `2px solid ${C.warning}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
            margin: '0 auto 12px',
          }}>
            📶
          </div>
          <div style={{ display: 'inline-flex', padding: '4px 14px', background: 'rgba(245,158,11,0.15)', border: `1px solid ${C.warning}44`, borderRadius: 20, marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: C.warning, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>LOW CONNECTIVITY MODE</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: C.text, margin: 0 }}>Signal weakening</h2>
          <p style={{ fontSize: 14, color: C.secondary, margin: '6px 0 0', lineHeight: 1.5 }}>
            Essential journey information is available offline.
          </p>
        </div>

        {/* Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <StatusIndicator label="Internet" value="Weak" color={C.warning} icon="📶" />
          <StatusIndicator label="GPS" value="Available" color={C.success} icon="📍" />
          <StatusIndicator label="Battery" value={`${state.battery}%`} color={state.battery <= 15 ? C.warning : C.success} icon="⚡" />
          <StatusIndicator label="Offline Pack" value="Active ✓" color={C.success} icon="📦" />
        </div>

        <Card>
          <p style={{ fontSize: 12, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>What remains available</p>
          {[
            { icon: '🗺', label: 'Saved route and directions' },
            { icon: '📍', label: 'GPS navigation (no internet needed)' },
            { icon: '🏥', label: 'Cached help point locations' },
            { icon: '📞', label: 'Emergency contacts' },
            { icon: '✓', label: 'Check-in (will send when signal returns)' },
          ].map((i, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '7px 0', borderBottom: idx < 4 ? `1px solid ${C.border}` : 'none' }}>
              <span style={{ fontSize: 16 }}>{i.icon}</span>
              <span style={{ fontSize: 13, color: C.secondary }}>{i.label}</span>
            </div>
          ))}
        </Card>

        <Card style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <p style={{ fontSize: 13, color: C.warning, fontWeight: 600, margin: '0 0 4px' }}>Reduced activity mode active</p>
          <p style={{ fontSize: 12, color: C.secondary, margin: 0, lineHeight: 1.4 }}>
            Background refresh, map tiles, and non-essential functions are paused to preserve battery and data.
          </p>
        </Card>

        <Button onClick={() => navigate('active-journey')} size="lg" fullWidth>Continue Journey</Button>
        <Button onClick={() => navigate('emergency')} variant="danger" size="md" fullWidth>🚨 Emergency</Button>
      </div>
    </ScreenWrapper>
  )
}

// ─── Offline Navigation ───────────────────────────────────────────────────────

export function OfflineNavigationScreen({ state, dispatch, navigate }: Props) {
  const isCritical = state.battery <= 5

  return (
    <div style={{
      flex: 1,
      background: isCritical ? C.bgCritical : C.bgDeep,
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 20px 32px',
      gap: 16,
    }}>
      {/* Status header */}
      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <div style={{
          display: 'inline-flex',
          padding: '6px 16px',
          background: 'rgba(239,68,68,0.15)',
          border: '1px solid rgba(239,68,68,0.4)',
          borderRadius: 20,
          marginBottom: 10,
        }}>
          <span className="font-mono" style={{ fontSize: 11, color: C.danger, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>OFFLINE JOURNEY MODE</span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Internet unavailable</h2>
        <p style={{ fontSize: 13, color: C.secondary, margin: '6px 0 0' }}>Your saved journey continues.</p>
      </div>

      {/* Status grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 12, padding: '10px 12px',
        }}>
          <span style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Internet</span>
          <span className="font-mono" style={{ fontSize: 14, fontWeight: 700, color: C.danger }}>OFFLINE</span>
        </div>
        <StatusIndicator label="GPS" value="AVAILABLE" color={C.success} icon="📍" />
        <StatusIndicator label="Battery" value={`${state.battery}%`} color={isCritical ? C.danger : C.warning} icon="⚡" />
        <div style={{
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.25)',
          borderRadius: 12, padding: '10px 12px',
        }}>
          <span style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>Saved Route</span>
          <span className="font-mono" style={{ fontSize: 14, fontWeight: 700, color: C.success }}>ACTIVE</span>
        </div>
      </div>

      {/* Checklist */}
      <Card style={{ padding: 14 }}>
        {[
          { label: 'Saved route available', ok: true },
          { label: 'Help points available', ok: true },
          { label: 'Emergency contacts ready', ok: true },
          { label: 'Check-in available', ok: true },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', gap: 10, alignItems: 'center',
            padding: '8px 0',
            borderBottom: i < 3 ? `1px solid ${C.border}` : 'none',
          }}>
            <span style={{ color: C.success, fontSize: 14 }}>✓</span>
            <span style={{ fontSize: 13, color: C.secondary }}>{item.label}</span>
          </div>
        ))}
      </Card>

      {/* GPS note */}
      <div style={{
        background: 'rgba(96,165,250,0.08)',
        border: '1px solid rgba(96,165,250,0.2)',
        borderRadius: 12,
        padding: '10px 14px',
      }}>
        <p style={{ fontSize: 12, color: '#60A5FA', fontWeight: 600, margin: '0 0 2px' }}>📍 GPS does not require internet</p>
        <p style={{ fontSize: 11, color: C.secondary, margin: 0, lineHeight: 1.4 }}>
          Your position is tracked locally via GPS satellite. Navigation continues without data connection.
        </p>
      </div>

      <div style={{ flex: 1 }} />

      <Button onClick={() => navigate('active-journey')} size="lg" fullWidth>Continue Journey →</Button>
      <Button onClick={() => navigate('emergency')} variant="danger" size="lg" fullWidth>🚨 Emergency</Button>
    </div>
  )
}

// ─── Deviation Alert ──────────────────────────────────────────────────────────

export function DeviationAlertScreen({ state, dispatch, navigate }: Props) {
  return (
    <ScreenWrapper state={state}>
      <div style={{ padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        <div style={{ textAlign: 'center', paddingTop: 12 }}>
          <div style={{
            width: 64, height: 64,
            borderRadius: '50%',
            background: 'rgba(245,158,11,0.15)',
            border: `2px solid ${C.warning}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
            margin: '0 auto 12px',
          }}>
            ⚠
          </div>
          <div style={{ display: 'inline-flex', padding: '4px 14px', background: 'rgba(245,158,11,0.12)', border: `1px solid ${C.warning}44`, borderRadius: 20, marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: C.warning, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI Detection</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: C.text, margin: 0 }}>Unusual journey pattern</h2>
          <p style={{ fontSize: 14, color: C.secondary, margin: '8px auto 0', maxWidth: 260, lineHeight: 1.5 }}>
            Your current route appears different from your expected journey. Are you okay?
          </p>
        </div>

        {/* Deviation info */}
        <Card style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <p style={{ fontSize: 12, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Deviation details</p>
          {[
            { label: 'Expected route', val: 'Route B — Home, Dadar' },
            { label: 'Current position', val: 'Near Mahim Junction' },
            { label: 'Time', val: '11:48 PM' },
            { label: 'Deviation', val: '~0.9 km from expected' },
          ].map((d, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 3 ? `1px solid ${C.border}` : 'none' }}>
              <span style={{ fontSize: 12, color: C.muted }}>{d.label}</span>
              <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{d.val}</span>
            </div>
          ))}
        </Card>

        <p style={{ fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
          The AI has detected an unusual pattern. No assumptions are made. You are in control.
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button onClick={() => { dispatch({ type: 'SET_JOURNEY', journeyStatus: 'normal' }); navigate('active-journey') }} size="lg" fullWidth>
            ✓ I&apos;m Safe — Continue
          </Button>
          <Button onClick={() => navigate('route-comparison')} variant="secondary" size="md" fullWidth>
            Change Route
          </Button>
          <Button onClick={() => navigate('checkin')} variant="secondary" size="md" fullWidth>
            Contact Someone
          </Button>
          <Button onClick={() => navigate('emergency')} variant="danger" size="lg" fullWidth>
            🚨 Emergency
          </Button>
        </div>
      </div>
    </ScreenWrapper>
  )
}

// ─── Check-in ─────────────────────────────────────────────────────────────────

export function CheckInScreen({ state, dispatch, navigate }: Props) {
  const [checkedIn, setCheckedIn] = useState(false)

  const handleCheckIn = () => {
    setCheckedIn(true)
    dispatch({ type: 'SET_CHECKIN_MISSED', missed: false })
    setTimeout(() => navigate('active-journey'), 2000)
  }

  return (
    <ScreenWrapper state={state}>
      <div style={{ padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <BackButton navigate={navigate} to="active-journey" />

        <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '20px 0' }}>
          {checkedIn ? (
            <div className="fade-in">
              <div className="check-pop" style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(34,197,94,0.15)',
                border: `3px solid ${C.success}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 40, margin: '0 auto 16px',
              }}>✓</div>
              <h2 style={{ fontSize: 22, fontWeight: 600, color: C.success, margin: '0 0 8px' }}>Check-in sent</h2>
              <p style={{ fontSize: 14, color: C.secondary, margin: 0 }}>Your contacts have been notified. Stay safe.</p>
            </div>
          ) : (
            <>
              <div>
                <p style={{ fontSize: 11, color: C.primary, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 8px' }}>Scheduled check-in</p>
                <h2 style={{ fontSize: 24, fontWeight: 600, color: C.text, margin: 0 }}>Quick check-in</h2>
                <p style={{ fontSize: 14, color: C.secondary, margin: '8px 0 0', lineHeight: 1.5 }}>
                  Let your contacts know you&apos;re okay.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
                <StatusIndicator label="Time" value="11:48 PM" color={C.secondary} />
                <StatusIndicator label="Location" value="Dadar" color={C.success} icon="📍" />
              </div>

              <Button
                onClick={handleCheckIn}
                size="lg"
                fullWidth
                style={{ height: 64, fontSize: 20, borderRadius: 16 }}
              >
                ✓ I&apos;M SAFE
              </Button>

              <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                Next check-in in 15 minutes
              </p>
            </>
          )}
        </div>
      </div>
    </ScreenWrapper>
  )
}

// ─── Missed Check-in ──────────────────────────────────────────────────────────

export function MissedCheckinScreen({ state, dispatch, navigate }: Props) {
  return (
    <ScreenWrapper state={state}>
      <div style={{ padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        <div style={{ textAlign: 'center', paddingTop: 12 }}>
          <div style={{
            width: 64, height: 64,
            borderRadius: '50%',
            background: 'rgba(239,68,68,0.12)',
            border: `2px solid ${C.danger}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
            margin: '0 auto 12px',
          }} className="soft-pulse">
            ⏰
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: C.text, margin: 0 }}>Check-in missed</h2>
          <p style={{ fontSize: 14, color: C.secondary, margin: '8px 0 0', lineHeight: 1.5 }}>
            Your scheduled check-in at 11:45 PM was not completed.
          </p>
        </div>

        <Card>
          <p style={{ fontSize: 12, color: C.muted, margin: '0 0 8px' }}>What happens next depends on your choice.</p>
          <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>
            No automatic actions are taken. Emergency contacts are not notified unless you authorise it.
          </p>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button onClick={() => { dispatch({ type: 'SET_CHECKIN_MISSED', missed: false }); navigate('checkin') }} size="lg" fullWidth>
            ✓ Check in now
          </Button>
          <Button
            onClick={() => navigate('active-journey')}
            variant="secondary"
            size="md"
            fullWidth
          >
            Continue journey
          </Button>
          <Button
            onClick={() => navigate('emergency')}
            variant="danger"
            size="lg"
            fullWidth
          >
            🚨 Emergency
          </Button>
        </div>
      </div>
    </ScreenWrapper>
  )
}
