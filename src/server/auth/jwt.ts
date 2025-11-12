import { SignJWT, jwtVerify } from 'jose'
import { parse } from 'cookie'
import type { User, Org } from '../trpc/context'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production-min-32-chars'
const JWT_SECRET_KEY = new TextEncoder().encode(JWT_SECRET)

// JWT payload interface
export interface JWTPayload {
  userId: string
  orgId: string
  email: string
  iat?: number
  exp?: number
}

/**
 * Sign a JWT token for a user
 */
export async function signToken(user: User, org: Org): Promise<string> {
  const payload = {
    userId: user.id,
    orgId: org.id,
    email: user.email,
  }

  const token = await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET_KEY)

  return token
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY, {
      algorithms: ['HS256'],
    })
    // Type assertion since jose returns a generic JWTPayload
    const jwtPayload = payload as unknown as JWTPayload
    if (jwtPayload.userId && jwtPayload.orgId && jwtPayload.email) {
      return jwtPayload
    }
    return null
  } catch (error) {
    return null
  }
}

/**
 * Extract JWT token from request headers or cookies
 */
export function extractTokenFromRequest(req: Request): string | null {
  // Try Authorization header first
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  // Try cookie
  const cookieHeader = req.headers.get('cookie')
  if (cookieHeader) {
    const cookies = parse(cookieHeader)
    return cookies['auth-token'] || null
  }

  return null
}

