import { Navigate, useLocation } from 'react-router-dom'
import { useAccessControl } from '../hooks/useAccessControl'
import { LoadingSpinner, ErrorAlert } from './UIElements'

export function ProtectedGuard({ children, allowedRoles }) {
  const { isLocked, timeoutHit, redirectPath, user } = useAccessControl()
  const location = useLocation()

  if (isLocked) {
    if (timeoutHit) {
      return (
        <div className="min-h-screen bg-war-bg p-8 pt-20">
           <ErrorAlert message="Connection timed out securely resolving the War Room. Please refresh your browser." />
        </div>
      )
    }
    return (
      <div className="min-h-screen bg-war-bg flex flex-col items-center justify-center">
        <LoadingSpinner />
        <p className="mt-4 font-body text-war-gold animate-pulse text-sm tracking-widest">SECURING CONNECTION...</p>
      </div>
    )
  }

  if (redirectPath && location.pathname !== redirectPath) {
     return <Navigate to={redirectPath} replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
     return <Navigate to="/dashboard" replace />
  }

  if (!user && !redirectPath) {
     return <Navigate to="/login" replace />
  }

  return children
}

export function PublicGuard({ children }) {
  const { isLocked, timeoutHit, redirectPath, accessGranted } = useAccessControl()
  const location = useLocation()
  
  if (isLocked) {
    if (timeoutHit) {
      return (
        <div className="min-h-screen bg-war-bg p-8 pt-20">
           <ErrorAlert message="Connection timed out. Please refresh your browser." />
        </div>
      )
    }
    return (
      <div className="min-h-screen bg-war-bg flex flex-col items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (accessGranted) {
     return <Navigate to="/dashboard" replace />
  }

  if (redirectPath && redirectPath !== '/login' && redirectPath !== '/signup' && location.pathname !== redirectPath) {
    return <Navigate to={redirectPath} replace />
  }

  return children
}
