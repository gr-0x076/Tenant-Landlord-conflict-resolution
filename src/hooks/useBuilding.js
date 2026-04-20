import { useContext } from 'react'
import { BuildingContext } from '../context/BuildingContext'

export function useBuilding() {
  const context = useContext(BuildingContext)
  if (!context) {
    throw new Error('useBuilding must be used within BuildingProvider')
  }
  return context
}
