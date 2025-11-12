/**
 * Normalize company name for fuzzy matching
 * Handles common variations like "Corp" vs "Corporation", "Inc" vs "Incorporated"
 */
export function normalizeCompanyName(name: string): string {
  if (!name) return ''
  
  return name
    .toLowerCase()
    .trim()
    // Replace common abbreviations with full forms
    .replace(/\bcorp\b/g, 'corporation')
    .replace(/\binc\b/g, 'incorporated')
    .replace(/\bltd\b/g, 'limited')
    .replace(/\bllc\b/g, 'limited liability company')
    .replace(/\bco\b/g, 'company')
    // Remove punctuation
    .replace(/[.,\-_]/g, ' ')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Check if two company names are similar (fuzzy match)
 * Returns true if normalized names match or one is a substring of the other
 */
export function companyNamesMatch(name1: string, name2: string): boolean {
  const normalized1 = normalizeCompanyName(name1)
  const normalized2 = normalizeCompanyName(name2)
  
  // Exact match
  if (normalized1 === normalized2) return true
  
  // Substring match (one contains the other) - handles cases like "Acme Corp" vs "Acme Corporation"
  if (normalized1.length > 5 && normalized2.length > 5) {
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
      return true
    }
  }
  
  return false
}

/**
 * Normalize person name for matching
 */
export function normalizePersonName(name: string): string {
  if (!name) return ''
  
  return name
    .toLowerCase()
    .trim()
    // Remove common suffixes
    .replace(/\b(jr|sr|ii|iii|iv|esq|phd|md)\.?\s*$/i, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Check if two person names match (case-insensitive, trimmed)
 */
export function personNamesMatch(name1: string, name2: string): boolean {
  return normalizePersonName(name1) === normalizePersonName(name2)
}

