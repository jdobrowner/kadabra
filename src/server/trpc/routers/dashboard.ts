import { router, publicProcedure, TRPCError } from '../trpc'
import { customers, actionPlans } from '../../db/schema'
import { gte, eq, and, sql, inArray } from 'drizzle-orm'

export const dashboardRouter = router({
  stats: publicProcedure.query(async ({ ctx }) => {
    const { db, org } = ctx
    
    if (!org) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Organization context required',
      })
    }
    
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    // Get customer IDs for this org
    const orgCustomers = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.orgId, org.id))
    
    const customerIds = orgCustomers.map(c => c.id)
    
    if (customerIds.length === 0) {
      return {
        customersAnalyzed: 0,
        actionPlansCreated: 0,
        urgentActionPlans: 0,
      }
    }
    
    // Customers analyzed (created in last 24h)
    const [customersAnalyzed] = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers)
      .where(and(
        eq(customers.orgId, org.id),
        gte(customers.createdAt, last24h)
      ))
    
    // Active action plans (for customers in this org)
    const [activeActionPlans] = await db
      .select({ count: sql<number>`count(*)` })
      .from(actionPlans)
      .where(and(
        eq(actionPlans.status, 'active'),
        inArray(actionPlans.customerId, customerIds)
      ))
    
    // Urgent action plans (active with badge = 'at-risk') for customers in this org
    const [urgentActionPlans] = await db
      .select({ count: sql<number>`count(*)` })
      .from(actionPlans)
      .where(and(
        eq(actionPlans.status, 'active'),
        eq(actionPlans.badge, 'at-risk'),
        inArray(actionPlans.customerId, customerIds)
      ))
    
    return {
      customersAnalyzed: Number(customersAnalyzed?.count || 0),
      actionPlansCreated: Number(activeActionPlans?.count || 0), // Now counts active plans
      urgentActionPlans: Number(urgentActionPlans?.count || 0), // Now counts at-risk active plans
    }
  }),
})

