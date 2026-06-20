import React, { useCallback, useEffect, useRef, useState } from 'react'
import ActuatorToggle from '../components/ActuatorToggle'
import EventBadge from '../components/EventBadge'
import StatusCard from '../components/StatusCard'
import { getStatus } from '../api'
import type { ControlStatus, User } from '../types'

interface Props {
  token: string
  user: User
}

/* ---- helpers ---- */

function readingStatus(metric: string, value: number): 'ok' | 'warn' | 'alert' {
  const m = metric.toLowerCase()
  if (m.includes('temp') || m === 'temperature') {
    if (value < 18 || value > 30) return 'alert'
    if (value < 20 || value > 28) return 'warn'
    return 'ok'
  }
  if (m.includes('rh') || m.includes('humid')) {
    if (value < 40 || value > 80) return 'alert'
    if (value < 50 || value > 70) return 'warn'
    return 'ok'
  }
  if (m === 'vpd') {
    if (value < 0.4 || value > 1.6) return 'alert'
    if (value < 0.6 || value > 1.4) return 'warn'
    return 'ok'
  }
  if (m.includes('co2')) {
    if (value < 300 || value > 1500) return 'alert'
    if (value > 1200) return 'warn'
    return 'ok'
  }
  return 'ok'
}

function canControl(user: User): boolean {
  return user.roles.some((r) => r === 'admin' || r === 'operator')
}

function formatElapsed(days: number): string {
  if (days < 1) return `${Math.round(days * 24)}h`
  return `Day ${Math.round(days)}`
}

/* ---- component ---- */

export default function Dashboard({ token, user }: Props) {
  const [status, setStatus] = useState<ControlStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const s = await getStatus(token)
      setStatus(s)
      setLastUpdated(new Date())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch status')
    }
  }, [token])

  useEffect(() => {
    void fetchStatus()
    pollRef.current = setInterval(() => { void fetchStatus() }, 10_000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [fetchStatus])

  // ---- render ----

  if (error && !status) {
    return (
      <div className="page">
        <div
          className="card"
          style={{
            borderLeft: '4px solid #d63031',
            textAlign: 'center',
            padding: 32,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
          <h2 style={{ color: '#d63031', marginBottom: 8 }}>Control service unavailable</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>{error}</p>
          <button
            onClick={() => { void fetchStatus() }}
            style={{ marginTop: 16, background: '#d63031', color: '#fff', fontWeight: 600 }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 20,
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 2 }}>
            {status ? status.spec_name : 'Loading…'}
          </h2>
          {status && (
            <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
              Stage:{' '}
              <span style={{ color: '#00b894', fontWeight: 600 }}>
                {status.current_stage}
              </span>
              {' · '}
              <span>{formatElapsed(status.elapsed_days)}</span>
              {' · Run '}
              <span style={{ fontFamily: 'monospace' }}>{status.run_id}</span>
            </div>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'right' }}>
          {error && (
            <div style={{ color: '#fdcb6e', marginBottom: 4 }}>⚠ {error}</div>
          )}
          {lastUpdated && (
            <div>Updated {lastUpdated.toLocaleTimeString()}</div>
          )}
          <div style={{ marginTop: 2 }}>Auto-refresh every 10s</div>
        </div>
      </div>

      {/* Readings grid */}
      <section style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dim)',
                      letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
          Sensor Readings
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {status
            ? Object.entries(status.readings).map(([key, r]) => (
                <StatusCard
                  key={key}
                  label={key.replace(/_/g, ' ')}
                  value={r.value}
                  unit={r.unit}
                  status={readingStatus(key, r.value)}
                />
              ))
            : [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="card"
                  style={{ flex: '1 1 140px', minWidth: 140, height: 80,
                           background: '#1e2545', animation: 'pulse 1.5s infinite' }}
                />
              ))}
        </div>
      </section>

      {/* Derived values */}
      {status && Object.keys(status.derived).length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dim)',
                        letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
            Derived Values
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {Object.entries(status.derived).map(([key, val]) => (
              <StatusCard
                key={key}
                label={key.replace(/_/g, ' ')}
                value={Number(val.toFixed(2))}
                status={readingStatus(key, val)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Actuators */}
      <section style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dim)',
                      letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
          Actuators
        </h3>
        {status && Object.keys(status.actuator_states).length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {Object.entries(status.actuator_states).map(([id, act]) => (
              <ActuatorToggle
                key={id}
                actuatorId={id}
                label={id.replace(/_/g, ' ')}
                currentState={act.state}
                timestamp={act.timestamp}
                token={token}
                canControl={canControl(user)}
                onToggled={() => { void fetchStatus() }}
              />
            ))}
          </div>
        ) : (
          <div className="card" style={{ color: 'var(--text-dim)', fontSize: 13 }}>
            {status ? 'No actuators reported.' : 'Loading…'}
          </div>
        )}
      </section>

      {/* Recent events */}
      <section>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dim)',
                      letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
          Recent Events
        </h3>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {status && status.recent_events.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {status.recent_events.map((ev, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: i < status.recent_events.length - 1
                        ? '1px solid var(--border)' : undefined,
                    }}
                  >
                    <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                      <EventBadge kind={ev.kind} />
                    </td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-dim)',
                                  fontSize: 12, whiteSpace: 'nowrap' }}>
                      {new Date(ev.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>
                      {ev.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: 16, color: 'var(--text-dim)', fontSize: 13 }}>
              {status ? 'No recent events.' : 'Loading…'}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
