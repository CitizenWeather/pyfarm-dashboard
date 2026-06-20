import React from 'react'

interface Props {
  label: string
  value: number | string | null
  unit?: string
  trend?: 'up' | 'down' | 'stable' | null
  status?: 'ok' | 'warn' | 'alert' | 'unknown'
  subtitle?: string
}

const STATUS_COLOR: Record<string, string> = {
  ok:      '#00b894',
  warn:    '#fdcb6e',
  alert:   '#d63031',
  unknown: '#a0a0b0',
}

const TREND_ARROW: Record<string, string> = {
  up:     '↑',
  down:   '↓',
  stable: '→',
}

export default function StatusCard({
  label,
  value,
  unit,
  trend,
  status = 'unknown',
  subtitle,
}: Props) {
  const color = STATUS_COLOR[status]
  const displayVal = value === null || value === undefined ? '—' : value

  return (
    <div
      className="card"
      style={{
        borderLeft: `4px solid ${color}`,
        minWidth: 140,
        flex: '1 1 140px',
      }}
    >
      <div style={{ color: 'var(--text-dim)', fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color }}>
          {displayVal}
        </span>
        {unit && (
          <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{unit}</span>
        )}
        {trend && trend in TREND_ARROW && (
          <span style={{ fontSize: 16, color, marginLeft: 4 }}>
            {TREND_ARROW[trend]}
          </span>
        )}
      </div>
      {subtitle && (
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
          {subtitle}
        </div>
      )}
    </div>
  )
}
