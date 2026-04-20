import { createContext, useState, useCallback, useMemo, useEffect } from 'react'

export const AuthContext = createContext(null)

export function AuthProvider({ children, services }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let unsubscribe;
    if (services && services.auth) {
      unsubscribe = services.auth.onAuthStateChange((u) => {
        setUser(prev => {
          if (!u) return null
          return {
            ...prev,
            ...u,
            id: u.uid || u.id || prev?.id,
            uid: u.uid || prev?.uid || u.id,
            role: u.role ?? prev?.role ?? null,
            buildingId: u.buildingId ?? prev?.buildingId ?? null
          }
        })
        setIsInitializing(false)
      })
    } else {
      setIsInitializing(false)
    }
    return () => unsubscribe?.()
  }, [services])

  const login = useCallback(async (email, password) => {
    if (!services?.auth) return

    setLoading(true)
    setError(null)
    try {
      const result = await services.auth.login(email, password)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [services])

  const loginWithGoogle = useCallback(async () => {
    if (!services?.auth) return

    setLoading(true)
    setError(null)
    try {
      const result = await services.auth.loginWithGoogle()
      // Rely on onAuthStateChange to hydrate the user document, which will trigger redirect via useAccessControl
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [services])

  const signup = useCallback(async (email, password, name, role) => {
    if (!services?.auth) return

    setLoading(true)
    setError(null)
    try {
      const result = await services.auth.signup(email, password, name, role)
      
      // Post-Write Resync: Immediately force local context to acknowledge the DB write 
      // preventing UI hanging logic loops while onAuthStateChange catches up
      setUser({
        id: result.uid || result.id,
        uid: result.uid || result.id,
        email,
        name,
        role,
        buildingId: null
      })
      
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [services])

  const completeOnboarding = useCallback(async (userId, email, role) => {
    if (!services?.auth) return

    setLoading(true)
    setError(null)
    try {
      const result = await services.auth.completeOnboarding(userId, email, role)

      setUser(prev => {
        if (!prev) return { id: userId, uid: userId, email, role, buildingId: null }
        return {
          ...prev,
          id: prev.id || userId,
          uid: prev.uid || userId,
          email: prev.email || email,
          role,
          buildingId: prev.buildingId || null
        }
      })

      if (result?.localOnly) {
        console.log('Onboarding completed locally (Firestore unavailable)')
      } else {
        console.log('Onboarding completed successfully')
      }

      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [services])

  const logout = useCallback(async () => {
    if (!services?.auth) return

    setLoading(true)
    setError(null)
    try {
      await services.auth.logout()
      setUser(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [services])

  const value = useMemo(() => ({
    user,
    setUser,
    loading,
    isInitializing,
    error,
    login,
    loginWithGoogle,
    completeOnboarding,
    signup,
    logout,
    isAuthenticated: !!user
  }), [user, loading, isInitializing, error, login, loginWithGoogle, completeOnboarding, signup, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
