// Load environment variables for server-side code
import 'dotenv/config'

import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '../../../src/server/trpc/routers/_app'
import { createContext, getUserAndOrgFromRequest } from '../../../src/server/trpc/context'
import { db } from '../../../src/server/db'

const handler = async (req: Request) => {
  const { user, org } = await getUserAndOrgFromRequest(req, db)
  
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext(db, user, org),
  })
}

export { handler as GET, handler as POST }

