import { create } from 'zustand'
import { trpcVanillaClient } from '../lib/trpc-client'

interface DashboardStats {
  customersAnalyzed: number
  actionPlansCreated: number
  urgentActionPlans: number
}

interface DashboardState {
  stats: DashboardStats | null
  statsLoading: boolean
  statsError: Error | null
  
  fetchStats: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set) => ({
  // Initial state
  stats: null,
  statsLoading: false,
  statsError: null,
  
  // Fetch dashboard stats
  fetchStats: async () => {
    set({ statsLoading: true, statsError: null })
    
    try {
      const result = await trpcVanillaClient.dashboard.stats.query()
      set({
        stats: result,
        statsLoading: false,
      })
    } catch (error) {
      set({
        statsError: error instanceof Error ? error : new Error('Failed to fetch dashboard stats'),
        statsLoading: false,
      })
    }
  },
}))

