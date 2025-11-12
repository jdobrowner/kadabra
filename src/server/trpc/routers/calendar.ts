import { z } from 'zod'
import { router, publicProcedure, TRPCError } from '../trpc'
import { calendarEvents, customers } from '../../db/schema'
import { eq, and, gte, lt } from 'drizzle-orm'

export const calendarRouter = router({
  today: publicProcedure.query(async ({ ctx }) => {
    const { db, org } = ctx
    
    if (!org) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Organization context required',
      })
    }
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const events = await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.orgId, org.id),
          gte(calendarEvents.date, today),
          lt(calendarEvents.date, tomorrow)
        )
      )
    
    return events.map(event => ({
      id: event.id,
      customerId: event.customerId,
      title: event.title,
      date: event.date.toISOString(),
      type: event.type,
      goal: event.goal,
      prepNotes: event.prepNotes,
      talkingPoints: event.talkingPoints || [],
      createdAt: event.createdAt.toISOString(),
    }))
  }),

  getByCustomerId: publicProcedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, org } = ctx
      
      if (!org) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Organization context required',
        })
      }
      
      // Validate customer belongs to org
      const [customer] = await db
        .select()
        .from(customers)
        .where(and(
          eq(customers.id, input.customerId),
          eq(customers.orgId, org.id)
        ))
        .limit(1)
      
      if (!customer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        })
      }
      
      const events = await db
        .select()
        .from(calendarEvents)
        .where(and(
          eq(calendarEvents.customerId, input.customerId),
          eq(calendarEvents.orgId, org.id)
        ))
      
      return events.map(event => ({
        id: event.id,
        customerId: event.customerId,
        title: event.title,
        date: event.date.toISOString(),
        type: event.type,
        goal: event.goal,
        prepNotes: event.prepNotes,
        talkingPoints: event.talkingPoints || [],
        createdAt: event.createdAt.toISOString(),
      }))
    }),
})

