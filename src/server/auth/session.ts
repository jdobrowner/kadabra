import type { Database } from '../db'
import { users, orgs } from '../db/schema'
import { eq } from 'drizzle-orm'
import type { User, Org } from '../trpc/context'
import { verifyToken, extractTokenFromRequest } from './jwt'

/**
 * Get user and org from JWT token in request
 */
export async function getSessionFromRequest(
  req: Request,
  db: Database
): Promise<{ user: User | null; org: Org | null }> {
  const token = extractTokenFromRequest(req)
  
  if (!token) {
    return { user: null, org: null }
  }

  const payload = await verifyToken(token)
  
  if (!payload || !payload.userId || !payload.orgId) {
    return { user: null, org: null }
  }

  // Fetch user from database
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1)

  if (!user || user.orgId !== payload.orgId) {
    return { user: null, org: null }
  }

  // Fetch org from database
  const [org] = await db
    .select()
    .from(orgs)
    .where(eq(orgs.id, payload.orgId))
    .limit(1)

  if (!org) {
    return { user: null, org: null }
  }

  // Map to User/Org types
  const userData: User = {
    id: user.id,
    orgId: user.orgId,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
  }

  const orgData: Org = {
    id: org.id,
    name: org.name,
    slug: org.slug,
  }

  return { user: userData, org: orgData }
}

