import { create } from 'zustand'
import { trpcVanillaClient } from '../lib/trpc-client'

interface User {
  id: string
  email: string
  name: string
  avatar?: string | null
  role: 'admin' | 'developer' | 'member'
  createdAt: string
  updatedAt: string
}

interface UsersState {
  // List state
  users: User[]
  usersLoading: boolean
  usersError: Error | null
  
  // Actions
  fetchUsers: () => Promise<void>
  removeUser: (userId: string) => Promise<void>
  updateUserRole: (userId: string, role: 'admin' | 'developer' | 'member') => Promise<void>
  removeUserFromList: (userId: string) => void
  updateUserInList: (userId: string, updates: Partial<User>) => void
}

export const useUsersStore = create<UsersState>((set, get) => ({
  // Initial state
  users: [],
  usersLoading: false,
  usersError: null,
  
  // Fetch users list
  fetchUsers: async () => {
    set({ usersLoading: true, usersError: null })
    
    try {
      const result = await trpcVanillaClient.users.list.query()
      set({
        users: result as User[],
        usersLoading: false,
      })
    } catch (error) {
      set({
        usersError: error instanceof Error ? error : new Error('Failed to fetch users'),
        usersLoading: false,
      })
      throw error
    }
  },
  
  // Remove user
  removeUser: async (userId: string) => {
    try {
      await trpcVanillaClient.users.remove.mutate({ userId })
      // Optimistically remove from list
      get().removeUserFromList(userId)
    } catch (error) {
      throw error
    }
  },
  
  // Update user role
  updateUserRole: async (userId: string, role: 'admin' | 'developer' | 'member') => {
    try {
      const result = await trpcVanillaClient.users.updateRole.mutate({ userId, role })
      // Update in list
      if (result.user) {
        get().updateUserInList(userId, result.user)
      }
    } catch (error) {
      throw error
    }
  },
  
  // Remove user from list
  removeUserFromList: (userId: string) => {
    set((state) => ({
      users: state.users.filter(u => u.id !== userId),
    }))
  },
  
  // Update user in list
  updateUserInList: (userId: string, updates: Partial<User>) => {
    set((state) => ({
      users: state.users.map(u =>
        u.id === userId ? { ...u, ...updates } : u
      ),
    }))
  },
}))

