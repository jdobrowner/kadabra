import { z } from 'zod'
import { router, protectedProcedure, TRPCError } from '../trpc'
import { teams, teamMembers, users, boardTeamPermissions, boards } from '../../db/schema'
import type { Database } from '../../db'
import { eq, and, inArray, asc, sql } from 'drizzle-orm'
import { isAdmin } from '../utils/auth'
import { emitTeamChange } from '../../services/events'

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)

async function ensureAdmin(db: Database, orgId: string, userId: string) {
  if (!(await isAdmin(db, userId, orgId))) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin privileges required' })
  }
}

export const teamsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const { db, org, user } = ctx

    const teamRows = await db
      .select()
      .from(teams)
      .where(eq(teams.orgId, org.id))
      .orderBy(asc(teams.name))

    if (teamRows.length === 0) {
      return []
    }

    const teamIds = teamRows.map((team) => team.id)

    const [memberCounts, userMemberships, boardCounts] = await Promise.all([
      db
        .select({ teamId: teamMembers.teamId, count: sql<number>`count(*)` })
        .from(teamMembers)
        .where(inArray(teamMembers.teamId, teamIds))
        .groupBy(teamMembers.teamId),
      db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(and(eq(teamMembers.userId, user.id), inArray(teamMembers.teamId, teamIds))),
      db
        .select({ teamId: boardTeamPermissions.teamId, count: sql<number>`count(*)` })
        .from(boardTeamPermissions)
        .where(inArray(boardTeamPermissions.teamId, teamIds))
        .groupBy(boardTeamPermissions.teamId),
    ])

    const membersByTeam = new Map(memberCounts.map((row) => [row.teamId, Number(row.count ?? 0)]))
    const userTeams = new Set(userMemberships.map((row) => row.teamId))
    const boardCountByTeam = new Map(boardCounts.map((row) => [row.teamId, Number(row.count ?? 0)]))

    return teamRows.map((team) => ({
      id: team.id,
      name: team.name,
      description: team.description,
      status: team.status,
      slug: team.slug,
      isDefault: team.isDefault,
      isAssignable: team.isAssignable,
      memberCount: membersByTeam.get(team.id) ?? 0,
      boardCount: boardCountByTeam.get(team.id) ?? 0,
      isMember: userTeams.has(team.id),
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
    }))
  }),

  detail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, org } = ctx

      const [team] = await db
        .select()
        .from(teams)
        .where(and(eq(teams.id, input.id), eq(teams.orgId, org.id)))
        .limit(1)

      if (!team) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' })
      }

      const [members, boardPermissions] = await Promise.all([
        db
          .select({
            membershipId: teamMembers.id,
            userId: users.id,
            name: users.name,
            email: users.email,
            role: teamMembers.role,
          })
          .from(teamMembers)
          .innerJoin(users, eq(teamMembers.userId, users.id))
          .where(eq(teamMembers.teamId, team.id)),
        db
          .select({
            permissionId: boardTeamPermissions.id,
            boardId: boards.id,
            boardName: boards.name,
            mode: boardTeamPermissions.mode,
          })
          .from(boardTeamPermissions)
          .innerJoin(boards, and(eq(boardTeamPermissions.boardId, boards.id), eq(boards.orgId, org.id)))
          .where(eq(boardTeamPermissions.teamId, team.id)),
      ])

      const { user } = ctx
      const userTeams = new Set(
        (
          await db
            .select({ teamId: teamMembers.teamId })
            .from(teamMembers)
            .where(eq(teamMembers.userId, user.id))
        ).map((row) => row.teamId)
      )

      return {
        team: {
          id: team.id,
          name: team.name,
          description: team.description,
          slug: team.slug,
          status: team.status,
          isDefault: team.isDefault,
          isAssignable: team.isAssignable,
          memberCount: members.length,
          boardCount: boardPermissions.length,
          isMember: userTeams.has(team.id),
          createdAt: team.createdAt.toISOString(),
          updatedAt: team.updatedAt.toISOString(),
        },
        members: members.map((member) => ({
          membershipId: member.membershipId,
          userId: member.userId,
          name: member.name,
          email: member.email,
          role: member.role,
        })),
        boards: boardPermissions.map((permission) => ({
          permissionId: permission.permissionId,
          boardId: permission.boardId,
          boardName: permission.boardName,
          mode: permission.mode,
        })),
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        description: z.string().optional(),
        isDefault: z.boolean().optional(),
        isAssignable: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      await ensureAdmin(db, org.id, user.id)

      const id = `team-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      await db.insert(teams).values({
        id,
        orgId: org.id,
        name: input.name,
        description: input.description ?? null,
        slug: toSlug(input.name),
        isDefault: input.isDefault ?? false,
        isAssignable: input.isAssignable ?? true,
      })

      emitTeamChange('created', org.id, id, { name: input.name })

      return { success: true, teamId: id }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        description: z.string().nullable().optional(),
        status: z.enum(['active', 'archived']).optional(),
        isAssignable: z.boolean().optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      await ensureAdmin(db, org.id, user.id)

      const [team] = await db
        .select()
        .from(teams)
        .where(and(eq(teams.id, input.id), eq(teams.orgId, org.id)))
        .limit(1)

      if (!team) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' })
      }

      const updates: Partial<typeof team> = {
        name: input.name ?? team.name,
        description: input.description === undefined ? team.description : input.description,
        status: input.status ?? team.status,
        isAssignable: input.isAssignable ?? team.isAssignable,
        isDefault: input.isDefault ?? team.isDefault,
        slug: input.name ? toSlug(input.name) : team.slug,
      }

      await db
        .update(teams)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(teams.id, team.id))

      emitTeamChange('updated', org.id, team.id, { name: updates.name })

      return { success: true }
    }),

  addMember: protectedProcedure
    .input(z.object({ teamId: z.string(), userId: z.string(), role: z.enum(['owner', 'member', 'viewer']).optional() }))
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      await ensureAdmin(db, org.id, user.id)

      const [team] = await db
        .select()
        .from(teams)
        .where(and(eq(teams.id, input.teamId), eq(teams.orgId, org.id)))
        .limit(1)

      if (!team) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' })
      }

      const [memberUser] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, input.userId), eq(users.orgId, org.id)))
        .limit(1)

      if (!memberUser) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
      }

      const [existing] = await db
        .select()
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, input.userId)))
        .limit(1)

      if (existing) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'User is already a member of this team' })
      }

      await db.insert(teamMembers).values({
        id: `team-member-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        teamId: team.id,
        userId: input.userId,
        role: input.role ?? 'member',
      })

      emitTeamChange('updated', org.id, team.id, { memberAdded: input.userId })

      return { success: true }
    }),

  removeMember: protectedProcedure
    .input(z.object({ teamId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      await ensureAdmin(db, org.id, user.id)

      const [existing] = await db
        .select()
        .from(teamMembers)
        .where(and(eq(teamMembers.teamId, input.teamId), eq(teamMembers.userId, input.userId)))
        .limit(1)

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Membership not found' })
      }

      await db
        .delete(teamMembers)
        .where(and(eq(teamMembers.teamId, input.teamId), eq(teamMembers.userId, input.userId)))

      emitTeamChange('updated', org.id, input.teamId, { memberRemoved: input.userId })

      return { success: true }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      await ensureAdmin(db, org.id, user.id)

      const [existing] = await db
        .select()
        .from(teams)
        .where(and(eq(teams.id, input.id), eq(teams.orgId, org.id)))
        .limit(1)

      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Team not found' })
      }

      await db.delete(teams).where(and(eq(teams.id, input.id), eq(teams.orgId, org.id)))

      emitTeamChange('deleted', org.id, input.id)

      return { success: true }
    }),
})
