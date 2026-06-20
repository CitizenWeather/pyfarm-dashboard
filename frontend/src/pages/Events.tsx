import React, { useCallback, useEffect, useState } from 'react'
import EventBadge from '../components/EventBadge'
import { getEvents } from '../api'
import type { ControlEvent } from '../types'

interface Props {
  token: string
}

const PAGE_SIZE = 20

export default function Events({ token }: Props) {
  const [events, setEvents] = useState<ControlEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [limit, setLimit] = useState(PAGE_SIZE)

  const fetchEvents = useCallback(
    async (l: number) => {
      setLoading(true)
      setError(null)
      try {
        const evs = await getEvents(token, l)
        setEvents(evs)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch events')
      } finally {
        setLoading(false)
      }
    },
    [token],
  )

  useEffect(() => {
    void fetchEvents(limit)
  }, [fetchEvents, limit])

  return (
    <div className="page">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>Event Log</h2>
        <button
          onClick={() => { void fetchEvents(limit) }}
          disabled={loading}
          style={{ background: 'var(--card2)', color: 'var(--text)', border: '1px solid var(--border)' }}
        >
          {loading ? 'Loading…' : '↺ Refresh'}
        </button>
      </div>

      {error && (
        <div
          className="card"
          style={{ borderLeft: '4px solid #d63031', color: '#d63031', marginBottom: 16 }}
        >
          {error}
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {events.length > 0 ? (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: '#0d0d1f' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11,
                                fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.06em',
                                textTransform: 'uppercase' }}>
                    Type
                  </th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11,
                                fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.06em',
                                textTransform: 'uppercase' }}>
                    Time
                  </th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11,
                                fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.06em',
                                textTransform: 'uppercase' }}>
                    Message
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom:
                        i < events.length - 1 ? '1px solid var(--border)' : undefined,
                    }}
                  >
                    <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                      <EventBadge kind={ev.kind} />
                    </td>
                    <td
                      style={{
                        padding: '10px 16px',
                        color: 'var(--text-dim)',
                        fontSize: 12,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {new Date(ev.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>{ev.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              style={{
                padding: '12px 16px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 13,
                color: 'var(--text-dim)',
              }}
            >
              <span>Showing {events.length} events</span>
              <button
                onClick={() => setLimit((l) => l + PAGE_SIZE)}
                disabled={loading || events.length < limit}
                style={{
                  background: 'var(--card2)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              >
                Load more
              </button>
            </div>
          </>
        ) : (
          <div style={{ padding: 24, color: 'var(--text-dim)', textAlign: 'center' }}>
            {loading ? 'Loading events…' : 'No events found.'}
          </div>
        )}
      </div>
    </div>
  )
}
