import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useBuilding } from '../hooks/useBuilding'
import { buildingService } from '../services/index'
import { Button, InputField, ErrorAlert, SuccessAlert, PageHeader, Panel } from '../components/UIElements'

/**
 * Join Building Page - For Tenants
 */
export default function JoinBuildingPage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const { setBuilding } = useBuilding()
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (user?.role !== 'tenant') {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!inviteCode.trim()) {
      setError('Invite code is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const building = await buildingService.building.joinBuilding(inviteCode, user.uid || user.id)
      setBuilding(building)
      setUser(prev => ({ ...prev, buildingId: building.id }))
      setSuccess('Successfully joined building!')
      
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (err) {
      setError(err.message || 'Failed to join building. Check the invite code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-war-bg p-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <PageHeader 
          title="JOIN BUILDING"
          subtitle="Enter the invite code from your landlord"
        />

        <Panel>
          {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
          {success && <SuccessAlert message={success} />}

          <form onSubmit={handleSubmit}>
            <InputField
              label="INVITE CODE"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="E.G. ABC123DEF"
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'JOINING...' : 'JOIN BUILDING'}
            </Button>
          </form>

          <p className="text-center text-war-neutral font-body text-xs mt-4">
            Ask your landlord for the invite code to access the war room
          </p>
        </Panel>
      </div>
    </div>
  )
}
