import { isMockEnabled } from './config'
import { useAuthStore } from '../store/useAuthStore'
import { useCustomersStore } from '../store/useCustomersStore'
import { useDashboardStore } from '../store/useDashboardStore'
import { useActionPlansStore } from '../store/useActionPlansStore'
import { useTasksStore } from '../store/useTasksStore'
import { useConversationsStore } from '../store/useConversationsStore'
import { useCalendarStore } from '../store/useCalendarStore'
import { useUsersStore } from '../store/useUsersStore'
import { useInvitationsStore } from '../store/useInvitationsStore'
import { useApiKeysStore } from '../store/useApiKeysStore'
import {
  users as mockUsers,
  org as mockOrg,
  customers as mockCustomers,
} from './mocks/data'

let initialized = false

export async function initializeMockMode() {
  if (!isMockEnabled || initialized) {
    return
  }

  initialized = true

  const authStore = useAuthStore.getState()

  if (!authStore.token) {
    authStore.setToken('mock-token')
    authStore.setUser({
      ...mockUsers[0],
    } as any)
    authStore.setOrg({
      ...mockOrg,
    } as any)
  }

  const customerIds = mockCustomers.map((customer) => customer.id)

  const promises: Array<Promise<any>> = [
    useCustomersStore.getState().fetchCustomers({ sortBy: 'priority' }),
    useDashboardStore.getState().fetchStats(),
    useActionPlansStore.getState().fetchActionPlans(),
    useTasksStore.getState().fetchTasks({ status: 'all', priority: 'all' }),
    useCalendarStore.getState().fetchTodayEvents(),
    useUsersStore.getState().fetchUsers(),
    useInvitationsStore.getState().fetchInvitations('all'),
    useApiKeysStore.getState().fetchApiKeys(),
  ]

  promises.push(
    ...customerIds.map((customerId) =>
      useConversationsStore.getState().fetchConversationsForCustomer(customerId)
    ),
    ...customerIds.map((customerId) =>
      useCalendarStore.getState().fetchEventsByCustomer(customerId)
    )
  )

  await Promise.allSettled(promises)
}

