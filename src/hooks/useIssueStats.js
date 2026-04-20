import { useMemo, useCallback } from 'react'
import { normalizeTimestamp } from '../utils/helpers'

/**
 * Custom hook for issue statistics and filtering
 * Uses useMemo for optimization (derived data)
 */
export function useIssueStats(issues) {
  const stats = useMemo(() => {
    const total = issues.length
    const open = issues.filter(i => i.status === 'Open').length
    const inProgress = issues.filter(i => i.status === 'In Progress').length
    const resolved = issues.filter(i => i.status === 'Resolved').length

    // Calculate severity distribution
    const severityMap = {}
    issues.forEach(issue => {
      severityMap[issue.severity] = (severityMap[issue.severity] || 0) + 1
    })

    // Category distribution
    const categoryMap = {}
    issues.forEach(issue => {
      categoryMap[issue.category] = (categoryMap[issue.category] || 0) + 1
    })

    // Issues this week
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const thisWeek = issues.filter(i => {
      const createdAt = normalizeTimestamp(i.createdAt)
      return createdAt && createdAt > oneWeekAgo
    }).length

    return {
      total,
      open,
      inProgress,
      resolved,
      severity: severityMap,
      categories: categoryMap,
      thisWeek,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0
    }
  }, [issues])

  return stats
}

/**
 * Custom hook for issue filtering
 * Uses useCallback to memoize filter function
 */
export function useIssueFilter(issues) {
  const filter = useCallback((status = null, category = null, severity = null) => {
    return issues.filter(issue => {
      if (status && issue.status !== status) return false
      if (category && issue.category !== category) return false
      if (severity && issue.severity !== severity) return false
      return true
    })
  }, [issues])

  return filter
}
