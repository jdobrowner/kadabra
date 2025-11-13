import { LOCAL_STORAGE_KEYS } from '../utils/storage'

const isBrowser = typeof window !== 'undefined'

function parseBoolean(value: string | undefined): boolean {
  if (!value) return false
  const normalized = value.toLowerCase()
  return normalized === 'true' || normalized === '1' || normalized === 'yes'
}

/**
 * Indicates whether the application should operate in demo/mock mode.
 * Controlled via localStorage key `kadabra:demo-mode`.
 * Falls back to environment variable `VITE_USE_MOCK_DATA` for initial setup.
 */
export const isMockEnabled = (() => {
  // Check localStorage first
  if (isBrowser) {
    try {
      const storedValue = window.localStorage.getItem(LOCAL_STORAGE_KEYS.demoMode)
      if (storedValue !== null) {
        // Try to parse as JSON first (in case it was stored with JSON.stringify)
        try {
          const parsed = JSON.parse(storedValue)
          return Boolean(parsed)
        } catch {
          // If not JSON, parse as string
          return parseBoolean(storedValue)
        }
      }
    } catch (error) {
      console.warn('Failed to read demo mode from localStorage', error)
    }
  }
  
  // Fallback to environment variable for initial setup
  const env = import.meta.env as Record<string, string | undefined>
  return parseBoolean(env?.VITE_USE_MOCK_DATA)
})()

