import { create } from 'zustand'
import { trpcVanillaClient } from '../lib/trpc-client'

interface CalendarEvent {
  id: string
  customerId: string
  title: string
  date: string
  type: 'call' | 'meeting' | 'follow_up' | 'demo'
  goal: string
  prepNotes?: string | null
  talkingPoints?: string[]
  createdAt: string
}

interface CalendarState {
  todayEvents: CalendarEvent[]
  todayEventsLoading: boolean
  todayEventsError: Error | null
  
  eventsByCustomer: Record<string, CalendarEvent[]>
  eventsByCustomerLoading: Record<string, boolean>
  eventsByCustomerError: Record<string, Error | null>
  
  fetchTodayEvents: () => Promise<void>
  fetchEventsByCustomer: (customerId: string) => Promise<void>
}

export const useCalendarStore = create<CalendarState>((set) => ({
  // Initial state
  todayEvents: [],
  todayEventsLoading: false,
  todayEventsError: null,
  
  eventsByCustomer: {},
  eventsByCustomerLoading: {},
  eventsByCustomerError: {},
  
  // Fetch today's events
  fetchTodayEvents: async () => {
    set({ todayEventsLoading: true, todayEventsError: null })
    
    try {
      const result = await trpcVanillaClient.calendar.today.query()
      set({
        todayEvents: result,
        todayEventsLoading: false,
      })
    } catch (error) {
      set({
        todayEventsError: error instanceof Error ? error : new Error('Failed to fetch calendar events'),
        todayEventsLoading: false,
      })
    }
  },
  
  // Fetch events by customer
  fetchEventsByCustomer: async (customerId) => {
    set((state) => ({
      eventsByCustomerLoading: {
        ...state.eventsByCustomerLoading,
        [customerId]: true,
      },
      eventsByCustomerError: {
        ...state.eventsByCustomerError,
        [customerId]: null,
      },
    }))
    
    try {
      const result = await trpcVanillaClient.calendar.getByCustomerId.query({ customerId })
      set((state) => ({
        eventsByCustomer: {
          ...state.eventsByCustomer,
          [customerId]: result,
        },
        eventsByCustomerLoading: {
          ...state.eventsByCustomerLoading,
          [customerId]: false,
        },
      }))
    } catch (error) {
      set((state) => ({
        eventsByCustomerError: {
          ...state.eventsByCustomerError,
          [customerId]: error instanceof Error ? error : new Error('Failed to fetch calendar events'),
        },
        eventsByCustomerLoading: {
          ...state.eventsByCustomerLoading,
          [customerId]: false,
        },
      }))
    }
  },
}))

