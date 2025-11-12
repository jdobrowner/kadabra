/**
 * Background component that subscribes to real-time database changes
 * and updates Zustand stores accordingly.
 * This component should be rendered once at the app root.
 */

import { trpc } from '../lib/trpc-client'
import { useCustomersStore } from '../store/useCustomersStore'
import { useDashboardStore } from '../store/useDashboardStore'
import { useConversationsStore } from '../store/useConversationsStore'
import { useActionPlansStore } from '../store/useActionPlansStore'

// Track last fetch times to prevent infinite loops
const lastFetchTimes = new Map<string, number>()
const FETCH_DEBOUNCE_MS = 1000 // Don't refetch the same thing within 1 second

function shouldFetch(key: string): boolean {
  const now = Date.now()
  const lastFetch = lastFetchTimes.get(key)
  if (!lastFetch || now - lastFetch > FETCH_DEBOUNCE_MS) {
    lastFetchTimes.set(key, now)
    return true
  }
  return false
}

export function StoreSubscriptions() {
  // Subscribe to all database changes
  trpc.subscriptions.onDatabaseChange.useSubscription(
    {
      types: ['customer', 'conversation', 'actionPlan', 'actionItem', 'task', 'csvJob'],
      actions: ['created', 'updated', 'deleted'],
    },
    {
      onData: (change) => {
        // Get store actions inside callback to ensure we have latest state
        const customersStore = useCustomersStore.getState()
        const dashboardStore = useDashboardStore.getState()
        const conversationsStore = useConversationsStore.getState()
        const actionPlansStore = useActionPlansStore.getState()

        // Handle changes based on type
        switch (change.type) {
          case 'customer':
            // Refetch customers list and stats (with debounce)
            if (shouldFetch('customers-list')) {
              customersStore.fetchCustomers({ sortBy: 'priority' }).catch(console.error)
            }
            if (shouldFetch('dashboard-stats')) {
              dashboardStore.fetchStats().catch(console.error)
            }
            
            // If we're viewing a customer that was updated, refetch it (with debounce)
            if (customersStore.currentCustomer?.id === change.id) {
              const fetchKey = `customer-${change.id}`
              if (shouldFetch(fetchKey)) {
                customersStore.fetchCustomer(change.id).catch(console.error)
              }
            }
            break

          case 'conversation': {
            // Refetch customers list (to update last communication) with debounce
            if (shouldFetch('customers-list')) {
              customersStore.fetchCustomers({ sortBy: 'priority' }).catch(console.error)
            }
            if (shouldFetch('dashboard-stats')) {
              dashboardStore.fetchStats().catch(console.error)
            }
            
            // Refetch conversations for the affected customer with debounce
            const conversationCustomerId = change.data?.customerId
            if (conversationCustomerId) {
              const fetchKey = `conversations-${conversationCustomerId}`
              if (shouldFetch(fetchKey)) {
                conversationsStore.fetchConversationsForCustomer(conversationCustomerId).catch(console.error)
              }
            } else if (customersStore.currentCustomer) {
              // Fallback: if viewing a customer and no customerId in event, refetch current
              const fetchKey = `conversations-${customersStore.currentCustomer.id}`
              if (shouldFetch(fetchKey)) {
                conversationsStore.fetchConversationsForCustomer(customersStore.currentCustomer.id).catch(console.error)
              }
            }
            break
          }

          case 'actionPlan':
            // Refetch customers list (to update action plan badges) with debounce
            if (shouldFetch('customers-list')) {
              customersStore.fetchCustomers({ sortBy: 'priority' }).catch(console.error)
            }
            if (shouldFetch('dashboard-stats')) {
              dashboardStore.fetchStats().catch(console.error)
            }
            
            // If we're viewing a customer, refetch their action plan with debounce
            if (customersStore.currentCustomer) {
              const fetchKey = `actionplan-customer-${customersStore.currentCustomer.id}`
              if (shouldFetch(fetchKey)) {
                actionPlansStore.fetchActionPlanByCustomerId(customersStore.currentCustomer.id).catch(console.error)
              }
            } else if (change.data?.customerId) {
              // If the change includes customerId, refetch that customer's action plan
              const fetchKey = `actionplan-customer-${change.data.customerId}`
              if (shouldFetch(fetchKey)) {
                actionPlansStore.fetchActionPlanByCustomerId(change.data.customerId).catch(console.error)
              }
            }
            
            // If we're viewing this specific action plan, refetch it with debounce
            if (actionPlansStore.currentActionPlan?.id === change.id) {
              const fetchKey = `actionplan-${change.id}`
              if (shouldFetch(fetchKey)) {
                actionPlansStore.fetchActionPlan(change.id).catch(console.error)
              }
            }
            break

          case 'actionItem': {
            // If we're viewing an action plan, refetch it to get updated action items with debounce
            const currentPlan = actionPlansStore.currentActionPlan
            if (currentPlan && currentPlan.id === change.data?.actionPlanId) {
              const fetchKey = `actionplan-${currentPlan.id}`
              if (shouldFetch(fetchKey)) {
                actionPlansStore.fetchActionPlan(currentPlan.id).catch(console.error)
              }
            }
            break
          }

          case 'task':
            // Refetch stats with debounce
            if (shouldFetch('dashboard-stats')) {
              dashboardStore.fetchStats().catch(console.error)
            }
            break

          case 'csvJob':
            // CSV job changes emit events for created customers/conversations/actionPlans
            // Those events will be handled by their respective cases above
            // No need to do anything specific here
            break
        }
      },
      onError: (error) => {
        console.error('Real-time subscription error:', error)
      },
    }
  )

  // Component doesn't render anything
  return null
}

