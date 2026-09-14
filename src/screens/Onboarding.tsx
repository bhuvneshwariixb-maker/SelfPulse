import { useState } from 'react'
import type { Action } from '../types'
import { C, Button, Card } from '../components/ui'

interface Props {
  dispatch: (a: Action) => void
}

const steps = ['welcome', 'name', 'locations', 'contacts', 'preferences', 'settings'] as const
type Step = typeof steps[number]

const PREFS = [
  { id: 'fastest', label: 'Fastest route' },
  { id: 'connected', label: 'More connected areas' },
  { id: 'fewer-turns', label: 'Fewer turns' },
  { id: 'well-lit', label: 'Better-lit areas' },
  { id: 'populated', label: 'More populated areas' },
  { id: 'avoid-isolated', label: 'Avoid isolated sections' },
]

const SETTINGS = [
  { id: 'smart-protection', label: 'Smart Journey Protection', sub: 'AI monitors your journey for unusual patterns' },
  { id: 'pattern-learning', label: 'Behavioral Pattern Learning', sub: 'Learn your usual routes to detect deviations' },
  { id: 'location-sharing', label: 'Emergency Location Sharing', sub: 'Share location with contacts during emergencies' },
  { id: 'auto-checkin', label: 'Automatic Check-ins', sub: 'Scheduled check-in reminders during journeys' },
]

export default function OnboardingScreen({ dispatch }: Props) {
  const [step, setStep] = useState<Step>('welcome')
  const [name, setName] = useState('')
  const [prefs, setPrefs] = useState<string[]>(['well-lit', 'populated'])
  const [settings, setSettings] = useState<string[]>(['smart-protection', 'location-sharing', 'auto-checkin'])

  const next = () => {
    const idx = steps.indexOf(step)
    if (idx < steps.length - 1) setStep(steps[idx + 1])
    else dispatch({ type: 'COMPLETE_ONBOARDING', name: name || 'Priya' })
  }

  const togglePref = (id: string) => setPrefs(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const toggleSetting = (id: string) => setSettings(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  return (
    <div style={{ flex: 1, background: C.bg, display: 'flex', flexDirection: 'column', padding: 24, gap: 24 }}>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', paddingTop: 8 }}>
        {steps.map((s, i) => (
          <div key={s} style={{
            width: s === step ? 20 : 6,
            height: 6,
            borderRadius: 3,
            background: steps.indexOf(step) >= i ? C.primary : C.surface,
            transition: 'all 0.3s',
          }} />
        ))}
      </div>

      {/* Welcome */}
      {step === 'welcome' && (
        <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: C.primaryMuted,
            border: `2px solid ${C.primary}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36,
          }}>✦</div>
          <div>
            <h1 className="font-display" style={{ fontSize: 36, fontWeight: 600, color: C.text, margin: 0, lineHeight: 1.1 }}>SafePulse</h1>
            <p style={{ fontSize: 16, color: C.secondary, margin: '8px 0 0', fontStyle: 'italic' }}>"Your journey, understood."</p>
          </div>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, maxWidth: 260 }}>
            An AI-powered travel companion that understands your context — not just your destination.
          </p>
          <Button onClick={next} size="lg" style={{ width: '100%', maxWidth: 280 }}>Get Started</Button>
          <button onClick={() => dispatch({ type: 'COMPLETE_ONBOARDING', name: 'Priya' })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: C.muted, fontFamily: 'Outfit, sans-serif' }}>
            Skip — use demo profile
          </button>
        </div>
      )}

      {/* Name */}
      {step === 'name' && (
        <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 600, color: C.text, margin: 0 }}>What should we call you?</h2>
            <p style={{ fontSize: 14, color: C.muted, margin: '6px 0 0' }}>A name or nickname is fine.</p>
          </div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name or nickname"
            style={{
              background: C.card,
              border: `1.5px solid ${name ? C.primary : C.border}`,
              borderRadius: 12,
              padding: '14px 16px',
              fontSize: 16,
              color: C.text,
              fontFamily: 'Outfit, sans-serif',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
          <div style={{ flex: 1 }} />
          <Button onClick={next} disabled={!name.trim()}>Continue</Button>
        </div>
      )}

      {/* Locations */}
      {step === 'locations' && (
        <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: C.text, margin: 0 }}>Frequently visited places</h2>
            <p style={{ fontSize: 13, color: C.muted, margin: '6px 0 0' }}>These help the AI personalise your routes. You can skip any.</p>
          </div>
          {[
            { icon: '🏠', label: 'Home', placeholder: 'e.g. Dadar, Mumbai' },
            { icon: '🎓', label: 'College', placeholder: 'e.g. VJTI Matunga' },
            { icon: '💼', label: 'Work', placeholder: 'e.g. Lower Parel' },
            { icon: '📍', label: 'Other', placeholder: 'Any frequent location' },
          ].map(loc => (
            <div key={loc.label} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{loc.icon}</span>
              <input
                placeholder={`${loc.label} — ${loc.placeholder}`}
                style={{
                  flex: 1,
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 14,
                  color: C.text,
                  fontFamily: 'Outfit, sans-serif',
                  outline: 'none',
                }}
              />
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <Button onClick={next}>Continue</Button>
        </div>
      )}

      {/* Emergency contacts */}
      {step === 'contacts' && (
        <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: C.text, margin: 0 }}>Emergency contacts</h2>
            <p style={{ fontSize: 13, color: C.muted, margin: '6px 0 0' }}>These contacts are notified only when you authorise it.</p>
          </div>
          {[
            { label: 'Parent / Guardian', placeholder: 'Name & number' },
            { label: 'Friend', placeholder: 'Name & number' },
            { label: 'Sibling / Partner', placeholder: 'Name & number' },
            { label: 'Optional third contact', placeholder: 'Name & number (optional)' },
          ].map((c, i) => (
            <div key={i}>
              <label style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{c.label}</label>
              <input
                placeholder={c.placeholder}
                style={{
                  width: '100%',
                  marginTop: 4,
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 14,
                  color: C.text,
                  fontFamily: 'Outfit, sans-serif',
                  outline: 'none',
                }}
              />
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <Button onClick={next}>Continue</Button>
        </div>
      )}

      {/* Preferences */}
      {step === 'preferences' && (
        <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: C.text, margin: 0 }}>Travel preferences</h2>
            <p style={{ fontSize: 13, color: C.muted, margin: '6px 0 0' }}>The AI uses these to recommend routes that fit your needs.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PREFS.map(p => (
              <button
                key={p.id}
                onClick={() => togglePref(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: prefs.includes(p.id) ? C.primaryMuted : C.card,
                  border: `1.5px solid ${prefs.includes(p.id) ? C.primary : C.border}`,
                  borderRadius: 12,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 6,
                  border: `2px solid ${prefs.includes(p.id) ? C.primary : C.muted}`,
                  background: prefs.includes(p.id) ? C.primary : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: '#fff', flexShrink: 0,
                }}>
                  {prefs.includes(p.id) ? '✓' : ''}
                </div>
                <span style={{ fontSize: 14, color: C.text, fontFamily: 'Outfit, sans-serif' }}>{p.label}</span>
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <Button onClick={next}>Continue</Button>
        </div>
      )}

      {/* Smart settings */}
      {step === 'settings' && (
        <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: C.text, margin: 0 }}>Journey protection</h2>
            <p style={{ fontSize: 13, color: C.muted, margin: '6px 0 0' }}>All features require explicit consent and can be changed anytime.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SETTINGS.map(s => (
              <Card key={s.id} style={{ padding: '12px 14px', cursor: 'pointer' }} onClick={() => toggleSetting(s.id)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 11,
                    border: `2px solid ${settings.includes(s.id) ? C.primary : C.muted}`,
                    background: settings.includes(s.id) ? C.primary : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, color: '#fff', flexShrink: 0, marginTop: 1,
                  }}>
                    {settings.includes(s.id) ? '✓' : ''}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{s.sub}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div style={{ fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 1.5 }}>
            Your data is private by default. Location sharing is off unless you activate it.
          </div>
          <Button onClick={next} size="lg">Start using SafePulse</Button>
        </div>
      )}
    </div>
  )
}
