import { create } from 'zustand'
import { trpcVanillaClient } from '../lib/trpc-client'

interface ApiKey {
  id: string
  name: string
  keyMasked: string | null // Masked version of the key for display
  hasEncryptedKey?: boolean // Whether we can reveal the full key
  lastUsedAt: string | null
  createdAt: string
  expiresAt: string | null
}

interface ApiKeyWithPlainKey extends ApiKey {
  key: string // Only present on creation
}

interface ApiKeysState {
  // List state
  apiKeys: ApiKey[]
  apiKeysLoading: boolean
  apiKeysError: Error | null
  
  // Actions
  fetchApiKeys: () => Promise<void>
  createApiKey: (name: string, expiresAt?: string) => Promise<ApiKeyWithPlainKey>
  deleteApiKey: (apiKeyId: string) => Promise<void>
  revealApiKey: (apiKeyId: string) => Promise<string>
  addApiKeyToList: (apiKey: ApiKey) => void
  removeApiKeyFromList: (apiKeyId: string) => void
}

export const useApiKeysStore = create<ApiKeysState>((set, get) => ({
  // Initial state
  apiKeys: [],
  apiKeysLoading: false,
  apiKeysError: null,
  
  // Fetch API keys list
  fetchApiKeys: async () => {
    set({ apiKeysLoading: true, apiKeysError: null })
    
    try {
      const result = await trpcVanillaClient.apiKeys.list.query()
      set({
        apiKeys: result as ApiKey[],
        apiKeysLoading: false,
      })
    } catch (error) {
      set({
        apiKeysError: error instanceof Error ? error : new Error('Failed to fetch API keys'),
        apiKeysLoading: false,
      })
      throw error
    }
  },
  
  // Create API key
  createApiKey: async (name: string, expiresAt?: string) => {
    try {
      const result = await trpcVanillaClient.apiKeys.create.mutate({ name, expiresAt })
      // Add to list (without the plain key, and ensure all required fields)
      const { key, ...apiKeyWithoutKey } = result
      get().addApiKeyToList({
        id: apiKeyWithoutKey.id,
        name: apiKeyWithoutKey.name,
        keyMasked: null, // Will be fetched on next list refresh
        createdAt: apiKeyWithoutKey.createdAt,
        expiresAt: apiKeyWithoutKey.expiresAt,
        lastUsedAt: null, // Will be null on creation
      })
      return result as ApiKeyWithPlainKey
    } catch (error) {
      throw error
    }
  },
  
  // Delete API key
  deleteApiKey: async (apiKeyId: string) => {
    try {
      await trpcVanillaClient.apiKeys.delete.mutate({ id: apiKeyId })
      // Remove from list
      get().removeApiKeyFromList(apiKeyId)
    } catch (error) {
      throw error
    }
  },
  
  // Reveal API key (for copying)
  revealApiKey: async (apiKeyId: string) => {
    try {
      const result = await trpcVanillaClient.apiKeys.reveal.query({ id: apiKeyId })
      return result.key
    } catch (error) {
      throw error
    }
  },
  
  // Add API key to list
  addApiKeyToList: (apiKey: ApiKey) => {
    set((state) => ({
      apiKeys: [apiKey, ...state.apiKeys],
    }))
  },
  
  // Remove API key from list
  removeApiKeyFromList: (apiKeyId: string) => {
    set((state) => ({
      apiKeys: state.apiKeys.filter(key => key.id !== apiKeyId),
    }))
  },
}))

