import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { issueService, commentService } from '../services/index'
import { formatDateTime, ISSUE_STATUSES } from '../utils/helpers'
import {
  Button,
  ErrorAlert,
  SuccessAlert,
  SelectField,
  LoadingSpinner,
  PageHeader,
  Panel
} from '../components/UIElements'
import { CommentsSection } from '../components/CommentsSection'

/**
 * Issue Detail Page
 */
export default function IssueDetailPage() {
  const { issueId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [issue, setIssue] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const unsubscribeIssue = issueService.issue.subscribeToIssue(issueId, (issueData) => {
      if (issueData) {
        setIssue(issueData)
        setNewStatus(issueData.status)
      } else {
        setIssue(null)
      }
      setLoading(false)
    }, (subscriptionError) => {
      setError(subscriptionError?.message || 'Failed to load issue')
      setLoading(false)
    })

    const unsubscribeComments = commentService.comment.subscribeToComments(issueId, (fetchedComments) => {
      setComments(fetchedComments || [])
    }, (subscriptionError) => {
      setError(subscriptionError?.message || 'Failed to load comments')
    })

    return () => {
      unsubscribeIssue()
      unsubscribeComments()
    }
  }, [issueId])

  const handleStatusUpdate = async () => {
    if (!newStatus || !issue || newStatus === issue.status) return

    setIsUpdatingStatus(true)
    setError(null)

    try {
      await issueService.issue.updateIssueStatus(issueId, newStatus)
      setIssue(prev => ({ ...prev, status: newStatus }))
      setSuccess(`Status updated to ${newStatus}`)
      setTimeout(() => setSuccess(null), 2000)
    } catch (err) {
      setError(err.message || 'Failed to update status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleAddComment = useCallback(async (commentText) => {
    setError(null)

    try {
      await commentService.comment.addComment(issueId, user.uid || user.id, commentText)
      setSuccess('Comment recorded')
      setTimeout(() => setSuccess(null), 1500)
    } catch (err) {
      setError(err.message || 'Failed to add comment')
    }
  }, [issueId, user?.id, user?.uid])

  const isLandlord = user?.role === 'landlord'

  if (loading) {
    return (
      <div className="min-h-screen bg-war-bg p-8 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-war-bg p-8">
        <div className="max-w-4xl mx-auto">
          <PageHeader title="INCIDENT NOT FOUND" />
          <Button onClick={() => navigate('/dashboard')}>RETURN TO WAR TABLE</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-war-bg p-8">
      <div className="max-w-4xl mx-auto">
        <Button onClick={() => navigate('/dashboard')} variant="teal" className="mb-6">
          BACK TO WAR TABLE
        </Button>

        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
        {success && <SuccessAlert message={success} />}

        <Panel className="mb-6 bg-war-dark bg-opacity-50">
          <div className="mb-4">
            <div className="flex justify-between items-start mb-4">
              <h1 className="font-display font-bold text-3xl text-war-gold">{issue.title}</h1>
              <span
                className="px-4 py-2 rounded text-white font-bold"
                style={{
                  backgroundColor: issue.status === 'Resolved'
                    ? '#1abc9c'
                    : issue.status === 'In Progress'
                      ? '#f39c12'
                      : '#c0392b'
                }}
              >
                {issue.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-war-neutral text-xs font-body uppercase mb-1">Category</p>
                <p className="font-body text-white">{issue.category}</p>
              </div>
              <div>
                <p className="text-war-neutral text-xs font-body uppercase mb-1">Severity</p>
                <p className="font-body text-white">{issue.severity}</p>
              </div>
              <div>
                <p className="text-war-neutral text-xs font-body uppercase mb-1">Filed</p>
                <p className="font-body text-white">{formatDateTime(issue.createdAt)}</p>
              </div>
              <div>
                <p className="text-war-neutral text-xs font-body uppercase mb-1">Last Updated</p>
                <p className="font-body text-white">{formatDateTime(issue.updatedAt)}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-display font-bold text-war-gold mb-2">INCIDENT DETAILS</h3>
            <p className="font-body text-white whitespace-pre-wrap">{issue.description}</p>
          </div>
        </Panel>

        {isLandlord && (
          <Panel className="mb-6 bg-war-red bg-opacity-5">
            <h3 className="font-display font-bold text-war-gold mb-4">COMMAND - UPDATE STATUS</h3>
            <div className="flex gap-4">
              <SelectField
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                options={ISSUE_STATUSES.map(s => ({ value: s.value, label: s.label }))}
                className="flex-1"
              />
              <Button
                onClick={handleStatusUpdate}
                disabled={isUpdatingStatus || newStatus === issue.status}
                className="pt-10"
              >
                {isUpdatingStatus ? 'UPDATING...' : 'UPDATE STATUS'}
              </Button>
            </div>
          </Panel>
        )}

        <CommentsSection
          comments={comments}
          userRole={user?.role}
          onAddComment={handleAddComment}
          loading={false}
          error={null}
        />
      </div>
    </div>
  )
}
