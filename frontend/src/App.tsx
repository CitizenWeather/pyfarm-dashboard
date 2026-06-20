import React, { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import NavBar from './components/NavBar'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import Login from './pages/Login'
import type { User } from './types'

/* ---- auth storage helpers ---- */

const TOKEN_KEY = 'pyfarm_token'
const USER_KEY = 'pyfarm_user'

function loadToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function saveAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/* ---- inner router component (needs useNavigate) ---- */

function AppRoutes() {
  const [token, setToken] = useState<string | null>(loadToken)
  const [user, setUser] = useState<User | null>(loadUser)
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect to /login if not authenticated
  useEffect(() => {
    if (!token && location.pathname !== '/login') {
      navigate('/login', { replace: true })
    }
  }, [token, navigate, location.pathname])

  function handleLogin(t: string, u: User) {
    saveAuth(t, u)
    setToken(t)
    setUser(u)
    navigate('/dashboard', { replace: true })
  }

  function handleLogout() {
    clearAuth()
    setToken(null)
    setUser(null)
    navigate('/login', { replace: true })
  }

  if (!token) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar user={user} onLogout={handleLogout} />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard token={token} user={user!} />} />
          <Route path="/events" element={<Events token={token} />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  )
}

/* ---- root App ---- */

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
