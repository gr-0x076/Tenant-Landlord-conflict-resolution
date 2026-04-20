import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { validateEmail } from '../utils/helpers'
import { Button, InputField, ErrorAlert, SuccessAlert, PageHeader, Panel } from '../components/UIElements'

/**
 * Signup Page
 */
export default function SignupPage() {
  const navigate = useNavigate()
  const { signup, loginWithGoogle } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'tenant'
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [success, setSuccess] = useState(null)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!validateEmail(formData.email)) newErrors.email = 'Valid email is required'
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (!formData.role) newErrors.role = 'Please select a role'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setApiError(null)

    try {
      await signup(
        formData.email,
        formData.password,
        formData.name,
        formData.role
      )

      setSuccess('Account created successfully! Redirecting...')
      
      setTimeout(() => {
        navigate(formData.role === 'landlord' ? '/create-building' : '/join-building')
      }, 1500)
    } catch (error) {
      setApiError(error.message || 'Signup failed. Please try again.')
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
          title="ENTER THE WAR ROOM"
          subtitle="Create your account"
        />

        <Panel className="mb-6">
          {success && <SuccessAlert message={success} />}
          {apiError && <ErrorAlert message={apiError} onClose={() => setApiError(null)} />}

          <form onSubmit={handleSubmit}>
            <InputField
              id="signup-name"
              label="FULL NAME"
              value={formData.name}
              onChange={handleChange}
              name="name"
              placeholder="John Doe"
              error={errors.name}
            />

            <InputField
              id="signup-email"
              label="EMAIL"
              type="email"
              value={formData.email}
              onChange={handleChange}
              name="email"
              placeholder="you@example.com"
              error={errors.email}
            />

            <InputField
              id="signup-password"
              label="PASSWORD"
              type="password"
              value={formData.password}
              onChange={handleChange}
              name="password"
              placeholder="••••••••"
              error={errors.password}
            />

            <InputField
              id="signup-confirm-password"
              label="CONFIRM PASSWORD"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              name="confirmPassword"
              placeholder="••••••••"
              error={errors.confirmPassword}
            />

            <fieldset className="mb-6 border border-war-neutral border-opacity-30 rounded p-4">
              <legend className="font-display font-semibold text-war-gold mb-3">YOUR ROLE</legend>
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    id="role-tenant"
                    name="role"
                    value="tenant"
                    checked={formData.role === 'tenant'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <span className="font-body text-white">TENANT - File Issues</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    id="role-landlord"
                    name="role"
                    value="landlord"
                    checked={formData.role === 'landlord'}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <span className="font-body text-white">LANDLORD - Manage Building</span>
                </label>
              </div>
              {errors.role && <p className="text-war-red text-sm mt-2">{errors.role}</p>}
            </fieldset>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mb-4"
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
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
            Already have an account?{' '}
            <Link to="/login" className="text-war-gold hover:underline">
              LOG IN
            </Link>
          </p>
        </Panel>
      </div>
    </div>
  )
}
