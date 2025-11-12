const isBrowser = typeof window !== 'undefined'

export const LOCAL_STORAGE_KEYS = Object.freeze({
  colorMode: 'kadabra:color-mode',
})

export function getStoredValue<T>(key: string, fallback: T): T {
  if (!isBrowser) {
    return fallback
  }

  try {
    const rawValue = window.localStorage.getItem(key)
    if (rawValue === null) {
      return fallback
    }
    return JSON.parse(rawValue) as T
  } catch (error) {
    console.warn(`Failed to read local storage key "${key}"`, error)
    return fallback
  }
}

export function setStoredValue<T>(key: string, value: T | null | undefined) {
  if (!isBrowser) {
    return
  }

  try {
    if (value === undefined || value === null) {
      window.localStorage.removeItem(key)
      return
    }
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`Failed to store local storage key "${key}"`, error)
  }
}

export function removeStoredValue(key: string) {
  if (!isBrowser) {
    return
  }

  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.warn(`Failed to remove local storage key "${key}"`, error)
  }
}


