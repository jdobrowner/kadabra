export function clone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value))
}

export function generateMockId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function isoDate(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date
  return d.toISOString()
}

export function daysFromNow(offset: number): Date {
  const now = Date.now()
  return new Date(now + offset * 24 * 60 * 60 * 1000)
}

export function daysAgo(days: number): string {
  return isoDate(daysFromNow(-days))
}

export function startOfDayIso(date: Date = new Date()): string {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy.toISOString()
}

export function isSameDay(isoDate: string, reference: Date = new Date()): boolean {
  const target = new Date(isoDate)
  return (
    target.getFullYear() === reference.getFullYear() &&
    target.getMonth() === reference.getMonth() &&
    target.getDate() === reference.getDate()
  )
}

export function normalizeString(value: string): string {
  return value.toLowerCase()
}

export function matchIncludes(haystack: string, needle: string): boolean {
  return normalizeString(haystack).includes(normalizeString(needle))
}

