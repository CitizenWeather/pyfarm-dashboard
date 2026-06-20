import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { User } from '../types'

interface Props {
  user: User | null
  onLogout: () => void
}

const ROLE_COLOR: Record<string, string> = {
  admin:    '#6c5ce7',
  operator: '#00b894',
  viewer:   '#0984e3',
}

function RoleBadge({ role }: { role: string }) {
  const color = ROLE_COLOR[role] ?? '#636e72'
  return (
    <span
      style={{
        background: color,
        color: '#fff',
        borderRadius: 4,
        padding: '2px 7px',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}
    >
      {role}
    </span>
  )
}

export default function NavBar({ user, onLogout }: Props) {
  const loc = useLocation()

  const navLink = (to: string, label: string) => {
    const active = loc.pathname === to || loc.pathname.startsWith(to + '/')
    return (
      <Link
        to={to}
        style={{
          color: active ? '#00b894' : 'var(--text-dim)',
          fontWeight: active ? 700 : 400,
          fontSize: 14,
          padding: '4px 10px',
          borderBottom: active ? '2px solid #00b894' : '2px solid transparent',
        }}
      >
        {label}
      </Link>
    )
  }

  return (
    <nav
      style={{
        background: '#0d0d1f',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        height: 52,
        gap: 24,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Brand */}
      <span
        style={{
          fontWeight: 800,
          fontSize: 16,
          color: '#00b894',
          letterSpacing: '0.03em',
          marginRight: 8,
        }}
      >
        🌱 pyfarm
      </span>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 4 }}>
        {navLink('/dashboard', 'Dashboard')}
        {navLink('/events', 'Events')}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User info */}
      {user && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            color: 'var(--text-dim)',
          }}
        >
          <span>{user.username}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {user.roles.map((r) => (
              <RoleBadge key={r} role={r} />
            ))}
          </div>
          <button
            onClick={onLogout}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-dim)',
              fontSize: 12,
              padding: '4px 10px',
            }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}
