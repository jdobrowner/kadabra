import { z } from 'zod'
import { router, publicProcedure, TRPCError } from '../trpc'
import { reminders, customers, actionItems } from '../../db/schema'
import { eq, and, gte, asc } from 'drizzle-orm'

const reminderTypeSchema = z.enum(['email', 'call', 'text', 'task'])
const reminderStatusSchema = z.enum(['pending', 'completed', 'dismissed'])

export const remindersRouter = router({
  list: publicProcedure
    .input(
      z.object({
        status: reminderStatusSchema.optional(),
        customerId: z.string().optional(),
        upcoming: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { db, org } = ctx

      if (!org) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Organization context required',
        })
      }

      const conditions = [eq(reminders.orgId, org.id)]

      if (input?.status) {
        conditions.push(eq(reminders.status, input.status))
      }

      if (input?.customerId) {
        conditions.push(eq(reminders.customerId, input.customerId))
      }

      if (input?.upcoming) {
        const now = new Date()
        conditions.push(gte(reminders.reminderDate, now))
      }

      const results = await db
        .select({
          reminder: reminders,
          customer: {
            id: customers.id,
            name: customers.name,
            companyName: customers.companyName,
            avatar: customers.avatar,
          },
        })
        .from(reminders)
        .innerJoin(customers, eq(reminders.customerId, customers.id))
        .where(and(...conditions))
        .orderBy(asc(reminders.reminderDate))

      return results.map(({ reminder, customer }) => ({
        id: reminder.id,
        customerId: reminder.customerId,
        customer: {
          id: customer.id,
          name: customer.name,
          companyName: customer.companyName,
          avatar: customer.avatar,
        },
        actionItemId: reminder.actionItemId,
        type: reminder.type,
        title: reminder.title,
        description: reminder.description,
        reminderDate: reminder.reminderDate.toISOString(),
        status: reminder.status,
        createdAt: reminder.createdAt.toISOString(),
        updatedAt: reminder.updatedAt.toISOString(),
      }))
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, org } = ctx

      if (!org) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Organization context required',
        })
      }

      const [reminder] = await db
        .select()
        .from(reminders)
        .where(and(eq(reminders.id, input.id), eq(reminders.orgId, org.id)))
        .limit(1)

      if (!reminder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Reminder not found',
        })
      }

      return {
        id: reminder.id,
        customerId: reminder.customerId,
        actionItemId: reminder.actionItemId,
        type: reminder.type,
        title: reminder.title,
        description: reminder.description,
        reminderDate: reminder.reminderDate.toISOString(),
        status: reminder.status,
        createdAt: reminder.createdAt.toISOString(),
        updatedAt: reminder.updatedAt.toISOString(),
      }
    }),

  create: publicProcedure
    .input(
      z.object({
        customerId: z.string(),
        actionItemId: z.string().optional(),
        type: reminderTypeSchema,
        title: z.string(),
        description: z.string().optional(),
        reminderDate: z.string(), // ISO string
      })
    )
    .mutation(async ({ ctx, input }) => {
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
        .where(and(eq(customers.id, input.customerId), eq(customers.orgId, org.id)))
        .limit(1)

      if (!customer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        })
      }

      // Validate action item if provided
      if (input.actionItemId) {
        const [actionItem] = await db
          .select()
          .from(actionItems)
          .where(eq(actionItems.id, input.actionItemId))
          .limit(1)

        if (!actionItem) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Action item not found',
          })
        }
      }

      const reminderDate = new Date(input.reminderDate)
      const id = `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const [newReminder] = await db
        .insert(reminders)
        .values({
          id,
          orgId: org.id,
          customerId: input.customerId,
          actionItemId: input.actionItemId || null,
          type: input.type,
          title: input.title,
          description: input.description || null,
          reminderDate,
          status: 'pending',
        })
        .returning()

      return {
        id: newReminder.id,
        customerId: newReminder.customerId,
        actionItemId: newReminder.actionItemId,
        type: newReminder.type,
        title: newReminder.title,
        description: newReminder.description,
        reminderDate: newReminder.reminderDate.toISOString(),
        status: newReminder.status,
        createdAt: newReminder.createdAt.toISOString(),
        updatedAt: newReminder.updatedAt.toISOString(),
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        type: reminderTypeSchema.optional(),
        title: z.string().optional(),
        description: z.string().optional().nullable(),
        reminderDate: z.string().optional(), // ISO string
        status: reminderStatusSchema.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, org } = ctx

      if (!org) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Organization context required',
        })
      }

      const updateData: any = {}
      if (input.type !== undefined) updateData.type = input.type
      if (input.title !== undefined) updateData.title = input.title
      if (input.description !== undefined) updateData.description = input.description
      if (input.reminderDate !== undefined) {
        updateData.reminderDate = new Date(input.reminderDate)
      }
      if (input.status !== undefined) updateData.status = input.status
      updateData.updatedAt = new Date()

      const [updated] = await db
        .update(reminders)
        .set(updateData)
        .where(and(eq(reminders.id, input.id), eq(reminders.orgId, org.id)))
        .returning()

      if (!updated) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Reminder not found',
        })
      }

      return {
        id: updated.id,
        customerId: updated.customerId,
        actionItemId: updated.actionItemId,
        type: updated.type,
        title: updated.title,
        description: updated.description,
        reminderDate: updated.reminderDate.toISOString(),
        status: updated.status,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, org } = ctx

      if (!org) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Organization context required',
        })
      }

      const [deleted] = await db
        .delete(reminders)
        .where(and(eq(reminders.id, input.id), eq(reminders.orgId, org.id)))
        .returning()

      if (!deleted) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Reminder not found',
        })
      }

      return { success: true }
    }),

  createFromActionItem: publicProcedure
    .input(
      z.object({
        actionItemId: z.string(),
        type: reminderTypeSchema,
        title: z.string(),
        description: z.string().optional(),
        reminderDate: z.string(), // ISO string
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, org } = ctx

      if (!org) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Organization context required',
        })
      }

      // Get action item and validate
      const [actionItem] = await db
        .select()
        .from(actionItems)
        .where(eq(actionItems.id, input.actionItemId))
        .limit(1)

      if (!actionItem) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Action item not found',
        })
      }

      // Get action plan to get customerId
      const { actionPlans } = await import('../../db/schema')
      const [actionPlan] = await db
        .select()
        .from(actionPlans)
        .where(eq(actionPlans.id, actionItem.actionPlanId))
        .limit(1)

      if (!actionPlan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Action plan not found',
        })
      }

      // Validate customer belongs to org
      const [customer] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, actionPlan.customerId), eq(customers.orgId, org.id)))
        .limit(1)

      if (!customer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        })
      }

      const reminderDate = new Date(input.reminderDate)
      const id = `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const [newReminder] = await db
        .insert(reminders)
        .values({
          id,
          orgId: org.id,
          customerId: actionPlan.customerId,
          actionItemId: input.actionItemId,
          type: input.type,
          title: input.title,
          description: input.description || null,
          reminderDate,
          status: 'pending',
        })
        .returning()

      return {
        id: newReminder.id,
        customerId: newReminder.customerId,
        actionItemId: newReminder.actionItemId,
        type: newReminder.type,
        title: newReminder.title,
        description: newReminder.description,
        reminderDate: newReminder.reminderDate.toISOString(),
        status: newReminder.status,
        createdAt: newReminder.createdAt.toISOString(),
        updatedAt: newReminder.updatedAt.toISOString(),
      }
    }),
})

