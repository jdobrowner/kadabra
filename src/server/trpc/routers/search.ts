import { z } from 'zod'
import { router, publicProcedure, TRPCError } from '../trpc'
import { customers, conversations, actionPlans } from '../../db/schema'
import { eq, and, inArray } from 'drizzle-orm'

export const searchRouter = router({
  query: publicProcedure
    .input(
      z.object({
        q: z.string().optional(),
        type: z.enum(['all', 'customers', 'conversations', 'action-plans']).optional(),
        priority: z.enum(['all', 'at-risk', 'opportunity', 'lead', 'follow-up', 'no-action']).optional(),
        status: z.enum(['all', 'active', 'completed', 'canceled']).optional(),
        sortBy: z.enum(['recent', 'relevance']).optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { db, org } = ctx
      
      if (!org) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Organization context required',
        })
      }
      
      const searchQuery = input?.q?.toLowerCase() || ''
      const type = input?.type || 'all'
      const limit = input?.limit || 50
      const offset = input?.offset || 0
      
      const results: Array<{
        type: 'customer' | 'conversation' | 'action-plan'
        id: string
        title: string
        subtitle: string
        link: string
        date: string
        metadata?: Record<string, any>
      }> = []
      
      // Search customers
      if (type === 'all' || type === 'customers') {
        if (searchQuery) {
          // Simple search - in real app would use full-text search
          const customerList = await db
            .select()
            .from(customers)
            .where(eq(customers.orgId, org.id))
          const filtered = customerList.filter(c => 
            c.name.toLowerCase().includes(searchQuery) ||
            c.companyName.toLowerCase().includes(searchQuery)
          )
          
          for (const customer of filtered) {
            const [actionPlan] = await db
              .select()
              .from(actionPlans)
              .where(eq(actionPlans.customerId, customer.id))
              .limit(1)
            
            // Apply priority filter if needed
            if (input?.priority && input.priority !== 'all' && actionPlan?.badge !== input.priority) {
              continue
            }
            
            results.push({
              type: 'customer',
              id: customer.id,
              title: customer.name,
              subtitle: `${customer.companyName}`,
              link: `/triage/customers/${customer.id}`,
              date: customer.createdAt.toISOString(),
              metadata: {
                companyName: customer.companyName,
                badge: actionPlan?.badge,
              },
            })
          }
        } else {
          const customerList = await db
            .select()
            .from(customers)
            .where(eq(customers.orgId, org.id))
          
          for (const customer of customerList) {
            const [actionPlan] = await db
              .select()
              .from(actionPlans)
              .where(eq(actionPlans.customerId, customer.id))
              .limit(1)
            
            if (input?.priority && input.priority !== 'all' && actionPlan?.badge !== input.priority) {
              continue
            }
            
            results.push({
              type: 'customer',
              id: customer.id,
              title: customer.name,
              subtitle: `${customer.companyName}`,
              link: `/triage/customers/${customer.id}`,
              date: customer.createdAt.toISOString(),
            })
          }
        }
      }
      
      // Search conversations
      if (type === 'all' || type === 'conversations') {
        // Get customer IDs for this org
        const orgCustomers = await db
          .select({ id: customers.id })
          .from(customers)
          .where(eq(customers.orgId, org.id))
        
        const customerIds = orgCustomers.map(c => c.id)
        
        if (customerIds.length > 0) {
          if (searchQuery) {
            const convList = await db
              .select()
              .from(conversations)
              .where(inArray(conversations.customerId, customerIds))
            
            const filtered = convList.filter(c => 
              c.summary?.toLowerCase().includes(searchQuery) ||
              c.transcript.toLowerCase().includes(searchQuery) ||
              c.intent?.toLowerCase().includes(searchQuery)
            )
            
            for (const conv of filtered) {
              const [customer] = await db
                .select()
                .from(customers)
                .where(eq(customers.id, conv.customerId))
                .limit(1)
              
              results.push({
                type: 'conversation',
                id: conv.id,
                title: `Conversation with ${customer?.name || 'Customer'}`,
                subtitle: `${conv.channel} • ${conv.summary?.substring(0, 100) || 'No summary'}...`,
                link: conv.customerId ? `/triage/customers/${conv.customerId}/conversations/${conv.id}` : `/triage`,
                date: conv.date.toISOString(),
              })
            }
          } else {
            const convList = await db
              .select()
              .from(conversations)
              .where(inArray(conversations.customerId, customerIds))
            
            for (const conv of convList) {
              const [customer] = await db
                .select()
                .from(customers)
                .where(eq(customers.id, conv.customerId))
                .limit(1)
              
              results.push({
                type: 'conversation',
                id: conv.id,
                title: `Conversation with ${customer?.name || 'Customer'}`,
                subtitle: `${conv.channel} • ${conv.summary?.substring(0, 100) || 'No summary'}...`,
                link: conv.customerId ? `/triage/customers/${conv.customerId}/conversations/${conv.id}` : `/triage`,
                date: conv.date.toISOString(),
              })
            }
          }
        }
      }
      
      // Search action plans
      if (type === 'all' || type === 'action-plans') {
        // Get customer IDs for this org
        const orgCustomers = await db
          .select({ id: customers.id })
          .from(customers)
          .where(eq(customers.orgId, org.id))
        
        const customerIds = orgCustomers.map(c => c.id)
        
        if (customerIds.length > 0) {
          const conditions = [
            inArray(actionPlans.customerId, customerIds)
          ]
          
          if (input?.status && input.status !== 'all') {
            conditions.push(eq(actionPlans.status, input.status))
          }
          
          if (input?.priority && input.priority !== 'all') {
            conditions.push(eq(actionPlans.badge, input.priority))
          }
          
          let planList = await db
            .select()
            .from(actionPlans)
            .where(and(...conditions))
          
          if (searchQuery) {
            planList = planList.filter(p => 
              p.whatToDo.toLowerCase().includes(searchQuery) || 
              p.whyStrategy.toLowerCase().includes(searchQuery)
            )
          }
          
          for (const plan of planList) {
            const [customer] = await db
              .select()
              .from(customers)
              .where(eq(customers.id, plan.customerId))
              .limit(1)
            
            results.push({
              type: 'action-plan',
              id: plan.id,
              title: `Action Plan for ${customer?.name || 'Customer'}`,
              subtitle: plan.whatToDo.substring(0, 100) + '...',
              link: plan.customerId ? `/triage/customers/${plan.customerId}/action-plans/${plan.id}` : `/triage`,
              date: plan.createdAt.toISOString(),
            })
          }
        }
      }
      
      // Sort results
      if (input?.sortBy === 'recent') {
        results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }
      
      // Apply pagination
      const paginatedResults = results.slice(offset, offset + limit)
      
      return {
        results: paginatedResults,
        total: results.length,
        limit,
        offset,
      }
    }),
})

