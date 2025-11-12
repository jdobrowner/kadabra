import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  // Active entities (what user is currently viewing)
  activeCustomerId: string | null
  activeConversationId: string | null
  activeActionPlanId: string | null
  
  // Actions
  setActiveCustomer: (customerId: string | null) => void
  setActiveConversation: (conversationId: string | null) => void
  setActiveActionPlan: (actionPlanId: string | null) => void
  clearActiveEntities: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeCustomerId: null,
      activeConversationId: null,
      activeActionPlanId: null,
      
      setActiveCustomer: (customerId) => set({ activeCustomerId: customerId }),
      setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),
      setActiveActionPlan: (actionPlanId) => set({ activeActionPlanId: actionPlanId }),
      clearActiveEntities: () => set({
        activeCustomerId: null,
        activeConversationId: null,
        activeActionPlanId: null,
      }),
    }),
    {
      name: 'kadabra-app-state',
      // Only persist active IDs, not the full data
      partialize: (state) => ({
        activeCustomerId: state.activeCustomerId,
        activeConversationId: state.activeConversationId,
        activeActionPlanId: state.activeActionPlanId,
      }),
    }
  )
)

