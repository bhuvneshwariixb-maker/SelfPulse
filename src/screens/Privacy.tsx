import { useState } from 'react'
import type { AppState, Action, Screen } from '../types'
import { C, Card, Button, BackButton, ScreenWrapper } from '../components/ui'

interface Props {
  state: AppState
  dispatch: (a: Action) => void
  navigate: (s: Screen) => void
}

export default function PrivacyScreen({ state, dispatch, navigate }: Props) {
  const [locationSharing, setLocationSharing] = useState(false)
  const [shareWith, setShareWith] = useState<string[]>([])
  const [dataSettings, setDataSettings] = useState({
    patternLearning: true,
    anonymousReports: true,
    journeyHistory: true,
    feedbackData: false,
  })

  const toggleShare = (id: string) => {
    setShareWith(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleData = (key: keyof typeof dataSettings) => {
    setDataSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <ScreenWrapper state={state}>
      <div style={{ padding: '16px 20px 90px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <BackButton navigate={navigate} to="home" />

        <div>
          <span style={{ fontSize: 11, color: C.primary, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Privacy Center</span>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: C.text, margin: '4px 0 0' }}>Your Privacy Controls</h2>
          <p style={{ fontSize: 12, color: C.muted, margin: '4px 0 0' }}>You are in control of your data. Everything is off by default.</p>
        </div>

        {/* Core principles */}
        <Card style={{ background: 'linear-gradient(135deg, rgba(224,21,122,0.06), rgba(168,85,247,0.04))', border: `1px solid ${C.primary}22` }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: C.primaryLight, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Core principles</p>
          {[
            '🔒 Location private by default',
            '👤 No public live location',
            '✓ You control all sharing',
            '🛡 Protector access requires your authorisation',
            '◎ Community reports are anonymised',
          ].map((p, i) => (
            <p key={i} style={{ fontSize: 13, color: C.secondary, margin: i < 4 ? '0 0 6px' : 0, lineHeight: 1.4 }}>{p}</p>
          ))}
        </Card>

        {/* Location sharing toggle */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Location sharing</p>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: locationSharing ? 14 : 0 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: 0 }}>Live location sharing</p>
                <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0' }}>
                  Currently {locationSharing ? 'ON' : 'OFF — private by default'}
                </p>
              </div>
              {/* Toggle */}
              <div
                onClick={() => { setLocationSharing(!locationSharing); if (locationSharing) setShareWith([]) }}
                style={{
                  width: 48, height: 26,
                  borderRadius: 13,
                  background: locationSharing ? C.primary : C.surface,
                  border: `1px solid ${locationSharing ? C.primary : C.border}`,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s',
                }}
              >
                <div style={{
                  width: 20, height: 20,
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: 2,
                  left: locationSharing ? 24 : 2,
                  transition: 'left 0.3s',
                }} />
              </div>
            </div>

            {locationSharing && (
              <div className="fade-in">
                <p style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Who can receive your location?</p>
                {[
                  { id: 'parent', label: 'Parent / Guardian', icon: '👨‍👩‍👧' },
                  { id: 'friend', label: 'Friend', icon: '👥' },
                  { id: 'partner', label: 'Partner / Sibling', icon: '❤' },
                  { id: 'protector', label: 'Verified Protector', icon: '🛡' },
                  { id: 'emergency', label: 'Emergency Services only', icon: '🚨' },
                ].map(contact => (
                  <div
                    key={contact.id}
                    onClick={() => toggleShare(contact.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 0',
                      borderBottom: `1px solid ${C.border}`,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: 20, height: 20,
                      borderRadius: 6,
                      border: `2px solid ${shareWith.includes(contact.id) ? C.primary : C.muted}`,
                      background: shareWith.includes(contact.id) ? C.primary : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: '#fff', flexShrink: 0,
                    }}>
                      {shareWith.includes(contact.id) ? '✓' : ''}
                    </div>
                    <span style={{ fontSize: 14 }}>{contact.icon}</span>
                    <span style={{ fontSize: 13, color: C.text }}>{contact.label}</span>
                  </div>
                ))}

                <div style={{ paddingTop: 10 }}>
                  <button
                    onClick={() => { setLocationSharing(false); setShareWith([]) }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 12, color: C.danger, fontFamily: 'Outfit, sans-serif', fontWeight: 500,
                    }}
                  >
                    Stop sharing location
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Data settings */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Data & learning</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { key: 'patternLearning' as const, label: 'Behavioral pattern learning', sub: 'Learns your usual routes for deviation detection' },
              { key: 'anonymousReports' as const, label: 'Anonymous community reports', sub: 'Your reports are anonymised before submission' },
              { key: 'journeyHistory' as const, label: 'Journey history (local only)', sub: 'Stored on your device, not shared' },
              { key: 'feedbackData' as const, label: 'Route feedback for improvement', sub: 'Helps improve route recommendations (opt-in)' },
            ].map(setting => (
              <Card key={setting.key} style={{ padding: '12px 14px', cursor: 'pointer' }} onClick={() => toggleData(setting.key)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0 }}>{setting.label}</p>
                    <p style={{ fontSize: 11, color: C.muted, margin: '3px 0 0', lineHeight: 1.4 }}>{setting.sub}</p>
                  </div>
                  <div style={{
                    width: 40, height: 22,
                    borderRadius: 11,
                    background: dataSettings[setting.key] ? C.primary : C.surface,
                    border: `1px solid ${dataSettings[setting.key] ? C.primary : C.border}`,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.3s',
                    flexShrink: 0,
                  }}>
                    <div style={{
                      width: 16, height: 16,
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      top: 2,
                      left: dataSettings[setting.key] ? 20 : 2,
                      transition: 'left 0.3s',
                    }} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Emergency override note */}
        <Card style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p style={{ fontSize: 12, color: C.danger, fontWeight: 600, margin: '0 0 4px' }}>🚨 Emergency override</p>
          <p style={{ fontSize: 12, color: C.secondary, margin: 0, lineHeight: 1.4 }}>
            When you activate emergency mode, location may be shared with your selected contacts regardless of this setting. This only applies when you explicitly trigger emergency mode.
          </p>
        </Card>

        <Button onClick={() => navigate('home')} variant="secondary" fullWidth>Save & close</Button>
      </div>
    </ScreenWrapper>
  )
}
