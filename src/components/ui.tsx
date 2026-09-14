import type { ReactNode } from 'react'
import type { Screen, AppState } from '../types'

// ─── Colours ────────────────────────────────────────────────────────────────

export const C = {
  bg: '#080810',
  bgDeep: '#040408',
  bgCritical: '#020204',
  card: '#0E0E1A',
  surface: '#14142A',
  elevated: '#1E1E38',
  primary: '#E0157A',
  primaryLight: '#FF6DAE',
  primaryMuted: 'rgba(224,21,122,0.15)',
  accentPurple: '#A855F7',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  text: '#F0EEF9',
  secondary: '#9B96BB',
  muted: '#5A5780',
  border: 'rgba(255,255,255,0.06)',
  borderBright: 'rgba(255,255,255,0.12)',
}

// ─── Battery colour helper ───────────────────────────────────────────────────

export function batteryColor(pct: number) {
  if (pct <= 5) return C.danger
  if (pct <= 15) return C.warning
  return C.success
}

export function batteryBg(pct: number) {
  if (pct <= 5) return C.bgCritical
  if (pct <= 10) return C.bgDeep
  return C.bg
}

export function networkColor(n: string) {
  if (n === 'offline') return C.danger
  if (n === 'weak') return C.warning
  return C.success
}

// ─── StatusBar ──────────────────────────────────────────────────────────────

interface StatusBarProps {
  battery: number
  network: string
  timeOfDay: string
  critical?: boolean
}

export function StatusBar({ battery, network, timeOfDay, critical }: StatusBarProps) {
  const time = timeOfDay === 'night' ? '11:42 PM' : '2:14 PM'
  const netDot = network === 'offline' ? C.danger : network === 'weak' ? C.warning : C.success
  const batColor = batteryColor(battery)
  const batWidth = Math.max(4, battery)

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 6px' }}>
      <span className="font-mono" style={{ fontSize: 12, color: C.secondary, letterSpacing: '0.02em' }}>{time}</span>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Signal */}
        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          {[4, 7, 10, 13].map((h, i) => (
            <div key={i} style={{
              width: 3,
              height: h,
              borderRadius: 1,
              background: network === 'offline' ? (i < 1 ? C.danger : C.muted) :
                          network === 'weak' ? (i < 2 ? C.warning : C.muted) : C.success,
            }} />
          ))}
        </div>
        {/* Battery */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <div style={{ width: 24, height: 12, border: `1.5px solid ${critical ? C.danger : C.secondary}`, borderRadius: 3, padding: 1.5, position: 'relative' }}>
            <div style={{ height: '100%', width: `${batWidth}%`, background: batColor, borderRadius: 1.5 }} />
          </div>
          <span className="font-mono" style={{ fontSize: 10, color: batColor }}>{battery}%</span>
        </div>
      </div>
    </div>
  )
}

// ─── BottomNav ──────────────────────────────────────────────────────────────

interface BottomNavProps {
  active: Screen
  navigate: (s: Screen) => void
  battery: number
}

const navItems = [
  { screen: 'home' as Screen, icon: '⌂', label: 'Home' },
  { screen: 'route-comparison' as Screen, icon: '↗', label: 'Routes' },
  { screen: 'safety-map' as Screen, icon: '◉', label: 'Map' },
  { screen: 'emergency-contacts' as Screen, icon: '📞', label: 'Contacts' },
  { screen: 'protector-network' as Screen, icon: '◈', label: 'Protectors' },
]

export function BottomNav({ active, navigate, battery }: BottomNavProps) {
  if (battery <= 5) return null
  return (
    <div style={{
      display: 'flex',
      borderTop: `1px solid ${C.border}`,
      background: C.bgDeep,
      padding: '8px 0 12px',
    }}>
      {navItems.map(item => (
        <button
          key={item.screen}
          onClick={() => navigate(item.screen)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          <span style={{
            fontSize: 18,
            color: active === item.screen ? C.primary : C.muted,
            transition: 'color 0.2s',
          }}>{item.icon}</span>
          <span style={{
            fontSize: 9,
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 500,
            color: active === item.screen ? C.primary : C.muted,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>{item.label}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Card ────────────────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode
  style?: React.CSSProperties
  onClick?: () => void
  glow?: boolean
  danger?: boolean
}

export function Card({ children, style, onClick, glow, danger }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: C.card,
        border: `1px solid ${danger ? 'rgba(239,68,68,0.3)' : glow ? 'rgba(224,21,122,0.3)' : C.border}`,
        borderRadius: 16,
        padding: '14px 16px',
        cursor: onClick ? 'pointer' : undefined,
        boxShadow: glow ? '0 0 20px rgba(224,21,122,0.08)' : undefined,
        transition: 'all 0.2s',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── Button ──────────────────────────────────────────────────────────────────

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  style?: React.CSSProperties
  disabled?: boolean
}

export function Button({ children, onClick, variant = 'primary', size = 'md', fullWidth, style, disabled }: ButtonProps) {
  const bg = {
    primary: `linear-gradient(135deg, ${C.primary}, #C4116B)`,
    secondary: C.surface,
    ghost: 'transparent',
    danger: `linear-gradient(135deg, ${C.danger}, #C41111)`,
    outline: 'transparent',
  }[variant]

  const border = {
    primary: 'none',
    secondary: `1px solid ${C.borderBright}`,
    ghost: 'none',
    danger: 'none',
    outline: `1px solid ${C.borderBright}`,
  }[variant]

  const color = {
    primary: '#fff',
    secondary: C.text,
    ghost: C.secondary,
    danger: '#fff',
    outline: C.text,
  }[variant]

  const padding = { sm: '8px 16px', md: '12px 20px', lg: '16px 24px' }[size]
  const fontSize = { sm: 13, md: 15, lg: 16 }[size]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: bg,
        border,
        borderRadius: 12,
        color,
        padding,
        fontSize,
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : undefined,
        letterSpacing: '0.01em',
        transition: 'all 0.2s',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

// ─── Badge ───────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: ReactNode
  color?: string
  bg?: string
}

export function Badge({ children, color = C.primary, bg }: BadgeProps) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      fontFamily: 'Outfit, sans-serif',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color,
      background: bg || `${color}22`,
      border: `1px solid ${color}44`,
    }}>
      {children}
    </span>
  )
}

// ─── VerifiedBadge ───────────────────────────────────────────────────────────

export function VerifiedBadge() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      padding: '2px 8px',
      borderRadius: 20,
      fontSize: 10,
      fontWeight: 700,
      fontFamily: 'Outfit, sans-serif',
      letterSpacing: '0.08em',
      color: '#22C55E',
      background: 'rgba(34,197,94,0.12)',
      border: '1px solid rgba(34,197,94,0.3)',
    }}>
      ✓ VERIFIED
    </span>
  )
}

// ─── StatusIndicator ─────────────────────────────────────────────────────────

interface StatusIndicatorProps {
  label: string
  value: string
  color?: string
  icon?: string
}

export function StatusIndicator({ label, value, color = C.success, icon }: StatusIndicatorProps) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <span style={{ fontSize: 10, color: C.muted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
        <span className="font-mono" style={{ fontSize: 13, fontWeight: 600, color }}>{value}</span>
      </div>
    </div>
  )
}

// ─── SectionHeader ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string
  action?: string
  onAction?: () => void
}

export function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{title}</span>
      {action && (
        <button onClick={onAction} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: C.primary, fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>
          {action}
        </button>
      )}
    </div>
  )
}

// ─── BackButton ──────────────────────────────────────────────────────────────

interface BackButtonProps {
  navigate: (s: Screen) => void
  to: Screen
  label?: string
}

export function BackButton({ navigate, to, label }: BackButtonProps) {
  return (
    <button
      onClick={() => navigate(to)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: C.secondary,
        fontSize: 14,
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 500,
        padding: '4px 0',
      }}
    >
      ← {label || 'Back'}
    </button>
  )
}

// ─── EmergencyFAB ────────────────────────────────────────────────────────────

interface EmergencyFABProps {
  navigate: (s: Screen) => void
}

export function EmergencyFAB({ navigate }: EmergencyFABProps) {
  return (
    <button
      onClick={() => navigate('emergency-gesture')}
      className="emergency-pulse"
      style={{
        position: 'absolute',
        bottom: 80,
        right: 16,
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${C.danger}, #B80000)`,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        boxShadow: '0 4px 16px rgba(239,68,68,0.4)',
        zIndex: 10,
      }}
    >
      🚨
    </button>
  )
}

// ─── CityMap (SVG) ────────────────────────────────────────────────────────────

interface CityMapProps {
  showRoute?: 'A' | 'B' | 'C' | 'all'
  showHeat?: boolean
  showConnectivity?: boolean
  height?: number
}

export function CityMap({ showRoute = 'all', showHeat = false, showConnectivity = false, height = 200 }: CityMapProps) {
  const w = 320

  // Street grid
  const hStreets = [30, 60, 95, 130, 165]
  const vStreets = [30, 70, 110, 160, 210, 260, 300]

  // Route paths (SVG path data)
  const routePaths = {
    A: 'M 30,165 L 30,130 L 70,130 L 70,95 L 110,95 L 110,60 L 160,60 L 160,30 L 260,30 L 300,30',
    B: 'M 30,165 L 70,165 L 70,130 L 110,130 L 160,130 L 160,95 L 210,95 L 210,60 L 260,60 L 260,30 L 300,30',
    C: 'M 30,165 L 30,130 L 70,130 L 110,130 L 110,95 L 160,95 L 210,95 L 260,95 L 300,60 L 300,30',
  }

  const routeColors = { A: '#7C7A9E', B: '#E0157A', C: '#A855F7' }

  // Connectivity segments for route B
  const connectivitySegs = [
    { path: 'M 30,165 L 70,165 L 70,130 L 110,130', color: '#22C55E' },
    { path: 'M 110,130 L 160,130 L 160,95', color: '#F59E0B' },
    { path: 'M 160,95 L 210,95', color: '#EF4444' },
    { path: 'M 210,95 L 210,60 L 260,60 L 260,30 L 300,30', color: '#22C55E' },
  ]

  // Heat zones
  const heatZones = [
    { cx: 95, cy: 110, r: 28, color: '#EF4444', opacity: 0.15 },
    { cx: 160, cy: 130, r: 22, color: '#F59E0B', opacity: 0.12 },
    { cx: 220, cy: 60, r: 18, color: '#22C55E', opacity: 0.13 },
    { cx: 70, cy: 95, r: 20, color: '#EF4444', opacity: 0.1 },
    { cx: 260, cy: 95, r: 16, color: '#22C55E', opacity: 0.12 },
  ]

  return (
    <svg
      width={w}
      height={height}
      viewBox={`0 0 ${w} ${height}`}
      style={{ display: 'block', width: '100%', height: 'auto' }}
    >
      <rect width={w} height={height} fill="#0A0A14" rx={0} />

      {/* Street grid */}
      {hStreets.filter(y => y < height).map(y => (
        <line key={`h${y}`} x1={0} y1={y} x2={w} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={1.5} />
      ))}
      {vStreets.map(x => (
        <line key={`v${x}`} x1={x} y1={0} x2={x} y2={height} stroke="rgba(255,255,255,0.04)" strokeWidth={1.5} />
      ))}

      {/* Main roads */}
      <line x1={0} y1={95} x2={w} y2={95} stroke="rgba(255,255,255,0.08)" strokeWidth={2.5} />
      <line x1={160} y1={0} x2={160} y2={height} stroke="rgba(255,255,255,0.08)" strokeWidth={2.5} />

      {/* Heat zones */}
      {showHeat && heatZones.map((z, i) => (
        <circle key={i} cx={z.cx} cy={z.cy} r={z.r} fill={z.color} opacity={z.opacity} />
      ))}

      {/* Routes */}
      {showConnectivity ? (
        connectivitySegs.map((seg, i) => (
          <path key={i} d={seg.path} stroke={seg.color} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
        ))
      ) : (
        (showRoute === 'all' ? ['A', 'B', 'C'] as const : [showRoute]).map(r => (
          <path
            key={r}
            d={routePaths[r]}
            stroke={routeColors[r]}
            strokeWidth={showRoute === r ? 4 : 2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={showRoute === 'all' ? 0.85 : 0.95}
          />
        ))
      )}

      {/* Start / End markers */}
      <circle cx={30} cy={165} r={5} fill="#22C55E" stroke="#0A0A14" strokeWidth={2} />
      <circle cx={300} cy={30} r={5} fill="#E0157A" stroke="#0A0A14" strokeWidth={2} />

      {/* Labels */}
      <text x={38} y={172} fill="#22C55E" fontSize={9} fontFamily="Outfit, sans-serif" fontWeight="600">START</text>
      <text x={240} y={26} fill="#E0157A" fontSize={9} fontFamily="Outfit, sans-serif" fontWeight="600">HOME</text>

      {/* Help point dots on Route B */}
      {showRoute === 'B' && [
        [110, 130], [160, 95], [210, 60]
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4} fill="#A855F7" stroke="#0A0A14" strokeWidth={1.5} opacity={0.8} />
      ))}
    </svg>
  )
}

// ─── ConnectivityBar ─────────────────────────────────────────────────────────

interface ConnectivityBarProps {
  progress: number
}

export function ConnectivityBar({ progress }: ConnectivityBarProps) {
  return (
    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        borderRadius: 3,
        background: progress > 70 ? C.success : progress > 40 ? C.warning : C.danger,
        transition: 'all 0.5s ease',
      }} />
    </div>
  )
}

// ─── Divider ─────────────────────────────────────────────────────────────────

export function Divider() {
  return <div style={{ height: 1, background: C.border, margin: '4px 0' }} />
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

interface AvatarProps {
  initials: string
  size?: number
  color?: string
}

export function Avatar({ initials, size = 40, color = C.primary }: AvatarProps) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: `${color}22`,
      border: `1.5px solid ${color}55`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.35,
      fontWeight: 700,
      color,
      fontFamily: 'Outfit, sans-serif',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

// ─── ScreenWrapper ────────────────────────────────────────────────────────────

interface ScreenWrapperProps {
  children: ReactNode
  state: AppState
  scrollable?: boolean
  style?: React.CSSProperties
}

export function ScreenWrapper({ children, state, scrollable = true, style }: ScreenWrapperProps) {
  const bg = batteryBg(state.battery)
  return (
    <div
      className="fade-in"
      style={{
        flex: 1,
        background: bg,
        overflowY: scrollable ? 'auto' : 'hidden',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {/* Low battery warning banner */}
      {state.battery <= 15 && state.battery > 10 && (
        <div style={{
          background: 'rgba(245,158,11,0.15)',
          borderBottom: '1px solid rgba(245,158,11,0.3)',
          padding: '6px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{ fontSize: 12 }}>⚡</span>
          <span style={{ fontSize: 12, color: C.warning, fontWeight: 500 }}>Battery is getting low. Consider enabling Low Power Journey.</span>
        </div>
      )}
      {/* Network warning */}
      {state.network === 'weak' && (
        <div style={{
          background: 'rgba(245,158,11,0.12)',
          borderBottom: '1px solid rgba(245,158,11,0.25)',
          padding: '6px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{ fontSize: 11 }}>📶</span>
          <span style={{ fontSize: 12, color: C.warning, fontWeight: 500 }}>Connectivity weakening — offline journey pack is active.</span>
        </div>
      )}
      {children}
    </div>
  )
}
