import { create } from 'zustand'
import { trpcVanillaClient } from '../lib/trpc-client'

interface Customer {
  id: string
  name: string
  companyName: string
  email?: string
  phone?: string
  avatar: string
  riskScore?: number
  opportunityScore?: number
  actionPlan?: {
    id: string
    badge: string
    aiRecommendation: string
  } | null
  communications: Array<{
    type: string
    count: number
    lastTime: string
  }>
  lastCommunication?: {
    type: string
    time: string
    topic: string
    shortTopic: string
    longTopic: string
  }
  totalConversations: number
  totalTasks: number
  totalActionPlans: number
  createdAt: string
  updatedAt: string
}

export type CustomerBadgeFilter = 'at-risk' | 'opportunity' | 'lead' | 'follow-up' | 'no-action' | 'all'
export type CustomerTimeframeFilter = 'all' | 'today' | '24h' | '7d' | '30d'
export type CustomerSortOption = 'priority' | 'most-recent'
export type CustomerAssigneeFilter = 'all' | 'john-smith' | 'emily-davis' | 'michael-chen' | 'unassigned'

export type CustomersFilters = {
  badge: CustomerBadgeFilter
  sortBy: CustomerSortOption
  timeframe: CustomerTimeframeFilter
  assignee: CustomerAssigneeFilter
}

const defaultCustomersFilters: CustomersFilters = {
  badge: 'all',
  sortBy: 'priority',
  timeframe: 'all',
  assignee: 'all',
}

interface CustomersState {
  // List state
  customers: Customer[]
  customersLoading: boolean
  customersError: Error | null
  customersFilters: CustomersFilters
  
  // Single customer state
  currentCustomer: Customer | null
  currentCustomerLoading: boolean
  currentCustomerError: Error | null
  
  // Actions for list
  fetchCustomers: (filters?: Partial<CustomersFilters>) => Promise<void>
  updateCustomerInList: (customerId: string, updates: Partial<Customer>) => void
  setCustomersFilters: (updates: Partial<CustomersFilters>) => void
  resetCustomersFilters: () => void
  
  // Actions for single customer
  fetchCustomer: (id: string) => Promise<void>
  clearCurrentCustomer: () => void
}

export const useCustomersStore = create<CustomersState>((set, get) => ({
  // Initial state
  customers: [],
  customersLoading: false,
  customersError: null,
  customersFilters: { ...defaultCustomersFilters },
  
  currentCustomer: null,
  currentCustomerLoading: false,
  currentCustomerError: null,
  
  // Fetch customers list
  fetchCustomers: async (filters) => {
    set({ customersLoading: true, customersError: null })
    
    const currentFilters = get().customersFilters
    const nextFilters =
      typeof filters === 'undefined'
        ? currentFilters
        : filters === currentFilters
          ? currentFilters
          : { ...currentFilters, ...filters }
    
    const requestFilters = {
      badge: nextFilters.badge !== 'all' ? nextFilters.badge : undefined,
      timeframe: nextFilters.timeframe !== 'all' ? nextFilters.timeframe : undefined,
      sortBy: nextFilters.sortBy,
      assignee: nextFilters.assignee !== 'all' ? nextFilters.assignee : undefined,
    }
    
    try {
      const result = await trpcVanillaClient.customers.list.query(requestFilters as any)
      set({
        customers: result as Customer[],
        customersLoading: false,
        customersFilters: nextFilters,
      })
    } catch (error) {
      set({
        customersError: error instanceof Error ? error : new Error('Failed to fetch customers'),
        customersLoading: false,
      })
    }
  },
  
  // Update customer in list
  updateCustomerInList: (customerId, updates) => {
    set((state) => ({
      customers: state.customers.map(c =>
        c.id === customerId ? { ...c, ...updates } : c
      ),
      // Also update current customer if it's the same
      currentCustomer: state.currentCustomer?.id === customerId
        ? { ...state.currentCustomer, ...updates }
        : state.currentCustomer,
    }))
  },
  
  setCustomersFilters: (updates) => {
    set((state) => ({
      customersFilters: { ...state.customersFilters, ...updates },
    }))
  },
  
  resetCustomersFilters: () => {
    set({
      customersFilters: { ...defaultCustomersFilters },
    })
  },
  
  // Fetch single customer
  fetchCustomer: async (id) => {
    set({ currentCustomerLoading: true, currentCustomerError: null })
    
    try {
      const result = await trpcVanillaClient.customers.getById.query({ id })
      set({
        currentCustomer: result as Customer,
        currentCustomerLoading: false,
      })
    } catch (error) {
      set({
        currentCustomerError: error instanceof Error ? error : new Error('Failed to fetch customer'),
        currentCustomerLoading: false,
      })
    }
  },
  
  // Clear current customer
  clearCurrentCustomer: () => {
    set({
      currentCustomer: null,
      currentCustomerError: null,
    })
  },
}))

