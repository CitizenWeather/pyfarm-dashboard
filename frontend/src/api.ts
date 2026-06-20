import type { AppConfig, ControlEvent, ControlStatus, LoginResponse } from './types'

let _config: AppConfig | null = null

async function getConfig(): Promise<AppConfig> {
  if (_config) return _config
  const res = await fetch('/config.json')
  if (!res.ok) {
    // Fallback for local dev without the FastAPI server.
    _config = { apiUrl: 'http://localhost:8002', authUrl: 'http://localhost:8001' }
    return _config
  }
  _config = (await res.json()) as AppConfig
  return _config
}

async function authHeaders(token: string): Promise<HeadersInit> {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const cfg = await getConfig()
  const res = await fetch(`${cfg.authUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { detail?: string }).detail ?? `Login failed: ${res.status}`)
  }
  return res.json() as Promise<LoginResponse>
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const cfg = await getConfig()
    const res = await fetch(`${cfg.authUrl}/api/v1/auth/verify`, {
      method: 'POST',
      headers: await authHeaders(token),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function getStatus(token: string): Promise<ControlStatus> {
  const cfg = await getConfig()
  const res = await fetch(`${cfg.apiUrl}/api/v1/status`, {
    headers: await authHeaders(token),
  })
  if (!res.ok) throw new Error(`Status fetch failed: ${res.status}`)
  return res.json() as Promise<ControlStatus>
}

export interface HistoryParams {
  sensor_id?: string
  metric?: string
  start?: string
  end?: string
  limit?: number
}

export async function getHistory(
  token: string,
  params: HistoryParams = {},
): Promise<unknown[]> {
  const cfg = await getConfig()
  const qs = new URLSearchParams()
  if (params.sensor_id) qs.set('sensor_id', params.sensor_id)
  if (params.metric) qs.set('metric', params.metric)
  if (params.start) qs.set('start', params.start)
  if (params.end) qs.set('end', params.end)
  if (params.limit != null) qs.set('limit', String(params.limit))
  const res = await fetch(`${cfg.apiUrl}/api/v1/history?${qs.toString()}`, {
    headers: await authHeaders(token),
  })
  if (!res.ok) throw new Error(`History fetch failed: ${res.status}`)
  return res.json() as Promise<unknown[]>
}

export async function getEvents(token: string, limit = 50): Promise<ControlEvent[]> {
  const cfg = await getConfig()
  const res = await fetch(`${cfg.apiUrl}/api/v1/events?limit=${limit}`, {
    headers: await authHeaders(token),
  })
  if (!res.ok) throw new Error(`Events fetch failed: ${res.status}`)
  return res.json() as Promise<ControlEvent[]>
}

export async function overrideActuator(
  token: string,
  actuator_id: string,
  state: boolean,
): Promise<unknown> {
  const cfg = await getConfig()
  const res = await fetch(`${cfg.apiUrl}/api/v1/override`, {
    method: 'POST',
    headers: await authHeaders(token),
    body: JSON.stringify({ actuator_id, state }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { detail?: string }).detail ?? `Override failed: ${res.status}`,
    )
  }
  return res.json()
}
