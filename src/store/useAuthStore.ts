import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { trpcVanillaClient } from '../lib/trpc-client'
import { isMockEnabled } from '../lib/config'
import { org as mockOrg, users as mockUsers } from '../lib/mocks/data'

interface User {
  id: string
  orgId: string
  email: string
  name: string
  avatar?: string | null
  role: 'admin' | 'developer' | 'member'
}

interface Org {
  id: string
  name: string
  slug?: string | null
}

interface AuthState {
  token: string | null
  user: User | null
  org: Org | null
  isLoading: boolean
  isAuthenticated: boolean
  hasCheckedAuth: boolean // Track if initial auth check has completed
  
  // Actions
  setToken: (token: string | null) => void
  setUser: (user: User | null) => void
  setOrg: (org: Org | null) => void
  login: (token: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      org: null,
      isLoading: false,
      isAuthenticated: false,
      hasCheckedAuth: false, // Track if initial auth check has completed

      setToken: (token) => {
        set({ token, isAuthenticated: !!token })
      },

      setUser: (user) => {
        set({ user })
      },

      setOrg: (org) => {
        set({ org })
      },

      login: async (token: string) => {
        set({ token, isLoading: true, isAuthenticated: true, hasCheckedAuth: true })
        
        try {
          if (isMockEnabled) {
            const mockUser = mockUsers[0]
            set({
              user: mockUser as User,
              org: mockOrg as Org,
              isLoading: false,
            })
          } else {
            // Fetch user data
            const result = await trpcVanillaClient.auth.me.query()
            
            set({
              user: result.user as User,
              org: result.org as Org,
              isLoading: false,
            })
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error)
          set({
            token: null,
            user: null,
            org: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      },

      logout: () => {
        set({
          token: null,
          user: null,
          org: null,
          isAuthenticated: false,
          isLoading: false,
          hasCheckedAuth: true, // Mark as checked so we don't show loading after logout
        })
      },

      checkAuth: async () => {
        const { token } = get()
        
        // If there's a token, we're loading. If no token, we're not loading but we've checked.
        if (!token) {
          set({ isAuthenticated: false, isLoading: false, hasCheckedAuth: true })
          return
        }

        // Set loading state - we're checking auth
        set({ isLoading: true })

        try {
          if (isMockEnabled) {
            const mockUser = mockUsers[0]
            set({
              user: mockUser as User,
              org: mockOrg as Org,
              isAuthenticated: true,
              isLoading: false,
              hasCheckedAuth: true,
            })
          } else {
            const result = await trpcVanillaClient.auth.me.query()
            
            set({
              user: result.user as User,
              org: result.org as Org,
              isAuthenticated: true,
              isLoading: false,
              hasCheckedAuth: true,
            })
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          set({
            token: null,
            user: null,
            org: null,
            isAuthenticated: false,
            isLoading: false,
            hasCheckedAuth: true, // Mark as checked even on failure
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, if there's a token, we need to check auth
        // Set isLoading to true so we show loading screen until checkAuth completes
        if (state && state.token) {
          state.isLoading = true
          state.hasCheckedAuth = false
        } else if (state) {
          // No token, so we've effectively "checked" (no auth needed)
          state.hasCheckedAuth = true
        }
      },
    }
  )
)

