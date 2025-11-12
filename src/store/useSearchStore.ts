import { create } from 'zustand'
import { trpcVanillaClient } from '../lib/trpc-client'

interface SearchResult {
  type: 'customer' | 'conversation' | 'action-plan'
  id: string
  title: string
  subtitle: string
  link: string
  date: string
  metadata?: Record<string, any>
}

interface SearchState {
  results: SearchResult[]
  total: number
  loading: boolean
  error: Error | null
  
  search: (params: {
    q?: string
    type?: 'all' | 'customers' | 'conversations' | 'action-plans'
    priority?: 'all' | 'at-risk' | 'opportunity' | 'lead' | 'follow-up' | 'no-action'
    status?: 'all' | 'active' | 'completed' | 'canceled'
    sortBy?: 'recent' | 'relevance'
  }) => Promise<void>
  clearResults: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  // Initial state
  results: [],
  total: 0,
  loading: false,
  error: null,
  
  // Perform search
  search: async (params) => {
    set({ loading: true, error: null })
    
    try {
      const result = await trpcVanillaClient.search.query.query(params as any)
      set({
        results: result.results,
        total: result.total,
        loading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error('Search failed'),
        loading: false,
      })
    }
  },
  
  // Clear results
  clearResults: () => {
    set({
      results: [],
      total: 0,
      error: null,
    })
  },
}))

