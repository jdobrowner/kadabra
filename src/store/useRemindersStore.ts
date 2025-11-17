import { create } from 'zustand'
import { trpcVanillaClient } from '../lib/trpc-client'

export interface Reminder {
  id: string
  customerId: string
  customer?: {
    id: string
    name: string
    companyName: string
    avatar?: string | null
  }
  actionItemId?: string | null
  type: 'email' | 'call' | 'text' | 'task'
  title: string
  description?: string | null
  reminderDate: string
  status: 'pending' | 'completed' | 'dismissed'
  createdAt: string
  updatedAt: string
}

interface RemindersFilters {
  status?: 'pending' | 'completed' | 'dismissed'
  customerId?: string
  upcoming?: boolean
}

interface RemindersState {
  reminders: Reminder[]
  remindersLoading: boolean
  remindersError: Error | null

  upcomingReminders: Reminder[]
  upcomingRemindersLoading: boolean
  upcomingRemindersError: Error | null

  fetchReminders: (filters?: RemindersFilters) => Promise<void>
  fetchUpcomingReminders: () => Promise<void>
  createReminder: (data: {
    customerId: string
    actionItemId?: string
    type: 'email' | 'call' | 'text' | 'task'
    title: string
    description?: string
    reminderDate: string
  }) => Promise<Reminder>
  updateReminder: (id: string, data: {
    type?: 'email' | 'call' | 'text' | 'task'
    title?: string
    description?: string | null
    reminderDate?: string
    status?: 'pending' | 'completed' | 'dismissed'
  }) => Promise<Reminder>
  deleteReminder: (id: string) => Promise<void>
  createReminderFromActionItem: (actionItemId: string, data: {
    type: 'email' | 'call' | 'text' | 'task'
    title: string
    description?: string
    reminderDate: string
  }) => Promise<Reminder>
}

export const useRemindersStore = create<RemindersState>((set) => ({
  // Initial state
  reminders: [],
  remindersLoading: false,
  remindersError: null,

  upcomingReminders: [],
  upcomingRemindersLoading: false,
  upcomingRemindersError: null,

  // Fetch all reminders with optional filters
  fetchReminders: async (filters) => {
    set({ remindersLoading: true, remindersError: null })

    try {
      const result = await trpcVanillaClient.reminders.list.query(filters)
      set({
        reminders: result,
        remindersLoading: false,
      })
    } catch (error) {
      set({
        remindersError: error instanceof Error ? error : new Error('Failed to fetch reminders'),
        remindersLoading: false,
      })
    }
  },

  // Fetch upcoming reminders
  fetchUpcomingReminders: async () => {
    set({ upcomingRemindersLoading: true, upcomingRemindersError: null })

    try {
      const result = await trpcVanillaClient.reminders.list.query({ upcoming: true })
      set({
        upcomingReminders: result,
        upcomingRemindersLoading: false,
      })
    } catch (error) {
      set({
        upcomingRemindersError: error instanceof Error ? error : new Error('Failed to fetch upcoming reminders'),
        upcomingRemindersLoading: false,
      })
    }
  },

  // Create reminder
  createReminder: async (data) => {
    try {
      const result = await trpcVanillaClient.reminders.create.mutate(data)
      set((state) => ({
        reminders: [...state.reminders, result],
        upcomingReminders: result.status === 'pending' && new Date(result.reminderDate) >= new Date()
          ? [...state.upcomingReminders, result]
          : state.upcomingReminders,
      }))
      return result
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to create reminder')
    }
  },

  // Update reminder
  updateReminder: async (id, data) => {
    try {
      const result = await trpcVanillaClient.reminders.update.mutate({ id, ...data })
      set((state) => ({
        reminders: state.reminders.map((r) => (r.id === id ? result : r)),
        upcomingReminders: state.upcomingReminders.map((r) => (r.id === id ? result : r)),
      }))
      return result
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to update reminder')
    }
  },

  // Delete reminder
  deleteReminder: async (id) => {
    try {
      await trpcVanillaClient.reminders.delete.mutate({ id })
      set((state) => ({
        reminders: state.reminders.filter((r) => r.id !== id),
        upcomingReminders: state.upcomingReminders.filter((r) => r.id !== id),
      }))
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to delete reminder')
    }
  },

  // Create reminder from action item
  createReminderFromActionItem: async (actionItemId, data) => {
    try {
      const result = await trpcVanillaClient.reminders.createFromActionItem.mutate({
        actionItemId,
        ...data,
      })
      set((state) => ({
        reminders: [...state.reminders, result],
        upcomingReminders: result.status === 'pending' && new Date(result.reminderDate) >= new Date()
          ? [...state.upcomingReminders, result]
          : state.upcomingReminders,
      }))
      return result
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to create reminder from action item')
    }
  },
}))

