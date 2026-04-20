/**
 * Utility functions for formatting and validation
 */

export function normalizeTimestamp(date) {
  if (!date) return null
  if (date instanceof Date) return date
  if (typeof date?.toDate === 'function') return date.toDate()
  if (typeof date?.seconds === 'number') return new Date(date.seconds * 1000)
  if (typeof date === 'number' || typeof date === 'string') {
    const parsed = new Date(date)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  return null
}

export function formatDate(date) {
  if (!date) return 'Unknown'
  const d = normalizeTimestamp(date)
  if (!d) return 'Unknown'
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatTime(date) {
  if (!date) return 'Unknown'
  const d = normalizeTimestamp(date)
  if (!d) return 'Unknown'
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDateTime(date) {
  return `${formatDate(date)} at ${formatTime(date)}`
}

export function timeAgo(date) {
  if (!date) return 'Unknown'

  const normalizedDate = normalizeTimestamp(date)
  if (!normalizedDate) return 'Unknown'

  const seconds = Math.floor((Date.now() - normalizedDate.getTime()) / 1000)
  
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + ' years ago'
  
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + ' months ago'
  
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + ' days ago'
  
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + ' hours ago'
  
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + ' minutes ago'
  
  return Math.floor(seconds) + ' seconds ago'
}

export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export function generateInviteCode() {
  return Math.random().toString(36).substr(2, 9).toUpperCase()
}

export const ISSUE_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Maintenance',
  'Cleanliness',
  'Noise',
  'Security',
  'WiFi/Internet',
  'Other'
]

export const SEVERITY_LEVELS = [
  { value: 'Low', label: 'Low', color: '#7f8c8d' },
  { value: 'Medium', label: 'Medium', color: '#f39c12' },
  { value: 'High', label: 'High', color: '#e74c3c' },
  { value: 'Critical', label: 'Critical', color: '#c0392b' }
]

export const ISSUE_STATUSES = [
  { value: 'Open', label: 'Open', color: '#c0392b' },
  { value: 'In Progress', label: 'In Progress', color: '#f39c12' },
  { value: 'Resolved', label: 'Resolved', color: '#1abc9c' }
]

export function getSeverityColor(severity) {
  const level = SEVERITY_LEVELS.find(l => l.value === severity)
  return level?.color || '#7f8c8d'
}

export function getStatusColor(status) {
  const s = ISSUE_STATUSES.find(st => st.value === status)
  return s?.color || '#7f8c8d'
}
