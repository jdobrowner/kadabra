import { z } from 'zod'
import { router, protectedProcedure, TRPCError } from '../trpc'
import { routingRules, teams, boards, boardColumns } from '../../db/schema'
import type { Database } from '../../db'
import { eq, and, inArray, asc } from 'drizzle-orm'
import { emitRoutingRuleChange } from '../../services/events'
import { isAdmin } from '../utils/auth'

async function requireAdmin(db: Database, orgId: string, userId: string) {
  if (!(await isAdmin(db, userId, orgId))) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Administrator rights required' })
  }
}

const routingConditionEnum = z.enum(['badge', 'intent', 'urgency', 'customer_segment', 'channel', 'custom'])
const channelEnum = z.enum(['phone', 'email', 'chat', 'video', 'sms', 'ai-call', 'voice-message']).nullable()

export const routingRulesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { db, org } = ctx

    const rules = await db
      .select({
        rule: routingRules,
        team: teams,
        board: boards,
        column: boardColumns,
      })
      .from(routingRules)
      .leftJoin(teams, eq(routingRules.targetTeamId, teams.id))
      .leftJoin(boards, eq(routingRules.targetBoardId, boards.id))
      .leftJoin(boardColumns, eq(routingRules.targetColumnId, boardColumns.id))
      .where(eq(routingRules.orgId, org.id))
      .orderBy(asc(routingRules.priority), asc(routingRules.createdAt))

    return rules.map(({ rule, team, board, column }) => ({
      id: rule.id,
      name: rule.name,
      channel: rule.channel,
      conditionType: rule.conditionType,
      conditionValue: rule.conditionValue,
      targetTeam: team
        ? {
            id: team.id,
            name: team.name,
          }
        : null,
      targetBoard: board
        ? {
            id: board.id,
            name: board.name,
          }
        : null,
      targetColumn: column
        ? {
            id: column.id,
            name: column.name,
          }
        : null,
      priority: rule.priority,
      enabled: rule.enabled,
      metadata: rule.metadata ?? null,
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString(),
    }))
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        channel: channelEnum.optional(),
        conditionType: routingConditionEnum,
        conditionValue: z.string().nullable().optional(),
        targetTeamId: z.string(),
        targetBoardId: z.string().nullable().optional(),
        targetColumnId: z.string().nullable().optional(),
        priority: z.number().int().min(0).optional(),
        enabled: z.boolean().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      await requireAdmin(db, org.id, user.id)

      const [team] = await db
        .select()
        .from(teams)
        .where(and(eq(teams.id, input.targetTeamId), eq(teams.orgId, org.id)))
        .limit(1)

      if (!team) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Target team not found' })
      }

      if (input.targetBoardId) {
        const [board] = await db
          .select()
          .from(boards)
          .where(and(eq(boards.id, input.targetBoardId), eq(boards.orgId, org.id)))
          .limit(1)
        if (!board) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Target board not found' })
        }
      }

      if (input.targetColumnId) {
        const [column] = await db
          .select()
          .from(boardColumns)
          .where(eq(boardColumns.id, input.targetColumnId))
          .limit(1)
        if (!column) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Target column not found' })
        }
      }

      const id = `route-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

      await db.insert(routingRules).values({
        id,
        orgId: org.id,
        name: input.name,
        channel: input.channel ?? null,
        conditionType: input.conditionType,
        conditionValue: input.conditionValue ?? null,
        targetTeamId: input.targetTeamId,
        targetBoardId: input.targetBoardId ?? null,
        targetColumnId: input.targetColumnId ?? null,
        priority: input.priority ?? 100,
        enabled: input.enabled ?? true,
        metadata: input.metadata ?? null,
      })

      emitRoutingRuleChange('created', org.id, id, { name: input.name })

      return { success: true, ruleId: id }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        channel: channelEnum.optional(),
        conditionType: routingConditionEnum.optional(),
        conditionValue: z.string().nullable().optional(),
        targetTeamId: z.string().optional(),
        targetBoardId: z.string().nullable().optional(),
        targetColumnId: z.string().nullable().optional(),
        priority: z.number().int().min(0).optional(),
        enabled: z.boolean().optional(),
        metadata: z.record(z.string(), z.unknown()).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      await requireAdmin(db, org.id, user.id)

      const [rule] = await db
        .select()
        .from(routingRules)
        .where(and(eq(routingRules.id, input.id), eq(routingRules.orgId, org.id)))
        .limit(1)

      if (!rule) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Routing rule not found' })
      }

      if (input.targetTeamId) {
        const [team] = await db
          .select()
          .from(teams)
          .where(and(eq(teams.id, input.targetTeamId), eq(teams.orgId, org.id)))
          .limit(1)
        if (!team) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Target team not found' })
        }
      }

      if (input.targetBoardId) {
        const [board] = await db
          .select()
          .from(boards)
          .where(and(eq(boards.id, input.targetBoardId), eq(boards.orgId, org.id)))
          .limit(1)
        if (!board) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Target board not found' })
        }
      }

      if (input.targetColumnId) {
        const [column] = await db
          .select()
          .from(boardColumns)
          .where(eq(boardColumns.id, input.targetColumnId))
          .limit(1)
        if (!column) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Target column not found' })
        }
      }

      await db
        .update(routingRules)
        .set({
          name: input.name ?? rule.name,
          channel: input.channel === undefined ? rule.channel : input.channel,
          conditionType: input.conditionType ?? rule.conditionType,
          conditionValue: input.conditionValue === undefined ? rule.conditionValue : input.conditionValue,
          targetTeamId: input.targetTeamId ?? rule.targetTeamId,
          targetBoardId: input.targetBoardId === undefined ? rule.targetBoardId : input.targetBoardId,
          targetColumnId: input.targetColumnId === undefined ? rule.targetColumnId : input.targetColumnId,
          priority: input.priority ?? rule.priority,
          enabled: input.enabled ?? rule.enabled,
          metadata: input.metadata === undefined ? rule.metadata : input.metadata,
          updatedAt: new Date(),
        })
        .where(eq(routingRules.id, rule.id))

      emitRoutingRuleChange('updated', org.id, rule.id, { name: input.name ?? rule.name })

      return { success: true }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      await requireAdmin(db, org.id, user.id)

      const [existing] = await db
        .select()
        .from(routingRules)
        .where(and(eq(routingRules.id, input.id), eq(routingRules.orgId, org.id)))
        .limit(1)

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Routing rule not found' })
      }

      await db.delete(routingRules).where(and(eq(routingRules.id, input.id), eq(routingRules.orgId, org.id)))

      emitRoutingRuleChange('deleted', org.id, input.id)

      return { success: true }
    }),

  reorder: protectedProcedure
    .input(z.object({ ruleIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      await requireAdmin(db, org.id, user.id)

      if (input.ruleIds.length === 0) {
        return { success: true }
      }

      const rules = await db
        .select({ id: routingRules.id })
        .from(routingRules)
        .where(and(eq(routingRules.orgId, org.id), inArray(routingRules.id, input.ruleIds)))

      const existingIds = new Set(rules.map((rule) => rule.id))
      const updates = input.ruleIds.filter((id) => existingIds.has(id))

      await Promise.all(
        updates.map((id, index) =>
          db
            .update(routingRules)
            .set({ priority: index * 10, updatedAt: new Date() })
            .where(and(eq(routingRules.id, id), eq(routingRules.orgId, org.id)))
        )
      )

      return { success: true }
    }),
})
