# Zustand Store Architecture

This directory contains Zustand stores for managing all application state and API interactions.

## Architecture Principle

**All API queries happen within Zustand stores. Components never directly call tRPC queries.** 

Components only:
- Read state from stores
- Call store actions to trigger data fetching
- React to state changes automatically

## Store Structure

### Domain Stores (Data + API)

Each domain has its own store that manages:
- State (data, loading, errors)
- Actions (fetch, update, create, delete)
- API calls via vanilla tRPC client

#### `useCustomersStore.ts`
- State: `customers` (list), `currentCustomer` (single), loading states, errors
- Actions: `fetchCustomers()`, `fetchCustomer(id)`, `updateCustomerInList()`

#### `useActionPlansStore.ts`
- State: `actionPlans` (list), `currentActionPlan` (single), loading states, errors
- Actions: `fetchActionPlans()`, `fetchActionPlan(id)`, `fetchActionPlanByCustomerId()`, `markActionPlanComplete()`

#### `useConversationsStore.ts`
- State: `conversationsByCustomer` (by customer ID), `currentConversation` (single), loading states, errors
- Actions: `fetchConversationsForCustomer()`, `fetchConversation(id)`, `updateConversation()`

#### `useTasksStore.ts`
- State: `tasks` (list), loading states, errors
- Actions: `fetchTasks()`, `createTask()`, `updateTask()`, `updateTaskStatus()`, `removeTask()`

#### `useDashboardStore.ts`
- State: `stats`, loading states, errors
- Actions: `fetchStats()`

#### `useCalendarStore.ts`
- State: `todayEvents`, `eventsByCustomer`, loading states, errors
- Actions: `fetchTodayEvents()`, `fetchEventsByCustomer()`

#### `useSearchStore.ts`
- State: `results`, `total`, loading states, errors
- Actions: `search()`, `clearResults()`

#### `useAIAgentStore.ts`
- State: `history` (chat messages), loading states, errors
- Actions: `query()`, `clearHistory()`

### UI State Stores

#### `useAppStore.ts`
- Tracks active entities (customer, conversation, action plan IDs)
- Persisted to localStorage
- Used for context and navigation


## Usage Pattern

### In Components

```tsx
import { useCustomersStore } from '../store/useCustomersStore'
import { useEffect } from 'react'

function CustomerList() {
  // Read state from store
  const customers = useCustomersStore((state) => state.customers)
  const isLoading = useCustomersStore((state) => state.customersLoading)
  const fetchCustomers = useCustomersStore((state) => state.fetchCustomers)
  
  // Trigger fetch on mount
  useEffect(() => {
    fetchCustomers({ sortBy: 'priority' })
  }, [fetchCustomers])
  
  // Render using state
  if (isLoading) return <div>Loading...</div>
  return <div>{customers.map(...)}</div>
}
```

### Store Actions

```tsx
// In a store
fetchCustomers: async (filters = {}) => {
  set({ customersLoading: true, customersError: null })
  
  try {
    const result = await trpcVanillaClient.customers.list.query(filters)
    set({ customers: result, customersLoading: false })
  } catch (error) {
    set({ customersError: error, customersLoading: false })
  }
}
```

## Benefits

1. **Separation of Concerns**: Components only handle UI, stores handle data
2. **Testability**: Stores can be tested independently
3. **Reusability**: Same store can be used across multiple components
4. **Type Safety**: Full TypeScript support
5. **No React Query Dependency**: Components don't need React Query hooks
6. **Centralized State**: Single source of truth for each domain
7. **Easy Debugging**: All API calls traceable through stores

## tRPC Client Setup

We use two tRPC clients:

1. **`trpc`** (React Query hooks) - For components that still need React Query (legacy)
2. **`trpcVanillaClient`** (Vanilla client) - For use in Zustand stores (current pattern)

The vanilla client is used in stores because:
- It works outside React components
- It doesn't require React Query
- It's simpler and more direct

## Migration Complete ✅

All components have been migrated to use store actions. The legacy React Query hooks have been removed.

**Current Pattern:**
```tsx
// ✅ Current pattern (use this)
const customers = useCustomersStore((state) => state.customers)
const fetchCustomers = useCustomersStore((state) => state.fetchCustomers)
useEffect(() => { fetchCustomers() }, [fetchCustomers])
```

## Store Best Practices

1. **Store actions should be async** - All API calls are async
2. **Handle loading/error states** - Always set loading and error flags
3. **Update state optimistically** - Update UI immediately, sync with server
4. **Use selectors** - Components should use selectors to minimize re-renders
5. **Keep stores focused** - One store per domain (customers, tasks, etc.)
