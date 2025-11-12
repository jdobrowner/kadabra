import { create } from 'zustand'
import { trpcVanillaClient } from '../lib/trpc-client'

interface Invitation {
  id: string
  email: string
  role: 'admin' | 'developer' | 'member'
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'canceled'
  token?: string
  expiresAt: string
  createdAt: string
  acceptedAt?: string
  invitedBy?: {
    id: string
    name: string
    email: string
  } | null
  org?: {
    id: string
    name: string
  } | null
}

interface InvitationsState {
  // List state
  invitations: Invitation[]
  invitationsLoading: boolean
  invitationsError: Error | null
  invitationsFilter: 'all' | 'pending' | 'accepted' | 'rejected' | 'expired' | 'canceled'
  
  // Actions
  fetchInvitations: (status?: InvitationsState['invitationsFilter']) => Promise<void>
  createInvitation: (email: string, role: 'admin' | 'developer' | 'member') => Promise<Invitation>
  cancelInvitation: (invitationId: string) => Promise<void>
  addInvitationToList: (invitation: Invitation) => void
  removeInvitationFromList: (invitationId: string) => void
  updateInvitationInList: (invitationId: string, updates: Partial<Invitation>) => void
}

export const useInvitationsStore = create<InvitationsState>((set, get) => ({
  // Initial state
  invitations: [],
  invitationsLoading: false,
  invitationsError: null,
  invitationsFilter: 'all',
  
  // Fetch invitations list
  fetchInvitations: async (status = 'all') => {
    set({ invitationsLoading: true, invitationsError: null, invitationsFilter: status })
    
    try {
      const result = await trpcVanillaClient.invitations.list.query({ status })
      set({
        invitations: result as Invitation[],
        invitationsLoading: false,
      })
    } catch (error) {
      set({
        invitationsError: error instanceof Error ? error : new Error('Failed to fetch invitations'),
        invitationsLoading: false,
      })
      throw error
    }
  },
  
  // Create invitation
  createInvitation: async (email: string, role: 'admin' | 'developer' | 'member') => {
    try {
      const result = await trpcVanillaClient.invitations.create.mutate({ email, role })
      // Add to list
      get().addInvitationToList(result as Invitation)
      return result as Invitation
    } catch (error) {
      throw error
    }
  },
  
  // Cancel invitation
  cancelInvitation: async (invitationId: string) => {
    try {
      await trpcVanillaClient.invitations.cancel.mutate({ id: invitationId })
      // Update in list
      get().updateInvitationInList(invitationId, { status: 'canceled' })
    } catch (error) {
      throw error
    }
  },
  
  // Add invitation to list
  addInvitationToList: (invitation: Invitation) => {
    set((state) => ({
      invitations: [invitation, ...state.invitations],
    }))
  },
  
  // Remove invitation from list
  removeInvitationFromList: (invitationId: string) => {
    set((state) => ({
      invitations: state.invitations.filter(inv => inv.id !== invitationId),
    }))
  },
  
  // Update invitation in list
  updateInvitationInList: (invitationId: string, updates: Partial<Invitation>) => {
    set((state) => ({
      invitations: state.invitations.map(inv =>
        inv.id === invitationId ? { ...inv, ...updates } : inv
      ),
    }))
  },
}))

