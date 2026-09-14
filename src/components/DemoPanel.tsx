import type { AppState, Action, Screen, NetworkStatus, ThreatType } from '../types'
import { C } from './ui'

interface Props {
  state: AppState
  dispatch: (a: Action) => void
  navigate: (s: Screen) => void
  open: boolean
  setOpen: (v: boolean) => void
}

export default function DemoPanel({ state, dispatch, navigate, open, setOpen }: Props) {
  const bat = (b: number) => () => {
    dispatch({ type: 'SET_BATTERY', battery: b })
    if (b <= 5 && state.journeyStatus !== 'none') navigate('offline-navigation')
    else if (b <= 10 && state.journeyStatus !== 'none') navigate('active-journey')
  }

  const net = (n: NetworkStatus) => () => {
    dispatch({ type: 'SET_NETWORK', network: n })
    if (n === 'offline' && state.journeyStatus !== 'none') navigate('offline-navigation')
    else if (n === 'weak' && state.journeyStatus !== 'none') navigate('low-connectivity')
  }

  const btn = (
    label: string,
    active: boolean,
    onClick: () => void,
    color = C.primary
  ) => (
    <button
      onClick={onClick}
      style={{
        padding: '5px 10px',
        borderRadius: 8,
        border: `1.5px solid ${active ? color : 'rgba(255,255,255,0.12)'}`,
        background: active ? `${color}20` : 'rgba(255,255,255,0.04)',
        color: active ? color : 'rgba(255,255,255,0.5)',
        fontSize: 11,
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )

  const row = (label: string, children: React.ReactNode) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', minWidth: 52 }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{children}</div>
    </div>
  )

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: 'rgba(8,6,18,0.96)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(224,21,122,0.25)',
      transition: 'all 0.3s ease',
    }}>
      {/* Toggle tab */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'absolute',
          top: -28,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(8,6,18,0.9)',
          border: '1px solid rgba(224,21,122,0.3)',
          borderRadius: '8px 8px 0 0',
          padding: '4px 16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          borderBottom: 'none',
        }}
      >
        <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(224,21,122,0.8)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {open ? '▼ DEMO' : '▲ DEMO'}
        </span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace' }}>for judges</span>
      </button>

      {open && (
        <div style={{ padding: '12px 16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: 'rgba(224,21,122,0.8)', fontWeight: 700, letterSpacing: '0.15em' }}>
              HACKATHON DEMO CONTROLS
            </span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'Outfit, sans-serif' }}>
              UI responds immediately
            </span>
          </div>

          {/* Battery */}
          {row('Battery',
            <>
              {btn('100%', state.battery === 100, bat(100), '#22C55E')}
              {btn('82%', state.battery === 82, bat(82), '#22C55E')}
              {btn('15% ⚡', state.battery === 15, bat(15), '#F59E0B')}
              {btn('10% 🔋', state.battery === 10, bat(10), '#F59E0B')}
              {btn('5% 🔴', state.battery === 5, bat(5), C.danger)}
            </>
          )}

          {/* Network */}
          {row('Network',
            <>
              {btn('Good 🟢', state.network === 'good', net('good'), '#22C55E')}
              {btn('Weak 🟡', state.network === 'weak', net('weak'), '#F59E0B')}
              {btn('Offline 🔴', state.network === 'offline', net('offline'), C.danger)}
            </>
          )}

          {/* Time */}
          {row('Time',
            <>
              {btn('Day ☀', state.timeOfDay === 'day', () => dispatch({ type: 'SET_TIME', timeOfDay: 'day' }))}
              {btn('Night 🌙', state.timeOfDay === 'night', () => dispatch({ type: 'SET_TIME', timeOfDay: 'night' }))}
            </>
          )}

          {/* Journey */}
          {row('Journey',
            <>
              {btn('None', state.journeyStatus === 'none', () => dispatch({ type: 'SET_JOURNEY', journeyStatus: 'none' }))}
              {btn('Active', state.journeyStatus === 'normal', () => {
                dispatch({ type: 'SET_JOURNEY', journeyStatus: 'normal' })
                dispatch({ type: 'SET_OFFLINE_PACK' })
                navigate('active-journey')
              }, '#22C55E')}
              {btn('Deviation ⚠', state.journeyStatus === 'deviation', () => {
                dispatch({ type: 'SET_JOURNEY', journeyStatus: 'deviation' })
                navigate('deviation-alert')
              }, '#F59E0B')}
            </>
          )}

          {/* Check-in */}
          {row('Check-in',
            <>
              {btn('On time ✓', !state.checkInMissed, () => dispatch({ type: 'SET_CHECKIN_MISSED', missed: false }), '#22C55E')}
              {btn('Missed ✕', state.checkInMissed, () => {
                dispatch({ type: 'SET_CHECKIN_MISSED', missed: true })
                navigate('missed-checkin')
              }, C.danger)}
            </>
          )}

          {/* Emergency */}
          {row('Emergency',
            <>
              {btn('Normal', true, () => navigate('home'))}
              {btn('Gesture 🚨', false, () => navigate('emergency-gesture'), C.danger)}
              {btn('Active 🆘', false, () => navigate('emergency'), C.danger)}
            </>
          )}

          {/* Threat detection */}
          {row('Threat',
            <>
              {btn('None', !state.activeThreat, () => dispatch({ type: 'SET_THREAT', threat: null }))}
              {btn('Snatching ⚡', state.activeThreat === 'snatching', () => dispatch({ type: 'SET_THREAT', threat: 'snatching' as ThreatType }), C.danger)}
              {btn('Bad Behav ⚠', state.activeThreat === 'bad-behaviour', () => dispatch({ type: 'SET_THREAT', threat: 'bad-behaviour' as ThreatType }), '#F97316')}
              {btn('Suspected 🔴', state.activeThreat === 'crime-suspected', () => dispatch({ type: 'SET_THREAT', threat: 'crime-suspected' as ThreatType }), C.danger)}
            </>
          )}

          {/* Screens */}
          {row('Screens',
            <>
              {btn('Home', state.screen === 'home', () => navigate('home'))}
              {btn('Routes', state.screen === 'route-comparison', () => navigate('route-comparison'))}
              {btn('Map', state.screen === 'safety-map', () => navigate('safety-map'))}
              {btn('Contacts', state.screen === 'emergency-contacts', () => navigate('emergency-contacts'))}
              {btn('Protectors', state.screen === 'protector-network', () => navigate('protector-network'))}
              {btn('Command', state.screen === 'protector-command', () => navigate('protector-command'))}
              {btn('Offline Nav', state.screen === 'offline-navigation', () => navigate('offline-navigation'))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
