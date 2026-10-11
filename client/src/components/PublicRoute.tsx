import { Center, Loader } from '@mantine/core'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function PublicRoute() {
  const { user, loading } = useAuth()
  if (loading) return <Center mih="100vh"><Loader color="dark" /></Center>
  if (user?.roles.includes('ADMIN')) return <Navigate to="/admin" replace />
  return <Outlet />
}
