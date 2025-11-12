import { createTRPCReact } from '@trpc/react-query'
import { createTRPCProxyClient, type TRPCClient } from '@trpc/client'
import type { AppRouter } from '../../server/trpc/routers/_app'
import { mockLink } from './router'

type MockClients = {
  trpc: ReturnType<typeof createTRPCReact<AppRouter>>
  trpcClient: TRPCClient<AppRouter>
  trpcVanillaClient: TRPCClient<AppRouter>
  getWsClient: () => null
}

export function createMockClients(): MockClients {
  const trpc = createTRPCReact<AppRouter>()

  const trpcClient = trpc.createClient({
    links: [mockLink],
  })

  const trpcVanillaClient = createTRPCProxyClient<AppRouter>({
    links: [mockLink],
  })

  return {
    trpc,
    trpcClient,
    trpcVanillaClient,
    getWsClient: () => null,
  }
}

