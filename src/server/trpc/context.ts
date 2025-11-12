import type { Database } from '../db'

export interface User {
  id: string
  orgId: string
  email: string
  name: string
  avatar?: string | null
  role: 'admin' | 'developer' | 'member'
}

export interface Org {
  id: string
  name: string
  slug?: string | null
}

export interface Context {
  db: Database
  user?: User | null
  org?: Org | null
}

export function createContext(db: Database, user?: User | null, org?: Org | null): Context {
  return {
    db,
    user: user ?? null,
    org: org ?? null,
  }
}

// Helper function to get user and org from request
// Extracts JWT token and fetches user/org from database
export async function getUserAndOrgFromRequest(
  req: Request,
  db: Database
): Promise<{ user: User | null; org: Org | null }> {
  const { getSessionFromRequest } = await import('../auth/session')
  return getSessionFromRequest(req, db)
}

