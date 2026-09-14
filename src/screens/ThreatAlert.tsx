import { useState, useEffect, useRef } from 'react'
import type { AppState, Action, Screen, ThreatType } from '../types'
import { C, Button } from '../components/ui'

interface Props {
  state: AppState
  dispatch: (a: Action) => void
  navigate: (s: Screen) => void
  threatType: ThreatType
}

const THREAT_CONFIG: Record<ThreatType, { title: string; subtitle: string; icon: string; color: string }> = {
  snatching: {
    title: 'Snatching Alert',
    subtitle: 'Sudden movement pattern detected near you. SafePulse has flagged this for your attention.',
    icon: '⚡',
    color: '#EF4444',
  },
  'bad-behaviour': {
    title: 'Unsafe Situation',
    subtitle: 'Distressing interaction detected. You are not alone — help is available immediately.',
    icon: '⚠',
    color: '#F97316',
  },
  'crime-suspected': {
    title: 'Unusual Activity',
    subtitle: 'Unusual environmental pattern detected. SafePulse is monitoring and ready to assist.',
    icon: '🔴',
    color: '#EF4444',
  },
}

export function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()

    const beep = (startTime: number, freq: number, dur: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(freq, startTime)
      gain.gain.setValueAtTime(0.3, startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + dur)
    }

    const t = ctx.currentTime
    beep(t, 880, 0.15)
    beep(t + 0.2, 1100, 0.15)
    beep(t + 0.4, 880, 0.15)
    beep(t + 0.6, 1100, 0.15)
    beep(t + 0.8, 880, 0.3)
    beep(t + 1.2, 1100, 0.3)
    beep(t + 1.6, 660, 0.6)
  } catch {
    // Audio context may not be available in all environments
  }
}

export default function ThreatAlertScreen({ state, dispatch, navigate, threatType }: Props) {
  const [flashPhase, setFlashPhase] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [actionTaken, setActionTaken] = useState<string | null>(null)
  const flashRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const config = THREAT_CONFIG[threatType]

  useEffect(() => {
    // Flash effect: cycle through red intensities
    let count = 0
    flashRef.current = setInterval(() => {
      setFlashPhase(p => (p + 1) % 4)
      count++
      if (count > 12) {
        if (flashRef.current) clearInterval(flashRef.current)
        setFlashPhase(3) // settle on dim red
      }
    }, 250)

    // Play sound on mount
    playAlertSound()

    return () => {
      if (flashRef.current) clearInterval(flashRef.current)
    }
  }, [])

  const flashBg = [
    'rgba(239,68,68,0.6)',
    'rgba(239,68,68,0.15)',
    'rgba(239,68,68,0.5)',
    'rgba(239,68,68,0.08)',
  ][flashPhase]

  const handleAction = (action: string) => {
    setActionTaken(action)
    if (action === 'emergency') navigate('emergency')
    if (action === 'call-police') navigate('emergency-contacts')
    if (action === 'protectors') navigate('protector-network')
    if (action === 'safe') {
      dispatch({ type: 'SET_THREAT', threat: null })
      navigate('active-journey')
    }
  }

  return (
    <div style={{
      flex: 1,
      background: flashBg,
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 20px 32px',
      gap: 16,
      transition: 'background 0.2s ease',
    }}>
      {/* Alert banner */}
      <div style={{
        background: 'rgba(239,68,68,0.3)',
        border: '2px solid rgba(239,68,68,0.7)',
        borderRadius: 14,
        padding: '14px 16px',
        textAlign: 'center',
      }} className="emergency-pulse">
        <span className="font-mono" style={{ fontSize: 13, color: '#FF8080', fontWeight: 800, letterSpacing: '0.15em' }}>
          🚨 SHEVIBES THREAT DETECTION
        </span>
      </div>

      {/* Icon + Title */}
      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(239,68,68,0.2)',
          border: `3px solid ${config.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36,
          margin: '0 auto 16px',
        }} className="emergency-pulse">
          {config.icon}
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 8px', fontFamily: 'Fraunces, Georgia, serif' }}>
          {config.title}
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.6, maxWidth: 280, marginInline: 'auto' }}>
          {config.subtitle}
        </p>
      </div>

      {/* Status */}
      <div style={{
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: '12px 14px',
      }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>
          System status
        </p>
        {[
          { icon: '📍', label: 'Your location', val: 'Being monitored' },
          { icon: '⚡', label: 'Battery', val: `${state.battery}%` },
          { icon: '📶', label: 'Signal', val: state.network === 'offline' ? 'Offline' : state.network === 'weak' ? 'Weak' : 'Active' },
          { icon: '📦', label: 'Offline pack', val: state.offlinePackReady ? 'Ready' : 'N/A' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
            <span style={{ fontSize: 14 }}>{s.icon}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', flex: 1 }}>{s.label}</span>
            <span style={{ fontSize: 12, color: '#fff', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* Important note */}
      <div style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: '10px 14px',
      }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
          ⚠ SafePulse detects unusual patterns, not crimes. No assumptions are made. You control all actions. This is a simulated detection in the prototype.
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
        <button
          onClick={() => handleAction('emergency')}
          style={{
            padding: '16px',
            background: 'rgba(239,68,68,0.3)',
            border: '2px solid rgba(239,68,68,0.6)',
            borderRadius: 14,
            cursor: 'pointer',
            color: '#fff',
            fontSize: 16,
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          className="emergency-pulse"
        >
          🚨 Activate Emergency Mode
        </button>

        <button
          onClick={() => handleAction('call-police')}
          style={{
            padding: '13px',
            background: 'rgba(59,130,246,0.2)',
            border: '1.5px solid rgba(59,130,246,0.4)',
            borderRadius: 12,
            cursor: 'pointer',
            color: '#93C5FD',
            fontSize: 14,
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          🚔 Call Police — 100
        </button>

        <button
          onClick={() => handleAction('protectors')}
          style={{
            padding: '13px',
            background: 'rgba(168,85,247,0.15)',
            border: '1.5px solid rgba(168,85,247,0.3)',
            borderRadius: 12,
            cursor: 'pointer',
            color: '#C4B5FD',
            fontSize: 14,
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          🛡 Contact a Protector
        </button>

        <button
          onClick={() => handleAction('safe')}
          style={{
            padding: '11px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.55)',
            fontSize: 13,
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 500,
          }}
        >
          I&apos;m safe — Dismiss alert
        </button>
      </div>
    </div>
  )
}
