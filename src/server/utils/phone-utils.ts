/**
 * Normalize phone number for matching
 * Strips formatting and handles basic country code detection
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return ''
  
  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, '')
  
  // If it starts with 1 and is 11 digits (US/Canada), remove leading 1
  if (normalized.length === 11 && normalized.startsWith('1')) {
    normalized = normalized.substring(1)
  }
  
  return normalized
}

/**
 * Check if two phone numbers match (after normalization)
 */
export function phoneNumbersMatch(phone1: string | null | undefined, phone2: string | null | undefined): boolean {
  if (!phone1 || !phone2) return false
  return normalizePhoneNumber(phone1) === normalizePhoneNumber(phone2)
}

