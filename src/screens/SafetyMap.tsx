import { useState } from 'react'
import type { AppState, Action, Screen } from '../types'
import { C, Card, Button, BackButton, ScreenWrapper } from '../components/ui'
import { MAP_POIS, POI_CONFIG } from '../data'

interface Props {
  state: AppState
  dispatch: (a: Action) => void
  navigate: (s: Screen) => void
}

const reportTypes = [
  { id: 'felt-unsafe', label: 'Lower comfort felt', icon: '⚠', color: '#EF4444' },
  { id: 'poor-lighting', label: 'Limited lighting', icon: '🌑', color: '#F59E0B' },
  { id: 'crowded', label: 'Very crowded', icon: '👥', color: '#F59E0B' },
  { id: 'well-lit', label: 'Well-lit area', icon: '💡', color: '#22C55E' },
  { id: 'transport', label: 'Public transport nearby', icon: '🚍', color: '#60A5FA' },
  { id: 'help', label: 'Help available', icon: '🏥', color: '#22C55E' },
  { id: 'comfortable', label: 'Felt comfortable', icon: '✓', color: '#22C55E' },
]

const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'police', label: '🚔 Police' },
  { id: 'hospital', label: '🏥 Hospital' },
  { id: 'clinic', label: '+ Clinic' },
  { id: 'bus', label: '🚌 Bus' },
  { id: 'train', label: '🚉 Train' },
  { id: 'market', label: '₹ Market' },
]

interface HeatZone {
  cx: number; cy: number; r: number; color: string; opacity: number; label: string; count: number
}
const heatZones: HeatZone[] = [
  { cx: 95, cy: 110, r: 30, color: '#EF4444', opacity: 0.15, label: 'Lower comfort reported', count: 8 },
  { cx: 170, cy: 140, r: 22, color: '#F59E0B', opacity: 0.12, label: 'Limited lighting reported', count: 5 },
  { cx: 220, cy: 65, r: 24, color: '#22C55E', opacity: 0.13, label: 'Comfortable area', count: 12 },
  { cx: 65, cy: 60, r: 18, color: '#EF4444', opacity: 0.11, label: 'Fewer nearby facilities', count: 3 },
  { cx: 265, cy: 100, r: 20, color: '#22C55E', opacity: 0.13, label: 'Help points available', count: 9 },
]

type PoiType = keyof typeof POI_CONFIG

export default function SafetyMapScreen({ state, dispatch, navigate }: Props) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [showReport, setShowReport] = useState(false)
  const [selectedReport, setSelectedReport] = useState('')
  const [reportSubmitted, setReportSubmitted] = useState(false)
  const [selectedPoi, setSelectedPoi] = useState<typeof MAP_POIS[number] | null>(null)
  const [showHeat, setShowHeat] = useState(true)
  const [showJourney, setShowJourney] = useState(state.journeyStatus !== 'none')

  const visiblePois = activeFilter === 'all' ? MAP_POIS : MAP_POIS.filter(p => p.type === activeFilter)

  const handleSubmitReport = () => {
    if (selectedReport) {
      setReportSubmitted(true)
      setTimeout(() => { setShowReport(false); setReportSubmitted(false); setSelectedReport('') }, 2000)
    }
  }

  return (
    <ScreenWrapper state={state} style={{ position: 'relative' }}>
      <div style={{ padding: '16px 20px 90px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <BackButton navigate={navigate} to="home" label="Home" />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowHeat(h => !h)}
              style={{
                padding: '5px 12px', borderRadius: 20,
                background: showHeat ? 'rgba(239,68,68,0.15)' : C.card,
                border: `1px solid ${showHeat ? 'rgba(239,68,68,0.4)' : C.border}`,
                cursor: 'pointer', fontSize: 11, color: showHeat ? '#EF4444' : C.secondary,
                fontFamily: 'Outfit, sans-serif', fontWeight: 600,
              }}
            >
              🌡 Heat
            </button>
            <button
              onClick={() => setShowReport(true)}
              style={{
                padding: '5px 12px', borderRadius: 20,
                background: C.primaryMuted, border: `1px solid ${C.primary}44`,
                cursor: 'pointer', fontSize: 11, color: C.primary,
                fontFamily: 'Outfit, sans-serif', fontWeight: 600,
              }}
            >
              + Report
            </button>
          </div>
        </div>

        <div>
          <span style={{ fontSize: 11, color: C.primary, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Live Safety Map</span>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: C.text, margin: '3px 0 0' }}>Area Intelligence</h2>
          <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 0' }}>Police · Hospitals · Transport · Markets · Community reports</p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {filterTabs.map(t => (
            <button key={t.id} onClick={() => setActiveFilter(t.id)} style={{
              padding: '5px 12px', borderRadius: 20, whiteSpace: 'nowrap',
              border: `1px solid ${activeFilter === t.id ? C.primary : C.border}`,
              background: activeFilter === t.id ? C.primaryMuted : C.card,
              color: activeFilter === t.id ? C.primary : C.secondary,
              fontSize: 11, fontFamily: 'Outfit, sans-serif', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.2s',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Map SVG */}
        <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.border}`, position: 'relative' }}>
          <svg width={360} height={250} viewBox="0 0 360 250" style={{ display: 'block', width: '100%', height: 'auto' }}>
            {/* Background */}
            <rect width={360} height={250} fill="#0A0A14" />

            {/* Street grid — minor */}
            {[40, 80, 120, 160, 200].map(y => (
              <line key={`hy${y}`} x1={0} y1={y} x2={360} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
            ))}
            {[40, 80, 120, 160, 210, 260, 310, 350].map(x => (
              <line key={`vx${x}`} x1={x} y1={0} x2={x} y2={250} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
            ))}
            {/* Major roads */}
            <line x1={0} y1={120} x2={360} y2={120} stroke="rgba(255,255,255,0.1)" strokeWidth={3} />
            <line x1={180} y1={0} x2={180} y2={250} stroke="rgba(255,255,255,0.1}" strokeWidth={3} />
            <line x1={0} y1={80} x2={360} y2={80} stroke="rgba(255,255,255,0.06)" strokeWidth={2} />
            {/* Diagonal */}
            <line x1={0} y1={250} x2={360} y2={0} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />

            {/* Heat zones */}
            {showHeat && heatZones.map((z, i) => (
              <g key={i}>
                <circle cx={z.cx} cy={z.cy} r={z.r} fill={z.color} opacity={z.opacity} />
                <circle cx={z.cx} cy={z.cy} r={z.r} fill="none" stroke={z.color} strokeWidth={0.5} opacity={0.3} />
              </g>
            ))}

            {/* Active journey route overlay */}
            {showJourney && (
              <path
                d="M 40,200 L 80,200 L 80,160 L 120,160 L 180,160 L 180,120 L 240,120 L 240,80 L 300,80 L 340,40"
                stroke={C.primary}
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="6 3"
                opacity={0.7}
              />
            )}

            {/* POI markers */}
            {visiblePois.map(poi => {
              const cfg = POI_CONFIG[poi.type as PoiType]
              const isSelected = selectedPoi?.id === poi.id
              return (
                <g
                  key={poi.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedPoi(isSelected ? null : poi)}
                >
                  {/* Drop shadow */}
                  <circle cx={poi.x + 1} cy={poi.y + 1} r={isSelected ? 11 : 9} fill="rgba(0,0,0,0.4)" />
                  {/* Main circle */}
                  <circle
                    cx={poi.x} cy={poi.y} r={isSelected ? 11 : 9}
                    fill={cfg.color}
                    opacity={isSelected ? 1 : 0.88}
                    stroke="#0A0A14"
                    strokeWidth={1.5}
                  />
                  {/* Symbol text */}
                  <text
                    x={poi.x} y={poi.y + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize={isSelected ? 9 : 8}
                    fontWeight="800"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {cfg.symbol}
                  </text>
                  {/* Selected ring */}
                  {isSelected && (
                    <circle cx={poi.x} cy={poi.y} r={15} fill="none" stroke={cfg.color} strokeWidth={1.5} opacity={0.5} />
                  )}
                </g>
              )
            })}

            {/* User location */}
            <circle cx={170} cy={180} r={7} fill={C.primary} opacity={0.95} className="soft-pulse" />
            <circle cx={170} cy={180} r={14} fill="none" stroke={C.primary} strokeWidth={1} opacity={0.3} />
            <text x={170} y={184} textAnchor="middle" fill="white" fontSize={7} fontWeight="700">YOU</text>
          </svg>

          {/* Legend row */}
          <div style={{
            background: '#0A0A14',
            borderTop: `1px solid ${C.border}`,
            padding: '8px 10px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px 12px',
          }}>
            {(Object.entries(POI_CONFIG) as [PoiType, typeof POI_CONFIG[PoiType]][]).map(([type, cfg]) => (
              <button
                key={type}
                onClick={() => setActiveFilter(activeFilter === type ? 'all' : type)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}
              >
                <div style={{
                  width: 14, height: 14, borderRadius: '50%',
                  background: cfg.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 7, color: '#fff', fontWeight: 800 }}>{cfg.symbol}</span>
                </div>
                <span style={{ fontSize: 9, color: activeFilter === type ? cfg.color : C.muted, fontFamily: 'Outfit, sans-serif', fontWeight: activeFilter === type ? 700 : 400 }}>
                  {cfg.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected POI detail */}
        {selectedPoi && (
          <div className="fade-in" style={{
            background: C.card,
            border: `1.5px solid ${POI_CONFIG[selectedPoi.type as PoiType].color}55`,
            borderRadius: 14,
            padding: '12px 14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: POI_CONFIG[selectedPoi.type as PoiType].color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 13, color: '#fff', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>
                  {POI_CONFIG[selectedPoi.type as PoiType].symbol}
                </span>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.text, margin: 0 }}>{selectedPoi.label}</p>
                <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 0', textTransform: 'capitalize' }}>
                  {POI_CONFIG[selectedPoi.type as PoiType].label}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" fullWidth onClick={() => navigate('emergency-contacts')}>📞 Contact</Button>
              <Button size="sm" variant="secondary" fullWidth onClick={() => setSelectedPoi(null)}>Navigate</Button>
            </div>
          </div>
        )}

        {/* Journey toggle */}
        {state.journeyStatus !== 'none' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: C.card, borderRadius: 10, border: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, color: C.secondary }}>Show active journey route</span>
            <div
              onClick={() => setShowJourney(v => !v)}
              style={{
                width: 40, height: 22, borderRadius: 11,
                background: showJourney ? C.primary : C.surface,
                border: `1px solid ${showJourney ? C.primary : C.border}`,
                cursor: 'pointer', position: 'relative', transition: 'all 0.3s',
              }}
            >
              <div style={{
                width: 16, height: 16, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 2,
                left: showJourney ? 20 : 2,
                transition: 'left 0.3s',
              }} />
            </div>
          </div>
        )}

        {/* Recent reports */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>Community reports</p>
          {[
            { type: 'Limited lighting reported', area: 'Near sector 4 crossing', time: '23 min ago', color: '#F59E0B' },
            { type: 'Comfortable area', area: 'Main street, sector 6', time: '1 hr ago', color: '#22C55E' },
            { type: 'Help available nearby', area: 'Hospital junction', time: '2 hr ago', color: '#60A5FA' },
            { type: 'Lower comfort reported', area: 'Underpass area', time: '3 hr ago', color: '#EF4444' },
          ].map((r, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, padding: '9px 12px',
              background: C.card, borderRadius: 10, border: `1px solid ${C.border}`,
              alignItems: 'center', marginBottom: 6,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: C.text, margin: 0, fontWeight: 500 }}>{r.type}</p>
                <p style={{ fontSize: 10, color: C.muted, margin: '2px 0 0' }}>{r.area}</p>
              </div>
              <span style={{ fontSize: 10, color: C.muted, whiteSpace: 'nowrap' }}>{r.time}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 10, color: C.muted, textAlign: 'center', lineHeight: 1.5 }}>
          All reports are anonymised. Descriptions use neutral language and do not label areas as inherently dangerous.
        </p>
      </div>

      {/* Report modal */}
      {showReport && (
        <div
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'flex-end', zIndex: 10 }}
          onClick={() => setShowReport(false)}
        >
          <div className="slide-up" style={{ background: C.card, borderRadius: '20px 20px 0 0', padding: 20, width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: C.border, borderRadius: 2, margin: '0 auto 16px' }} />
            {reportSubmitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div className="check-pop" style={{ fontSize: 44, marginBottom: 12 }}>✓</div>
                <p style={{ fontSize: 16, color: C.success, fontWeight: 600, margin: 0 }}>Report submitted</p>
                <p style={{ fontSize: 13, color: C.muted, margin: '6px 0 0' }}>Your anonymous report helps the community.</p>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: C.text, margin: '0 0 14px' }}>Report for this area</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                  {reportTypes.map(r => (
                    <button key={r.id} onClick={() => setSelectedReport(r.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                      background: selectedReport === r.id ? `${r.color}18` : C.surface,
                      border: `1.5px solid ${selectedReport === r.id ? r.color : C.border}`,
                      borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                      <span style={{ fontSize: 16 }}>{r.icon}</span>
                      <span style={{ fontSize: 11, color: C.secondary, fontFamily: 'Outfit, sans-serif', textAlign: 'left', lineHeight: 1.3 }}>{r.label}</span>
                    </button>
                  ))}
                </div>
                <Button onClick={handleSubmitReport} disabled={!selectedReport} fullWidth>Submit anonymously</Button>
              </>
            )}
          </div>
        </div>
      )}
    </ScreenWrapper>
  )
}
