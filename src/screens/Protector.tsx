import { useState } from 'react'
import type { AppState, Action, Screen } from '../types'
import { C, Card, Button, BackButton, ScreenWrapper, VerifiedBadge, Avatar, Badge } from '../components/ui'
import { MOCK_PROTECTORS, MOCK_EMERGENCY_REQUESTS, VERIFIED_POLICE, VERIFIED_DOCTORS } from '../data'

interface Props {
  state: AppState
  dispatch: (a: Action) => void
  navigate: (s: Screen) => void
}

type NetTab = 'all' | 'police' | 'doctors'

// ─── Protector Network ────────────────────────────────────────────────────────

export function ProtectorNetworkScreen({ state, dispatch, navigate }: Props) {
  const [selectedProtector, setSelectedProtector] = useState<string | null>(null)
  const [tab, setTab] = useState<NetTab>('all')
  const [calledId, setCalledId] = useState<string | null>(null)

  const colors = [C.primary, '#22C55E', '#60A5FA', '#A855F7', '#F59E0B']

  const simulateCall = (id: string) => {
    setCalledId(id)
    setTimeout(() => setCalledId(null), 2500)
  }

  return (
    <ScreenWrapper state={state}>
      <div style={{ padding: '16px 20px 90px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <BackButton navigate={navigate} to="home" />
          <button
            onClick={() => { dispatch({ type: 'SET_PROTECTOR_MODE', isProtector: true }); navigate('protector-command') }}
            style={{
              background: C.primaryMuted,
              border: `1px solid ${C.primary}44`,
              borderRadius: 20,
              padding: '6px 14px',
              cursor: 'pointer',
              fontSize: 11,
              color: C.primary,
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            ⚙ Protector View
          </button>
        </div>

        <div>
          <span style={{ fontSize: 11, color: C.primary, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Verified Network</span>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: C.text, margin: '4px 0 0' }}>Protector Network</h2>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: C.card, borderRadius: 12, padding: 4, border: `1px solid ${C.border}` }}>
          {([
            { id: 'all', label: '🛡 All' },
            { id: 'police', label: '🚔 Police' },
            { id: 'doctors', label: '🏥 Doctors' },
          ] as { id: NetTab; label: string }[]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: '8px 0', borderRadius: 9, border: 'none',
              background: tab === t.id ? C.primary : 'transparent',
              color: tab === t.id ? '#fff' : C.secondary,
              fontSize: 12, fontFamily: 'Outfit, sans-serif', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Calling overlay */}
        {calledId && (
          <div className="fade-in" style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', zIndex: 50, gap: 14,
          }}>
            <div style={{
              width: 70, height: 70, borderRadius: '50%',
              background: 'rgba(34,197,94,0.2)',
              border: `3px solid ${C.success}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
            }} className="soft-pulse">📞</div>
            <p style={{ fontSize: 16, color: C.text, margin: 0 }}>Connecting... (simulated)</p>
            <button onClick={() => setCalledId(null)} style={{
              padding: '8px 24px', background: C.danger, border: 'none',
              borderRadius: 20, color: '#fff', fontSize: 13,
              fontFamily: 'Outfit, sans-serif', fontWeight: 600, cursor: 'pointer',
            }}>End</button>
          </div>
        )}

        {/* All protectors */}
        {tab === 'all' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MOCK_PROTECTORS.map((p, i) => (
              <div key={p.id} onClick={() => setSelectedProtector(selectedProtector === p.id ? null : p.id)} style={{
                background: selectedProtector === p.id ? `rgba(224,21,122,0.06)` : C.card,
                border: `1.5px solid ${selectedProtector === p.id ? colors[i % colors.length] + '55' : C.border}`,
                borderRadius: 14, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <Avatar initials={p.avatar} size={44} color={colors[i % colors.length]} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{p.name}</span>
                      <VerifiedBadge />
                    </div>
                    <span style={{ fontSize: 12, color: C.secondary }}>{p.role}</span>
                    {p.organization && <span style={{ fontSize: 11, color: C.muted, display: 'block' }}>{p.organization}</span>}
                  </div>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.success, flexShrink: 0, marginTop: 4 }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
                  {[
                    { label: 'Area', val: p.area.split('–')[0].trim() },
                    { label: 'Status', val: p.availability },
                    { label: 'Response', val: p.responseTime },
                  ].map(d => (
                    <div key={d.label}>
                      <span style={{ fontSize: 9, color: C.muted, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{d.label}</span>
                      <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>{d.val}</span>
                    </div>
                  ))}
                </div>
                {selectedProtector === p.id && (
                  <div className="fade-in" style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <Button size="sm" fullWidth onClick={() => simulateCall(p.id)}>📞 Contact</Button>
                    <Button size="sm" variant="secondary" fullWidth onClick={() => navigate('emergency')}>🆘 Emergency</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Verified Police */}
        {tab === 'police' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ fontSize: 12, color: '#60A5FA', fontWeight: 600, margin: '0 0 2px' }}>🚔 Verified Police Stations & Officers</p>
              <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Call 100 for immediate police assistance. All stations verified.</p>
            </div>
            {VERIFIED_POLICE.map((p, i) => (
              <Card key={p.id} style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'rgba(59,130,246,0.15)',
                    border: '1px solid rgba(59,130,246,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                  }}>🚔</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{p.name}</span>
                      <VerifiedBadge />
                    </div>
                    <p style={{ fontSize: 11, color: '#60A5FA', margin: '0 0 2px', fontWeight: 500 }}>{p.type}</p>
                    <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{p.area}</p>
                  </div>
                  <span style={{ fontSize: 10, color: C.success, fontWeight: 600, whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono, monospace' }}>
                    {p.dist}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
                  {[
                    { label: 'Badge', val: p.badge },
                    { label: 'Available', val: p.available },
                    { label: 'Phone', val: p.phone.length > 10 ? p.phone.slice(-10) : p.phone },
                  ].map(d => (
                    <div key={d.label}>
                      <span style={{ fontSize: 9, color: C.muted, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{d.label}</span>
                      <span style={{ fontSize: 10, color: C.text, fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>{d.val}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <Button size="sm" fullWidth onClick={() => simulateCall(p.id)}>📞 {p.phone.length <= 5 ? p.phone : 'Call'}</Button>
                  <Button size="sm" variant="secondary" fullWidth>Navigate →</Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Verified Doctors */}
        {tab === 'doctors' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ fontSize: 12, color: '#F87171', fontWeight: 600, margin: '0 0 2px' }}>🏥 Verified Doctors & Medical Professionals</p>
              <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Call 102 for ambulance. All professionals are verified.</p>
            </div>
            {VERIFIED_DOCTORS.map((doc) => (
              <Card key={doc.id} style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#EF4444', flexShrink: 0,
                    fontFamily: 'Outfit, sans-serif',
                  }}>
                    {doc.gender === 'F' ? '👩‍⚕️' : '👨‍⚕️'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{doc.name}</span>
                      <VerifiedBadge />
                    </div>
                    <p style={{ fontSize: 11, color: '#F87171', margin: '0 0 1px', fontWeight: 500 }}>{doc.specialty}</p>
                    <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>{doc.hospital}</p>
                  </div>
                  <span style={{ fontSize: 10, color: C.success, fontWeight: 600, whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono, monospace' }}>
                    {doc.dist}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <Button size="sm" fullWidth onClick={() => simulateCall(doc.id)}>📞 Contact</Button>
                  <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: doc.available === 'Available' ? 'rgba(34,197,94,0.1)' : doc.available === '24/7 Free' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                    border: `1px solid ${doc.available === 'On call' ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.25)'}`,
                    borderRadius: 8,
                    fontSize: 11,
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    color: doc.available === 'On call' ? C.warning : C.success,
                  }}>
                    {doc.available}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <p style={{ fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 1.5 }}>
          All profiles are verified. Location access requires your explicit authorisation. Demo accounts used in prototype.
        </p>
      </div>
    </ScreenWrapper>
  )
}

// ─── Protector Command Center ─────────────────────────────────────────────────

export function ProtectorCommandScreen({ state, dispatch, navigate }: Props) {
  const [respondedTo, setRespondedTo] = useState<string[]>([])
  const [expandedId, setExpandedId] = useState<string | null>('er1')

  const priorityColor = { HIGH: C.danger, MEDIUM: C.warning, LOW: C.success }
  const priorityBg = { HIGH: 'rgba(239,68,68,0.12)', MEDIUM: 'rgba(245,158,11,0.1)', LOW: 'rgba(34,197,94,0.08)' }

  const handleRespond = (id: string) => {
    setRespondedTo(prev => [...prev, id])
  }

  return (
    <div style={{ flex: 1, background: '#04040C', display: 'flex', flexDirection: 'column' }}>
      {/* Command header */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(239,68,68,0.12) 0%, transparent 100%)',
        borderBottom: `1px solid ${C.border}`,
        padding: '16px 20px 14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <p style={{ fontSize: 10, color: C.danger, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 4px' }}>Protector Dashboard</p>
            <h2 className="font-display" style={{ fontSize: 20, fontWeight: 600, color: C.text, margin: 0 }}>Command Center</h2>
          </div>
          <button
            onClick={() => { dispatch({ type: 'SET_PROTECTOR_MODE', isProtector: false }); navigate('home') }}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${C.border}`,
              borderRadius: 20,
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 11,
              color: C.secondary,
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            ← User View
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'Active', val: '3', color: C.danger },
            { label: 'HIGH', val: '1', color: C.danger },
            { label: 'MEDIUM', val: '1', color: C.warning },
            { label: 'LOW', val: '1', color: C.success },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1,
              background: `${s.color}10`,
              border: `1px solid ${s.color}25`,
              borderRadius: 10,
              padding: '6px 8px',
              textAlign: 'center',
            }}>
              <span className="font-mono" style={{ fontSize: 20, fontWeight: 700, color: s.color, display: 'block', lineHeight: 1 }}>{s.val}</span>
              <span style={{ fontSize: 9, color: C.muted, fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Requests */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
          Active assistance requests
        </p>

        {MOCK_EMERGENCY_REQUESTS.map(req => {
          const isExpanded = expandedId === req.id
          const isResponded = respondedTo.includes(req.id)
          const pColor = priorityColor[req.priority]
          const pBg = priorityBg[req.priority]

          return (
            <div
              key={req.id}
              style={{
                background: pBg,
                border: `1.5px solid ${pColor}44`,
                borderRadius: 14,
                overflow: 'hidden',
                transition: 'all 0.2s',
              }}
            >
              {/* Request header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : req.id)}
                style={{
                  padding: '12px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
              >
                <div style={{
                  padding: '3px 10px',
                  background: `${pColor}20`,
                  border: `1px solid ${pColor}44`,
                  borderRadius: 20,
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 10, color: pColor, fontWeight: 800, letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>
                    {req.priority}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{req.userName}</span>
                  <p style={{ fontSize: 12, color: C.secondary, margin: '3px 0 0' }}>{req.situation}</p>
                </div>
                <span style={{ fontSize: 12, color: C.muted, whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono, monospace' }}>{req.time}</span>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="fade-in" style={{ borderTop: `1px solid ${pColor}20`, padding: '12px 14px' }}>
                  {/* Status indicators */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                    {[
                      { label: 'Battery', val: `${req.battery}%`, color: req.battery <= 10 ? C.danger : req.battery <= 20 ? C.warning : C.success },
                      { label: 'Signal', val: req.connectivity, color: req.connectivity === 'Offline' ? C.danger : req.connectivity === 'Weak' ? C.warning : C.success },
                      { label: 'GPS', val: 'Active', color: C.success },
                    ].map(s => (
                      <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '6px 8px' }}>
                        <span style={{ fontSize: 9, color: C.muted, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{s.label}</span>
                        <span className="font-mono" style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>{s.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Location */}
                  <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 8,
                    padding: '8px 10px',
                    marginBottom: 10,
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                  }}>
                    <span style={{ fontSize: 14 }}>📍</span>
                    <span style={{ fontSize: 12, color: C.secondary }}>{req.location}</span>
                  </div>

                  {/* Priority reasons */}
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>
                      Why {req.priority}?
                    </p>
                    {req.reasons.map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '4px 0' }}>
                        <span style={{ fontSize: 8, color: pColor }}>◆</span>
                        <span style={{ fontSize: 11, color: C.secondary, lineHeight: 1.3 }}>{r}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  {isResponded ? (
                    <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(34,197,94,0.1)', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)' }}>
                      <span style={{ fontSize: 13, color: C.success, fontWeight: 600 }}>✓ Responding</span>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <Button onClick={() => handleRespond(req.id)} size="sm" fullWidth>RESPOND</Button>
                      <Button size="sm" variant="secondary" fullWidth>CALL</Button>
                      <Button size="sm" variant="secondary" fullWidth>NAVIGATE</Button>
                      <Button size="sm" variant="ghost" fullWidth>MARK ASSISTED</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        <p style={{ fontSize: 10, color: C.muted, textAlign: 'center', lineHeight: 1.5, margin: '4px 0 0' }}>
          This system prioritises assistance requests. It does not determine whether a crime is occurring. Protectors shown are demo accounts.
        </p>
      </div>
    </div>
  )
}
