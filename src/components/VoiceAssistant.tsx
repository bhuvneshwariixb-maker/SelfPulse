import { useState, useEffect, useRef } from 'react'
import type { Screen, AppState } from '../types'
import { C } from './ui'

interface Props {
  state: AppState
  navigate: (s: Screen) => void
  onCheckIn: () => void
}

type ListenState = 'idle' | 'listening' | 'processing' | 'responding'

interface VoiceCommand {
  keywords: string[]
  response: string
  action?: (navigate: (s: Screen) => void, onCheckIn: () => void) => void
}

const COMMANDS: VoiceCommand[] = [
  {
    keywords: ['emergency', 'help', 'sos'],
    response: 'Activating emergency mode now.',
    action: (nav) => nav('emergency'),
  },
  {
    keywords: ['police', 'call police', '100'],
    response: 'Connecting to emergency contacts. Police number is 100.',
    action: (nav) => nav('emergency-contacts'),
  },
  {
    keywords: ["i'm safe", "im safe", 'safe', 'check in', 'check-in'],
    response: "Check-in sent to your contacts. Stay safe, Priya.",
    action: (_, checkIn) => checkIn(),
  },
  {
    keywords: ['hospital', 'doctor', 'medical', 'clinic'],
    response: 'Showing nearest hospitals and clinics on the map.',
    action: (nav) => nav('safety-map'),
  },
  {
    keywords: ['navigate', 'go home', 'route', 'directions'],
    response: 'Starting route planning to Home, Dadar West.',
    action: (nav) => nav('context-questions'),
  },
  {
    keywords: ['protector', 'protectors', 'security'],
    response: 'Showing verified protectors near you.',
    action: (nav) => nav('protector-network'),
  },
  {
    keywords: ['offline', 'no internet', 'network'],
    response: 'Your offline journey pack is ready. Navigation continues without internet.',
    action: (nav) => nav('offline-navigation'),
  },
  {
    keywords: ['battery', 'low battery'],
    response: 'Battery saving mode is active. Non-essential functions are paused.',
  },
  {
    keywords: ['map', 'safety map', 'area'],
    response: 'Opening the community safety map.',
    action: (nav) => nav('safety-map'),
  },
  {
    keywords: ['contacts', 'numbers', 'helpline'],
    response: 'Opening emergency contacts and helpline numbers.',
    action: (nav) => nav('emergency-contacts'),
  },
]

const DEMO_PHRASES = [
  '"Emergency"',
  '"Nearest hospital"',
  '"I\'m safe"',
  '"Navigate home"',
  '"Call police"',
  '"Show protectors"',
]

function matchCommand(input: string): VoiceCommand | null {
  const lower = input.toLowerCase()
  return COMMANDS.find(cmd => cmd.keywords.some(k => lower.includes(k))) || null
}

export default function VoiceAssistant({ state, navigate, onCheckIn }: Props) {
  const [open, setOpen] = useState(false)
  const [listenState, setListenState] = useState<ListenState>('idle')
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [demoIdx, setDemoIdx] = useState(0)
  const [waveAmplitudes, setWaveAmplitudes] = useState([0.3, 0.5, 0.7, 0.4, 0.6, 0.8, 0.5, 0.3])
  const recogRef = useRef<any>(null)
  const waveRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Animate waveform when listening
  useEffect(() => {
    if (listenState === 'listening') {
      waveRef.current = setInterval(() => {
        setWaveAmplitudes(prev => prev.map(() => 0.2 + Math.random() * 0.8))
      }, 100)
    } else {
      if (waveRef.current) clearInterval(waveRef.current)
      setWaveAmplitudes([0.3, 0.5, 0.7, 0.4, 0.6, 0.8, 0.5, 0.3])
    }
    return () => { if (waveRef.current) clearInterval(waveRef.current) }
  }, [listenState])

  const startListening = () => {
    setListenState('listening')
    setTranscript('')
    setResponse('')

    // Try Web Speech API first
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recog = new SpeechRecognition()
      recog.continuous = false
      recog.interimResults = true
      recog.lang = 'en-IN'
      recogRef.current = recog

      recog.onresult = (event: any) => {
        const text = Array.from(event.results as any[])
          .map((r: any) => r[0].transcript)
          .join('')
        setTranscript(text)
        if (event.results[0].isFinal) {
          processCommand(text)
        }
      }
      recog.onerror = () => simulateListening()
      recog.onend = () => {
        if (listenState === 'listening') simulateListening()
      }
      recog.start()
    } else {
      // Fallback: simulate listening
      setTimeout(() => simulateListening(), 2000)
    }
  }

  const simulateListening = () => {
    const phrase = DEMO_PHRASES[demoIdx % DEMO_PHRASES.length].replace(/['"]/g, '')
    setDemoIdx(i => i + 1)
    setTranscript(phrase)
    setTimeout(() => processCommand(phrase), 800)
  }

  const processCommand = (text: string) => {
    if (recogRef.current) {
      recogRef.current.stop()
      recogRef.current = null
    }
    setListenState('processing')
    setTimeout(() => {
      const cmd = matchCommand(text)
      const res = cmd
        ? cmd.response
        : "I didn't catch that. Try saying 'emergency', 'nearest hospital', or 'I'm safe'."
      setResponse(res)
      setListenState('responding')

      // Execute action after showing response
      if (cmd?.action) {
        setTimeout(() => {
          cmd.action!(navigate, onCheckIn)
          setOpen(false)
          setListenState('idle')
        }, 2000)
      } else {
        setTimeout(() => setListenState('idle'), 3000)
      }
    }, 600)
  }

  const stopListening = () => {
    if (recogRef.current) {
      recogRef.current.stop()
      recogRef.current = null
    }
    setListenState('idle')
    setTranscript('')
    setResponse('')
  }

  // Don't show in critical battery (saves power)
  if (state.battery <= 5) return null

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { setOpen(true); startListening() }}
        style={{
          position: 'absolute',
          bottom: state.battery <= 10 ? 90 : 90,
          left: 16,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: open ? C.primary : `linear-gradient(135deg, rgba(224,21,122,0.3), rgba(168,85,247,0.3))`,
          border: `1.5px solid ${open ? C.primary : 'rgba(224,21,122,0.4)'}`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          boxShadow: open ? `0 0 20px ${C.primary}66` : '0 4px 12px rgba(0,0,0,0.4)',
          zIndex: 10,
          transition: 'all 0.3s',
        }}
        title="Voice Assistant"
      >
        🎙
      </button>

      {/* Voice modal */}
      {open && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            zIndex: 20,
            padding: '0 0 80px',
          }}
          onClick={() => { stopListening(); setOpen(false) }}
        >
          <div
            className="slide-up"
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              background: C.card,
              border: `1px solid ${C.primary}33`,
              borderRadius: '24px 24px 0 0',
              padding: '20px 20px 28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
            }}
          >
            {/* Drag handle */}
            <div style={{ width: 40, height: 4, background: C.border, borderRadius: 2 }} />

            {/* Label */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: C.primary, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px' }}>
                SafePulse Voice
              </p>
              <p style={{ fontSize: 14, color: C.secondary, margin: 0 }}>
                {listenState === 'idle' && 'Tap the mic to speak'}
                {listenState === 'listening' && 'Listening...'}
                {listenState === 'processing' && 'Processing...'}
                {listenState === 'responding' && 'Response ready'}
              </p>
            </div>

            {/* Waveform */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 48 }}>
              {waveAmplitudes.map((amp, i) => (
                <div
                  key={i}
                  style={{
                    width: 4,
                    height: listenState === 'listening' ? `${amp * 48}px` : listenState === 'processing' ? '24px' : '6px',
                    borderRadius: 2,
                    background: listenState === 'listening'
                      ? `hsl(${320 + i * 8}, 80%, 65%)`
                      : listenState === 'processing'
                      ? C.warning
                      : C.muted,
                    transition: 'height 0.1s ease, background 0.3s',
                  }}
                />
              ))}
            </div>

            {/* Mic button */}
            <button
              onClick={listenState === 'listening' ? stopListening : () => startListening()}
              style={{
                width: 68, height: 68,
                borderRadius: '50%',
                background: listenState === 'listening'
                  ? `linear-gradient(135deg, ${C.primary}, #8B0F5A)`
                  : listenState === 'processing'
                  ? 'rgba(245,158,11,0.2)'
                  : C.surface,
                border: `2px solid ${listenState === 'listening' ? C.primary : C.border}`,
                cursor: 'pointer',
                fontSize: 26,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s',
                boxShadow: listenState === 'listening' ? `0 0 24px ${C.primary}55` : 'none',
              }}
              className={listenState === 'listening' ? 'soft-pulse' : ''}
            >
              {listenState === 'processing' ? '⏳' : '🎙'}
            </button>

            {/* Transcript */}
            {transcript && (
              <div className="fade-in" style={{
                background: C.surface,
                borderRadius: 10,
                padding: '10px 14px',
                width: '100%',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: 11, color: C.muted, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>You said</p>
                <p style={{ fontSize: 15, color: C.text, margin: 0, fontStyle: 'italic' }}>"{transcript}"</p>
              </div>
            )}

            {/* Response */}
            {response && (
              <div className="fade-in" style={{
                background: C.primaryMuted,
                border: `1px solid ${C.primary}33`,
                borderRadius: 10,
                padding: '10px 14px',
                width: '100%',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: 11, color: C.primary, margin: '0 0 4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  ✦ SafePulse
                </p>
                <p style={{ fontSize: 14, color: C.text, margin: 0, lineHeight: 1.5 }}>{response}</p>
              </div>
            )}

            {/* Suggestion chips */}
            {listenState === 'idle' && !transcript && (
              <div style={{ width: '100%' }}>
                <p style={{ fontSize: 11, color: C.muted, textAlign: 'center', margin: '0 0 8px' }}>Try saying...</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {DEMO_PHRASES.map(phrase => (
                    <button
                      key={phrase}
                      onClick={() => {
                        const text = phrase.replace(/['"]/g, '')
                        setTranscript(text)
                        setListenState('processing')
                        setTimeout(() => processCommand(text), 500)
                      }}
                      style={{
                        padding: '5px 12px',
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        borderRadius: 20,
                        cursor: 'pointer',
                        fontSize: 11,
                        color: C.secondary,
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Close */}
            <button
              onClick={() => { stopListening(); setOpen(false) }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, color: C.muted, fontFamily: 'Outfit, sans-serif',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
