import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { getServices, configError } from './services/index'
import { AuthProvider } from './context/AuthContext'
import { BuildingProvider } from './context/BuildingContext'
import { ProtectedGuard, PublicGuard } from './components/ProtectedRoute'

// Pages
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import OnboardingPage from './pages/OnboardingPage'
import JoinBuildingPage from './pages/JoinBuildingPage'
import CreateBuildingPage from './pages/CreateBuildingPage'
import DashboardPage from './pages/DashboardPage'
import IssueDetailPage from './pages/IssueDetailPage'
import CreateIssuePage from './pages/CreateIssuePage'
import ProfilePage from './pages/ProfilePage'
import SetupPage from './pages/SetupPage'

/**
 * App Layout
 */
function AppLayout() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicGuard><LoginPage /></PublicGuard>} />
      <Route path="/signup" element={<PublicGuard><SignupPage /></PublicGuard>} />

      {/* Protected Routes */}
      <Route
        path="/onboarding"
        element={
          <ProtectedGuard>
            <OnboardingPage />
          </ProtectedGuard>
        }
      />

      <Route
        path="/join-building"
        element={
          <ProtectedGuard>
            <JoinBuildingPage />
          </ProtectedGuard>
        }
      />

      <Route
        path="/create-building"
        element={
          <ProtectedGuard allowedRoles={['landlord']}>
            <CreateBuildingPage />
          </ProtectedGuard>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedGuard>
            <DashboardPage />
          </ProtectedGuard>
        }
      />

      <Route
        path="/issue/:issueId"
        element={
          <ProtectedGuard>
            <IssueDetailPage />
          </ProtectedGuard>
        }
      />

      <Route
        path="/create-issue"
        element={
          <ProtectedGuard allowedRoles={['tenant']}>
            <CreateIssuePage />
          </ProtectedGuard>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedGuard>
            <ProfilePage />
          </ProtectedGuard>
        }
      />

      {/* Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

/**
 * Root App Component with Context Providers
 */
export default function App() {
  const [services, setServices] = useState(null)
  const [servicesLoaded, setServicesLoaded] = useState(false)

  // Load services asynchronously
  useEffect(() => {
    const loadServices = async () => {
      try {
        const loadedServices = await getServices()
        setServices(loadedServices)
        setServicesLoaded(true)
      } catch (error) {
        console.error('Failed to load services:', error)
      }
    }

    if (!configError) {
      loadServices()
    }
  }, [])

  // Show setup page if backend is not configured
  if (configError) {
    return <SetupPage />
  }

  // Show loading while services are loading
  if (!servicesLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-yellow-500">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider services={services}>
        <BuildingProvider services={services}>
          <div className="bg-war-bg text-white min-h-screen">
            <AppLayout />
          </div>
        </BuildingProvider>
      </AuthProvider>
    </Router>
  )
}
