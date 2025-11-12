/**
 * Formats a date or timestamp into a relative time string like "2h ago", "1d ago", "32m ago"
 * @param date - Date string (ISO format), Date object, or timestamp number
 * @returns Formatted relative time string (e.g., "2h ago", "1d ago", "32m ago")
 */
export function formatRelativeTime(date: string | Date | number): string {
  let dateObj: Date

  // Convert input to Date object
  if (typeof date === 'string') {
    dateObj = new Date(date)
  } else if (typeof date === 'number') {
    dateObj = new Date(date)
  } else {
    dateObj = date
  }

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return ''
  }

  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  // Format based on the difference
  if (diffDays > 0) {
    return `${diffDays}d ago`
  } else if (diffHours > 0) {
    return `${diffHours}h ago`
  } else if (diffMinutes > 0) {
    return `${diffMinutes}m ago`
  } else {
    // Less than a minute ago
    return 'just now'
  }
}

