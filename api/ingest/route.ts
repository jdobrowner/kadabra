// Load environment variables for server-side code
import 'dotenv/config'

import { db } from '../../src/server/db'
import { analyzeCommunication } from '../../src/server/services/llm'
import { validateApiKey } from '../../src/server/auth/api-keys'
import { normalizePhoneNumber, phoneNumbersMatch } from '../../src/server/utils/phone-utils'
import { companyNamesMatch, personNamesMatch } from '../../src/server/utils/name-utils'
import { getApiKeyRateLimiter, getLLMRateLimiter } from '../../src/server/middleware/rate-limit'
import {
  emitCustomerChange,
  emitConversationChange,
  emitActionPlanChange,
} from '../../src/server/services/events'
import {
  customers,
  conversations,
  actionPlans,
  actionItems,
  communications,
  lastCommunications,
  orgs,
} from '../../src/server/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * POST /api/ingest
 * 
 * Ingests incoming communications (email, SMS, transcribed calls, voice messages)
 * Analyzes them with LLM and creates database records
 * 
 * Authentication: Requires X-API-Key header with valid API key
 */
export async function POST(request: Request) {
  try {
    // Authenticate via API key
    const apiKey = request.headers.get('X-API-Key')
    if (!apiKey) {
      return Response.json(
        { error: 'Missing X-API-Key header' },
        { status: 401 }
      )
    }

    const keyValidation = await validateApiKey(db, apiKey)
    if (!keyValidation) {
      return Response.json(
        { error: 'Invalid or expired API key' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate required fields
    const { channel, content, metadata } = body

    if (!channel || !content) {
      return Response.json(
        { error: 'Missing required fields: channel, content' },
        { status: 400 }
      )
    }

    // Use orgId from API key validation (ensures user can only ingest to their org)
    const orgId = keyValidation.orgId

    // Validate channel
    const validChannels = ['phone', 'email', 'sms', 'voice-message']
    if (!validChannels.includes(channel)) {
      return Response.json(
        { error: `Invalid channel. Must be one of: ${validChannels.join(', ')}` },
        { status: 400 }
      )
    }

    // Verify org exists (double-check)
    const [org] = await db.select().from(orgs).where(eq(orgs.id, orgId)).limit(1)
    if (!org) {
      return Response.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Rate limiting - check API key rate limit
    const apiKeyRateLimit = getApiKeyRateLimiter()
    const apiKeyLimitResult = apiKeyRateLimit(request as any)
    if (!apiKeyLimitResult.allowed) {
      return Response.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((apiKeyLimitResult.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((apiKeyLimitResult.resetAt - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': apiKeyLimitResult.resetAt.toString(),
          },
        }
      )
    }

    // Rate limiting - check LLM rate limit (per org)
    const llmRateLimit = getLLMRateLimiter()
    const llmLimitResult = llmRateLimit(request as any)
    if (!llmLimitResult.allowed) {
      return Response.json(
        {
          error: 'LLM rate limit exceeded',
          message: 'Too many LLM requests. Please try again later.',
          retryAfter: Math.ceil((llmLimitResult.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((llmLimitResult.resetAt - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': llmLimitResult.resetAt.toString(),
          },
        }
      )
    }

    // Analyze communication with LLM
    const analysis = await analyzeCommunication(channel, content, metadata)

    // Find or create customer
    // Try to match by email first, then phone, then name + company (with fuzzy matching)
    let customer = null
    
    // Step 1: Match by email (case-insensitive)
    if (analysis.customer.email) {
      const allCustomers = await db
        .select()
        .from(customers)
        .where(eq(customers.orgId, orgId))
      
      customer = allCustomers.find(
        c => c.email && c.email.toLowerCase() === analysis.customer.email!.toLowerCase()
      ) || null
    }
    
    // Step 2: Match by phone (normalized)
    if (!customer && analysis.customer.phone) {
      const allCustomers = await db
        .select()
        .from(customers)
        .where(eq(customers.orgId, orgId))
      
      customer = allCustomers.find(
        c => c.phone && phoneNumbersMatch(c.phone, analysis.customer.phone!)
      ) || null
    }
    
    // Step 3: Match by name + company (fuzzy matching)
    if (!customer) {
      const allCustomers = await db
        .select()
        .from(customers)
        .where(eq(customers.orgId, orgId))
      
      customer = allCustomers.find(
        c => personNamesMatch(c.name, analysis.customer.name) &&
             companyNamesMatch(c.companyName, analysis.customer.companyName)
      ) || null
    }

    if (!customer) {
      // Create new customer
      const customerId = `customer-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        analysis.customer.name
      )}&background=random`

      // Normalize phone number before storing
      const normalizedPhone = analysis.customer.phone 
        ? normalizePhoneNumber(analysis.customer.phone)
        : null

      await db.insert(customers).values({
        id: customerId,
        orgId,
        name: analysis.customer.name,
        companyName: analysis.customer.companyName,
        email: analysis.customer.email?.toLowerCase() || null,
        phone: normalizedPhone || null,
        avatar: avatarUrl,
        riskScore: analysis.riskScore || null,
        opportunityScore: analysis.opportunityScore || null,
      })

      const [newCustomer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, customerId))
        .limit(1)

      customer = newCustomer!
      
      // Emit customer created event
      emitCustomerChange('created', orgId, customerId)
    } else {
      // Update existing customer with new info if available
      const updates: {
        email?: string
        phone?: string
        riskScore?: number | null
        opportunityScore?: number | null
        updatedAt?: Date
      } = {
        updatedAt: new Date(),
      }

      if (analysis.customer.email && !customer.email) {
        updates.email = analysis.customer.email.toLowerCase()
      }
      if (analysis.customer.phone && !customer.phone) {
        updates.phone = normalizePhoneNumber(analysis.customer.phone)
      } else if (analysis.customer.phone && customer.phone) {
        // Normalize both and update if different
        const normalizedNew = normalizePhoneNumber(analysis.customer.phone)
        const normalizedExisting = normalizePhoneNumber(customer.phone)
        if (normalizedNew !== normalizedExisting) {
          updates.phone = normalizedNew
        }
      }
      if (analysis.riskScore !== undefined) {
        updates.riskScore = analysis.riskScore
      }
      if (analysis.opportunityScore !== undefined) {
        updates.opportunityScore = analysis.opportunityScore
      }

      if (Object.keys(updates).length > 1) {
        // More than just updatedAt
        await db.update(customers).set(updates).where(eq(customers.id, customer.id))
        // Emit customer updated event
        emitCustomerChange('updated', orgId, customer.id)
      }
    }

    // Parse date from metadata or use current time
    const conversationDate = metadata?.date ? new Date(metadata.date) : new Date()

    // Create conversation record
    const conversationId = `conversation-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
    await db.insert(conversations).values({
      id: conversationId,
      customerId: customer.id,
      recordedByUserId: null, // Can be set if we know who recorded it
      channel: channel as 'phone' | 'email' | 'sms' | 'voice-message',
      date: conversationDate,
      duration: metadata?.duration || null,
      messageCount: metadata?.messageCount || null,
      transcript: content,
      summary: analysis.conversation.summary,
      sentiment: analysis.conversation.sentiment,
      intent: analysis.conversation.intent,
      subject: metadata?.subject || null,
      insights: analysis.conversation.insights || [],
      keyStats: analysis.conversation.keyStats || null,
      messages: metadata?.messages || null, // If structured message format provided
    })

    // Emit conversation created event
    emitConversationChange('created', orgId, conversationId, {
      customerId: customer.id,
    })

    // Update or create communications aggregate
    const [existingComm] = await db
      .select()
      .from(communications)
      .where(
        and(
          eq(communications.customerId, customer.id),
          eq(communications.type, channel as 'phone' | 'email' | 'sms' | 'voice-message')
        )
      )
      .limit(1)

    if (existingComm) {
      await db
        .update(communications)
        .set({
          count: existingComm.count + 1,
          lastTime: conversationDate,
        })
        .where(eq(communications.id, existingComm.id))
    } else {
      const commId = `comm-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      await db.insert(communications).values({
        id: commId,
        customerId: customer.id,
        type: channel as 'phone' | 'email' | 'sms' | 'voice-message',
        count: 1,
        lastTime: conversationDate,
      })
    }

    // Update last communication - use LLM-generated topics
    const topicSummary = analysis.conversation.topic || analysis.conversation.summary.substring(0, 100)
    const shortTopic = analysis.conversation.shortTopic || analysis.conversation.intent.substring(0, 20) || 'Communication'
    const longTopic = analysis.conversation.longTopic || analysis.conversation.summary

    const [existingLastComm] = await db
      .select()
      .from(lastCommunications)
      .where(eq(lastCommunications.customerId, customer.id))
      .limit(1)

    if (existingLastComm) {
      await db
        .update(lastCommunications)
        .set({
          type: channel as 'phone' | 'email' | 'sms' | 'voice-message',
          time: conversationDate,
          topic: topicSummary,
          shortTopic,
          longTopic,
        })
        .where(eq(lastCommunications.id, existingLastComm.id))
    } else {
      const lastCommId = `lastcomm-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      await db.insert(lastCommunications).values({
        id: lastCommId,
        customerId: customer.id,
        type: channel as 'phone' | 'email' | 'sms' | 'voice-message',
        time: conversationDate,
        topic: topicSummary,
        shortTopic,
        longTopic,
      })
    }

    // Create action plan if recommended
    // First, cancel any existing active action plans for this customer
    let actionPlanId: string | null = null
    if (analysis.actionPlan) {
      const existingActivePlans = await db
        .select()
        .from(actionPlans)
        .where(
          and(
            eq(actionPlans.customerId, customer.id),
            eq(actionPlans.status, 'active')
          )
        )
      
      // Cancel all existing active plans
      for (const plan of existingActivePlans) {
        await db
          .update(actionPlans)
          .set({
            status: 'canceled',
            canceledAt: new Date(),
          })
          .where(eq(actionPlans.id, plan.id))
      }
      
      // Create new action plan
      actionPlanId = `actionplan-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      await db.insert(actionPlans).values({
        id: actionPlanId,
        customerId: customer.id,
        assignedToUserId: null, // Can be assigned later
        badge: analysis.actionPlan.badge,
        recommendation: analysis.actionPlan.recommendation || analysis.actionPlan.whatToDo.substring(0, 100), // Fallback to truncated whatToDo if recommendation missing
        whatToDo: analysis.actionPlan.whatToDo,
        whyStrategy: analysis.actionPlan.whyStrategy,
        status: 'active',
      })

      // Emit action plan created event
      emitActionPlanChange('created', orgId, actionPlanId, {
        customerId: customer.id,
      })

      // Create action items if provided
      if (analysis.actionPlan.actionItems && analysis.actionPlan.actionItems.length > 0) {
        for (const item of analysis.actionPlan.actionItems) {
          const itemId = `actionitem-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
          await db.insert(actionItems).values({
            id: itemId,
            actionPlanId: actionPlanId!,
            type: item.type,
            title: item.title,
            description: item.description,
            status: 'pending' as const,
          })
        }
      }
    }

    return Response.json({
      success: true,
      customerId: customer.id,
      conversationId,
      actionPlanId,
    })
  } catch (error) {
    console.error('Error ingesting communication:', error)
    return Response.json(
      {
        error: 'Failed to ingest communication',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

