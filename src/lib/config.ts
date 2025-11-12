function parseBoolean(value: string | undefined): boolean {
  if (!value) return false
  const normalized = value.toLowerCase()
  return normalized === 'true' || normalized === '1' || normalized === 'yes'
}

/**
 * Indicates whether the application should operate in mock mode.
 * Controlled via Vite environment variable `VITE_USE_MOCK_DATA`.
 */
export const isMockEnabled = (() => {
  const env = import.meta.env as Record<string, string | undefined>
  return parseBoolean(env?.VITE_USE_MOCK_DATA)
})()

