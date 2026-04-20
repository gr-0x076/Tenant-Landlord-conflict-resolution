import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useBuilding } from '../hooks/useBuilding'
import { buildingService } from '../services/index'
import { Button, InputField, ErrorAlert, SuccessAlert, PageHeader, Panel } from '../components/UIElements'

/**
 * Create Building Page - For Landlords
 */
export default function CreateBuildingPage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const { setBuilding } = useBuilding()
  const [buildingName, setBuildingName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [inviteCode, setInviteCode] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!buildingName.trim()) {
      setError('Building name is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const buildingData = await buildingService.building.createBuilding(buildingName, user.uid || user.id)
      
      setBuilding(buildingData)
      setInviteCode(buildingData.inviteCode)
      setUser(prev => ({ ...prev, buildingId: buildingData.id }))
      
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to create building')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-war-bg p-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <PageHeader 
          title="ESTABLISH WAR ROOM"
          subtitle="Create your building's command center"
        />

        <Panel>
          {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
          
          {inviteCode ? (
            <div className="text-center">
              <div className="mb-6 p-4 bg-war-gold bg-opacity-10 rounded border-2 border-war-gold">
                <p className="font-body text-war-neutral text-sm mb-2">INVITE CODE</p>
                <p className="font-display text-3xl text-war-gold font-bold">{inviteCode}</p>
              </div>
              <p className="font-body text-war-neutral mb-6">
                Share this code with tenants to let them join your building
              </p>
              <SuccessAlert message="Building created! Redirecting to dashboard..." />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <InputField
                label="BUILDING NAME"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                placeholder="E.G. Tower A, Riverside Apartments"
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'ESTABLISHING...' : 'ESTABLISH BUILDING'}
              </Button>
            </form>
          )}
        </Panel>
      </div>
    </div>
  )
}
