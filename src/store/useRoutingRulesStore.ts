import { create } from 'zustand'
import { trpcVanillaClient } from '../lib/trpc-client'

export interface RoutingRule {
  id: string
  name: string
  channel: 'phone' | 'email' | 'chat' | 'video' | 'sms' | 'ai-call' | 'voice-message' | null
  conditionType: 'badge' | 'intent' | 'urgency' | 'customer_segment' | 'channel' | 'custom'
  conditionValue: string | null
  targetTeam: { id: string; name: string } | null
  targetBoard: { id: string; name: string } | null
  targetColumn: { id: string; name: string } | null
  priority: number
  enabled: boolean
  metadata: Record<string, any> | null
  createdAt: string
  updatedAt: string
}

interface RoutingRulesState {
  routingRules: RoutingRule[]
  routingRulesLoading: boolean
  routingRulesError: Error | null

  fetchRoutingRules: () => Promise<void>
  createRoutingRule: (input: {
    name: string
    channel?: 'phone' | 'email' | 'chat' | 'video' | 'sms' | 'ai-call' | 'voice-message' | null
    conditionType: RoutingRule['conditionType']
    conditionValue?: string | null
    targetTeamId: string
    targetBoardId?: string | null
    targetColumnId?: string | null
    priority?: number
    enabled?: boolean
    metadata?: Record<string, any>
  }) => Promise<void>
  updateRoutingRule: (input: {
    id: string
    name?: string
    channel?: 'phone' | 'email' | 'chat' | 'video' | 'sms' | 'ai-call' | 'voice-message' | null
    conditionType?: RoutingRule['conditionType']
    conditionValue?: string | null
    targetTeamId?: string
    targetBoardId?: string | null
    targetColumnId?: string | null
    priority?: number
    enabled?: boolean
    metadata?: Record<string, any> | null
  }) => Promise<void>
  deleteRoutingRule: (id: string) => Promise<void>
  reorderRoutingRules: (ruleIds: string[]) => Promise<void>
}

export const useRoutingRulesStore = create<RoutingRulesState>((set, get) => ({
  routingRules: [],
  routingRulesLoading: false,
  routingRulesError: null,

  fetchRoutingRules: async () => {
    set({ routingRulesLoading: true, routingRulesError: null })
    try {
      const result = await trpcVanillaClient.routingRules.list.query()
      set({ routingRules: result, routingRulesLoading: false })
    } catch (error) {
      set({
        routingRulesError: error instanceof Error ? error : new Error('Failed to load routing rules'),
        routingRulesLoading: false,
      })
    }
  },

  createRoutingRule: async (input) => {
    await trpcVanillaClient.routingRules.create.mutate(input)
    await get().fetchRoutingRules()
  },

  updateRoutingRule: async (input) => {
    await trpcVanillaClient.routingRules.update.mutate(input)
    await get().fetchRoutingRules()
  },

  deleteRoutingRule: async (id) => {
    await trpcVanillaClient.routingRules.delete.mutate({ id })
    set((state) => ({ routingRules: state.routingRules.filter((rule) => rule.id !== id) }))
  },

  reorderRoutingRules: async (ruleIds) => {
    await trpcVanillaClient.routingRules.reorder.mutate({ ruleIds })
    await get().fetchRoutingRules()
  },
}))
