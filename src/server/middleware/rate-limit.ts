// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

interface RateLimitRequest {
  headers: {
    get: (name: string) => string | null
  }
}

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator: (req: RateLimitRequest) => string // Function to generate unique key
}

/**
 * Simple rate limiting middleware
 * For production, consider using Redis or a dedicated service
 */
export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator } = options

  return (req: RateLimitRequest): { allowed: boolean; remaining: number; resetAt: number } => {
    const key = keyGenerator(req)
    const now = Date.now()

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      // 1% chance to clean up
      for (const [k, v] of rateLimitStore.entries()) {
        if (v.resetAt < now) {
          rateLimitStore.delete(k)
        }
      }
    }

    const record = rateLimitStore.get(key)

    if (!record || record.resetAt < now) {
      // Create new window
      const resetAt = now + windowMs
      rateLimitStore.set(key, { count: 1, resetAt })
      return { allowed: true, remaining: maxRequests - 1, resetAt }
    }

    if (record.count >= maxRequests) {
      // Rate limit exceeded
      return { allowed: false, remaining: 0, resetAt: record.resetAt }
    }

    // Increment count
    record.count++
    rateLimitStore.set(key, record)
    return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt }
  }
}

/**
 * Rate limiter for API endpoints (per API key)
 */
export function getApiKeyRateLimiter() {
  return createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute per API key
    keyGenerator: (req) => {
      const apiKey = req.headers.get('x-api-key') || 'unknown'
      return `api:${apiKey}`
    },
  })
}

/**
 * Rate limiter for LLM calls (per org)
 */
export function getLLMRateLimiter() {
  return createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 LLM calls per minute per org
    keyGenerator: (req) => {
      // Extract org from API key, org header, or context
      const orgId = req.headers.get('x-org-id')
      const apiKey = req.headers.get('x-api-key') || 'unknown'
      // Use orgId if available (for tRPC), otherwise fall back to API key
      return orgId ? `llm:org:${orgId}` : `llm:${apiKey}`
    },
  })
}

