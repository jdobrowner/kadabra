import { initTRPC } from '@trpc/server'
import { TRPCError } from '@trpc/server'
import type { Context } from './context'
import { observable } from '@trpc/server/observable'

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user || !ctx.org) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Type narrowing
      org: ctx.org,
    },
  })
})

export { TRPCError, observable }

