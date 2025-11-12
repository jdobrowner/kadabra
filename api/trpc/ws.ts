/**
 * WebSocket server for tRPC subscriptions (local development only)
 * For Vercel, subscriptions use HTTP long-polling via the regular fetch adapter
 */
import 'dotenv/config'
import { applyWSSHandler } from '@trpc/server/adapters/ws'
import { WebSocketServer } from 'ws'
import { appRouter } from '../../src/server/trpc/routers/_app'
import { createContext, getUserAndOrgFromRequest } from '../../src/server/trpc/context'
import { db } from '../../src/server/db'

/**
 * Create WebSocket handler for tRPC subscriptions
 * This is used by the local Express server
 */
export function createWSServer(wss: WebSocketServer) {
  console.log('🔧 Setting up tRPC WebSocket handler...')
  const handler = applyWSSHandler({
    wss,
    router: appRouter,
    // endpoint tells tRPC which path prefix to handle
    // This should match the client connection path
    endpoint: '/api/trpc',
    createContext: async (opts) => {
      console.log('🔧 Creating WebSocket context for:', opts.req.url)
      // Extract user/org from WebSocket connection
      // WebSocket connections can pass auth via query params or headers
      try {
        // Build full URL from request
        const protocol = opts.req.headers['x-forwarded-proto'] || 'http'
        const host = opts.req.headers.host || 'localhost:3000'
        const fullUrl = `${protocol}://${host}${opts.req.url || ''}`
        const url = new URL(fullUrl)
        const tokenFromQuery = url.searchParams.get('token')
        
        // Create headers object - prefer query param token, fallback to header
        const headers = new Headers(opts.req.headers as any)
        if (tokenFromQuery && !headers.get('authorization')) {
          headers.set('authorization', `Bearer ${tokenFromQuery}`)
        }
        
        const mockReq = {
          headers,
          url: fullUrl,
        } as Request
        
        const userAndOrg = await getUserAndOrgFromRequest(mockReq, db)
        console.log('✅ WebSocket context created for user:', userAndOrg.user?.email || 'anonymous')
        return createContext(db, userAndOrg.user, userAndOrg.org)
      } catch (error) {
        console.error('❌ Error creating WebSocket context:', error)
        // Return empty context - will be handled by protectedProcedure
        return createContext(db, null, null)
      }
    },
  })

  console.log('✅ tRPC WebSocket handler set up successfully')
  return handler
}

