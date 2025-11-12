import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { Loading } from './custom/Loading'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasCheckedAuth, checkAuth } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    // Only check auth if we haven't checked yet and we're not currently loading
    if (!hasCheckedAuth && !isLoading) {
      checkAuth()
    }
  }, [isAuthenticated, isLoading, hasCheckedAuth, checkAuth])

  // Show loading while checking auth (defensive check - App.tsx should handle this, but just in case)
  if (!hasCheckedAuth || isLoading) {
    return <Loading />
  }

  // Only redirect to sign-in if we've checked auth and user is not authenticated
  if (!isAuthenticated) {
    // Redirect to sign-in page, saving the current location
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  return <>{children}</>
}

