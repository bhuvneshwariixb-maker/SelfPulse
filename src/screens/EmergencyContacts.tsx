import { useState } from 'react'
import type { AppState, Action, Screen } from '../types'
import { C, Card, Button, BackButton, ScreenWrapper, Avatar } from '../components/ui'
import { EMERGENCY_NUMBERS, EMERGENCY_CONTACTS_DEMO } from '../data'

interface Props {
  state: AppState
  dispatch: (a: Action) => void
  navigate: (s: Screen) => void
}

type Tab = 'contacts' | 'numbers'

export default function EmergencyContactsScreen({ state, dispatch, navigate }: Props) {
  const [tab, setTab] = useState<Tab>('contacts')
  const [calledNumber, setCalledNumber] = useState<string | null>(null)

  const simulateCall = (number: string, label: string) => {
    setCalledNumber(number)
    setTimeout(() => setCalledNumber(null), 3000)
  }

  return (
    <ScreenWrapper state={state}>
      <div style={{ padding: '16px 20px 90px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <BackButton navigate={navigate} to="home" />

        <div>
          <span style={{ fontSize: 11, color: C.primary, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Emergency Hub</span>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: C.text, margin: '4px 0 0' }}>Contacts & Numbers</h2>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: C.card, borderRadius: 12, padding: 4, border: `1px solid ${C.border}` }}>
          {(['contacts', 'numbers'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 9,
                border: 'none',
                background: tab === t ? C.primary : 'transparent',
                color: tab === t ? '#fff' : C.secondary,
                fontSize: 13,
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t === 'contacts' ? '👥 My Contacts' : '📞 Emergency Numbers'}
            </button>
          ))}
        </div>

        {/* Calling overlay */}
        {calledNumber && (
          <div className="fade-in" style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            gap: 16,
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(34,197,94,0.2)',
              border: `3px solid ${C.success}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36,
            }} className="soft-pulse">📞</div>
            <p style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: 0, fontFamily: 'JetBrains Mono, monospace' }}>
              {calledNumber}
            </p>
            <p style={{ fontSize: 14, color: C.secondary, margin: 0 }}>Connecting... (simulated)</p>
            <button onClick={() => setCalledNumber(null)} style={{
              marginTop: 8, padding: '10px 28px',
              background: C.danger, border: 'none', borderRadius: 24,
              color: '#fff', fontSize: 14, fontFamily: 'Outfit, sans-serif',
              fontWeight: 600, cursor: 'pointer',
            }}>End Call</button>
          </div>
        )}

        {/* Contacts tab */}
        {tab === 'contacts' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.5 }}>
              Trusted contacts are notified only when you authorise it. In emergencies, you can alert all at once.
            </p>

            {/* Alert all button */}
            <button
              onClick={() => navigate('emergency')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '14px',
                background: 'rgba(239,68,68,0.12)',
                border: '1.5px solid rgba(239,68,68,0.4)',
                borderRadius: 14,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 18 }}>🚨</span>
              <span style={{ fontSize: 14, color: C.danger, fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
                Alert ALL emergency contacts
              </span>
            </button>

            {EMERGENCY_CONTACTS_DEMO.map(contact => (
              <Card key={contact.id} style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar initials={contact.initials} size={44} color={contact.color} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{contact.name}</span>
                      {contact.trusted && (
                        <span style={{ fontSize: 9, padding: '1px 6px', background: `${contact.color}22`, border: `1px solid ${contact.color}44`, borderRadius: 10, color: contact.color, fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
                          TRUSTED
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0' }}>{contact.relation}</p>
                    <p style={{ fontSize: 12, color: C.secondary, margin: '2px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>{contact.number}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => simulateCall(contact.number, contact.name)}
                      style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'rgba(34,197,94,0.15)',
                        border: '1px solid rgba(34,197,94,0.3)',
                        cursor: 'pointer', fontSize: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >📞</button>
                    <button
                      onClick={() => simulateCall(contact.number, contact.name)}
                      style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: C.primaryMuted,
                        border: `1px solid ${C.primary}33`,
                        cursor: 'pointer', fontSize: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >💬</button>
                  </div>
                </div>
              </Card>
            ))}

            <Button onClick={() => {}} variant="outline" fullWidth size="sm">
              + Add emergency contact
            </Button>
          </div>
        )}

        {/* Numbers tab */}
        {tab === 'numbers' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
              Official emergency numbers. Tap to call (simulated in prototype).
            </p>

            {/* Quick dial row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 4 }}>
              {EMERGENCY_NUMBERS.slice(0, 3).map(n => (
                <button
                  key={n.number}
                  onClick={() => simulateCall(n.number, n.label)}
                  style={{
                    padding: '12px 8px',
                    background: `${n.color}15`,
                    border: `1.5px solid ${n.color}44`,
                    borderRadius: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{n.icon}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 800, color: n.color }}>{n.number}</span>
                  <span style={{ fontSize: 10, color: C.secondary, fontFamily: 'Outfit, sans-serif', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{n.label}</span>
                </button>
              ))}
            </div>

            {/* Full list */}
            {EMERGENCY_NUMBERS.map((num, i) => (
              <button
                key={num.number}
                onClick={() => simulateCall(num.number, num.label)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: C.card,
                  border: `1px solid ${i < 3 ? num.color + '33' : C.border}`,
                  borderRadius: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  width: '100%',
                }}
              >
                <div style={{
                  width: 40, height: 40,
                  borderRadius: 12,
                  background: `${num.color}15`,
                  border: `1px solid ${num.color}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  {num.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text, margin: 0 }}>{num.label}</p>
                  <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 0', lineHeight: 1.3 }}>{num.desc}</p>
                </div>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 16,
                  fontWeight: 800,
                  color: num.color,
                  flexShrink: 0,
                }}>
                  {num.number}
                </span>
              </button>
            ))}

            <p style={{ fontSize: 10, color: C.muted, textAlign: 'center', lineHeight: 1.5, marginTop: 4 }}>
              Numbers are real Indian emergency services. Calls are simulated in this prototype.
            </p>
          </div>
        )}
      </div>
    </ScreenWrapper>
  )
}
