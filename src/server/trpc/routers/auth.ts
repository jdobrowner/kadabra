import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { getGoogleAuthUrl } from '../../auth/google-oauth'

export const authRouter = router({
  /**
   * Get Google OAuth authorization URL
   */
  getGoogleAuthUrl: publicProcedure
    .input(
      z.object({
        redirectUrl: z.string().url().optional(),
        invitationToken: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      // Prefer invitationToken over redirectUrl for state
      const invitationToken = input?.invitationToken
      const redirectUrl = input?.redirectUrl
      
      // If invitationToken is provided, use it; otherwise use redirectUrl
      const state = invitationToken || (redirectUrl ? encodeURIComponent(redirectUrl) : undefined)
      const authUrl = getGoogleAuthUrl(state)
      
      return {
        authUrl,
      }
    }),

  /**
   * Get current authenticated user and organization
   */
  me: protectedProcedure.query(async ({ ctx }) => ({
    user: ctx.user,
    org: ctx.org,
  })),
})

