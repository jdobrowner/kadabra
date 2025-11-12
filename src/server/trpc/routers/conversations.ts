import { z } from 'zod'
import { router, protectedProcedure, TRPCError } from '../trpc'
import type { Database } from '../../db'
import { conversations, customers, communications, lastCommunications, actionPlans, actionItems } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { isDeveloperOrAdmin } from '../utils/auth'
import { normalizePhoneNumber, phoneNumbersMatch } from '../../utils/phone-utils'
import { companyNamesMatch, personNamesMatch } from '../../utils/name-utils'
import { analyzeCommunication, type CommunicationAnalysis } from '../../services/llm'
import { getLLMRateLimiter } from '../../middleware/rate-limit'
import { emitCustomerChange, emitConversationChange, emitActionPlanChange } from '../../services/events'
// import { emitCsvJobChange } from '../../services/events' // TODO: Re-enable when needed

// Generate ID helper
function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

type ConversationChannel = 'phone' | 'email' | 'sms' | 'chat' | 'video' | 'ai-call' | 'voice-message'

interface ConversationMetadata {
  subject?: string
  date?: string
  duration?: number
  messageCount?: number
}

interface CustomerFallbackData {
  name?: string | null
  email?: string | null
  phone?: string | null
  companyName?: string | null
}

interface ConversationFallbackData {
  summary?: string | null
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed' | null
  intent?: string | null
  insights?: string[]
  keyStats?: Record<string, any> | null
  topic?: string | null
  shortTopic?: string | null
  longTopic?: string | null
}

function isValidSentiment(value: string | null | undefined): value is 'positive' | 'neutral' | 'negative' | 'mixed' {
  return value === 'positive' || value === 'neutral' || value === 'negative' || value === 'mixed'
}

async function ingestAnalyzedConversation(options: {
  db: Database
  orgId: string
  userId: string
  channel: ConversationChannel
  transcript: string
  metadata?: ConversationMetadata
  analysis?: CommunicationAnalysis | null
  customerFallback?: CustomerFallbackData
  conversationFallback?: ConversationFallbackData
}) {
  const {
    db,
    orgId,
    userId,
    channel,
    transcript,
    metadata,
    analysis,
    customerFallback,
    conversationFallback,
  } = options

  const analysisCustomer = analysis?.customer
  const analysisConversation = analysis?.conversation

  const fallbackCustomer = customerFallback ?? {}
  const fallbackConversation = conversationFallback ?? {}

  const finalCustomerName =
    analysisCustomer?.name?.trim() ||
    fallbackCustomer.name?.toString().trim() ||
    'Unknown Customer'

  const finalCompanyName =
    analysisCustomer?.companyName?.trim() ||
    fallbackCustomer.companyName?.toString().trim() ||
    'Unknown Company'

  const finalEmail =
    analysisCustomer?.email?.toLowerCase() ||
    fallbackCustomer.email?.toLowerCase() ||
    null

  const finalPhoneRaw =
    analysisCustomer?.phone ||
    fallbackCustomer.phone ||
    null
  const finalPhone = finalPhoneRaw ? normalizePhoneNumber(finalPhoneRaw) : null

  const fallbackSummary = fallbackConversation.summary || transcript.substring(0, 200)
  const finalSummary = analysisConversation?.summary || fallbackSummary

  const analysisSentiment = analysisConversation?.sentiment
  const fallbackSentiment = fallbackConversation.sentiment
  const finalSentiment = isValidSentiment(analysisSentiment)
    ? analysisSentiment
    : isValidSentiment(fallbackSentiment)
      ? fallbackSentiment
      : null

  const finalIntent = analysisConversation?.intent || fallbackConversation.intent || 'General inquiry'

  const finalInsights =
    (analysisConversation?.insights && analysisConversation.insights.length > 0)
      ? analysisConversation.insights
      : fallbackConversation.insights ?? []

  const finalKeyStats = analysisConversation?.keyStats ?? fallbackConversation.keyStats ?? null

  const topicBase = analysisConversation?.topic || fallbackConversation.topic || finalIntent || 'Communication'
  const shortTopicBase = analysisConversation?.shortTopic || fallbackConversation.shortTopic || topicBase
  const longTopicBase = analysisConversation?.longTopic || fallbackConversation.longTopic || finalSummary

  let conversationDate = metadata?.date ? new Date(metadata.date) : new Date()
  if (Number.isNaN(conversationDate.getTime())) {
    conversationDate = new Date()
  }

  const duration = metadata?.duration ?? null
  const messageCount =
    metadata?.messageCount ??
    (channel === 'email' || channel === 'sms' ? 1 : null)

  let customer = await findOrCreateCustomer(
    db,
    orgId,
    finalCustomerName,
    finalEmail,
    finalPhone,
    finalCompanyName
  )

  if (analysis) {
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
    }
    if (analysis.riskScore !== undefined) {
      updates.riskScore = analysis.riskScore
    }
    if (analysis.opportunityScore !== undefined) {
      updates.opportunityScore = analysis.opportunityScore
    }

    if (Object.keys(updates).length > 1) {
      await db.update(customers).set(updates).where(eq(customers.id, customer.id))
      emitCustomerChange('updated', orgId, customer.id)

      const [updatedCustomer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, customer.id))
        .limit(1)

      if (updatedCustomer) {
        customer = updatedCustomer
      }
    }
  }

  const conversationId = generateId('conversation-')
  await db.insert(conversations).values({
    id: conversationId,
    customerId: customer.id,
    recordedByUserId: userId,
    channel: channel as any,
    date: conversationDate,
    duration,
    transcript,
    summary: finalSummary,
    sentiment: finalSentiment,
    intent: finalIntent,
    insights: finalInsights,
    keyStats: finalKeyStats,
    messageCount,
  })

  emitConversationChange('created', orgId, conversationId, {
    customerId: customer.id,
  })

  await updateCommunicationsCounts(
    db,
    customer.id,
    channel,
    conversationDate,
    topicBase,
    shortTopicBase,
    longTopicBase
  )

  let actionPlanId: string | null = null
  if (analysis?.actionPlan) {
    const existingActivePlans = await db
      .select()
      .from(actionPlans)
      .where(
        and(
          eq(actionPlans.customerId, customer.id),
          eq(actionPlans.status, 'active')
        )
      )

    for (const plan of existingActivePlans) {
      await db
        .update(actionPlans)
        .set({
          status: 'canceled',
          canceledAt: new Date(),
        })
        .where(eq(actionPlans.id, plan.id))
    }

    actionPlanId = generateId('actionplan-')
    await db.insert(actionPlans).values({
      id: actionPlanId,
      customerId: customer.id,
      assignedToUserId: null,
      badge: analysis.actionPlan.badge,
      recommendation:
        analysis.actionPlan.recommendation ||
        analysis.actionPlan.whatToDo.substring(0, 100),
      whatToDo: analysis.actionPlan.whatToDo,
      whyStrategy: analysis.actionPlan.whyStrategy,
      status: 'active',
    })

    emitActionPlanChange('created', orgId, actionPlanId, {
      customerId: customer.id,
    })

    if (analysis.actionPlan.actionItems && analysis.actionPlan.actionItems.length > 0) {
      for (const item of analysis.actionPlan.actionItems) {
        const itemId = generateId('actionitem-')
        await db.insert(actionItems).values({
          id: itemId,
          actionPlanId: actionPlanId,
          type: item.type,
          title: item.title,
          description: item.description,
          status: 'pending' as const,
        })
      }
    }
  }

  return {
    customerId: customer.id,
    conversationId,
    actionPlanId,
  }
}

/**
 * CSV Upload Router
 * Allows admin/developer users to upload CSV files containing conversations
 */
export const conversationsRouter = router({
  /**
   * Upload conversations from CSV file
   * CSV format:
   * - customer_name (required): Name of the customer
   * - customer_email (optional): Email address
   * - customer_phone (optional): Phone number
   * - customer_company (optional): Company name
   * - channel (required): phone, email, sms, chat, video, ai-call, voice-message
   * - date (required): ISO 8601 date string
   * - transcript (required): For voice-type channels, this is the transcript text
   * - content (optional): For non-voice channels, this is the message content
   * - summary (optional): Conversation summary
   * - sentiment (optional): positive, neutral, negative, mixed
   * - duration (optional): Duration in minutes (for voice/video)
   * 
   * If analyzeWithAI is true (default), the system will use OpenAI to analyze each conversation
   * and create action plans, similar to the ingest API.
   */
  uploadCsv: protectedProcedure
    .input(
      z.object({
        csvData: z.string(), // Base64 encoded CSV content or raw CSV string
        isBase64: z.boolean().optional().default(false),
        analyzeWithAI: z.boolean().optional().default(true), // Whether to analyze with LLM
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user, org } = ctx
      const orgId = org.id
      const userId = user.id

      // Check if user is admin or developer
      const hasPermission = await isDeveloperOrAdmin(db, user.id, org.id)
      if (!hasPermission) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only admin and developer users can upload conversations',
        })
      }

      // Parse CSV data
      let csvText: string
      if (input.isBase64) {
        csvText = Buffer.from(input.csvData, 'base64').toString('utf-8')
      } else {
        csvText = input.csvData
      }

      // Parse CSV using papaparse
      const Papa = await import('papaparse')
      const parseResult = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase(),
      })

      if (parseResult.errors.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `CSV parsing errors: ${parseResult.errors.map(e => e.message).join(', ')}`,
        })
      }

      const rows = parseResult.data as Array<Record<string, string>>
      if (rows.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'CSV file is empty or has no valid rows',
        })
      }

      // Validate required columns
      const requiredColumns = ['customer_name', 'channel', 'date']
      const firstRow = rows[0]
      const missingColumns = requiredColumns.filter(col => !firstRow[col])
      if (missingColumns.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Missing required columns: ${missingColumns.join(', ')}`,
        })
      }

      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
      }

      // Process each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const rowNumber = i + 2 // +2 because CSV is 1-indexed and has header

        try {
          // Extract and validate data
          const customerName = row.customer_name?.trim()
          const customerEmail = row.customer_email?.trim().toLowerCase() || null
          const customerPhone = row.customer_phone?.trim() || null
          const customerCompany = row.customer_company?.trim() || null
          const channel = row.channel?.trim().toLowerCase()
          const dateStr = row.date?.trim()
          const transcript = row.transcript?.trim() || row.content?.trim() || ''
          const summary = row.summary?.trim() || null
          const sentiment = row.sentiment?.trim().toLowerCase() || null
          const duration = row.duration ? parseInt(row.duration, 10) : null

          // Validate required fields
          if (!customerName) {
            throw new Error('customer_name is required')
          }
          if (!channel) {
            throw new Error('channel is required')
          }
          const validChannels = ['phone', 'email', 'sms', 'chat', 'video', 'ai-call', 'voice-message']
          if (!validChannels.includes(channel)) {
            throw new Error(`Invalid channel: ${channel}. Must be one of: ${validChannels.join(', ')}`)
          }
          if (!dateStr) {
            throw new Error('date is required')
          }
          
          // For voice-type channels, transcript is required
          const voiceChannels = ['phone', 'ai-call', 'voice-message', 'video']
          if (voiceChannels.includes(channel) && !transcript) {
            throw new Error(`transcript is required for channel type: ${channel}`)
          }

          // Parse date
          const date = new Date(dateStr)
          if (isNaN(date.getTime())) {
            throw new Error(`Invalid date format: ${dateStr}`)
          }

          // Normalize phone number if provided
          let normalizedPhone = customerPhone ? normalizePhoneNumber(customerPhone) : null

          // Analyze with LLM if enabled
          let analysis = null
          if (input.analyzeWithAI && transcript) {
            try {
              // Check LLM rate limit (per org)
              const llmRateLimit = getLLMRateLimiter()
              // Create a mock request object with orgId for rate limiting
              const mockRequest = {
                headers: {
                  get: (name: string) => {
                    if (name === 'x-org-id') return org.id
                    return null
                  }
                }
              } as any
              const llmLimitResult = llmRateLimit(mockRequest)
              
              if (llmLimitResult.allowed) {
                analysis = await analyzeCommunication(
                  channel as 'phone' | 'email' | 'sms' | 'voice-message',
                  transcript,
                  {
                    subject: row.subject?.trim() || undefined,
                    date: dateStr,
                    duration: duration || undefined,
                    messageCount: channel === 'email' || channel === 'sms' ? 1 : undefined,
                  }
                )
              } else {
                // Rate limited, skip LLM analysis for this row
                console.warn(`LLM rate limit exceeded for row ${rowNumber}, skipping analysis`)
              }
            } catch (error: any) {
              // If LLM analysis fails, continue with CSV data only
              console.error(`LLM analysis failed for row ${rowNumber}:`, error.message)
              // Continue without analysis
            }
          }

          await ingestAnalyzedConversation({
            db,
            orgId,
            userId,
            channel: channel as ConversationChannel,
            transcript,
            metadata: {
              subject: row.subject?.trim() || undefined,
              date: dateStr,
              duration: duration ?? undefined,
              messageCount: channel === 'email' || channel === 'sms' ? 1 : undefined,
            },
            analysis,
            customerFallback: {
              name: customerName,
              email: customerEmail,
              phone: normalizedPhone,
              companyName: customerCompany || 'Unknown',
            },
            conversationFallback: {
              summary,
              sentiment: sentiment as 'positive' | 'neutral' | 'negative' | 'mixed' | null,
            },
          })

          results.success++
        } catch (error: any) {
          results.failed++
          results.errors.push(`Row ${rowNumber}: ${error.message}`)
        }
      }

      return {
        total: rows.length,
        success: results.success,
        failed: results.failed,
        errors: results.errors,
      }
    }),

  uploadAudio: protectedProcedure
    .input(
      z.object({
        audioBase64: z.string().min(1),
        fileName: z.string().optional(),
        channel: z.enum(['phone', 'voice-message', 'ai-call']).optional().default('voice-message'),
        durationSeconds: z.number().nonnegative().optional(),
        recordedAt: z.string().datetime().optional(),
        analyzeWithAI: z.boolean().optional().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user, org } = ctx
      const {
        audioBase64,
        fileName,
        channel,
        durationSeconds,
        recordedAt,
        analyzeWithAI,
      } = input

      try {
        Buffer.from(audioBase64, 'base64')
      } catch {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid audio payload. Expected base64 encoded data.',
        })
      }

      const displayName = fileName?.trim() || 'uploaded audio'
      const transcript = `Mock transcription for ${displayName} recorded on ${new Date().toLocaleString()}. This is placeholder content generated for testing the audio ingestion flow.`
      const recordedAtIso = recordedAt || new Date().toISOString()

      let analysis: CommunicationAnalysis | null = null
      if (analyzeWithAI) {
        try {
          const analysisChannel: 'phone' | 'email' | 'sms' | 'voice-message' =
            channel === 'phone' || channel === 'ai-call' ? 'phone' : 'voice-message'

          analysis = await analyzeCommunication(analysisChannel, transcript, {
            subject: fileName || undefined,
            date: recordedAtIso,
            duration: durationSeconds ?? undefined,
          })
        } catch (error) {
          console.error('Audio analysis failed:', error)
        }
      }

      await ingestAnalyzedConversation({
        db,
        orgId: org.id,
        userId: user.id,
        channel: channel as ConversationChannel,
        transcript,
        metadata: {
          subject: fileName || undefined,
          date: recordedAtIso,
          duration: durationSeconds ?? undefined,
        },
        analysis,
        customerFallback: {
          name: 'Audio Upload Contact',
          companyName: 'Unknown Company',
        },
        conversationFallback: {
          summary: transcript,
          sentiment: 'neutral',
          intent: 'General inquiry',
          insights: ['Transcription generated from uploaded audio file'],
        },
      })

      return { success: true }
    }),
})

/**
 * Find existing customer or create new one
 */
async function findOrCreateCustomer(
  db: Database,
  orgId: string,
  name: string,
  email: string | null,
  phone: string | null,
  company: string | null
) {
  // Try to find existing customer by email
  if (email) {
    const [existingByEmail] = await db
      .select()
      .from(customers)
      .where(and(
        eq(customers.orgId, orgId),
        eq(customers.email, email)
      ))
      .limit(1)

    if (existingByEmail) {
      return existingByEmail
    }
  }

  // Try to find by phone
  if (phone) {
    const existingCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.orgId, orgId))

    const matchedByPhone = existingCustomers.find(c => 
      c.phone && phoneNumbersMatch(c.phone, phone)
    )

    if (matchedByPhone) {
      return matchedByPhone
    }
  }

  // Try to find by name + company
  if (name && company) {
    const existingCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.orgId, orgId))

    const matchedByName = existingCustomers.find(c => 
      personNamesMatch(c.name, name) && 
      (c.companyName && companyNamesMatch(c.companyName, company))
    )

    if (matchedByName) {
      return matchedByName
    }
  }

  // Create new customer
  const customerId = generateId('customer-')
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`

  await db.insert(customers).values({
    id: customerId,
    orgId,
    name,
    companyName: company || 'Unknown',
    email: email || null,
    phone: phone || null,
    avatar,
  })

  const [newCustomer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId))
    .limit(1)

  // Emit customer created event
  if (newCustomer) {
    emitCustomerChange('created', orgId, newCustomer.id)
  }

  return newCustomer!
}

/**
 * Update communications counts for a customer
 */
async function updateCommunicationsCounts(
  db: Database,
  customerId: string,
  channel: string,
  date: Date,
  topic?: string,
  shortTopic?: string,
  longTopic?: string
) {
  // Find existing communication record
  const [existing] = await db
    .select()
    .from(communications)
    .where(and(
      eq(communications.customerId, customerId),
      eq(communications.type, channel as any)
    ))
    .limit(1)

  if (existing) {
    // Update count
    await db
      .update(communications)
      .set({ count: existing.count + 1 })
      .where(eq(communications.id, existing.id))
  } else {
    // Create new record
    await db.insert(communications).values({
      id: generateId('communication-'),
      customerId,
      type: channel as any,
      count: 1,
      lastTime: new Date(),
    })
  }

  // Update last communication - use provided topics or generate fallbacks
  const topicSummary = topic || 'Communication'
  const shortTopicValue = shortTopic || 'Communication'
  const longTopicValue = longTopic || 'Communication'

  // lastCommunications has unique constraint on customerId, so we only need to check by customerId
  const [lastComm] = await db
    .select()
    .from(lastCommunications)
    .where(eq(lastCommunications.customerId, customerId))
    .limit(1)

  if (lastComm) {
    // Update if this is more recent
    if (date > new Date(lastComm.time)) {
      await db
        .update(lastCommunications)
        .set({ 
          type: channel as any,
          time: date,
          topic: topicSummary,
          shortTopic: shortTopicValue,
          longTopic: longTopicValue,
        })
        .where(eq(lastCommunications.id, lastComm.id))
    }
  } else {
    // Create new record
    await db.insert(lastCommunications).values({
      id: generateId('last-comm-'),
      customerId,
      type: channel as any,
      time: date,
      topic: topicSummary,
      shortTopic: shortTopicValue,
      longTopic: longTopicValue,
    })
  }
}
