import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useBuilding } from '../hooks/useBuilding'
import { Button, PageHeader, Panel } from '../components/UIElements'

/**
 * Profile Page
 */
export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { building } = useBuilding()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-war-bg p-8">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="PROFILE"
          subtitle="Your war room credentials"
        />

        <Panel className="mb-6">
          <div className="space-y-6">
            <div>
              <p className="font-body text-war-neutral text-sm mb-2 uppercase">NAME</p>
              <p className="font-display text-2xl text-war-gold">{user?.name || user?.email}</p>
            </div>

            <div>
              <p className="font-body text-war-neutral text-sm mb-2 uppercase">EMAIL</p>
              <p className="font-body text-white">{user?.email}</p>
            </div>

            <div>
              <p className="font-body text-war-neutral text-sm mb-2 uppercase">ROLE</p>
              <p className="font-body text-white capitalize">{user?.role || 'Member'}</p>
            </div>

            {building && (
              <div>
                <p className="font-body text-war-neutral text-sm mb-2 uppercase">Building</p>
                <p className="font-body text-white">{building.name}</p>
              </div>
            )}

            <div className="border-t-2 border-war-neutral border-opacity-20 pt-6">
              <p className="font-body text-war-neutral text-xs mb-4">ACCOUNT ACTIONS</p>
              <Button
                onClick={handleLogout}
                variant="danger"
                className="w-full"
              >
                LOGOUT
              </Button>
            </div>
          </div>
        </Panel>

        <Button onClick={() => navigate('/dashboard')} variant="teal" className="w-full">
          BACK TO WAR TABLE
        </Button>
      </div>
    </div>
  )
}
