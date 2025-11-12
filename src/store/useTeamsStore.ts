import { create } from 'zustand'
import { trpcVanillaClient } from '../lib/trpc-client'

export interface TeamSummary {
  id: string
  name: string
  description: string | null
  status: 'active' | 'archived'
  slug?: string | null
  isDefault: boolean
  isAssignable: boolean
  memberCount: number
  boardCount: number
  isMember: boolean
  createdAt: string
  updatedAt: string
}

export interface TeamMemberSummary {
  membershipId: string
  userId: string
  name: string
  email: string
  role: 'owner' | 'member' | 'viewer'
}

export interface TeamBoardPermission {
  permissionId: string
  boardId: string
  boardName: string
  mode: 'edit' | 'view'
}

export interface TeamDetail {
  team: TeamSummary
  members: TeamMemberSummary[]
  boards: TeamBoardPermission[]
}

interface TeamsState {
  teams: TeamSummary[]
  teamsLoading: boolean
  teamsError: Error | null

  selectedTeam: TeamDetail | null
  teamLoading: boolean
  teamError: Error | null

  fetchTeams: () => Promise<void>
  fetchTeam: (id: string) => Promise<void>
  createTeam: (input: {
    name: string
    description?: string
    isDefault?: boolean
    isAssignable?: boolean
  }) => Promise<string>
  updateTeam: (input: {
    id: string
    name?: string
    description?: string | null
    status?: 'active' | 'archived'
    isAssignable?: boolean
    isDefault?: boolean
  }) => Promise<void>
  deleteTeam: (id: string) => Promise<void>
  addMember: (input: { teamId: string; userId: string; role?: 'owner' | 'member' | 'viewer' }) => Promise<void>
  removeMember: (teamId: string, userId: string) => Promise<void>
}

export const useTeamsStore = create<TeamsState>((set, get) => ({
  teams: [],
  teamsLoading: false,
  teamsError: null,

  selectedTeam: null,
  teamLoading: false,
  teamError: null,

  fetchTeams: async () => {
    set({ teamsLoading: true, teamsError: null })
    try {
      const result = await trpcVanillaClient.teams.list.query()
      set({ teams: result, teamsLoading: false })
    } catch (error) {
      set({
        teamsError: error instanceof Error ? error : new Error('Failed to load teams'),
        teamsLoading: false,
      })
    }
  },

  fetchTeam: async (id) => {
    set({ teamLoading: true, teamError: null })
    try {
      const result = await trpcVanillaClient.teams.detail.query({ id })
      set({ selectedTeam: result, teamLoading: false })
    } catch (error) {
      set({
        teamError: error instanceof Error ? error : new Error('Failed to load team'),
        teamLoading: false,
      })
    }
  },

  createTeam: async (input) => {
    const result = await trpcVanillaClient.teams.create.mutate(input)
    await get().fetchTeams()
    return result.teamId
  },

  updateTeam: async (input) => {
    await trpcVanillaClient.teams.update.mutate(input)
    await Promise.all([get().fetchTeams(), get().fetchTeam(input.id)])
  },

  deleteTeam: async (id) => {
    await trpcVanillaClient.teams.delete.mutate({ id })
    set((state) => ({
      teams: state.teams.filter((team) => team.id !== id),
      selectedTeam: state.selectedTeam?.team.id === id ? null : state.selectedTeam,
    }))
  },

  addMember: async ({ teamId, userId, role }) => {
    await trpcVanillaClient.teams.addMember.mutate({ teamId, userId, role })
    await get().fetchTeam(teamId)
  },

  removeMember: async (teamId, userId) => {
    await trpcVanillaClient.teams.removeMember.mutate({ teamId, userId })
    await get().fetchTeam(teamId)
  },
}))
