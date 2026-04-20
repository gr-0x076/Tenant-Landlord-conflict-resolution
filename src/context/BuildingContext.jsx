import { createContext, useState, useCallback, useMemo, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

export const BuildingContext = createContext(null)

export function BuildingProvider({ children, services }) {
  const { user } = useAuth()
  const [building, setBuilding] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user?.buildingId && services?.building) {
      setLoading(true)
      setError(null)
      services.building.getBuilding(user.buildingId)
        .then(b => setBuilding(b))
        .catch(err => {
          console.error('Failed to load building:', err)
          setError(err.message || 'Failed to load building')
          setBuilding(null)
        })
        .finally(() => setLoading(false))
    } else {
      setBuilding(null)
    }
  }, [user, services])

  const joinBuilding = useCallback(async (inviteCode) => {
    if (!services?.building || !user?.id) return

    setLoading(true)
    setError(null)
    try {
      const result = await services.building.joinBuilding(inviteCode, user.id)
      setBuilding(result)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [services])

  const createBuilding = useCallback(async (name) => {
    if (!services?.building || !user?.id) return

    setLoading(true)
    setError(null)
    try {
      const newBuilding = await services.building.createBuilding(name, user.id)
      setBuilding(newBuilding)
      return newBuilding
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [services])

  const value = useMemo(() => ({
    building,
    setBuilding,
    loading,
    error,
    joinBuilding,
    createBuilding,
    hasBuilding: !!building
  }), [building, loading, error, joinBuilding, createBuilding])

  return (
    <BuildingContext.Provider value={value}>
      {children}
    </BuildingContext.Provider>
  )
}
