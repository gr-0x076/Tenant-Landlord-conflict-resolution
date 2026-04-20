import { useMemo } from 'react'
import { useIssueStats } from '../hooks/useIssueStats'
import { Panel } from './UIElements'

/**
 * Statistics Dashboard Component
 * Uses useMemo for optimized calculations
 */
export function StatsDashboard({ issues }) {
  const stats = useIssueStats(issues)

  // Use useMemo for critical metric calculation
  const criticalMetrics = useMemo(() => {
    const criticalIssues = issues.filter(i => i.severity === 'Critical')
    const unresolvedCritical = criticalIssues.filter(i => i.status !== 'Resolved').length
    
    return {
      criticalCount: criticalIssues.length,
      unresolvedCritical,
      requiresImmedateAttention: unresolvedCritical > 0
    }
  }, [issues])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Issues */}
      <Panel>
        <div className="text-center">
          <p className="font-body text-war-neutral text-sm mb-2">TOTAL INCIDENTS</p>
          <p className="font-display text-4xl text-war-gold font-bold">{stats.total}</p>
        </div>
      </Panel>

      {/* Open Issues */}
      <Panel>
        <div className="text-center">
          <p className="font-body text-war-neutral text-sm mb-2">OPEN</p>
          <p className="font-display text-4xl text-war-red font-bold">{stats.open}</p>
        </div>
      </Panel>

      {/* In Progress */}
      <Panel>
        <div className="text-center">
          <p className="font-body text-war-neutral text-sm mb-2">IN PROGRESS</p>
          <p className="font-display text-4xl text-yellow-500 font-bold">{stats.inProgress}</p>
        </div>
      </Panel>

      {/* Resolved */}
      <Panel>
        <div className="text-center">
          <p className="font-body text-war-neutral text-sm mb-2">RESOLVED</p>
          <p className="font-display text-4xl text-war-teal font-bold">{stats.resolved}</p>
        </div>
      </Panel>

      {/* Resolution Rate */}
      <Panel>
        <div className="text-center">
          <p className="font-body text-war-neutral text-sm mb-2">RESOLUTION RATE</p>
          <p className="font-display text-4xl text-war-teal font-bold">{stats.resolutionRate}%</p>
        </div>
      </Panel>

      {/* This Week */}
      <Panel>
        <div className="text-center">
          <p className="font-body text-war-neutral text-sm mb-2">THIS WEEK</p>
          <p className="font-display text-4xl text-war-gold font-bold">{stats.thisWeek}</p>
        </div>
      </Panel>

      {/* Critical Alert */}
      {criticalMetrics.requiresImmedateAttention && (
        <Panel className="md:col-span-2 bg-war-red bg-opacity-10">
          <div className="text-center">
            <p className="font-body text-war-red text-sm mb-2">⚠️ CRITICAL UNRESOLVED</p>
            <p className="font-display text-4xl text-war-red font-bold">
              {criticalMetrics.unresolvedCritical}
            </p>
            <p className="font-body text-war-red text-xs mt-2">Immediate attention required</p>
          </div>
        </Panel>
      )}
    </div>
  )
}

/**
 * Severity Distribution Component
 */
export function SeverityDistribution({ issues }) {
  const stats = useIssueStats(issues)

  if (Object.keys(stats.severity).length === 0) {
    return (
      <Panel className="mb-6">
        <p className="text-war-neutral text-center italic">No issues yet</p>
      </Panel>
    )
  }

  return (
    <Panel className="mb-6">
      <h3 className="font-display font-bold text-war-gold mb-4">SEVERITY DISTRIBUTION</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(stats.severity).map(([severity, count]) => (
          <div key={severity} className="text-center border-l-3 border-war-gold border-opacity-50 pl-3">
            <p className="text-war-neutral text-sm font-body mb-1">{severity}</p>
            <p className="font-display text-2xl text-war-gold font-bold">{count}</p>
          </div>
        ))}
      </div>
    </Panel>
  )
}
