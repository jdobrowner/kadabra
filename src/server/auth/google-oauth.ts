import { OAuth2Client } from 'google-auth-library'
import type { Database } from '../db'
import { users, orgs, invitations } from '../db/schema'
import { eq } from 'drizzle-orm'
import type { User, Org } from '../trpc/context'
import { signToken } from './jwt'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'

// Validate required environment variables
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️  Google OAuth credentials not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.')
}

// Create OAuth2 client
export const googleOAuthClient = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
)

/**
 * Get Google OAuth authorization URL
 * @param invitationToken - Optional invitation token to pass through OAuth flow
 */
export function getGoogleAuthUrl(invitationToken?: string): string {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.')
  }

  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ]

  return googleOAuthClient.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state: invitationToken || undefined, // Pass invitation token as state
  })
}

/**
 * Exchange authorization code for tokens and get user info
 * @param code - OAuth authorization code
 * @param db - Database instance
 * @param invitationToken - Optional invitation token from OAuth state
 */
export async function handleGoogleCallback(
  code: string,
  db: Database,
  invitationToken?: string
): Promise<{ token: string; user: User; org: Org; invitationAccepted?: boolean }> {
  // Exchange code for tokens
  const { tokens } = await googleOAuthClient.getToken(code)
  googleOAuthClient.setCredentials(tokens)

  // Get user info from Google
  const ticket = await googleOAuthClient.verifyIdToken({
    idToken: tokens.id_token!,
    audience: GOOGLE_CLIENT_ID,
  })

  const payload = ticket.getPayload()
  if (!payload || !payload.email || !payload.name) {
    throw new Error('Failed to get user info from Google')
  }

  const googleEmail = payload.email
  const googleName = payload.name
  const googlePicture = payload.picture || null

  // Normalize email to lowercase for comparison
  const normalizedEmail = googleEmail.toLowerCase()

  // Check for pending invitations first (case-insensitive)
  // If invitationToken is provided, use that; otherwise search by email
  let pendingInvitation: typeof invitations.$inferSelect | undefined
  
  if (invitationToken) {
    // Get invitation by token
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(eq(invitations.token, invitationToken))
      .limit(1)
    
    if (invitation && invitation.status === 'pending' && invitation.email.toLowerCase() === normalizedEmail) {
      pendingInvitation = invitation
    }
  } else {
    // Search by email
    const pendingInvitations = await db
      .select()
      .from(invitations)
      .where(eq(invitations.status, 'pending'))
    
    pendingInvitation = pendingInvitations.find(
      inv => inv.email.toLowerCase() === normalizedEmail
    )
  }
  
  let invitationAccepted = false

  // Find or create user (case-insensitive email lookup)
  const allUsers = await db
    .select()
    .from(users)
  
  let user = allUsers.find(u => u.email.toLowerCase() === normalizedEmail)

  let org: typeof orgs.$inferSelect | null = null

  if (!user) {
    // If there's a pending invitation, use that org and role
    if (pendingInvitation) {
      // Check if invitation is expired
      if (pendingInvitation.expiresAt < new Date()) {
        // Mark as expired
        await db
          .update(invitations)
          .set({ status: 'expired', updatedAt: new Date() })
          .where(eq(invitations.id, pendingInvitation.id))
        
        // Create new organization for new user
        const orgId = `org-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
        const orgName = `${googleName}'s Organization`
        const orgSlug = orgName.toLowerCase().replace(/\s+/g, '-')

        await db.insert(orgs).values({
          id: orgId,
          name: orgName,
          slug: orgSlug,
        })

        // Create new user (store email in lowercase)
        const userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
        await db.insert(users).values({
          id: userId,
          orgId: orgId,
          email: normalizedEmail, // Store normalized email
          name: googleName,
          avatar: googlePicture,
          role: 'admin', // First user is admin
        })

        // Fetch created user and org
        const [createdUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1)

        const [createdOrg] = await db
          .select()
          .from(orgs)
          .where(eq(orgs.id, orgId))
          .limit(1)

        if (!createdUser || !createdOrg) {
          throw new Error('Failed to create user')
        }

        user = createdUser
        org = createdOrg
      } else {
        // Use invitation's org and role
        const [invitationOrg] = await db
          .select()
          .from(orgs)
          .where(eq(orgs.id, pendingInvitation.orgId))
          .limit(1)

        if (!invitationOrg) {
          throw new Error('Invitation organization not found')
        }

        // Create new user with invitation's org and role (store email in lowercase)
        const userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
        await db.insert(users).values({
          id: userId,
          orgId: pendingInvitation.orgId,
          email: normalizedEmail, // Store normalized email
          name: googleName,
          avatar: googlePicture,
          role: pendingInvitation.role,
        })

        // Mark invitation as accepted
        await db
          .update(invitations)
          .set({
            status: 'accepted',
            acceptedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(invitations.id, pendingInvitation.id))
        
        invitationAccepted = true

        // Fetch created user
        const [createdUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1)

        if (!createdUser) {
          throw new Error('Failed to create user')
        }

        user = createdUser
        org = invitationOrg
      }
    } else {
      // No pending invitation, create new organization for new user
      const orgId = `org-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      const orgName = `${googleName}'s Organization`
      const orgSlug = orgName.toLowerCase().replace(/\s+/g, '-')

      await db.insert(orgs).values({
        id: orgId,
        name: orgName,
        slug: orgSlug,
      })

      // Create new user (store email in lowercase)
      const userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      await db.insert(users).values({
        id: userId,
        orgId: orgId,
        email: normalizedEmail, // Store normalized email
        name: googleName,
        avatar: googlePicture,
        role: 'admin', // First user is admin
      })

      // Fetch created user and org
      const [createdUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)

      const [createdOrg] = await db
        .select()
        .from(orgs)
        .where(eq(orgs.id, orgId))
        .limit(1)

      if (!createdUser || !createdOrg) {
        throw new Error('Failed to create user')
      }

      user = createdUser
      org = createdOrg
    }
  } else {
    // Existing user - check if there's a pending invitation for a different org
    if (pendingInvitation && pendingInvitation.orgId !== user.orgId) {
      // User has a pending invitation for a different org
      // Check if invitation is expired
      if (pendingInvitation.expiresAt < new Date()) {
        // Mark as expired
        await db
          .update(invitations)
          .set({ status: 'expired', updatedAt: new Date() })
          .where(eq(invitations.id, pendingInvitation.id))
      } else {
        // Invitation is valid - switch user to new org
        const [invitationOrg] = await db
          .select()
          .from(orgs)
          .where(eq(orgs.id, pendingInvitation.orgId))
          .limit(1)

        if (invitationOrg) {
          // Update user's org and role
          await db
            .update(users)
            .set({
              orgId: pendingInvitation.orgId,
              role: pendingInvitation.role,
              updatedAt: new Date(),
            })
            .where(eq(users.id, user.id))

          // Mark invitation as accepted
          await db
            .update(invitations)
            .set({
              status: 'accepted',
              acceptedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(invitations.id, pendingInvitation.id))

          invitationAccepted = true

          // Update local user object
          user.orgId = pendingInvitation.orgId
          user.role = pendingInvitation.role
          org = invitationOrg

          // Fetch updated user for avatar check
          const [updatedUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1)
          
          if (updatedUser) {
            user = updatedUser
          }
        }
      }
    }

    // Update user avatar if it changed
    if (googlePicture && user.avatar !== googlePicture) {
      await db
        .update(users)
        .set({ avatar: googlePicture, updatedAt: new Date() })
        .where(eq(users.id, user.id))
      
      user.avatar = googlePicture
    }

    // Get user's organization if not already set
    if (!org) {
      const [userOrg] = await db
        .select()
        .from(orgs)
        .where(eq(orgs.id, user.orgId))
        .limit(1)

      if (!userOrg) {
        throw new Error('User organization not found')
      }

      org = userOrg
    }
  }

  // Create user and org objects
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

  // Generate JWT token
  const token = await signToken(userData, orgData)

  return {
    token,
    user: userData,
    org: orgData,
    invitationAccepted,
  }
}

