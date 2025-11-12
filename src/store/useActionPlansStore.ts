import { create } from 'zustand'
import { trpcVanillaClient } from '../lib/trpc-client'

interface ActionPlanTeamSummary {
  id: string
  name: string
  status: 'active' | 'archived'
  isDefault: boolean
  isAssignable: boolean
}

interface ActionPlanBoardCardSummary {
  id: string
  boardId: string
  boardName: string
  columnId: string
  columnName: string
  status: 'active' | 'done' | 'archived'
  type: string
  position: number
  assigneeTeamId: string | null
}

interface ActionPlan {
  id: string
  customerId: string
  customer?: {
    id: string
    name: string
    companyName: string
    avatar: string
  }
  badge: string
  recommendation?: string
  whatToDo: string
  whyStrategy: string
  status: string
  actionItems: Array<{
    id: string
    type: string
    title: string
    description: string
    status: string
  }>
  assigneeTeamId: string | null
  assigneeTeam?: ActionPlanTeamSummary
  boardCard?: ActionPlanBoardCardSummary
  routingMetadata?: Record<string, any> | null
  createdAt: string
  updatedAt: string
  completedAt?: string
  canceledAt?: string
  assignedToUserId?: string | null
}

interface ActionPlansFilters {
  status?: 'all' | 'active' | 'completed' | 'canceled'
  badge?: 'at-risk' | 'opportunity' | 'lead' | 'follow-up' | 'no-action' | 'all'
  customerId?: string
  teamId?: string
}

interface ActionPlansState {
  actionPlans: ActionPlan[]
  actionPlansLoading: boolean
  actionPlansError: Error | null
  actionPlansFilters: ActionPlansFilters

  currentActionPlan: ActionPlan | null
  currentActionPlanLoading: boolean
  currentActionPlanError: Error | null

  fetchActionPlans: (filters?: ActionPlansFilters) => Promise<void>
  updateActionPlanInList: (actionPlanId: string, updates: Partial<ActionPlan>) => void
  fetchActionPlan: (id: string) => Promise<void>
  fetchActionPlanByCustomerId: (customerId: string) => Promise<void>
  markActionPlanComplete: (id: string, reason?: string) => Promise<void>
  markActionPlanIncomplete: (id: string, reason?: string) => Promise<void>
  markActionPlanCanceled: (id: string, reason?: string) => Promise<void>
  assignActionPlanToUser: (id: string, userId: string | null) => Promise<void>
  assignActionPlanToTeam: (id: string, teamId: string | null) => Promise<void>
  promoteActionPlanToBoard: (params: {
    actionPlanId: string
    boardId: string
    columnId: string
    title?: string
    description?: string
    assigneeTeamId?: string
    metadata?: Record<string, any>
  }) => Promise<ActionPlanBoardCardSummary | undefined>
  clearCurrentActionPlan: () => void
}

const mapActionPlan = (plan: any): ActionPlan => ({
  id: plan.id,
  customerId: plan.customerId,
  customer: plan.customer,
  badge: plan.badge,
  recommendation: plan.recommendation,
  whatToDo: plan.whatToDo,
  whyStrategy: plan.whyStrategy,
  status: plan.status,
  actionItems: plan.actionItems ?? [],
  assigneeTeamId: plan.assigneeTeamId ?? null,
  assigneeTeam: plan.assigneeTeam ?? undefined,
  boardCard: plan.boardCard ?? undefined,
  routingMetadata: plan.routingMetadata ?? null,
  createdAt: plan.createdAt,
  updatedAt: plan.updatedAt,
  completedAt: plan.completedAt,
  canceledAt: plan.canceledAt,
  assignedToUserId: plan.assignedToUserId ?? null,
})

export const useActionPlansStore = create<ActionPlansState>((set, get) => ({
  actionPlans: [],
  actionPlansLoading: false,
  actionPlansError: null,
  actionPlansFilters: {},

  currentActionPlan: null,
  currentActionPlanLoading: false,
  currentActionPlanError: null,

  fetchActionPlans: async (filters = {}) => {
    set({ actionPlansLoading: true, actionPlansError: null })

    try {
      const result = await trpcVanillaClient.actionPlans.list.query(filters)
      set({
        actionPlans: result.map(mapActionPlan),
        actionPlansLoading: false,
        actionPlansFilters: filters,
      })
    } catch (error) {
      set({
        actionPlansError: error instanceof Error ? error : new Error('Failed to fetch action plans'),
        actionPlansLoading: false,
      })
    }
  },

  updateActionPlanInList: (actionPlanId, updates) => {
    set((state) => ({
      actionPlans: state.actionPlans.map((plan) =>
        plan.id === actionPlanId ? { ...plan, ...updates } : plan
      ),
      currentActionPlan:
        state.currentActionPlan?.id === actionPlanId
          ? { ...state.currentActionPlan, ...updates }
          : state.currentActionPlan,
    }))
  },

  fetchActionPlan: async (id) => {
    set({ currentActionPlanLoading: true, currentActionPlanError: null })

    try {
      const result = await trpcVanillaClient.actionPlans.getById.query({ id })
      set({
        currentActionPlan: result ? mapActionPlan(result) : null,
        currentActionPlanLoading: false,
      })
    } catch (error) {
      set({
        currentActionPlanError: error instanceof Error ? error : new Error('Failed to fetch action plan'),
        currentActionPlanLoading: false,
      })
    }
  },

  fetchActionPlanByCustomerId: async (customerId) => {
    set({ currentActionPlanLoading: true, currentActionPlanError: null })

    try {
      const result = await trpcVanillaClient.actionPlans.getByCustomerId.query({ customerId })
      set({
        currentActionPlan: result ? mapActionPlan(result) : null,
        currentActionPlanLoading: false,
      })
    } catch (error) {
      set({
        currentActionPlanError: error instanceof Error ? error : new Error('Failed to fetch action plan'),
        currentActionPlanLoading: false,
      })
    }
  },

  markActionPlanComplete: async (id, reason) => {
    const result = await trpcVanillaClient.actionPlans.markComplete.mutate({ id, reason })
    const mapped = mapActionPlan(result.actionPlan)
    get().updateActionPlanInList(id, mapped)
  },

  markActionPlanIncomplete: async (id, reason) => {
    const result = await trpcVanillaClient.actionPlans.markIncomplete.mutate({ id, reason })
    const mapped = mapActionPlan(result.actionPlan)
    get().updateActionPlanInList(id, mapped)
  },

  markActionPlanCanceled: async (id, reason) => {
    const result = await trpcVanillaClient.actionPlans.markCanceled.mutate({ id, reason })
    get().updateActionPlanInList(id, {
      status: result.actionPlan.status,
      canceledAt: result.actionPlan.canceledAt,
    })
  },

  assignActionPlanToUser: async (id, userId) => {
    const result = await trpcVanillaClient.actionPlans.assign.mutate({ id, userId })
    get().updateActionPlanInList(id, { assignedToUserId: result.actionPlan.assignedToUserId ?? null })
  },

  assignActionPlanToTeam: async (id, teamId) => {
    await trpcVanillaClient.actionPlans.assignTeam.mutate({ id, teamId })
    get().updateActionPlanInList(id, { assigneeTeamId: teamId ?? null })
  },

  promoteActionPlanToBoard: async (params) => {
    const result = await trpcVanillaClient.actionPlans.promoteToBoard.mutate(params)
    if (result.boardCard) {
      get().updateActionPlanInList(params.actionPlanId, {
        boardCard: {
          ...result.boardCard,
          status: result.boardCard.status as 'active' | 'done' | 'archived',
        },
        assigneeTeamId: result.boardCard.assigneeTeamId ?? null,
      })
    }
    return result.boardCard ? {
      ...result.boardCard,
      status: result.boardCard.status as 'active' | 'done' | 'archived',
    } : undefined
  },

  clearCurrentActionPlan: () => {
    set({ currentActionPlan: null, currentActionPlanError: null })
  },
}))
