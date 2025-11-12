import { z } from 'zod'
import { router, publicProcedure, TRPCError } from '../trpc'
import { customers, communications, lastCommunications, actionPlans, conversations, tasks } from '../../db/schema'
import { eq, sql, gte, and, inArray } from 'drizzle-orm'

export const customersRouter = router({
  list: publicProcedure
    .input(
      z.object({
        badge: z.enum(['at-risk', 'opportunity', 'lead', 'follow-up', 'no-action', 'all']).optional(),
        sortBy: z.enum(['priority', 'most-recent']).optional(),
        timeframe: z.enum(['all', 'today', '24h', '7d', '30d']).optional(),
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
      
      // Get all customers for this org
      let customerList = await db
        .select()
        .from(customers)
        .where(eq(customers.orgId, org.id))
      
      // Apply timeframe filter if provided
      if (input?.timeframe && input.timeframe !== 'all') {
        const now = new Date()
        let cutoffDate: Date
        
        switch (input.timeframe) {
          case 'today':
            cutoffDate = new Date(now.setHours(0, 0, 0, 0))
            break
          case '24h':
            cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
            break
          case '7d':
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case '30d':
            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
          default:
            cutoffDate = new Date(0)
        }
        
        // Filter by last communication time (only for customers in this org)
        const recentLastComms = await db
          .select({ customerId: lastCommunications.customerId })
          .from(lastCommunications)
          .innerJoin(customers, eq(lastCommunications.customerId, customers.id))
          .where(and(
            gte(lastCommunications.time, cutoffDate),
            eq(customers.orgId, org.id)
          ))
        
        const customerIds = new Set(recentLastComms.map(c => c.customerId))
        customerList = customerList.filter(c => customerIds.has(c.id))
      }
      
      // Apply badge filter if provided
      if (input?.badge && input.badge !== 'all') {
        // Badge is on action plan, so filter by action plan badge (only for customers in this org with active plans)
        const plansWithBadge = await db
          .select({ customerId: actionPlans.customerId })
          .from(actionPlans)
          .innerJoin(customers, eq(actionPlans.customerId, customers.id))
          .where(and(
            eq(actionPlans.badge, input.badge),
            eq(actionPlans.status, 'active'),
            eq(customers.orgId, org.id)
          ))
        
        const customerIds = new Set(plansWithBadge.map(p => p.customerId))
        customerList = customerList.filter(c => customerIds.has(c.id))
      }
      
      // By default, only show customers with active action plans (unless explicitly filtering)
      // This ensures triage page only shows actionable customers
      if (!input?.badge || input.badge === 'all') {
        const customersWithActivePlans = await db
          .select({ customerId: actionPlans.customerId })
          .from(actionPlans)
          .innerJoin(customers, eq(actionPlans.customerId, customers.id))
          .where(and(
            eq(actionPlans.status, 'active'),
            eq(customers.orgId, org.id)
          ))
        
        const customerIds = new Set(customersWithActivePlans.map(p => p.customerId))
        customerList = customerList.filter(c => customerIds.has(c.id))
      }
      
      const customerIds = customerList.map(c => c.id)
      if (customerIds.length === 0) {
        return []
      }

      const [
        communicationsRows,
        lastCommRows,
        activePlans,
        conversationCounts,
        taskCounts,
        totalActionPlanCounts,
      ] = await Promise.all([
        db
          .select()
          .from(communications)
          .where(inArray(communications.customerId, customerIds)),
        db
          .select()
          .from(lastCommunications)
          .where(inArray(lastCommunications.customerId, customerIds)),
        db
          .select()
          .from(actionPlans)
          .where(and(
            inArray(actionPlans.customerId, customerIds),
            eq(actionPlans.status, 'active')
          )),
        db
          .select({
            customerId: conversations.customerId,
            count: sql<number>`count(*)`,
          })
          .from(conversations)
          .where(inArray(conversations.customerId, customerIds))
          .groupBy(conversations.customerId),
        db
          .select({
            customerId: tasks.customerId,
            count: sql<number>`count(*)`,
          })
          .from(tasks)
          .where(inArray(tasks.customerId, customerIds))
          .groupBy(tasks.customerId),
        db
          .select({
            customerId: actionPlans.customerId,
            count: sql<number>`count(*)`,
          })
          .from(actionPlans)
          .where(inArray(actionPlans.customerId, customerIds))
          .groupBy(actionPlans.customerId),
      ])

      const communicationsByCustomer = new Map<string, typeof communicationsRows>()
      communicationsRows.forEach((row) => {
        if (!row.customerId) return
        if (!communicationsByCustomer.has(row.customerId)) {
          communicationsByCustomer.set(row.customerId, [])
        }
        communicationsByCustomer.get(row.customerId)!.push(row)
      })

      const lastCommByCustomer = new Map<string, typeof lastCommRows[number]>()
      lastCommRows.forEach((row) => {
        if (!row.customerId) return
        if (!lastCommByCustomer.has(row.customerId)) {
          lastCommByCustomer.set(row.customerId, row)
        }
      })

      const activePlanByCustomer = new Map<string, typeof activePlans[number]>()
      activePlans.forEach((plan) => {
        if (!plan.customerId) return
        if (!activePlanByCustomer.has(plan.customerId)) {
          activePlanByCustomer.set(plan.customerId, plan)
        }
      })

      const conversationCountMap = new Map<string, number>()
      conversationCounts.forEach(({ customerId, count }) => {
        if (!customerId) return
        conversationCountMap.set(customerId, Number(count) || 0)
      })

      const taskCountMap = new Map<string, number>()
      taskCounts.forEach(({ customerId, count }) => {
        if (!customerId) return
        taskCountMap.set(customerId, Number(count) || 0)
      })

      const actionPlansCountMap = new Map<string, number>()
      totalActionPlanCounts.forEach(({ customerId, count }) => {
        if (!customerId) return
        actionPlansCountMap.set(customerId, Number(count) || 0)
      })

      const result = customerList.map((customer) => {
        const comms = communicationsByCustomer.get(customer.id) ?? []
        const lastComm = lastCommByCustomer.get(customer.id)
        const activePlan = activePlanByCustomer.get(customer.id) ?? null

        return {
          id: customer.id,
          name: customer.name,
          companyName: customer.companyName,
          email: customer.email,
          phone: customer.phone,
          riskScore: customer.riskScore,
          opportunityScore: customer.opportunityScore,
          communications: comms.map(c => ({
            type: c.type,
            count: c.count,
            lastTime: c.lastTime.toISOString(),
          })),
          lastCommunication: lastComm ? {
            type: lastComm.type,
            time: lastComm.time.toISOString(),
            topic: lastComm.topic,
            shortTopic: lastComm.shortTopic,
            longTopic: lastComm.longTopic,
          } : undefined,
          actionPlan: activePlan ? {
            id: activePlan.id,
            badge: activePlan.badge,
            aiRecommendation: activePlan.recommendation || activePlan.whatToDo,
          } : null,
          avatar: customer.avatar,
          createdAt: customer.createdAt.toISOString(),
          updatedAt: customer.updatedAt.toISOString(),
          totalConversations: conversationCountMap.get(customer.id) ?? 0,
          totalTasks: taskCountMap.get(customer.id) ?? 0,
          totalActionPlans: actionPlansCountMap.get(customer.id) ?? 0,
        }
      })
      
      // Apply sorting
      if (input?.sortBy === 'most-recent') {
        result.sort((a, b) => {
          const aTime = a.lastCommunication?.time || a.createdAt
          const bTime = b.lastCommunication?.time || b.createdAt
          return new Date(bTime).getTime() - new Date(aTime).getTime()
        })
      } else {
        // Sort by priority (riskScore + opportunityScore)
        result.sort((a, b) => {
          const aScore = (a.riskScore || 0) + (a.opportunityScore || 0)
          const bScore = (b.riskScore || 0) + (b.opportunityScore || 0)
          return bScore - aScore
        })
      }
      
      return result
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, org } = ctx
      
      if (!org) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Organization context required',
        })
      }
      
      const [customer] = await db
        .select()
        .from(customers)
        .where(and(
          eq(customers.id, input.id),
          eq(customers.orgId, org.id)
        ))
        .limit(1)
      
      if (!customer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        })
      }
      
      // Get aggregate counts
      const [conversationsCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(conversations)
        .where(eq(conversations.customerId, customer.id))
      
      const [tasksCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(tasks)
        .where(eq(tasks.customerId, customer.id))
      
      const [actionPlansCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(actionPlans)
        .where(eq(actionPlans.customerId, customer.id))
      
      return {
        id: customer.id,
        name: customer.name,
        companyName: customer.companyName,
        email: customer.email,
        phone: customer.phone,
        riskScore: customer.riskScore,
        opportunityScore: customer.opportunityScore,
        avatar: customer.avatar,
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString(),
        totalConversations: Number(conversationsCount?.count || 0),
        totalTasks: Number(tasksCount?.count || 0),
        totalActionPlans: Number(actionPlansCount?.count || 0),
      }
    }),
})

