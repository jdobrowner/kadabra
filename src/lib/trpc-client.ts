import { httpBatchLink, splitLink, createWSClient, wsLink, createTRPCProxyClient } from '@trpc/client'
import type { TRPCClient } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '../server/trpc/routers/_app'
import { isMockEnabled } from './config'
import { createMockClients } from './mocks'

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return ''
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return `http://localhost:${process.env.PORT ?? 3000}`
}

function getWsUrl() {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'ws://localhost:3000'
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}`
  }
  return `ws://localhost:${process.env.PORT ?? 3000}`
}

function getAuthHeaders() {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const raw = window.localStorage?.getItem('auth-storage')
    const token = raw ? JSON.parse(raw)?.state?.token : null

    return token
      ? {
          authorization: `Bearer ${token}`,
        }
      : {}
  } catch (error) {
    console.warn('Unable to read auth token from storage:', error)
    return {}
  }
}

type TrpcClients = {
  trpc: ReturnType<typeof createTRPCReact<AppRouter>>
  trpcClient: TRPCClient<AppRouter>
  trpcVanillaClient: TRPCClient<AppRouter>
  getWsClient: () => ReturnType<typeof createWSClient> | null
}

function createRealClients(): TrpcClients {
  const trpc = createTRPCReact<AppRouter>()

  let wsClient: ReturnType<typeof createWSClient> | null = null

  if (typeof window !== 'undefined') {
    try {
      const token = getAuthHeaders().authorization?.replace('Bearer ', '')
      const baseWsUrl = getWsUrl()
      const wsUrl = baseWsUrl
        ? token
          ? `${baseWsUrl}/api/trpc?token=${encodeURIComponent(token)}`
          : `${baseWsUrl}/api/trpc`
        : token
          ? `/api/trpc?token=${encodeURIComponent(token)}`
          : '/api/trpc'

      wsClient = createWSClient({
        url: wsUrl,
        onOpen: () => {
          console.log('✅ WebSocket connection opened for real-time updates')
        },
        onClose: () => {
          console.log('⚠️ WebSocket connection closed, falling back to HTTP polling')
        },
        onError: (error) => {
          console.warn('WebSocket connection error, using HTTP fallback:', error)
        },
      })
    } catch (error) {
      console.warn('Failed to create WebSocket client, using HTTP fallback:', error)
      wsClient = null
    }
  }

  const links = wsClient
    ? [
        splitLink({
          condition: (op) => op.type === 'subscription',
          true: wsLink({
            client: wsClient!,
          }),
          false: httpBatchLink({
            url: `${getBaseUrl()}/api/trpc`,
            headers: () => getAuthHeaders(),
          }),
        }),
      ]
    : [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          headers: () => getAuthHeaders(),
        }),
      ]

  const trpcClient = trpc.createClient({
    links,
  })

  const trpcVanillaClient = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        headers: () => getAuthHeaders(),
        fetch: async (url, options) => {
          return fetch(url, {
            ...options,
            credentials: 'include',
          } as RequestInit)
        },
      }),
    ],
  })

  return {
    trpc,
    trpcClient,
    trpcVanillaClient,
    getWsClient: () => wsClient,
  }
}

const clients: TrpcClients = isMockEnabled ? createMockClients() : createRealClients()

export const trpc = clients.trpc
export const trpcClient = clients.trpcClient
export const trpcVanillaClient = clients.trpcVanillaClient
export const getWsClient = clients.getWsClient

