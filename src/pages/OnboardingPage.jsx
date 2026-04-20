import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, ErrorAlert, PageHeader, Panel } from '../components/UIElements'

export default function OnboardingPage() {
  const { user, completeOnboarding, loading, error } = useAuth()
  const [localError, setLocalError] = useState(null)
  const navigate = useNavigate()

  const handleRoleSelection = async (role) => {
    setLocalError(null)
    try {
      await completeOnboarding(user.uid || user.id, user.email, role)
      navigate(role === 'landlord' ? '/create-building' : '/join-building')
    } catch (err) {
      setLocalError(err.message || 'Failed to complete onboarding. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-war-bg p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <PageHeader 
          title="IDENTIFY YOURSELF"
          subtitle="Are you managing a building or reporting issues?"
        />

        {(error || localError) && <ErrorAlert message={error || localError} onClose={() => setLocalError(null)} />}

        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <Panel className="flex flex-col items-center text-center cursor-pointer hover:border-war-gold transition duration-300">
            <h3 className="font-display text-2xl text-war-gold mb-4">TENANT</h3>
            <p className="font-body text-war-neutral mb-8">
              I live here. I need to report issues, track repairs, and communicate with management.
            </p>
            <Button 
              onClick={() => handleRoleSelection('tenant')}
              disabled={loading}
              className="mt-auto w-full"
            >
              {loading ? 'PROCESSING...' : 'JOIN AS TENANT'}
            </Button>
          </Panel>

          <Panel className="flex flex-col items-center text-center cursor-pointer hover:border-war-gold transition duration-300">
            <h3 className="font-display text-2xl text-war-gold mb-4">LANDLORD / WARDEN</h3>
            <p className="font-body text-war-neutral mb-8">
              I manage the building. I need to oversee issues, update statuses, and maintain the log.
            </p>
            <Button 
              onClick={() => handleRoleSelection('landlord')}
              disabled={loading}
              className="mt-auto w-full"
            >
              {loading ? 'PROCESSING...' : 'JOIN AS LANDLORD'}
            </Button>
          </Panel>
        </div>
      </div>
    </div>
  )
}
