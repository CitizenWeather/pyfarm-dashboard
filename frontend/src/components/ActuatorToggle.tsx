import React, { useState } from 'react'
import { overrideActuator } from '../api'

interface Props {
  actuatorId: string
  label: string
  currentState: boolean
  timestamp: string
  token: string
  canControl: boolean
  onToggled?: () => void
}

export default function ActuatorToggle({
  actuatorId,
  label,
  currentState,
  timestamp,
  token,
  canControl,
  onToggled,
}: Props) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleToggle() {
    const newState = !currentState
    const action = newState ? 'ON' : 'OFF'
    if (!window.confirm(`Set ${label} to ${action}?`)) return
    setPending(true)
    setError(null)
    try {
      await overrideActuator(token, actuatorId, newState)
      onToggled?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Override failed')
    } finally {
      setPending(false)
    }
  }

  const ts = new Date(timestamp).toLocaleTimeString()

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flex: '1 1 200px',
        minWidth: 200,
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: currentState ? '#00b894' : '#636e72',
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
            {currentState ? 'ON' : 'OFF'} · {ts}
          </span>
        </div>
        {error && (
          <div style={{ fontSize: 11, color: '#d63031', marginTop: 4 }}>{error}</div>
        )}
      </div>
      {canControl && (
        <button
          onClick={handleToggle}
          disabled={pending}
          style={{
            background: currentState ? '#d63031' : '#00b894',
            color: '#fff',
            fontWeight: 600,
            minWidth: 60,
          }}
        >
          {pending ? '…' : currentState ? 'Turn OFF' : 'Turn ON'}
        </button>
      )}
    </div>
  )
}
