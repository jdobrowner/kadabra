import { z } from 'zod'
import { router, protectedProcedure, TRPCError } from '../trpc'
import {
  boards,
  boardColumns,
  boardCards,
  boardTeamPermissions,
  teams,
  teamMembers,
  actionPlans,
} from '../../db/schema'
import type { Database } from '../../db'
import { eq, and, inArray, asc } from 'drizzle-orm'
import { emitBoardChange, emitBoardCardChange } from '../../services/events'
import { isAdmin } from '../utils/auth'

const boardVisibilityEnum = z.enum(['org', 'team'])
const boardCardTypeEnum = z.enum(['lead', 'case', 'deal', 'task', 'custom'])
const boardPermissionModeEnum = z.enum(['edit', 'view'])

const defaultColumns = [
  { name: 'Backlog', position: 0 },
  { name: 'In Progress', position: 1 },
  { name: 'Done', position: 2 },
]

async function requireAdmin(db: Database, orgId: string, userId: string) {
  if (!(await isAdmin(db, userId, orgId))) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Administrator rights required' })
  }
}

async function ensureBoardAccess(db: Database, orgId: string, userId: string, boardId: string) {
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

  const userTeamIds = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId))

  const teamIdSet = new Set(userTeamIds.map((row) => row.teamId))

  if (board.defaultTeamId && teamIdSet.has(board.defaultTeamId)) {
    return board
  }

  if (teamIdSet.size === 0) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'No team access to this board' })
  }

  const [permission] = await db
    .select()
    .from(boardTeamPermissions)
    .where(and(eq(boardTeamPermissions.boardId, board.id), inArray(boardTeamPermissions.teamId, Array.from(teamIdSet))))
    .limit(1)

  if (!permission) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'No team access to this board' })
  }

  return board
}

export const boardsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { db, org, user } = ctx

    const boardRows = await db
      .select()
      .from(boards)
      .where(eq(boards.orgId, org.id))
      .orderBy(asc(boards.name))

    if (boardRows.length === 0) {
      return []
    }

    const boardIds = boardRows.map((board) => board.id)

    const userTeamMemberships = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))

    const userTeamIds = new Set(userTeamMemberships.map((row) => row.teamId))

    const boardPerms = await db
      .select({
        boardId: boardTeamPermissions.boardId,
        teamId: boardTeamPermissions.teamId,
        mode: boardTeamPermissions.mode,
      })
      .from(boardTeamPermissions)
      .where(inArray(boardTeamPermissions.boardId, boardIds))

    const permsByBoard = new Map<string, typeof boardPerms>()
    boardPerms.forEach((perm) => {
      if (!permsByBoard.has(perm.boardId)) {
        permsByBoard.set(perm.boardId, [])
      }
      permsByBoard.get(perm.boardId)!.push(perm)
    })

    return boardRows.map((board) => {
      const permissions = permsByBoard.get(board.id) ?? []
      const hasTeamAccess =
        board.visibility === 'org' ||
        (board.defaultTeamId && userTeamIds.has(board.defaultTeamId)) ||
        permissions.some((perm) => userTeamIds.has(perm.teamId))

      return {
        id: board.id,
        name: board.name,
        description: board.description,
        visibility: board.visibility,
        cardType: board.cardType,
        defaultTeamId: board.defaultTeamId,
        isEditable: hasTeamAccess,
        createdAt: board.createdAt.toISOString(),
        updatedAt: board.updatedAt.toISOString(),
        permissions: permissions.map((perm) => ({ teamId: perm.teamId, mode: perm.mode })),
      }
    })
  }),

  detail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      const board = await ensureBoardAccess(db, org.id, user.id, input.id)

      const [columns, cards, permissions] = await Promise.all([
        db
          .select()
          .from(boardColumns)
          .where(eq(boardColumns.boardId, board.id))
          .orderBy(asc(boardColumns.position)),
        db
          .select()
          .from(boardCards)
          .where(eq(boardCards.boardId, board.id))
          .orderBy(asc(boardCards.position)),
        db
          .select({
            id: boardTeamPermissions.id,
            teamId: boardTeamPermissions.teamId,
            mode: boardTeamPermissions.mode,
          })
          .from(boardTeamPermissions)
          .where(eq(boardTeamPermissions.boardId, board.id)),
      ])

      const userTeamMemberships = await db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, user.id))

      const userTeamIds = new Set(userTeamMemberships.map((row) => row.teamId))

      const hasTeamAccess =
        board.visibility === 'org' ||
        (board.defaultTeamId && userTeamIds.has(board.defaultTeamId)) ||
        permissions.some((perm) => userTeamIds.has(perm.teamId))

      return {
        board: {
          id: board.id,
          name: board.name,
          description: board.description,
          visibility: board.visibility,
          cardType: board.cardType,
          defaultTeamId: board.defaultTeamId,
          isEditable: hasTeamAccess,
          permissions: permissions.map((perm) => ({ teamId: perm.teamId, mode: perm.mode })),
          createdAt: board.createdAt.toISOString(),
          updatedAt: board.updatedAt.toISOString(),
        },
        columns: columns.map((column) => ({
          id: column.id,
          name: column.name,
          position: column.position,
          wipLimit: column.wipLimit,
          createdAt: column.createdAt.toISOString(),
          updatedAt: column.updatedAt.toISOString(),
        })),
        cards: cards.map((card) => ({
          id: card.id,
          actionPlanId: card.actionPlanId,
          customerId: card.customerId,
          columnId: card.columnId,
          title: card.title,
          description: card.description,
          type: card.type,
          status: card.status,
          position: card.position,
          dueDate: card.dueDate?.toISOString() ?? null,
          assigneeUserId: card.assigneeUserId,
          assigneeTeamId: card.assigneeTeamId,
          metadata: card.metadata ?? null,
          createdAt: card.createdAt.toISOString(),
          updatedAt: card.updatedAt.toISOString(),
        })),
        permissions: permissions.map((perm) => ({ id: perm.id, teamId: perm.teamId, mode: perm.mode })),
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        description: z.string().optional(),
        visibility: boardVisibilityEnum,
        cardType: boardCardTypeEnum,
        defaultTeamId: z.string().nullable().optional(),
        initialColumns: z.array(z.object({ name: z.string().min(1) })).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      await requireAdmin(db, org.id, user.id)

      if (input.defaultTeamId) {
        const [team] = await db
          .select()
          .from(teams)
          .where(and(eq(teams.id, input.defaultTeamId), eq(teams.orgId, org.id)))
          .limit(1)
        if (!team) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Default team not found' })
        }
      }

      const id = `board-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      await db.insert(boards).values({
        id,
        orgId: org.id,
        name: input.name,
        description: input.description ?? null,
        visibility: input.visibility,
        cardType: input.cardType,
        defaultTeamId: input.defaultTeamId ?? null,
      })

      const columns = input.initialColumns?.length ? input.initialColumns : defaultColumns
      await Promise.all(
        columns.map((column, index) =>
          db.insert(boardColumns).values({
            id: `board-col-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
            boardId: id,
            name: column.name,
            position: (column as { name: string; position?: number }).position ?? index,
          })
        )
      )

      emitBoardChange('created', org.id, id, { name: input.name })

      return { success: true, boardId: id }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        description: z.string().nullable().optional(),
        visibility: boardVisibilityEnum.optional(),
        cardType: boardCardTypeEnum.optional(),
        defaultTeamId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      await requireAdmin(db, org.id, user.id)

      const [board] = await db
        .select()
        .from(boards)
        .where(and(eq(boards.id, input.id), eq(boards.orgId, org.id)))
        .limit(1)

      if (!board) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Board not found' })
      }

      if (input.defaultTeamId) {
        const [team] = await db
          .select()
          .from(teams)
          .where(and(eq(teams.id, input.defaultTeamId), eq(teams.orgId, org.id)))
          .limit(1)
        if (!team) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Default team not found' })
        }
      }

      await db
        .update(boards)
        .set({
          name: input.name ?? board.name,
          description: input.description === undefined ? board.description : input.description,
          visibility: input.visibility ?? board.visibility,
          cardType: input.cardType ?? board.cardType,
          defaultTeamId: input.defaultTeamId === undefined ? board.defaultTeamId : input.defaultTeamId,
          updatedAt: new Date(),
        })
        .where(eq(boards.id, input.id))

      emitBoardChange('updated', org.id, board.id, { name: input.name ?? board.name })

      return { success: true }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      await requireAdmin(db, org.id, user.id)

      const [existing] = await db
        .select()
        .from(boards)
        .where(and(eq(boards.id, input.id), eq(boards.orgId, org.id)))
        .limit(1)

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Board not found' })
      }

      await db.delete(boards).where(and(eq(boards.id, input.id), eq(boards.orgId, org.id)))

      emitBoardChange('deleted', org.id, input.id)

      return { success: true }
    }),

  createColumn: protectedProcedure
    .input(z.object({ boardId: z.string(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      await requireAdmin(db, org.id, user.id)
      const [board] = await db
        .select()
        .from(boards)
        .where(and(eq(boards.id, input.boardId), eq(boards.orgId, org.id)))
        .limit(1)

      if (!board) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Board not found' })
      }

      const [{ count }] = await db
        .select({ count: boardColumns.id })
        .from(boardColumns)
        .where(eq(boardColumns.boardId, input.boardId))

      const position = Number(count ?? 0)

      const id = `board-col-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      await db.insert(boardColumns).values({
        id,
        boardId: input.boardId,
        name: input.name,
        position,
      })

      emitBoardChange('updated', org.id, board.id, { columnAdded: id })

      return { success: true, columnId: id }
    }),

  updateColumn: protectedProcedure
    .input(
      z.object({
        columnId: z.string(),
        name: z.string().min(1).optional(),
        wipLimit: z.number().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      await requireAdmin(db, org.id, user.id)

      const [column] = await db
        .select({ column: boardColumns, board: boards })
        .from(boardColumns)
        .innerJoin(boards, eq(boardColumns.boardId, boards.id))
        .where(and(eq(boardColumns.id, input.columnId), eq(boards.orgId, org.id)))
        .limit(1)

      if (!column) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Column not found' })
      }

      await db
        .update(boardColumns)
        .set({
          name: input.name ?? column.column.name,
          wipLimit: input.wipLimit === undefined ? column.column.wipLimit : input.wipLimit,
          updatedAt: new Date(),
        })
        .where(eq(boardColumns.id, input.columnId))

      emitBoardChange('updated', org.id, column.board.id, { columnUpdated: input.columnId })

      return { success: true }
    }),

  reorderColumns: protectedProcedure
    .input(z.object({ boardId: z.string(), columnOrder: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      await requireAdmin(db, org.id, user.id)

      const [board] = await db
        .select()
        .from(boards)
        .where(and(eq(boards.id, input.boardId), eq(boards.orgId, org.id)))
        .limit(1)

      if (!board) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Board not found' })
      }

      await Promise.all(
        input.columnOrder.map((columnId, index) =>
          db
            .update(boardColumns)
            .set({ position: index, updatedAt: new Date() })
            .where(and(eq(boardColumns.id, columnId), eq(boardColumns.boardId, board.id)))
        )
      )

      emitBoardChange('updated', org.id, board.id, { columnsReordered: true })

      return { success: true }
    }),

  deleteColumn: protectedProcedure
    .input(z.object({ columnId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      await requireAdmin(db, org.id, user.id)

      const [column] = await db
        .select({ column: boardColumns, board: boards })
        .from(boardColumns)
        .innerJoin(boards, eq(boardColumns.boardId, boards.id))
        .where(and(eq(boardColumns.id, input.columnId), eq(boards.orgId, org.id)))
        .limit(1)

      if (!column) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Column not found' })
      }

      await db.delete(boardColumns).where(eq(boardColumns.id, input.columnId))

      const remainingColumns = await db
        .select()
        .from(boardColumns)
        .where(eq(boardColumns.boardId, column.board.id))
        .orderBy(asc(boardColumns.position))

      await Promise.all(
        remainingColumns.map((col, index) =>
          db
            .update(boardColumns)
            .set({ position: index, updatedAt: new Date() })
            .where(eq(boardColumns.id, col.id))
        )
      )

      emitBoardChange('updated', org.id, column.board.id, { columnDeleted: input.columnId })

      return { success: true }
    }),

  addPermission: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        teamId: z.string(),
        mode: boardPermissionModeEnum,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      await requireAdmin(db, org.id, user.id)

      const [board] = await db
        .select()
        .from(boards)
        .where(and(eq(boards.id, input.boardId), eq(boards.orgId, org.id)))
        .limit(1)

      if (!board) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Board not found' })
      }

      const [team] = await db
        .select()
        .from(teams)
        .where(and(eq(teams.id, input.teamId), eq(teams.orgId, org.id)))
        .limit(1)

      if (!team) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' })
      }

      const [existing] = await db
        .select()
        .from(boardTeamPermissions)
        .where(and(eq(boardTeamPermissions.boardId, board.id), eq(boardTeamPermissions.teamId, team.id)))
        .limit(1)

      if (existing) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Team already has access to this board' })
      }

      const permissionId = `board-perm-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      await db.insert(boardTeamPermissions).values({
        id: permissionId,
        boardId: board.id,
        teamId: team.id,
        mode: input.mode,
      })

      emitBoardChange('updated', org.id, board.id, { permissionAdded: permissionId })

      return { success: true, permissionId }
    }),

  removePermission: protectedProcedure
    .input(z.object({ permissionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      await requireAdmin(db, org.id, user.id)

      const [permission] = await db
        .select({ permission: boardTeamPermissions, board: boards })
        .from(boardTeamPermissions)
        .innerJoin(boards, eq(boardTeamPermissions.boardId, boards.id))
        .where(and(eq(boardTeamPermissions.id, input.permissionId), eq(boards.orgId, org.id)))
        .limit(1)

      if (!permission) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Permission not found' })
      }

      await db.delete(boardTeamPermissions).where(eq(boardTeamPermissions.id, input.permissionId))

      emitBoardChange('updated', org.id, permission.board.id, { permissionRemoved: input.permissionId })

      return { success: true }
    }),

  createCard: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        columnId: z.string(),
        title: z.string().min(1),
        description: z.string().optional(),
        status: z.enum(['active', 'done', 'archived']).optional(),
        type: boardCardTypeEnum.optional(),
        assigneeTeamId: z.string().optional(),
        assigneeUserId: z.string().optional(),
        actionPlanId: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      await requireAdmin(db, org.id, user.id)

      const [column] = await db
        .select({ column: boardColumns, board: boards })
        .from(boardColumns)
        .innerJoin(boards, eq(boardColumns.boardId, boards.id))
        .where(and(eq(boardColumns.id, input.columnId), eq(boards.orgId, org.id)))
        .limit(1)

      if (!column) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Column not found' })
      }

      if (input.actionPlanId) {
        const [plan] = await db
          .select()
          .from(actionPlans)
          .where(eq(actionPlans.id, input.actionPlanId))
          .limit(1)
        if (!plan) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Action plan not found' })
        }
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

      const [{ count }] = await db
        .select({ count: boardCards.id })
        .from(boardCards)
        .where(and(eq(boardCards.boardId, column.board.id), eq(boardCards.columnId, input.columnId)))

      const position = Number(count ?? 0)
      const id = `board-card-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

      await db.insert(boardCards).values({
        id,
        boardId: column.board.id,
        columnId: input.columnId,
        title: input.title,
        description: input.description ?? null,
        status: input.status ?? 'active',
        type: input.type ?? 'custom',
        position,
        assigneeTeamId: input.assigneeTeamId ?? null,
        assigneeUserId: input.assigneeUserId ?? null,
        actionPlanId: input.actionPlanId ?? null,
        metadata: input.metadata ?? null,
      })

      emitBoardCardChange('created', org.id, id, { boardId: column.board.id, columnId: input.columnId })

      return { success: true, cardId: id }
    }),

  updateCard: protectedProcedure
    .input(
      z.object({
        cardId: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().nullable().optional(),
        status: z.enum(['active', 'done', 'archived']).optional(),
        type: boardCardTypeEnum.optional(),
        assigneeTeamId: z.string().nullable().optional(),
        assigneeUserId: z.string().nullable().optional(),
        metadata: z.record(z.string(), z.unknown()).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      await requireAdmin(db, org.id, user.id)

      const [card] = await db
        .select({ card: boardCards, board: boards })
        .from(boardCards)
        .innerJoin(boards, eq(boardCards.boardId, boards.id))
        .where(and(eq(boardCards.id, input.cardId), eq(boards.orgId, org.id)))
        .limit(1)

      if (!card) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Card not found' })
      }

      await db
        .update(boardCards)
        .set({
          title: input.title ?? card.card.title,
          description: input.description === undefined ? card.card.description : input.description,
          status: input.status ?? card.card.status,
          type: input.type ?? card.card.type,
          assigneeTeamId: input.assigneeTeamId === undefined ? card.card.assigneeTeamId : input.assigneeTeamId,
          assigneeUserId: input.assigneeUserId === undefined ? card.card.assigneeUserId : input.assigneeUserId,
          metadata: input.metadata === undefined ? card.card.metadata : input.metadata,
          updatedAt: new Date(),
        })
        .where(eq(boardCards.id, input.cardId))

      emitBoardCardChange('updated', org.id, card.card.id, { boardId: card.board.id })

      return { success: true }
    }),

  moveCard: protectedProcedure
    .input(z.object({ cardId: z.string(), columnId: z.string(), position: z.number().int().min(0) }))
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      await requireAdmin(db, org.id, user.id)

      const [card] = await db
        .select({ card: boardCards, board: boards })
        .from(boardCards)
        .innerJoin(boards, eq(boardCards.boardId, boards.id))
        .where(and(eq(boardCards.id, input.cardId), eq(boards.orgId, org.id)))
        .limit(1)

      if (!card) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Card not found' })
      }

      const [targetColumn] = await db
        .select()
        .from(boardColumns)
        .where(and(eq(boardColumns.id, input.columnId), eq(boardColumns.boardId, card.board.id)))
        .limit(1)

      if (!targetColumn) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Target column not found' })
      }

      await db
        .update(boardCards)
        .set({
          columnId: input.columnId,
          position: input.position,
          updatedAt: new Date(),
        })
        .where(eq(boardCards.id, card.card.id))

      emitBoardCardChange('updated', org.id, card.card.id, {
        boardId: card.board.id,
        columnId: input.columnId,
        position: input.position,
      })

      return { success: true }
    }),

  deleteCard: protectedProcedure
    .input(z.object({ cardId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      await requireAdmin(db, org.id, user.id)

      const [card] = await db
        .select({ card: boardCards, board: boards })
        .from(boardCards)
        .innerJoin(boards, eq(boardCards.boardId, boards.id))
        .where(and(eq(boardCards.id, input.cardId), eq(boards.orgId, org.id)))
        .limit(1)

      if (!card) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Card not found' })
      }

      await db.delete(boardCards).where(eq(boardCards.id, card.card.id))

      emitBoardCardChange('deleted', org.id, card.card.id, { boardId: card.board.id })

      return { success: true }
    }),
})
