import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useBuilding } from '../hooks/useBuilding'
import { useDuplicateCheck } from '../hooks/useDuplicateCheck'
import { issueService } from '../services/index'
import { ISSUE_CATEGORIES } from '../utils/helpers'
import {
  Button,
  InputField,
  TextareaField,
  SelectField,
  ErrorAlert,
  SuccessAlert,
  PageHeader,
  Panel,
  LoadingSpinner
} from '../components/UIElements'

/**
 * Create Issue Page - For Tenants
 */
export default function CreateIssuePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { building } = useBuilding()
  const [issues] = useState([])
  const { duplicateWarning, checkDuplicate, clearWarning } = useDuplicateCheck(issues, user?.uid || user?.id)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    severity: 'Medium'
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters'
    if (!formData.category) newErrors.category = 'Category is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const submitIssue = async () => {
    await issueService.issue.createIssue(
      building.id,
      formData.title,
      formData.description,
      formData.category,
      formData.severity,
      user.uid || user.id
    )
  }

  const handleSuccess = () => {
    setSuccess('Issue filed successfully! Redirecting to war table...')
    setTimeout(() => {
      navigate('/dashboard')
    }, 1500)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    if (!checkDuplicate(formData.title)) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      await submitIssue()
      handleSuccess()
    } catch (err) {
      setError(err.message || 'Failed to file issue. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleIgnoreDuplicate = () => {
    clearWarning()
    setLoading(true)
    setError(null)

    submitIssue()
      .then(handleSuccess)
      .catch(err => {
        setError(err.message || 'Failed to file issue. Please try again.')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-war-bg p-8 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-war-bg p-8">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="FILE INCIDENT"
          subtitle="Document the conflict. Create permanent record."
        />

        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
        {success && <SuccessAlert message={success} />}

        {duplicateWarning && (
          <Panel className="mb-6 bg-war-red bg-opacity-10">
            <p className="font-body text-war-red mb-4">
              Warning: {duplicateWarning.message}
            </p>
            <p className="text-war-neutral text-sm mb-4">
              Similar issue: <strong>{duplicateWarning.issueTitle}</strong>
            </p>
            <div className="flex gap-3">
              <Button onClick={handleIgnoreDuplicate} variant="danger">
                CONTINUE ANYWAY
              </Button>
              <Button onClick={clearWarning} variant="teal">
                CANCEL
              </Button>
            </div>
          </Panel>
        )}

        <Panel>
          <form onSubmit={handleSubmit}>
            <InputField
              label="INCIDENT TITLE"
              value={formData.title}
              onChange={handleChange}
              name="title"
              placeholder="E.G. Water not flowing in kitchen tap"
              error={errors.title}
            />

            <TextareaField
              label="DETAILED DESCRIPTION"
              value={formData.description}
              onChange={handleChange}
              name="description"
              placeholder="Provide complete details. No detail is too small. This record is permanent."
              error={errors.description}
              rows={6}
            />

            <SelectField
              label="CATEGORY"
              value={formData.category}
              onChange={handleChange}
              name="category"
              options={ISSUE_CATEGORIES.map(c => ({ value: c, label: c }))}
              error={errors.category}
            />

            <SelectField
              label="SEVERITY"
              value={formData.severity}
              onChange={handleChange}
              name="severity"
              options={[
                { value: 'Low', label: 'Low - Minor inconvenience' },
                { value: 'Medium', label: 'Medium - Affects daily life' },
                { value: 'High', label: 'High - Major issue' },
                { value: 'Critical', label: 'Critical - Safety/Health risk' }
              ]}
            />

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'FILING...' : 'FILE INCIDENT'}
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="teal"
                className="flex-1"
              >
                CANCEL
              </Button>
            </div>
          </form>

          <p className="text-center text-war-neutral font-body text-xs mt-6">
            This incident will be recorded permanently and visible to building management
          </p>
        </Panel>
      </div>
    </div>
  )
}
