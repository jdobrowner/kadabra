import { router } from '../trpc'
import { customersRouter } from './customers'
import { actionPlansRouter } from './actionPlans'
import { conversationsRouter } from './conversations'
import { tasksRouter } from './tasks'
import { remindersRouter } from './reminders'
import { dashboardRouter } from './dashboard'
import { aiAgentRouter } from './aiAgent'
import { searchRouter } from './search'
import { authRouter } from './auth'
import { invitationsRouter } from './invitations'
import { usersRouter } from './users'
import { apiKeysRouter } from './apiKeys'
import { subscriptionsRouter } from './subscriptions'
import { teamsRouter } from './teams'
import { routingRulesRouter } from './routingRules'
import { boardsRouter } from './boards'

export const appRouter = router({
  auth: authRouter,
  invitations: invitationsRouter,
  users: usersRouter,
  apiKeys: apiKeysRouter,
  customers: customersRouter,
  actionPlans: actionPlansRouter,
  conversations: conversationsRouter,
  tasks: tasksRouter,
  reminders: remindersRouter,
  dashboard: dashboardRouter,
  aiAgent: aiAgentRouter,
  search: searchRouter,
  subscriptions: subscriptionsRouter,
  teams: teamsRouter,
  routingRules: routingRulesRouter,
  boards: boardsRouter,
})

export type AppRouter = typeof appRouter

