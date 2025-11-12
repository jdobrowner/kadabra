import { z } from 'zod'
import { router, publicProcedure, protectedProcedure, TRPCError } from '../trpc'
import {
  actionPlans,
  actionItems,
  customers,
  actionPlanAuditLogs,
  teams,
  boardCards,
  boards,
  boardColumns,
  boardTeamPermissions,
} from '../../db/schema'
import type { Database } from '../../db'
import { eq, and, inArray, desc, sql } from 'drizzle-orm'
import { emitActionPlanChange, emitBoardCardChange } from '../../services/events'

const actionPlanStatusFilter = z.enum(['all', 'active', 'completed', 'canceled'])
const badgeFilter = z.enum(['at-risk', 'opportunity', 'lead', 'follow-up', 'no-action', 'all'])

const cardStatusForPlanStatus = (status: 'active' | 'completed' | 'canceled') => {
  if (status === 'completed') return 'done' as const
  if (status === 'canceled') return 'archived' as const
  return 'active' as const
}

const now = () => new Date()

type PlanRecord = typeof actionPlans.$inferSelect

type BoardCardRecord = {
  id: string
  actionPlanId: string | null
  boardId: string
  boardName: string
  columnId: string
  columnName: string
  status: string
  type: string
  position: number
  assigneeTeamId: string | null
}

async function ensureBoardAccess(db: Database, orgId: string, boardId: string, teamId?: string | null) {
  const [board] = await db
    .select()
    .from(boards)
    .where(and(eq(boards.id, boardId), eq(boards.orgId, orgId)))
    .limit(1)

  if (!board) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Board not found' })
  }

  if (board.visibility === 'org') {
    return board
  }

  if (!teamId) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Board requires team access' })
  }

  const [permission] = await db
    .select()
    .from(boardTeamPermissions)
    .where(and(eq(boardTeamPermissions.boardId, boardId), eq(boardTeamPermissions.teamId, teamId)))
    .limit(1)

  if (!permission) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Team does not have access to board' })
  }

  return board
}

async function syncBoardCardStatus(db: Database, orgId: string, planId: string, status: 'active' | 'completed' | 'canceled') {
  const cardStatus = cardStatusForPlanStatus(status)
  const timestamp = now()
  const [card] = await db
    .update(boardCards)
    .set({
      status: cardStatus,
      completedAt: cardStatus === 'done' ? timestamp : null,
      archivedAt: cardStatus === 'archived' ? timestamp : null,
      updatedAt: timestamp,
    })
    .where(eq(boardCards.actionPlanId, planId))
    .returning({ id: boardCards.id })

  if (card) {
    emitBoardCardChange('updated', orgId, card.id, { status: cardStatus })
  }
}

async function loadTeam(db: Database, orgId: string, plan: PlanRecord) {
  if (!plan.assigneeTeamId) {
    return undefined
  }

  const [team] = await db
    .select()
    .from(teams)
    .where(and(eq(teams.id, plan.assigneeTeamId), eq(teams.orgId, orgId)))
    .limit(1)

  return team
}

async function loadBoardCard(db: Database, orgId: string, planId: string): Promise<BoardCardRecord | undefined> {
  const [card] = await db
    .select({
      id: boardCards.id,
      actionPlanId: boardCards.actionPlanId,
      boardId: boardCards.boardId,
      boardName: boards.name,
      columnId: boardCards.columnId,
      columnName: boardColumns.name,
      status: boardCards.status,
      type: boardCards.type,
      position: boardCards.position,
      assigneeTeamId: boardCards.assigneeTeamId,
    })
    .from(boardCards)
    .innerJoin(boards, and(eq(boardCards.boardId, boards.id), eq(boards.orgId, orgId)))
    .innerJoin(boardColumns, eq(boardCards.columnId, boardColumns.id))
    .where(eq(boardCards.actionPlanId, planId))
    .limit(1)

  return card
}

const actionPlanResponse = (
  plan: PlanRecord,
  customer: typeof customers.$inferSelect | undefined,
  items: typeof actionItems.$inferSelect[],
  team: typeof teams.$inferSelect | undefined,
  card: BoardCardRecord | undefined
) => ({
  id: plan.id,
  customerId: plan.customerId,
  customer: customer
    ? {
        id: customer.id,
        name: customer.name,
        companyName: customer.companyName,
        avatar: customer.avatar,
      }
    : undefined,
  badge: plan.badge,
  recommendation: plan.recommendation,
  whatToDo: plan.whatToDo,
  whyStrategy: plan.whyStrategy,
  status: plan.status,
  assignedToUserId: plan.assignedToUserId,
  assigneeTeamId: plan.assigneeTeamId ?? null,
  assigneeTeam: team
    ? {
        id: team.id,
        name: team.name,
        status: team.status,
        isDefault: team.isDefault,
        isAssignable: team.isAssignable,
      }
    : undefined,
  boardCard: card
    ? {
        id: card.id,
        boardId: card.boardId,
        boardName: card.boardName,
        columnId: card.columnId,
        columnName: card.columnName,
        status: card.status,
        type: card.type,
        position: card.position,
        assigneeTeamId: card.assigneeTeamId,
      }
    : undefined,
  routingMetadata: plan.routingMetadata ?? null,
  actionItems: items.map((item) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    description: item.description,
    status: item.status,
  })),
  createdAt: plan.createdAt.toISOString(),
  updatedAt: plan.updatedAt.toISOString(),
  completedAt: plan.completedAt?.toISOString(),
  canceledAt: plan.canceledAt?.toISOString(),
})

export const actionPlansRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          status: actionPlanStatusFilter.optional(),
          badge: badgeFilter.optional(),
          customerId: z.string().optional(),
          teamId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { db, org } = ctx

      if (!org) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Organization context required' })
      }

      const conditions = [eq(customers.orgId, org.id)]

      if (input?.status && input.status !== 'all') {
        conditions.push(eq(actionPlans.status, input.status))
      }

      if (input?.badge && input.badge !== 'all') {
        conditions.push(eq(actionPlans.badge, input.badge))
      }

      if (input?.customerId) {
        conditions.push(eq(customers.id, input.customerId))
      }

      if (input?.teamId) {
        conditions.push(eq(actionPlans.assigneeTeamId, input.teamId))
      }

      const rows = await db
        .select({ plan: actionPlans, customer: customers })
        .from(actionPlans)
        .innerJoin(customers, eq(actionPlans.customerId, customers.id))
        .where(and(...conditions))

      if (rows.length === 0) {
        return []
      }

      const plans = rows.map((row) => row.plan)
      const planIds = plans.map((plan) => plan.id)

      const [itemsRows, teamRows, cardRows] = await Promise.all([
        db.select().from(actionItems).where(inArray(actionItems.actionPlanId, planIds)),
        (() => {
          const teamIds = Array.from(
            new Set(plans.map((plan) => plan.assigneeTeamId).filter((id): id is string => Boolean(id)))
          )
          if (teamIds.length === 0) {
            return Promise.resolve([])
          }
          return db
            .select()
            .from(teams)
            .where(and(eq(teams.orgId, org.id), inArray(teams.id, teamIds)))
        })(),
        db
          .select({
            id: boardCards.id,
            actionPlanId: boardCards.actionPlanId,
            boardId: boardCards.boardId,
            boardName: boards.name,
            columnId: boardCards.columnId,
            columnName: boardColumns.name,
            status: boardCards.status,
            type: boardCards.type,
            position: boardCards.position,
            assigneeTeamId: boardCards.assigneeTeamId,
          })
          .from(boardCards)
          .innerJoin(boards, and(eq(boardCards.boardId, boards.id), eq(boards.orgId, org.id)))
          .innerJoin(boardColumns, eq(boardCards.columnId, boardColumns.id))
          .where(inArray(boardCards.actionPlanId, planIds))
      ])

      const itemsByPlan = new Map<string, typeof actionItems.$inferSelect[]>()
      itemsRows.forEach((item) => {
        if (!itemsByPlan.has(item.actionPlanId)) {
          itemsByPlan.set(item.actionPlanId, [])
        }
        itemsByPlan.get(item.actionPlanId)!.push(item)
      })

      const teamsById = new Map<string, typeof teams.$inferSelect>()
      teamRows.forEach((team) => teamsById.set(team.id, team))

      const cardsByPlan = new Map<string, BoardCardRecord>()
      cardRows.forEach((card) => {
        if (card.actionPlanId) {
          cardsByPlan.set(card.actionPlanId, card)
        }
      })

      return rows.map(({ plan, customer }) =>
        actionPlanResponse(
          plan,
          customer,
          itemsByPlan.get(plan.id) ?? [],
          plan.assigneeTeamId ? teamsById.get(plan.assigneeTeamId) : undefined,
          cardsByPlan.get(plan.id)
        )
      )
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, org } = ctx

      if (!org) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Organization context required' })
      }

      const [row] = await db
        .select({ plan: actionPlans, customer: customers })
        .from(actionPlans)
        .innerJoin(customers, eq(actionPlans.customerId, customers.id))
        .where(and(eq(actionPlans.id, input.id), eq(customers.orgId, org.id)))
        .limit(1)

      if (!row) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Action plan not found' })
      }

      const [items, team, card] = await Promise.all([
        db.select().from(actionItems).where(eq(actionItems.actionPlanId, row.plan.id)),
        loadTeam(db, org.id, row.plan),
        loadBoardCard(db, org.id, row.plan.id),
      ])

      return actionPlanResponse(row.plan, row.customer, items, team, card)
    }),

  getByCustomerId: publicProcedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, org } = ctx

      if (!org) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Organization context required' })
      }

      const [row] = await db
        .select({ plan: actionPlans, customer: customers })
        .from(actionPlans)
        .innerJoin(customers, eq(actionPlans.customerId, customers.id))
        .where(
          and(
            eq(actionPlans.customerId, input.customerId),
            eq(actionPlans.status, 'active'),
            eq(customers.orgId, org.id)
          )
        )
        .limit(1)

      if (!row) {
        return null
      }

      const [items, team, card] = await Promise.all([
        db.select().from(actionItems).where(eq(actionItems.actionPlanId, row.plan.id)),
        loadTeam(db, org.id, row.plan),
        loadBoardCard(db, org.id, row.plan.id),
      ])

      return actionPlanResponse(row.plan, row.customer, items, team, card)
    }),

  markComplete: publicProcedure
    .input(z.object({ id: z.string(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { db, org } = ctx

      if (!org) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Organization context required' })
      }

      const [existing] = await db
        .select({ plan: actionPlans, customer: customers })
        .from(actionPlans)
        .innerJoin(customers, eq(actionPlans.customerId, customers.id))
        .where(and(eq(actionPlans.id, input.id), eq(customers.orgId, org.id)))
        .limit(1)

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Action plan not found' })
      }

      const previousStatus = existing.plan.status

      const [plan] = await db
        .update(actionPlans)
        .set({ status: 'completed', completedAt: now(), updatedAt: now() })
        .where(eq(actionPlans.id, input.id))
        .returning()

      if (!plan) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Action plan not found' })
      }

      await syncBoardCardStatus(db, org.id, plan.id, 'completed')

      const auditLogId = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      await db.insert(actionPlanAuditLogs).values({
        id: auditLogId,
        actionPlanId: plan.id,
        userId: ctx.user?.id || null,
        action: 'status_change',
        previousStatus,
        newStatus: 'completed',
        metadata: { reason: input.reason ?? null },
      })

      emitActionPlanChange('updated', org.id, plan.id, {
        status: plan.status,
        customerId: plan.customerId,
      })

      const [items, team, card] = await Promise.all([
        db.select().from(actionItems).where(eq(actionItems.actionPlanId, plan.id)),
        loadTeam(db, org.id, plan),
        loadBoardCard(db, org.id, plan.id),
      ])

      return {
        success: true,
        actionPlan: actionPlanResponse(plan, existing.customer, items, team, card),
      }
    }),

  markIncomplete: publicProcedure
    .input(z.object({ id: z.string(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { db, org } = ctx

      if (!org) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Organization context required' })
      }

      const [existing] = await db
        .select({ plan: actionPlans, customer: customers })
        .from(actionPlans)
        .innerJoin(customers, eq(actionPlans.customerId, customers.id))
        .where(and(eq(actionPlans.id, input.id), eq(customers.orgId, org.id)))
        .limit(1)

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Action plan not found' })
      }

      const previousStatus = existing.plan.status

      const [plan] = await db
        .update(actionPlans)
        .set({ status: 'active', completedAt: null, updatedAt: now() })
        .where(eq(actionPlans.id, input.id))
        .returning()

      if (!plan) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Action plan not found' })
      }

      await syncBoardCardStatus(db, org.id, plan.id, 'active')

      const auditLogId = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      await db.insert(actionPlanAuditLogs).values({
        id: auditLogId,
        actionPlanId: plan.id,
        userId: ctx.user?.id || null,
        action: 'status_change',
        previousStatus,
        newStatus: 'active',
        metadata: { reason: input.reason ?? null },
      })

      emitActionPlanChange('updated', org.id, plan.id, {
        status: plan.status,
        customerId: plan.customerId,
      })

      const [items, team, card] = await Promise.all([
        db.select().from(actionItems).where(eq(actionItems.actionPlanId, plan.id)),
        loadTeam(db, org.id, plan),
        loadBoardCard(db, org.id, plan.id),
      ])

      return {
        success: true,
        actionPlan: actionPlanResponse(plan, existing.customer, items, team, card),
      }
    }),

  markCanceled: publicProcedure
    .input(z.object({ id: z.string(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { db, org } = ctx

      if (!org) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Organization context required' })
      }

      const [existing] = await db
        .select({ plan: actionPlans, customer: customers })
        .from(actionPlans)
        .innerJoin(customers, eq(actionPlans.customerId, customers.id))
        .where(and(eq(actionPlans.id, input.id), eq(customers.orgId, org.id)))
        .limit(1)

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Action plan not found' })
      }

      const previousStatus = existing.plan.status

      const [plan] = await db
        .update(actionPlans)
        .set({ status: 'canceled', canceledAt: now(), updatedAt: now() })
        .where(eq(actionPlans.id, input.id))
        .returning()

      if (!plan) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Action plan not found' })
      }

      await syncBoardCardStatus(db, org.id, plan.id, 'canceled')

      const auditLogId = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      await db.insert(actionPlanAuditLogs).values({
        id: auditLogId,
        actionPlanId: plan.id,
        userId: ctx.user?.id || null,
        action: 'status_change',
        previousStatus,
        newStatus: 'canceled',
        metadata: { reason: input.reason ?? null },
      })

      emitActionPlanChange('updated', org.id, plan.id, {
        status: plan.status,
        customerId: plan.customerId,
      })

      return {
        success: true,
        actionPlan: {
          id: plan.id,
          status: plan.status,
          canceledAt: plan.canceledAt?.toISOString(),
        },
      }
    }),

  recordCreated: publicProcedure
    .input(
      z.object({
        actionPlanId: z.string(),
        recordType: z.enum(['Lead', 'Case', 'Opportunity', 'Task', 'Email']),
        recordId: z.string(),
        recordUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      if (!org || !user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
      }

      const [existing] = await db
        .select({ plan: actionPlans, customer: customers })
        .from(actionPlans)
        .innerJoin(customers, eq(actionPlans.customerId, customers.id))
        .where(and(eq(actionPlans.id, input.actionPlanId), eq(customers.orgId, org.id)))
        .limit(1)

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Action plan not found' })
      }

      const previousStatus = existing.plan.status

      const [plan] = await db
        .update(actionPlans)
        .set({ status: 'completed', completedAt: now(), updatedAt: now() })
        .where(eq(actionPlans.id, input.actionPlanId))
        .returning()

      if (!plan) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Action plan not found' })
      }

      await syncBoardCardStatus(db, org.id, plan.id, 'completed')

      const auditLogId = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      await db.insert(actionPlanAuditLogs).values({
        id: auditLogId,
        actionPlanId: input.actionPlanId,
        userId: user.id,
        action: 'record_created',
        recordType: input.recordType,
        recordId: input.recordId,
        recordUrl: input.recordUrl ?? null,
        previousStatus,
        newStatus: 'completed',
        metadata: {},
      })

      if (previousStatus !== 'completed') {
        const statusChangeLogId = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
        await db.insert(actionPlanAuditLogs).values({
          id: statusChangeLogId,
          actionPlanId: input.actionPlanId,
          userId: user.id,
          action: 'status_change',
          previousStatus,
          newStatus: 'completed',
          metadata: { triggeredBy: 'record_created' },
        })
      }

      emitActionPlanChange('updated', org.id, plan.id, {
        status: plan.status,
        customerId: plan.customerId,
        recordType: input.recordType,
        recordId: input.recordId,
      })

      return {
        success: true,
        actionPlan: {
          id: plan.id,
          status: plan.status,
          completedAt: plan.completedAt?.toISOString(),
        },
      }
    }),

  getAuditLogs: publicProcedure
    .input(z.object({ actionPlanId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, org } = ctx

      if (!org) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Organization context required' })
      }

      const [existingPlan] = await db
        .select()
        .from(actionPlans)
        .innerJoin(customers, eq(actionPlans.customerId, customers.id))
        .where(and(eq(actionPlans.id, input.actionPlanId), eq(customers.orgId, org.id)))
        .limit(1)

      if (!existingPlan) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Action plan not found' })
      }

      const logs = await db
        .select()
        .from(actionPlanAuditLogs)
        .where(eq(actionPlanAuditLogs.actionPlanId, input.actionPlanId))
        .orderBy(desc(actionPlanAuditLogs.createdAt))

      const { users } = await import('../../db/schema')
      const logsWithUsers = await Promise.all(
        logs.map(async (log) => {
          let userInfo: { id: string; name: string; email: string } | null = null
          if (log.userId) {
            const [userRow] = await db
              .select()
              .from(users)
              .where(eq(users.id, log.userId))
              .limit(1)
            if (userRow) {
              userInfo = { id: userRow.id, name: userRow.name, email: userRow.email }
            }
          }

          return {
            id: log.id,
            action: log.action,
            recordType: log.recordType,
            recordId: log.recordId,
            recordUrl: log.recordUrl,
            previousStatus: log.previousStatus,
            newStatus: log.newStatus,
            metadata: log.metadata,
            user: userInfo,
            createdAt: log.createdAt.toISOString(),
          }
        })
      )

      return logsWithUsers
    }),

  assign: publicProcedure
    .input(z.object({ id: z.string(), userId: z.string().nullable() }))
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      if (!org || !user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
      }

      const [existing] = await db
        .select({ plan: actionPlans, customer: customers })
        .from(actionPlans)
        .innerJoin(customers, eq(actionPlans.customerId, customers.id))
        .where(and(eq(actionPlans.id, input.id), eq(customers.orgId, org.id)))
        .limit(1)

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Action plan not found' })
      }

      if (input.userId) {
        const { users } = await import('../../db/schema')
        const [assignedUser] = await db
          .select()
          .from(users)
          .where(and(eq(users.id, input.userId), eq(users.orgId, org.id)))
          .limit(1)

        if (!assignedUser) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
        }
      }

      const previousAssignee = existing.plan.assignedToUserId

      const [plan] = await db
        .update(actionPlans)
        .set({ assignedToUserId: input.userId ?? null, updatedAt: now() })
        .where(eq(actionPlans.id, input.id))
        .returning()

      if (!plan) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Action plan not found' })
      }

      await db
        .update(boardCards)
        .set({ assigneeUserId: input.userId ?? null, updatedAt: now() })
        .where(eq(boardCards.actionPlanId, plan.id))

      const auditLogId = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      await db.insert(actionPlanAuditLogs).values({
        id: auditLogId,
        actionPlanId: plan.id,
        userId: user.id,
        action: input.userId ? 'assigned' : 'unassigned',
        metadata: { previousAssignee, newAssignee: input.userId },
      })

      emitActionPlanChange('updated', org.id, plan.id, {
        customerId: plan.customerId,
        assignedToUserId: plan.assignedToUserId,
      })

      return {
        success: true,
        actionPlan: { id: plan.id, assignedToUserId: plan.assignedToUserId },
      }
    }),

  assignTeam: protectedProcedure
    .input(z.object({ id: z.string(), teamId: z.string().nullable() }))
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      const [planRow] = await db
        .select({ plan: actionPlans, customer: customers })
        .from(actionPlans)
        .innerJoin(customers, eq(actionPlans.customerId, customers.id))
        .where(and(eq(actionPlans.id, input.id), eq(customers.orgId, org.id)))
        .limit(1)

      if (!planRow) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Action plan not found' })
      }

      if (input.teamId) {
        const [team] = await db
          .select()
          .from(teams)
          .where(and(eq(teams.id, input.teamId), eq(teams.orgId, org.id)))
          .limit(1)
        if (!team) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' })
        }
      }

      const [plan] = await db
        .update(actionPlans)
        .set({ assigneeTeamId: input.teamId ?? null, updatedAt: now() })
        .where(eq(actionPlans.id, input.id))
        .returning()

      await db
        .update(boardCards)
        .set({ assigneeTeamId: input.teamId ?? null, updatedAt: now() })
        .where(eq(boardCards.actionPlanId, input.id))

      emitActionPlanChange('updated', org.id, input.id, {
        assigneeTeamId: plan.assigneeTeamId,
        updatedBy: user.id,
      })

      return { success: true }
    }),

  promoteToBoard: protectedProcedure
    .input(
      z.object({
        actionPlanId: z.string(),
        boardId: z.string(),
        columnId: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        assigneeTeamId: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      const [planRow] = await db
        .select({ plan: actionPlans, customer: customers })
        .from(actionPlans)
        .innerJoin(customers, eq(actionPlans.customerId, customers.id))
        .where(and(eq(actionPlans.id, input.actionPlanId), eq(customers.orgId, org.id)))
        .limit(1)

      if (!planRow) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Action plan not found' })
      }

      let teamId = input.assigneeTeamId ?? planRow.plan.assigneeTeamId ?? null
      if (teamId) {
        const [team] = await db
          .select()
          .from(teams)
          .where(and(eq(teams.id, teamId), eq(teams.orgId, org.id)))
          .limit(1)
        if (!team) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' })
        }
      }

      await ensureBoardAccess(db, org.id, input.boardId, teamId ?? undefined)

      const [column] = await db
        .select()
        .from(boardColumns)
        .where(and(eq(boardColumns.id, input.columnId), eq(boardColumns.boardId, input.boardId)))
        .limit(1)

      if (!column) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Column not found' })
      }

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(boardCards)
        .where(and(eq(boardCards.boardId, input.boardId), eq(boardCards.columnId, input.columnId)))

      const [existingCard] = await db
        .select()
        .from(boardCards)
        .where(eq(boardCards.actionPlanId, input.actionPlanId))
        .limit(1)

      const totalInColumn = Number(count ?? 0)
      const cardStatus = cardStatusForPlanStatus(planRow.plan.status)

      let position = totalInColumn
      if (existingCard && existingCard.boardId === input.boardId && existingCard.columnId === input.columnId) {
        position = existingCard.position ?? 0
      }

      let cardId: string
      if (existingCard) {
        cardId = existingCard.id
        await db
          .update(boardCards)
          .set({
            boardId: input.boardId,
            columnId: input.columnId,
            title: input.title ?? existingCard.title ?? planRow.plan.whatToDo,
            description: input.description ?? existingCard.description ?? planRow.plan.whyStrategy,
            assigneeTeamId: teamId,
            assigneeUserId: planRow.plan.assignedToUserId ?? existingCard.assigneeUserId,
            metadata: input.metadata ?? existingCard.metadata,
            status: cardStatus,
            position,
            completedAt: cardStatus === 'done' ? now() : null,
            archivedAt: cardStatus === 'archived' ? now() : null,
            updatedAt: now(),
          })
          .where(eq(boardCards.id, existingCard.id))
      } else {
        cardId = `card-${input.actionPlanId}`
        await db.insert(boardCards).values({
          id: cardId,
          boardId: input.boardId,
          columnId: input.columnId,
          actionPlanId: input.actionPlanId,
          customerId: planRow.plan.customerId,
          title: input.title ?? planRow.plan.whatToDo,
          description: input.description ?? planRow.plan.whyStrategy,
          type: 'custom',
          status: cardStatus,
          position,
          assigneeTeamId: teamId,
          assigneeUserId: planRow.plan.assignedToUserId ?? null,
          metadata: input.metadata ?? { promotedBy: user.id },
          completedAt: cardStatus === 'done' ? now() : null,
          archivedAt: cardStatus === 'archived' ? now() : null,
        })
      }

      await db
        .update(actionPlans)
        .set({
          assigneeTeamId: teamId,
          routingMetadata: {
            ...(planRow.plan.routingMetadata ?? {}),
            lastPromotedAt: now().toISOString(),
            lastPromotedBy: user.id,
            lastBoardId: input.boardId,
            lastColumnId: input.columnId,
          },
          updatedAt: now(),
        })
        .where(eq(actionPlans.id, input.actionPlanId))

      emitBoardCardChange(existingCard ? 'updated' : 'created', org.id, cardId, {
        boardId: input.boardId,
        columnId: input.columnId,
        actionPlanId: input.actionPlanId,
      })

      emitActionPlanChange('updated', org.id, input.actionPlanId, {
        assigneeTeamId: teamId,
        promotedTo: { boardId: input.boardId, columnId: input.columnId },
      })

      const card = await loadBoardCard(db, org.id, input.actionPlanId)

      return {
        success: true,
        boardCard: card,
      }
    }),
})
