export interface User {
  id: number
  username: string
  roles: string[]
  email: string
}

export interface SensorReading {
  sensor_id: string
  metric: string
  value: number
  unit: string
  timestamp: string
}

export interface ActuatorState {
  name: string
  state: boolean
  timestamp: string
}

export interface ControlEvent {
  kind: string
  message: string
  timestamp: string
  data: Record<string, unknown>
}

export interface ControlStatus {
  run_id: string
  spec_name: string
  current_stage: string
  elapsed_days: number
  readings: Record<string, { value: number; unit: string }>
  derived: Record<string, number>
  actuator_states: Record<string, { state: boolean; timestamp: string }>
  recent_events: ControlEvent[]
}

export interface LoginResponse {
  access_token: string
  user: User
}

export interface AppConfig {
  apiUrl: string
  authUrl: string
}
