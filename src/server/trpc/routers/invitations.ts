import { z } from 'zod'
import { router, publicProcedure, protectedProcedure, TRPCError } from '../trpc'
import { invitations, users, orgs } from '../../db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import { isAdmin } from '../utils/auth'

/**
 * Generate a secure random token for invitations
 */
function generateInvitationToken(): string {
  return randomBytes(32).toString('hex')
}

export const invitationsRouter = router({
  /**
   * Create a new invitation (admin only)
   */
  create: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(['admin', 'developer', 'member']).default('member'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user, org } = ctx

      // Check if user is admin
      if (!(await isAdmin(db, user.id, org.id))) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can create invitations',
        })
      }

      // Normalize email to lowercase for comparison
      const normalizedEmail = input.email.toLowerCase().trim()

      // Check if user with this email already exists in the org (case-insensitive)
      const existingUsers = await db
        .select()
        .from(users)
        .where(eq(users.orgId, org.id))
      
      const existingUser = existingUsers.find(u => u.email.toLowerCase() === normalizedEmail)

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists in your organization',
        })
      }

      // Check if there's already a pending invitation for this email in this org (case-insensitive)
      const pendingInvitations = await db
        .select()
        .from(invitations)
        .where(and(
          eq(invitations.orgId, org.id),
          eq(invitations.status, 'pending')
        ))
      
      const existingInvitation = pendingInvitations.find(
        inv => inv.email.toLowerCase() === normalizedEmail
      )

      if (existingInvitation) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A pending invitation already exists for this email',
        })
      }

      // Generate invitation token
      const token = generateInvitationToken()
      
      // Set expiration to 7 days from now
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      // Create invitation (store email in lowercase)
      const invitationId = `inv-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      await db.insert(invitations).values({
        id: invitationId,
        orgId: org.id,
        email: normalizedEmail, // Store normalized email
        role: input.role,
        invitedByUserId: user.id,
        status: 'pending',
        token,
        expiresAt,
      })

      // Fetch created invitation with related data
      const [invitation] = await db
        .select()
        .from(invitations)
        .where(eq(invitations.id, invitationId))
        .limit(1)

      const [invitedBy] = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1)

      const [orgData] = await db
        .select()
        .from(orgs)
        .where(eq(orgs.id, org.id))
        .limit(1)

      return {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        token: invitation.token, // Include token for frontend to generate invitation link
        expiresAt: invitation.expiresAt.toISOString(),
        createdAt: invitation.createdAt.toISOString(),
        invitedBy: invitedBy ? {
          id: invitedBy.id,
          name: invitedBy.name,
          email: invitedBy.email,
        } : null,
        org: orgData ? {
          id: orgData.id,
          name: orgData.name,
        } : null,
      }
    }),

  /**
   * List invitations for the organization (admin only)
   */
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(['pending', 'accepted', 'rejected', 'expired', 'canceled', 'all']).optional().default('all'),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { db, user, org } = ctx

      // Check if user is admin
      if (!(await isAdmin(db, user.id, org.id))) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can view invitations',
        })
      }

      const conditions = [eq(invitations.orgId, org.id)]
      
      if (input?.status && input.status !== 'all') {
        conditions.push(eq(invitations.status, input.status))
      }

      const invitationList = await db
        .select()
        .from(invitations)
        .where(and(...conditions))
        .orderBy(desc(invitations.createdAt))

      // Get invited by user info
      const result = await Promise.all(
        invitationList.map(async (invitation) => {
          const [invitedBy] = await db
            .select()
            .from(users)
            .where(eq(users.id, invitation.invitedByUserId))
            .limit(1)

          return {
            id: invitation.id,
            email: invitation.email,
            role: invitation.role,
            status: invitation.status,
            expiresAt: invitation.expiresAt.toISOString(),
            createdAt: invitation.createdAt.toISOString(),
            acceptedAt: invitation.acceptedAt?.toISOString(),
            invitedBy: invitedBy ? {
              id: invitedBy.id,
              name: invitedBy.name,
              email: invitedBy.email,
            } : null,
          }
        })
      )

      return result
    }),

  /**
   * Get invitation by token (public, for invitation acceptance page)
   */
  getByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx

      const [invitation] = await db
        .select()
        .from(invitations)
        .where(eq(invitations.token, input.token))
        .limit(1)

      if (!invitation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invitation not found',
        })
      }

      // Check if invitation is expired
      const now = new Date()
      if (invitation.expiresAt < now && invitation.status === 'pending') {
        // Update status to expired
        await db
          .update(invitations)
          .set({ status: 'expired', updatedAt: now })
          .where(eq(invitations.id, invitation.id))

        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invitation has expired',
        })
      }

      // Get organization info
      const [orgData] = await db
        .select()
        .from(orgs)
        .where(eq(orgs.id, invitation.orgId))
        .limit(1)

      const [invitedBy] = await db
        .select()
        .from(users)
        .where(eq(users.id, invitation.invitedByUserId))
        .limit(1)

      return {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt.toISOString(),
        createdAt: invitation.createdAt.toISOString(),
        org: orgData ? {
          id: orgData.id,
          name: orgData.name,
        } : null,
        invitedBy: invitedBy ? {
          id: invitedBy.id,
          name: invitedBy.name,
          email: invitedBy.email,
        } : null,
      }
    }),

  /**
   * Cancel an invitation (admin only)
   */
  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, user, org } = ctx

      // Check if user is admin
      if (!(await isAdmin(db, user.id, org.id))) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can cancel invitations',
        })
      }

      // Get invitation and verify it belongs to the org
      const [invitation] = await db
        .select()
        .from(invitations)
        .where(and(
          eq(invitations.id, input.id),
          eq(invitations.orgId, org.id)
        ))
        .limit(1)

      if (!invitation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invitation not found',
        })
      }

      if (invitation.status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only cancel pending invitations',
        })
      }

      // Update invitation status
      await db
        .update(invitations)
        .set({
          status: 'canceled',
          updatedAt: new Date(),
        })
        .where(eq(invitations.id, input.id))

      return {
        success: true,
      }
    }),

  /**
   * Accept an invitation (used after Google OAuth sign-in)
   * This is called when a user signs in with Google and their email matches a pending invitation
   */
  accept: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        })
      }

      // Get invitation by token
      const [invitation] = await db
        .select()
        .from(invitations)
        .where(eq(invitations.token, input.token))
        .limit(1)

      if (!invitation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Invitation not found',
        })
      }

      // Verify email matches
      if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Invitation email does not match your account email',
        })
      }

      // Check if invitation is still pending
      if (invitation.status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Invitation has already been ${invitation.status}`,
        })
      }

      // Check if invitation is expired
      if (invitation.expiresAt < new Date()) {
        await db
          .update(invitations)
          .set({ status: 'expired', updatedAt: new Date() })
          .where(eq(invitations.id, invitation.id))

        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invitation has expired',
        })
      }

      // Check if user already exists in the org (case-insensitive email comparison)
      const orgUsers = await db
        .select()
        .from(users)
        .where(eq(users.orgId, invitation.orgId))
      
      const existingUser = orgUsers.find(
        u => u.email.toLowerCase() === invitation.email.toLowerCase()
      )

      if (existingUser) {
        // User already exists in this org, just mark invitation as accepted
        await db
          .update(invitations)
          .set({
            status: 'accepted',
            acceptedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(invitations.id, invitation.id))

        return {
          success: true,
          message: 'You are already a member of this organization',
        }
      }

      // Check if user is already in a different org
      if (user.orgId !== invitation.orgId) {
        // User is switching orgs - this is allowed via invitation
        // Update user's orgId and role
        await db
          .update(users)
          .set({
            orgId: invitation.orgId,
            role: invitation.role,
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id))
      } else {
        // User is in the same org but wasn't found above (shouldn't happen, but handle gracefully)
        // Just update role if needed
        if (user.role !== invitation.role) {
          await db
            .update(users)
            .set({
              role: invitation.role,
              updatedAt: new Date(),
            })
            .where(eq(users.id, user.id))
        }
      }

      // Mark invitation as accepted
      await db
        .update(invitations)
        .set({
          status: 'accepted',
          acceptedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(invitations.id, invitation.id))

      // Get updated user and org
      const [updatedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1)

      const [orgData] = await db
        .select()
        .from(orgs)
        .where(eq(orgs.id, invitation.orgId))
        .limit(1)

      return {
        success: true,
        user: updatedUser ? {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          orgId: updatedUser.orgId,
        } : null,
        org: orgData ? {
          id: orgData.id,
          name: orgData.name,
          slug: orgData.slug,
        } : null,
      }
    }),
})

