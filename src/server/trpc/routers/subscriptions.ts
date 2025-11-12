import { z } from 'zod'
import { router, protectedProcedure, observable } from '../trpc'
import { eventEmitter, type DatabaseChange } from '../../services/events'

export const subscriptionsRouter = router({
  /**
   * Subscribe to database changes for the authenticated user's organization
   * Supports filtering by change type and action
   */
  onDatabaseChange: protectedProcedure
    .input(
      z
        .object({
          types: z
            .array(z.enum(['customer', 'conversation', 'actionPlan', 'actionItem', 'task', 'csvJob', 'team', 'board', 'boardCard', 'routingRule']))
            .optional(),
          actions: z.array(z.enum(['created', 'updated', 'deleted'])).optional(),
        })
        .optional()
    )
    .subscription(async ({ ctx, input }) => {
      const { org } = ctx

      return observable<DatabaseChange>((emit) => {
        // Subscribe to org-specific changes
        const unsubscribe = eventEmitter.subscribeToOrg(org.id, (change) => {
          // Filter by types if specified
          if (input?.types && !input.types.includes(change.type)) {
            return
          }

          // Filter by actions if specified
          if (input?.actions && !input.actions.includes(change.action)) {
            return
          }

          emit.next(change)
        })

        // Cleanup on unsubscribe
        return () => {
          unsubscribe()
        }
      })
    }),

  /**
   * Subscribe to specific change type (e.g., all conversation changes)
   */
  onTypeChange: protectedProcedure
    .input(
      z.object({
        type: z.enum(['customer', 'conversation', 'actionPlan', 'actionItem', 'task', 'csvJob', 'team', 'board', 'boardCard', 'routingRule']),
      })
    )
    .subscription(async ({ ctx, input }) => {
      const { org } = ctx

      return observable<DatabaseChange>((emit) => {
        const unsubscribe = eventEmitter.subscribe(input.type, '*', (change) => {
          // Only emit changes for this org
          if (change.orgId === org.id) {
            emit.next(change)
          }
        })

        return () => {
          unsubscribe()
        }
      })
    }),

})

