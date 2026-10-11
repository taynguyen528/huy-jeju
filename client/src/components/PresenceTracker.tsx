import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { sendPresenceHeartbeat } from '../api'

const storageKey = 'jeju-presence-id'

function visitorId() {
  const current = sessionStorage.getItem(storageKey)
  if (current) return current
  const created = crypto.randomUUID()
  sessionStorage.setItem(storageKey, created)
  return created
}

export default function PresenceTracker() {
  const location = useLocation()
  const { user } = useAuth()
  const id = useMemo(visitorId, [])
  const audience = user?.roles.includes('ADMIN') ? 'admin' : user ? 'member' : 'guest'

  useEffect(() => {
    const send = () => {
      if (document.visibilityState === 'visible') void sendPresenceHeartbeat(id, location.pathname, audience).catch(() => undefined)
    }
    send()
    const interval = window.setInterval(send, 15_000)
    document.addEventListener('visibilitychange', send)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', send)
    }
  }, [audience, id, location.pathname])

  return null
}
