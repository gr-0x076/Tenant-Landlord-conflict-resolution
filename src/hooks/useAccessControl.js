import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'

export function useAccessControl() {
  const { user, isInitializing } = useAuth()
  const [loadingLock, setLoadingLock] = useState(true)
  const [timeoutHit, setTimeoutHit] = useState(false)

  // Manage global lock state with a timeout fallback
  useEffect(() => {
    let timer;
    if (isInitializing) {
      setLoadingLock(true)
      setTimeoutHit(false)
      
      // Safety timeout: if Firebase completely stalls, unlock into error state
      timer = setTimeout(() => {
        setTimeoutHit(true)
      }, 10000) 
    } else {
      setLoadingLock(false)
      setTimeoutHit(false)
    }
    return () => clearTimeout(timer)
  }, [isInitializing])

  // Central Routing Truth Engine
  let redirectPath = null;
  let accessGranted = false;

  if (!isInitializing && !loadingLock) {
    if (!user) {
      redirectPath = '/login'
    } else if (!user.role) {
      redirectPath = '/onboarding'
    } else if (!user.buildingId) {
      redirectPath = user.role === 'landlord' ? '/create-building' : '/join-building'
    } else {
      redirectPath = null
      accessGranted = true;
    }
  }

  return {
    isLocked: loadingLock,
    timeoutHit,
    redirectPath,
    user,
    accessGranted
  }
}
