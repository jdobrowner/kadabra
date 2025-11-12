import { create } from 'zustand'
// import { trpcVanillaClient } from '../lib/trpc-client' // TODO: Re-enable when getByCustomerId and getById are implemented

interface Conversation {
  id: string
  customerId: string
  customer?: {
    id: string
    name: string
    companyName: string
    avatar: string
  }
  channel: string
  date: string
  duration?: number
  messageCount?: number
  transcript: string
  summary?: string
  sentiment?: string
  intent?: string
  agent?: string
  subject?: string
  insights?: string[]
  coachingSuggestions?: string[]
  keyStats?: Record<string, any>
  messages?: Array<{
    role: 'assistant' | 'customer' | 'agent'
    content: string
    timestamp: string
  }>
  createdAt: string
}

interface ConversationsState {
  // Conversations by customer ID
  conversationsByCustomer: Record<string, Conversation[]>
  conversationsLoading: Record<string, boolean>
  conversationsError: Record<string, Error | null>
  
  // Single conversation state
  currentConversation: Conversation | null
  currentConversationLoading: boolean
  currentConversationError: Error | null
  
  // Actions
  fetchConversationsForCustomer: (customerId: string) => Promise<void>
  fetchConversation: (id: string) => Promise<void>
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void
  clearCurrentConversation: () => void
}

export const useConversationsStore = create<ConversationsState>((set) => ({
  // Initial state
  conversationsByCustomer: {},
  conversationsLoading: {},
  conversationsError: {},
  
  currentConversation: null,
  currentConversationLoading: false,
  currentConversationError: null,
  
  // Fetch conversations for a customer
  fetchConversationsForCustomer: async (customerId) => {
    set((state) => ({
      conversationsLoading: {
        ...state.conversationsLoading,
        [customerId]: true,
      },
      conversationsError: {
        ...state.conversationsError,
        [customerId]: null,
      },
    }))
    
    try {
      // TODO: Implement getByCustomerId in conversations router
      const result = [] as Conversation[]
      set((state) => ({
        conversationsByCustomer: {
          ...state.conversationsByCustomer,
          [customerId]: result as Conversation[],
        },
        conversationsLoading: {
          ...state.conversationsLoading,
          [customerId]: false,
        },
      }))
    } catch (error) {
      set((state) => ({
        conversationsError: {
          ...state.conversationsError,
          [customerId]: error instanceof Error ? error : new Error('Failed to fetch conversations'),
        },
        conversationsLoading: {
          ...state.conversationsLoading,
          [customerId]: false,
        },
      }))
    }
  },
  
  // Fetch single conversation
  fetchConversation: async (_id) => {
    set({ currentConversationLoading: true, currentConversationError: null })
    
    try {
      // TODO: Implement getById in conversations router
      const result = null as Conversation | null
      set({
        currentConversation: result as Conversation,
        currentConversationLoading: false,
      })
    } catch (error) {
      set({
        currentConversationError: error instanceof Error ? error : new Error('Failed to fetch conversation'),
        currentConversationLoading: false,
      })
    }
  },
  
  // Update conversation
  updateConversation: (conversationId, updates) => {
    set((state) => {
      const updated: Record<string, Conversation[]> = {}
      Object.entries(state.conversationsByCustomer).forEach(([customerId, conversations]) => {
        updated[customerId] = conversations.map(c =>
          c.id === conversationId ? { ...c, ...updates } : c
        )
      })
      return {
        conversationsByCustomer: updated,
        currentConversation: state.currentConversation?.id === conversationId
          ? { ...state.currentConversation, ...updates }
          : state.currentConversation,
      }
    })
  },
  
  // Clear current conversation
  clearCurrentConversation: () => {
    set({
      currentConversation: null,
      currentConversationError: null,
    })
  },
}))

