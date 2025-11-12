import { z } from 'zod'
import { router, protectedProcedure, TRPCError } from '../trpc'
import { tasks, customers, teams, boardCards, boards } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

const taskStatusEnum = z.enum(['todo', 'in_progress', 'done'])
const taskPriorityEnum = z.enum(['low', 'medium', 'high', 'urgent'])

export const tasksRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          customerId: z.string().optional(),
          status: z.enum(['all', 'todo', 'in_progress', 'done']).optional(),
          priority: z.enum(['all', 'low', 'medium', 'high', 'urgent']).optional(),
          teamId: z.string().optional(),
          boardCardId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { db, org } = ctx

      const conditions = [eq(tasks.orgId, org.id)]

      if (input?.customerId) {
        const [customer] = await db
          .select()
          .from(customers)
          .where(and(eq(customers.id, input.customerId), eq(customers.orgId, org.id)))
          .limit(1)

        if (!customer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' })
        }
        conditions.push(eq(tasks.customerId, input.customerId))
      }

      if (input?.teamId) {
        const [team] = await db
          .select()
          .from(teams)
          .where(and(eq(teams.id, input.teamId), eq(teams.orgId, org.id)))
          .limit(1)

        if (!team) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' })
        }
        conditions.push(eq(tasks.assigneeTeamId, input.teamId))
      }

      if (input?.boardCardId) {
        const [card] = await db
          .select({ id: boardCards.id })
          .from(boardCards)
          .innerJoin(boards, eq(boardCards.boardId, boards.id))
          .where(and(eq(boardCards.id, input.boardCardId), eq(boards.orgId, org.id)))
          .limit(1)

        if (!card) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Board card not found' })
        }
        conditions.push(eq(tasks.boardCardId, input.boardCardId))
      }

      if (input?.status && input.status !== 'all') {
        conditions.push(eq(tasks.status, input.status))
      }

      if (input?.priority && input.priority !== 'all') {
        conditions.push(eq(tasks.priority, input.priority))
      }

      const taskRows = await db.select().from(tasks).where(and(...conditions))

      return taskRows.map((task) => ({
        id: task.id,
        customerId: task.customerId,
        conversationId: task.conversationId,
        actionPlanId: task.actionPlanId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate?.toISOString(),
        ownerUserId: task.ownerUserId,
        assigneeTeamId: task.assigneeTeamId,
        boardCardId: task.boardCardId,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      }))
    }),

  getByCustomerId: protectedProcedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, org } = ctx

      const [customer] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, input.customerId), eq(customers.orgId, org.id)))
        .limit(1)

      if (!customer) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' })
      }

      const taskList = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.customerId, input.customerId), eq(tasks.orgId, org.id)))

      return taskList.map((task) => ({
        id: task.id,
        customerId: task.customerId,
        conversationId: task.conversationId,
        actionPlanId: task.actionPlanId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate?.toISOString(),
        ownerUserId: task.ownerUserId,
        assigneeTeamId: task.assigneeTeamId,
        boardCardId: task.boardCardId,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      }))
    }),

  create: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        conversationId: z.string().optional(),
        actionPlanId: z.string().optional(),
        title: z.string(),
        description: z.string().optional(),
        priority: taskPriorityEnum,
        dueDate: z.string().optional(),
        ownerUserId: z.string().optional(),
        assigneeTeamId: z.string().optional(),
        boardCardId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, org } = ctx

      const [customer] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, input.customerId), eq(customers.orgId, org.id)))
        .limit(1)

      if (!customer) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' })
      }

      if (input.assigneeTeamId) {
        const [team] = await db
          .select()
          .from(teams)
          .where(and(eq(teams.id, input.assigneeTeamId), eq(teams.orgId, org.id)))
          .limit(1)
        if (!team) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' })
        }
      }

      if (input.boardCardId) {
        const [card] = await db
          .select({ id: boardCards.id })
          .from(boardCards)
          .innerJoin(boards, eq(boardCards.boardId, boards.id))
          .where(and(eq(boardCards.id, input.boardCardId), eq(boards.orgId, org.id)))
          .limit(1)
        if (!card) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Board card not found' })
        }
      }

      const id = `task-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

      const [task] = await db
        .insert(tasks)
        .values({
          id,
          orgId: org.id,
          customerId: input.customerId,
          conversationId: input.conversationId ?? undefined,
          actionPlanId: input.actionPlanId ?? undefined,
          title: input.title,
          description: input.description ?? undefined,
          priority: input.priority,
          dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
          ownerUserId: input.ownerUserId ?? undefined,
          assigneeTeamId: input.assigneeTeamId ?? undefined,
          boardCardId: input.boardCardId ?? undefined,
        })
        .returning()

      return {
        success: true,
        task: {
          id: task.id,
          customerId: task.customerId,
          conversationId: task.conversationId,
          actionPlanId: task.actionPlanId,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate?.toISOString(),
          ownerUserId: task.ownerUserId,
          assigneeTeamId: task.assigneeTeamId,
          boardCardId: task.boardCardId,
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
        },
      }
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.string(), status: taskStatusEnum }))
    .mutation(async ({ ctx, input }) => {
      const { db, org } = ctx

      const [existingTask] = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, input.id), eq(tasks.orgId, org.id)))
        .limit(1)

      if (!existingTask) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' })
      }

      const [updatedTask] = await db
        .update(tasks)
        .set({ status: input.status, updatedAt: new Date() })
        .where(and(eq(tasks.id, input.id), eq(tasks.orgId, org.id)))
        .returning()

      if (!updatedTask) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' })
      }

      return { success: true }
    }),

  updateAssignment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        assigneeTeamId: z.string().nullable().optional(),
        boardCardId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, org } = ctx

      const [existingTask] = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, input.id), eq(tasks.orgId, org.id)))
        .limit(1)

      if (!existingTask) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' })
      }

      if (input.assigneeTeamId !== undefined) {
        if (input.assigneeTeamId === null) {
          // no validation needed
        } else {
          const [team] = await db
            .select()
            .from(teams)
            .where(and(eq(teams.id, input.assigneeTeamId), eq(teams.orgId, org.id)))
            .limit(1)
          if (!team) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' })
          }
        }
      }

      if (input.boardCardId !== undefined) {
        if (input.boardCardId === null) {
          // nothing to validate
        } else {
          const [card] = await db
            .select({ id: boardCards.id })
            .from(boardCards)
            .innerJoin(boards, eq(boardCards.boardId, boards.id))
            .where(and(eq(boardCards.id, input.boardCardId), eq(boards.orgId, org.id)))
            .limit(1)

          if (!card) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Board card not found' })
          }
        }
      }

      await db
        .update(tasks)
        .set({
          assigneeTeamId: input.assigneeTeamId === undefined ? existingTask.assigneeTeamId : input.assigneeTeamId ?? null,
          boardCardId: input.boardCardId === undefined ? existingTask.boardCardId : input.boardCardId ?? null,
          updatedAt: new Date(),
        })
        .where(and(eq(tasks.id, input.id), eq(tasks.orgId, org.id)))

      return { success: true }
    }),
})
