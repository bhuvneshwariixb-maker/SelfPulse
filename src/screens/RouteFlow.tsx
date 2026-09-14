import { useState } from 'react'
import type { AppState, Action, Screen } from '../types'
import { MOCK_ROUTES } from '../data'
import { C, Card, Button, Badge, BackButton, ScreenWrapper, CityMap } from '../components/ui'

interface Props {
  state: AppState
  dispatch: (a: Action) => void
  navigate: (s: Screen) => void
}

// ─── Context Questions ────────────────────────────────────────────────────────

const situations = [
  { id: 'alone', label: 'Travelling alone', icon: '👤' },
  { id: 'friends', label: 'With friends', icon: '👥' },
  { id: 'returning-home', label: 'Returning home', icon: '🏠' },
  { id: 'college-work', label: 'Going to college / work', icon: '💼' },
  { id: 'night', label: 'Night travel', icon: '🌙' },
  { id: 'other', label: 'Other', icon: '✦' },
]

export function ContextQuestionsScreen({ state, dispatch, navigate }: Props) {
  const [selected, setSelected] = useState(state.situation || '')

  const handleContinue = () => {
    dispatch({ type: 'SET_SITUATION', situation: selected })
    navigate('route-comparison')
  }

  return (
    <ScreenWrapper state={state}>
      <div style={{ padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <BackButton navigate={navigate} to="home" />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.primaryMuted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✦</div>
            <span style={{ fontSize: 11, color: C.primary, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI Context Check</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: C.text, margin: 0 }}>
            {`What's your situation?`}
          </h2>
          <p style={{ fontSize: 13, color: C.muted, margin: '6px 0 0', lineHeight: 1.5 }}>
            This helps the AI recommend the most suitable route for this journey.
          </p>
        </div>

        {/* Destination display */}
        <div style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ fontSize: 14 }}>📍</span>
          <div>
            <span style={{ fontSize: 11, color: C.muted, display: 'block', marginBottom: 2 }}>Destination</span>
            <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>{state.destination || 'Home, Dadar West'}</span>
          </div>
        </div>

        {/* Situation options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {situations.map(s => (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                background: selected === s.id ? C.primaryMuted : C.card,
                border: `1.5px solid ${selected === s.id ? C.primary : C.border}`,
                borderRadius: 14,
                padding: '16px 12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 24 }}>{s.icon}</span>
              <span style={{ fontSize: 12, color: C.text, fontFamily: 'Outfit, sans-serif', fontWeight: 500, textAlign: 'center', lineHeight: 1.3 }}>{s.label}</span>
            </button>
          ))}
        </div>

        <Button onClick={handleContinue} disabled={!selected} size="lg" fullWidth>
          Compare Routes →
        </Button>
      </div>
    </ScreenWrapper>
  )
}

// ─── Route Comparison ─────────────────────────────────────────────────────────

export function RouteComparisonScreen({ state, dispatch, navigate }: Props) {
  const [selected, setSelected] = useState<'A' | 'B' | 'C' | null>(null)

  const handleSelect = (id: 'A' | 'B' | 'C') => {
    setSelected(id)
    dispatch({ type: 'SELECT_ROUTE', route: id })
    navigate('route-detail')
  }

  return (
    <ScreenWrapper state={state}>
      <div style={{ padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <BackButton navigate={navigate} to="context-questions" />

        <div>
          <span style={{ fontSize: 11, color: C.primary, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI Route Analysis</span>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: C.text, margin: '4px 0 0' }}>
            3 routes found
          </h2>
          <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 0' }}>
            Context: {situations.find(s => s.id === state.situation)?.label || 'Night travel'} · {state.destination || 'Home'}
          </p>
        </div>

        {/* Map */}
        <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.border}` }}>
          <CityMap showRoute="all" height={180} />
          {/* Legend */}
          <div style={{
            background: C.card,
            padding: '8px 12px',
            display: 'flex',
            gap: 16,
            borderTop: `1px solid ${C.border}`,
          }}>
            {MOCK_ROUTES.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 20, height: 3, borderRadius: 2, background: r.color }} />
                <span style={{ fontSize: 10, color: C.secondary, fontFamily: 'Outfit, sans-serif' }}>Route {r.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Route cards */}
        {MOCK_ROUTES.map(route => (
          <div
            key={route.id}
            onClick={() => handleSelect(route.id)}
            style={{
              background: route.recommended ? `linear-gradient(135deg, rgba(224,21,122,0.08), rgba(224,21,122,0.04))` : C.card,
              border: `1.5px solid ${route.recommended ? C.primary : C.border}`,
              borderRadius: 16,
              padding: '14px 16px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              position: 'relative',
            }}
          >
            {route.recommended && (
              <div style={{
                position: 'absolute',
                top: -10, right: 14,
                background: C.primary,
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '3px 10px',
                borderRadius: 20,
                textTransform: 'uppercase',
              }}>
                ✦ AI Recommended
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${route.color}22`, border: `1.5px solid ${route.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 13, color: route.color }}>
                      {route.id}
                    </span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{route.label}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                  {route.tags.map(t => (
                    <span key={t} style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 20,
                      background: `${route.color}18`, color: route.color,
                      border: `1px solid ${route.color}33`,
                      fontFamily: 'Outfit, sans-serif', fontWeight: 600,
                    }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="font-mono" style={{ fontSize: 26, fontWeight: 700, color: route.recommended ? C.primary : C.text, display: 'block', lineHeight: 1 }}>
                  {route.duration}
                </span>
                <span style={{ fontSize: 12, color: C.muted }}>min</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 10 }}>
              {[
                { label: 'Lighting', val: route.lighting },
                { label: 'Activity', val: route.crowd },
                { label: 'Help points', val: `${route.helpPoints} nearby` },
                { label: 'Isolated', val: route.isolated },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: C.muted, fontFamily: 'Outfit, sans-serif', minWidth: 60 }}>{item.label}</span>
                  <span style={{ fontSize: 11, color: C.secondary, fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>{item.val}</span>
                </div>
              ))}
            </div>

            {/* Score bar */}
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: C.muted }}>Preference match</span>
                <span className="font-mono" style={{ fontSize: 10, color: route.color }}>{route.score}%</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${route.score}%`, background: route.color, borderRadius: 2 }} />
              </div>
            </div>
          </div>
        ))}

        <p style={{ fontSize: 11, color: C.muted, textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
          Language note: lower comfort scores reflect reported area characteristics, not inherent danger.
        </p>
      </div>
    </ScreenWrapper>
  )
}

// ─── Route Detail + WHY Panel ─────────────────────────────────────────────────

export function RouteDetailScreen({ state, dispatch, navigate }: Props) {
  const route = MOCK_ROUTES.find(r => r.id === (state.selectedRoute || 'B')) || MOCK_ROUTES[1]
  const fastest = MOCK_ROUTES[0]
  const diff = route.duration - fastest.duration

  const handleStartJourney = () => {
    dispatch({ type: 'SET_JOURNEY', journeyStatus: 'normal' })
    navigate('offline-pack')
  }

  return (
    <ScreenWrapper state={state} style={{ position: 'relative' }}>
      <div style={{ padding: '16px 20px 120px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <BackButton navigate={navigate} to="route-comparison" />

        {/* Route map */}
        <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.border}` }}>
          <CityMap showRoute={route.id} showConnectivity={route.id === 'B'} height={180} />
          <div style={{ background: C.card, padding: '8px 12px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 12, height: 3, background: '#22C55E', borderRadius: 2 }} /><span style={{ fontSize: 10, color: C.secondary }}>Good signal</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 12, height: 3, background: '#F59E0B', borderRadius: 2 }} /><span style={{ fontSize: 10, color: C.secondary }}>Weak ahead</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 12, height: 3, background: '#EF4444', borderRadius: 2 }} /><span style={{ fontSize: 10, color: C.secondary }}>Low zone</span></div>
          </div>
        </div>

        {/* Header */}
        <div style={{
          background: route.recommended ? `linear-gradient(135deg, rgba(224,21,122,0.12), rgba(168,85,247,0.06))` : C.card,
          border: `1.5px solid ${route.color}44`,
          borderRadius: 16,
          padding: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            {route.recommended && (
              <Badge color={C.primary}>✦ Recommended for you</Badge>
            )}
            <Badge color={route.color}>Route {route.id}</Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            <span className="font-mono" style={{ fontSize: 52, fontWeight: 700, color: route.recommended ? C.primary : C.text, lineHeight: 1 }}>
              {route.duration}
            </span>
            <div style={{ paddingBottom: 8 }}>
              <span style={{ fontSize: 16, color: C.secondary }}>min</span>
              {diff > 0 && (
                <p style={{ fontSize: 12, color: C.muted, margin: '2px 0 0' }}>
                  {diff} min longer than fastest
                </p>
              )}
            </div>
          </div>
          <p style={{ fontSize: 13, color: C.secondary, margin: '4px 0 0' }}>{route.distance}</p>
        </div>

        {/* Reasons (for recommended) */}
        {route.recommended && (
          <div>
            <p style={{ fontSize: 12, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Why this route</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                'More connected sections throughout',
                'Fewer reported isolated portions',
                'Matches your selected preferences',
                'More help points along route',
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 12, color: C.success, marginTop: 2 }}>✓</span>
                  <span style={{ fontSize: 13, color: C.secondary, lineHeight: 1.4 }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation confidence */}
        {route.recommended && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Recommendation Confidence</p>
                <p style={{ fontSize: 10, color: C.muted, margin: '2px 0 0' }}>How well this route matches your preferences</p>
              </div>
              <span className="font-mono" style={{ fontSize: 32, fontWeight: 700, color: C.primary }}>82%</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
              <div style={{ height: '100%', width: '82%', background: `linear-gradient(90deg, ${C.primary}, #FF6DAE)`, borderRadius: 3 }} />
            </div>
            <p style={{ fontSize: 10, color: C.muted, margin: '6px 0 0', lineHeight: 1.5 }}>
              This is not a safety guarantee. It indicates how well the route matches your selected preferences and context.
            </p>
          </div>
        )}

        {/* WHY button */}
        {route.recommended && (
          <button
            onClick={() => dispatch({ type: 'TOGGLE_WHY', show: !state.showWhyPanel })}
            style={{
              background: 'transparent',
              border: `1.5px solid ${C.primary}55`,
              borderRadius: 12,
              padding: '10px 16px',
              cursor: 'pointer',
              color: C.primary,
              fontSize: 14,
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {state.showWhyPanel ? '✕ Close' : '? WHY this route?'}
          </button>
        )}

        {/* Connectivity warning */}
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '12px 14px' }}>
          <p style={{ fontSize: 12, color: C.warning, fontWeight: 600, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
            ⚡ Low-connectivity area detected ahead
          </p>
          <p style={{ fontSize: 12, color: C.secondary, margin: 0, lineHeight: 1.4 }}>
            Connectivity may become unstable ~8 min into journey. SafePulse will prepare an offline journey pack before you enter the area.
          </p>
        </div>

        {/* CTA */}
        <Button onClick={handleStartJourney} size="lg" fullWidth>
          Start Route {route.id} →
        </Button>
      </div>

      {/* WHY Panel */}
      {state.showWhyPanel && (
        <div
          className="slide-up"
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            background: C.card,
            border: `1px solid ${C.primary}33`,
            borderRadius: '20px 20px 0 0',
            padding: 20,
            maxHeight: '60%',
            overflowY: 'auto',
          }}
        >
          <div style={{ width: 40, height: 4, background: C.border, borderRadius: 2, margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: '0 0 6px' }}>Why this route?</h3>
          <p style={{ fontSize: 12, color: C.muted, margin: '0 0 16px' }}>AI reasoning based on your preferences and context</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {[
              { reason: 'You selected more connected routes', match: true },
              { reason: 'This route has fewer reported isolated sections', match: true },
              { reason: 'Better matches your nighttime preference', match: true },
              { reason: 'More accessible help points (7 vs 2)', match: true },
              { reason: 'Route B avoids the area with limited lighting reported near sector 4', match: true },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: 10,
                padding: '10px 12px',
                background: C.surface,
                borderRadius: 10,
                alignItems: 'flex-start',
              }}>
                <span style={{ color: C.success, fontSize: 13, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 13, color: C.secondary, lineHeight: 1.4 }}>{r.reason}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 11, color: C.muted, margin: '0 0 14px', lineHeight: 1.5 }}>
            Language note: descriptions reflect reported area characteristics and community data. They do not label any area or community as inherently dangerous.
          </p>

          {/* Feedback */}
          <p style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 8 }}>Was this recommendation helpful?</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Helpful', 'Not helpful', 'Report issue'].map((label, i) => (
              <button
                key={label}
                onClick={() => dispatch({ type: 'TOGGLE_WHY', show: false })}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 11,
                  color: i === 0 ? C.success : C.secondary,
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 500,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </ScreenWrapper>
  )
}
