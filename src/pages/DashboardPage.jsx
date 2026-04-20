import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useBuilding } from '../hooks/useBuilding'
import { useIssueFilter } from '../hooks/useIssueStats'
import { issueService } from '../services/index'
import { ISSUE_CATEGORIES, ISSUE_STATUSES } from '../utils/helpers'
import {
  ErrorAlert,
  SelectField,
  Panel,
  IssueCard,
  PageHeader,
  LoadingSpinner,
  Button
} from '../components/UIElements'
import { StatsDashboard, SeverityDistribution } from '../components/StatsDashboard'

/**
 * Dashboard Page - Main Issue List
 */
export default function DashboardPage() {
  const { user } = useAuth()
  const { building } = useBuilding()
  const navigate = useNavigate()

  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    status: null,
    category: null
  })

  const issueFilter = useIssueFilter(issues)

  // Load issues on mount and when building changes
  useEffect(() => {
    if (!building?.id) {
      navigate('/join-building')
      return
    }

    setLoading(true)
    setError(null)

    const unsubscribe = issueService.issue.subscribeToBuildingIssues(building.id, (fetchedIssues) => {
      setIssues(fetchedIssues)
      setLoading(false)
    }, (subscriptionError) => {
      setError(subscriptionError?.message || 'Failed to load issues')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [building?.id, navigate])

  const handleIssueClick = (issueId) => {
    navigate(`/issue/${issueId}`)
  }

  const filteredIssues = issueFilter(filters.status, filters.category)

  const handleStatusChange = (e) => {
    setFilters(prev => ({ ...prev, status: e.target.value || null }))
  }

  const handleCategoryChange = (e) => {
    setFilters(prev => ({ ...prev, category: e.target.value || null }))
  }

  return (
    <div className="min-h-screen bg-war-bg p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <PageHeader
              title={`${building?.name || 'BUILDING'} WAR TABLE`}
              subtitle={`${user?.role === 'landlord' ? 'Landlord' : 'Tenant'} View`}
            />
          </div>
          <div className="flex gap-3">
            {user?.role === 'tenant' && (
              <Link to="/create-issue">
                <Button>+ FILE INCIDENT</Button>
              </Link>
            )}
            <Link to="/profile">
              <Button variant="teal">PROFILE</Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <StatsDashboard issues={issues} />
        <SeverityDistribution issues={issues} />

        {/* Error Alert */}
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

        {/* Filters */}
        <Panel className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Filter by Status"
              value={filters.status || ''}
              onChange={handleStatusChange}
              options={ISSUE_STATUSES.map(s => ({ value: s.value, label: s.label }))}
            />
            <SelectField
              label="Filter by Category"
              value={filters.category || ''}
              onChange={handleCategoryChange}
              options={ISSUE_CATEGORIES.map(c => ({ value: c, label: c }))}
            />
          </div>
        </Panel>

        {/* Issues List */}
        <div>
          <h2 className="font-display font-bold text-2xl text-war-gold mb-4">
            {filteredIssues.length} INCIDENT{filteredIssues.length !== 1 ? 'S' : ''} RECORDED
          </h2>

          {loading ? (
            <LoadingSpinner />
          ) : filteredIssues.length === 0 ? (
            <Panel>
              <p className="text-center text-war-neutral italic">
                {issues.length === 0
                  ? 'No incidents reported yet. Building is at peace.'
                  : 'No incidents match your filters.'}
              </p>
            </Panel>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredIssues.map(issue => (
                <div key={issue.id} onClick={() => handleIssueClick(issue.id)} className="cursor-pointer">
                  <IssueCard issue={issue} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-time Indicator */}
        <div className="mt-8 text-center text-war-neutral text-sm font-body tracking-wider">
           <span className="animate-pulse inline-block h-2 w-2 bg-war-gold rounded-full mr-2"></span>
           LIVE UPDATES ACTIVE
        </div>
      </div>
    </div>
  )
}
