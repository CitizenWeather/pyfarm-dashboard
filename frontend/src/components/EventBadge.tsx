import React from 'react'

interface Props {
  kind: string
}

const SEVERITY: Record<string, { bg: string; color: string }> = {
  alert:   { bg: '#d63031', color: '#fff' },
  warning: { bg: '#fdcb6e', color: '#1a1a2e' },
  info:    { bg: '#0984e3', color: '#fff' },
  ok:      { bg: '#00b894', color: '#fff' },
  override:{ bg: '#6c5ce7', color: '#fff' },
}

function kindToSeverity(kind: string): string {
  const k = kind.toLowerCase()
  if (k.includes('alert') || k.includes('error') || k.includes('fail')) return 'alert'
  if (k.includes('warn')) return 'warning'
  if (k.includes('ok') || k.includes('recover') || k.includes('normal')) return 'ok'
  if (k.includes('override') || k.includes('manual')) return 'override'
  return 'info'
}

export default function EventBadge({ kind }: Props) {
  const sev = kindToSeverity(kind)
  const style = SEVERITY[sev] ?? SEVERITY['info']
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        borderRadius: 4,
        padding: '2px 8px',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {kind}
    </span>
  )
}
