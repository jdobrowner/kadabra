import { z } from 'zod'
import { router, protectedProcedure, TRPCError } from '../trpc'
import { users } from '../../db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { isAdmin } from '../utils/auth'

export const usersRouter = router({
  /**
   * List all users in the organization (admin only)
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const { db, user, org } = ctx

    // Check if user is admin
    if (!(await isAdmin(db, user.id, org.id))) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only admins can view users',
      })
    }

    // Get all users in the organization, ordered by name
    const orgUsers = await db
      .select()
      .from(users)
      .where(eq(users.orgId, org.id))
      .orderBy(asc(users.name))

    return orgUsers.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      avatar: u.avatar,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }))
  }),

  /**
   * Remove a user from the organization (admin only)
   */
  remove: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, user, org } = ctx

      // Check if user is admin
      if (!(await isAdmin(db, user.id, org.id))) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can remove users',
        })
      }

      // Prevent removing yourself
      if (input.userId === user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot remove yourself from the organization',
        })
      }

      // Get the user to be removed
      const [userToRemove] = await db
        .select()
        .from(users)
        .where(and(
          eq(users.id, input.userId),
          eq(users.orgId, org.id)
        ))
        .limit(1)

      if (!userToRemove) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found in your organization',
        })
      }

      // Check if this is the last admin
      if (userToRemove.role === 'admin') {
        const adminUsers = await db
          .select()
          .from(users)
          .where(and(
            eq(users.orgId, org.id),
            eq(users.role, 'admin')
          ))

        if (adminUsers.length === 1) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot remove the last admin from the organization',
          })
        }
      }

      // Note: When a user is deleted:
      // - Their invitations (where invitedByUserId) are cascade-deleted
      // - Their assigned tasks (ownerUserId) are set to null
      // - Their assigned action plans (assignedToUserId) are set to null
      // - Their recorded conversations (recordedByUserId) are set to null
      // This is handled by the database schema constraints

      // Delete the user (cascade will handle related data based on schema)
      await db
        .delete(users)
        .where(eq(users.id, input.userId))

      return {
        success: true,
        message: `User ${userToRemove.name} has been removed from the organization`,
      }
    }),

  /**
   * Update a user's role (admin only)
   */
  updateRole: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(['admin', 'developer', 'member']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user, org } = ctx

      // Check if user is admin
      if (!(await isAdmin(db, user.id, org.id))) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins can update user roles',
        })
      }

      // Get the user to be updated
      const [userToUpdate] = await db
        .select()
        .from(users)
        .where(and(
          eq(users.id, input.userId),
          eq(users.orgId, org.id)
        ))
        .limit(1)

      if (!userToUpdate) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found in your organization',
        })
      }

      // Prevent demoting the last admin
      if (userToUpdate.role === 'admin' && input.role !== 'admin') {
        const adminUsers = await db
          .select()
          .from(users)
          .where(and(
            eq(users.orgId, org.id),
            eq(users.role, 'admin')
          ))

        if (adminUsers.length === 1) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot demote the last admin from the organization',
          })
        }
      }

      // Update user role
      await db
        .update(users)
        .set({
          role: input.role,
          updatedAt: new Date(),
        })
        .where(eq(users.id, input.userId))

      // Fetch updated user
      const [updatedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1)

      return {
        success: true,
        user: updatedUser ? {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          avatar: updatedUser.avatar,
          role: updatedUser.role,
          createdAt: updatedUser.createdAt.toISOString(),
          updatedAt: updatedUser.updatedAt.toISOString(),
        } : null,
      }
    }),
})

