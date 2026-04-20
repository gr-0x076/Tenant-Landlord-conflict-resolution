import { useState } from 'react'
import { normalizeTimestamp } from '../utils/helpers'

/**
 * Custom hook for duplicate issue detection
 * Prevents spam within 5 minutes of similar issues
 */
export function useDuplicateCheck(issues, currentUserId) {
  const [duplicateWarning, setDuplicateWarning] = useState(null)

  const checkDuplicate = (title) => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    
    const recentIssues = issues.filter(issue => {
      const issueTime = normalizeTimestamp(issue.createdAt)
      return (
        issue.createdBy === currentUserId &&
        issueTime &&
        issueTime > fiveMinutesAgo &&
        issue.title.toLowerCase().includes(title.toLowerCase())
      )
    })

    if (recentIssues.length > 0) {
      setDuplicateWarning({
        message: 'Similar issue created recently. Continue anyway?',
        issueId: recentIssues[0].id,
        issueTitle: recentIssues[0].title
      })
      return false
    }

    return true
  }

  const clearWarning = () => setDuplicateWarning(null)

  return { duplicateWarning, checkDuplicate, clearWarning }
}
