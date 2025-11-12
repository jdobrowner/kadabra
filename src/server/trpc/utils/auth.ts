import type { Database } from '../../db'
import { users } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * Check if user is admin of the organization
 */
export async function isAdmin(db: Database, userId: string, orgId: string): Promise<boolean> {
  const [user] = await db
    .select()
    .from(users)
    .where(and(
      eq(users.id, userId),
      eq(users.orgId, orgId)
    ))
    .limit(1)

  return user?.role === 'admin'
}

/**
 * Check if user is developer or admin of the organization
 */
export async function isDeveloperOrAdmin(db: Database, userId: string, orgId: string): Promise<boolean> {
  const [user] = await db
    .select()
    .from(users)
    .where(and(
      eq(users.id, userId),
      eq(users.orgId, orgId)
    ))
    .limit(1)

  return user?.role === 'admin' || user?.role === 'developer'
}
