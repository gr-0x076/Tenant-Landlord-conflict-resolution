import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { validateEmail } from '../utils/helpers'
import { Button, InputField, ErrorAlert, PageHeader, Panel } from '../components/UIElements'

/**
 * Login Page
 */
export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loginWithGoogle } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(null)

  const validateForm = () => {
    const newErrors = {}

    if (!validateEmail(formData.email)) newErrors.email = 'Valid email is required'
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setApiError(null)

    try {
      await login(formData.email, formData.password)
      navigate('/dashboard')
    } catch (error) {
      setApiError(error.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  return (
    <div className="min-h-screen bg-war-bg p-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <PageHeader 
          title="TENANT WAR ROOM"
          subtitle="Access your building's conflict log"
        />

        <Panel className="mb-6">
          {apiError && <ErrorAlert message={apiError} onClose={() => setApiError(null)} />}

          <form onSubmit={handleSubmit}>
            <InputField
              id="login-email"
              label="EMAIL"
              type="email"
              value={formData.email}
              onChange={handleChange}
              name="email"
              placeholder="your@email.com"
              error={errors.email}
            />

            <InputField
              id="login-password"
              label="PASSWORD"
              type="password"
              value={formData.password}
              onChange={handleChange}
              name="password"
              placeholder="••••••••"
              error={errors.password}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full mb-4"
            >
              {loading ? 'AUTHENTICATING...' : 'ENTER WAR ROOM'}
            </Button>

            <div className="relative flex items-center py-2 mb-4">
              <div className="flex-grow border-t border-war-neutral border-opacity-30"></div>
              <span className="flex-shrink-0 mx-4 text-war-neutral font-body text-xs">OR</span>
              <div className="flex-grow border-t border-war-neutral border-opacity-30"></div>
            </div>

            <Button
              type="button"
              onClick={async () => {
                setLoading(true)
                setApiError(null)
                try {
                  await loginWithGoogle()
                } catch (error) {
                  setApiError(error.message)
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
              className="w-full mb-4 !bg-white !text-black hover:!bg-gray-200 border-transparent shadow-md"
            >
              CONTINUE WITH GOOGLE
            </Button>
          </form>

          <p className="text-center text-war-neutral font-body text-sm">
            New here?{' '}
            <Link to="/signup" className="text-war-gold hover:underline">
              CREATE ACCOUNT
            </Link>
          </p>
        </Panel>
      </div>
    </div>
  )
}
