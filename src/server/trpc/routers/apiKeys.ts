import { z } from 'zod'
import { router, protectedProcedure, TRPCError } from '../trpc'
import { apiKeys } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { createApiKey, decryptApiKey, maskApiKey } from '../../auth/api-keys'
import { isDeveloperOrAdmin } from '../utils/auth'

export const apiKeysRouter = router({
  /**
   * Create a new API key for the organization (admin or developer only)
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        expiresAt: z.string().datetime().optional(), // ISO 8601 date string
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user, org } = ctx

      // Check if user is developer or admin
      if (!(await isDeveloperOrAdmin(db, user.id, org.id))) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins and developers can create API keys',
        })
      }

      const expiresAt = input.expiresAt ? new Date(input.expiresAt) : undefined

      const { id, plainKey } = await createApiKey(
        db,
        org.id,
        input.name,
        expiresAt
      )

      // Return the plain key (only shown once)
      return {
        id,
        name: input.name,
        key: plainKey, // Only returned on creation
        expiresAt: expiresAt?.toISOString() || null,
        createdAt: new Date().toISOString(),
      }
    }),

  /**
   * List all API keys for the organization (admin or developer only)
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const { db, user, org } = ctx

    // Check if user is developer or admin
    if (!(await isDeveloperOrAdmin(db, user.id, org.id))) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only admins and developers can list API keys',
      })
    }

    const keys = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.orgId, org.id))

    return keys.map((key) => {
      // Decrypt and mask the key for display
      let maskedKey: string | null = null
      let hasEncryptedKey = false
      
      if (key.keyEncrypted) {
        hasEncryptedKey = true
        try {
          const plainKey = decryptApiKey(key.keyEncrypted)
          maskedKey = maskApiKey(plainKey)
        } catch (error) {
          // If decryption fails (e.g., encryption key changed), show placeholder
          console.error('Failed to decrypt API key:', error)
          maskedKey = '••••••••'
        }
      } else {
        // Key was created before encryption was added, or column doesn't exist
        maskedKey = '••••••••'
      }

      return {
        id: key.id,
        name: key.name,
        keyMasked: maskedKey, // Masked version for display
        hasEncryptedKey, // Whether we can reveal the full key
        lastUsedAt: key.lastUsedAt?.toISOString() || null,
        createdAt: key.createdAt.toISOString(),
        expiresAt: key.expiresAt?.toISOString() || null,
      }
    })
  }),

  /**
   * Delete an API key (admin or developer only)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, user, org } = ctx

      // Check if user is developer or admin
      if (!(await isDeveloperOrAdmin(db, user.id, org.id))) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins and developers can delete API keys',
        })
      }

      // Verify the key belongs to this org
      const [key] = await db
        .select()
        .from(apiKeys)
        .where(and(eq(apiKeys.id, input.id), eq(apiKeys.orgId, org.id)))
        .limit(1)

      if (!key) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'API key not found',
        })
      }

      await db.delete(apiKeys).where(eq(apiKeys.id, input.id))

      return { success: true }
    }),

  /**
   * Reveal the full API key for copying (admin or developer only)
   */
  reveal: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, user, org } = ctx

      // Check if user is developer or admin
      if (!(await isDeveloperOrAdmin(db, user.id, org.id))) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admins and developers can reveal API keys',
        })
      }

      // Verify the key belongs to this org
      const [key] = await db
        .select()
        .from(apiKeys)
        .where(and(eq(apiKeys.id, input.id), eq(apiKeys.orgId, org.id)))
        .limit(1)

      if (!key) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'API key not found',
        })
      }

      if (!key.keyEncrypted) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'API key cannot be revealed (encrypted key not available)',
        })
      }

      try {
        const plainKey = decryptApiKey(key.keyEncrypted)
        return { key: plainKey }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to decrypt API key',
        })
      }
    }),
})

