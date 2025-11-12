import OpenAI from 'openai'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY not set. LLM features will not work.')
}

const openai = OPENAI_API_KEY
  ? new OpenAI({
      apiKey: OPENAI_API_KEY,
    })
  : null

export interface CommunicationAnalysis {
  customer: {
    name: string
    companyName: string
    email?: string
    phone?: string
  }
  conversation: {
    summary: string
    sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
    intent: string
    insights: string[]
    keyStats?: Record<string, any>
    topic: string // Short 2-4 word summary (20-30 chars) - e.g., "Billing Issue - Overcharge"
    shortTopic: string // Very brief 1-2 words (10-20 chars) - e.g., "Billing Issue"
    longTopic: string // 1-2 sentence summary (150-200 chars) - e.g., "Customer contacted regarding unexpected $2,450 charge, significantly higher than usual $800 fee. Immediate billing review needed."
  }
  actionPlan?: {
    badge: 'at-risk' | 'opportunity' | 'lead' | 'follow-up' | 'no-action'
    recommendation: string // Short summary for UI display (10-20 words) - e.g., "Immediate callback with billing specialist"
    whatToDo: string // Detailed action description
    whyStrategy: string // Brief explanation of why this action is recommended
    actionItems?: Array<{
      type: 'email' | 'call' | 'task' | 'text'
      title: string
      description: string
    }>
  }
  riskScore?: number // 0-100
  opportunityScore?: number // 0-100
}

/**
 * Analyze a communication using OpenAI
 */
export async function analyzeCommunication(
  channel: 'phone' | 'email' | 'sms' | 'voice-message',
  content: string,
  metadata?: {
    subject?: string // For email
    from?: string
    to?: string
    date?: string
    duration?: number // For calls, in minutes
    messageCount?: number // For email/sms threads
  }
): Promise<CommunicationAnalysis> {
  if (!openai) {
    throw new Error('OpenAI API key not configured')
  }

  const systemPrompt = `You are an AI assistant that analyzes customer communications (calls, emails, SMS, voice messages) and extracts structured information to help sales and support teams.

Your task is to analyze the communication and extract:
1. Customer information (name, company, email, phone)
2. Conversation insights (summary, sentiment, intent, key insights, topics)
3. Action recommendations (badge, what to do, why, action items)
4. Risk and opportunity scores (0-100)

CRITICAL: You must carefully analyze the communication content to determine the correct badge. DO NOT default to "follow-up". The badge must match the actual communication content and intent.

IMPORTANT: Return ONLY valid JSON in this exact structure:
{
  "customer": {
    "name": "string (required)",
    "companyName": "string (required, use 'Unknown' if not found)",
    "email": "string (optional)",
    "phone": "string (optional)"
  },
  "conversation": {
    "summary": "string (2-3 sentences, concise)",
    "sentiment": "positive" | "neutral" | "negative" | "mixed",
    "intent": "string (brief description of customer intent)",
    "insights": ["string array of key insights"],
    "keyStats": {}, // optional object with any relevant stats
    "topic": "string (2-4 words, 20-30 chars, e.g., 'Billing Issue - Overcharge')",
    "shortTopic": "string (1-2 words, 10-20 chars, e.g., 'Billing Issue')",
    "longTopic": "string (1-2 sentences, 150-200 chars, e.g., 'Customer contacted regarding unexpected $2,450 charge, significantly higher than usual $800 fee. Immediate billing review needed.')"
  },
  "actionPlan": {
    "badge": "at-risk" | "opportunity" | "lead" | "follow-up" | "no-action",
    "recommendation": "string (short 10-20 word summary for UI display, e.g., 'Immediate callback with billing specialist' or 'Schedule technical consultation')",
    "whatToDo": "string (detailed specific action to take, e.g., 'Create a Case for billing issue and assign to billing specialist for immediate review')",
    "whyStrategy": "string (brief explanation of why this action is recommended)",
    "actionItems": [
      {
        "type": "email" | "call" | "task" | "text",
        "title": "string",
        "description": "string"
      }
    ]
  },
  "riskScore": 0-100, // optional, estimate churn risk
  "opportunityScore": 0-100 // optional, estimate sales opportunity
}

BADGE SELECTION RULES (CRITICAL - Choose based on actual content, not default):

1. "at-risk": Use when customer:
   - Expresses frustration, anger, or dissatisfaction
   - Mentions cancellation, switching providers, or leaving
   - Has multiple complaints or unresolved issues
   - Shows signs of churn (e.g., "I'm done", "considering canceling", "unacceptable")
   - Example: "I'm frustrated and considering canceling my subscription"

2. "opportunity": Use when customer:
   - Shows interest in upgrading or purchasing more services
   - Asks about premium features, enterprise plans, or add-ons
   - Indicates readiness to buy or expand usage
   - Example: "I'm interested in upgrading to Enterprise plan"

3. "lead": Use when customer:
   - Is a new potential customer (not existing)
   - Requests demo, pricing, or product information
   - Shows initial interest in becoming a customer
   - Example: "I'd like to schedule a demo" (from new contact)

4. "follow-up": Use when customer:
   - Asks a routine question that needs a response
   - Needs information or clarification
   - Requires standard support follow-up
   - Example: "Where can I find the API documentation?"

5. "no-action": Use when customer:
   - Confirms resolution or thanks support
   - Provides informational update with no action needed
   - Closes the conversation positively
   - Example: "Thanks, everything is working now!"

BADGE VALIDATION:
- If customer mentions cancellation, frustration, or switching → "at-risk"
- If customer wants to upgrade or buy more → "opportunity"
- If customer is new and interested → "lead"
- If customer asks a simple question → "follow-up"
- If customer confirms resolution or thanks → "no-action"
- DO NOT default to "follow-up" - analyze the actual content first!

TOPIC GENERATION:
- "topic": Create a concise 2-4 word summary that captures the main subject (e.g., "Billing Issue - Overcharge", "Upgrade Inquiry", "Demo Request")
- "shortTopic": Extract the core 1-2 word topic (e.g., "Billing Issue", "Upgrade", "Demo")
- "longTopic": Write a 1-2 sentence summary (150-200 chars) that provides context and key details

ACTION PLAN GENERATION:
- "recommendation": Create a short, actionable summary (10-20 words) that clearly states what should be done. This will be displayed prominently in the UI.
  Examples:
  - "Immediate callback with billing specialist"
  - "Schedule technical consultation call"
  - "Create Case for service outage"
  - "Send enterprise pricing information"
  - "Follow up with API documentation"
- "whatToDo": Provide detailed, specific action steps (can be longer, 1-2 sentences)
- "whyStrategy": Explain the reasoning behind the recommendation (1-2 sentences)

The "recommendation" field should be unique and specific to each customer's situation. DO NOT use generic phrases like "Follow up" or "Review communication". Be specific and actionable.

Return valid JSON only, no markdown formatting.`

  const userPrompt = `Analyze this ${channel} communication:

${metadata?.subject ? `Subject: ${metadata.subject}\n` : ''}
${metadata?.from ? `From: ${metadata.from}\n` : ''}
${metadata?.to ? `To: ${metadata.to}\n` : ''}
${metadata?.date ? `Date: ${metadata.date}\n` : ''}
${metadata?.duration ? `Duration: ${metadata.duration} minutes\n` : ''}
${metadata?.messageCount ? `Message Count: ${metadata.messageCount}\n` : ''}

Content:
${content}`

  // Retry configuration
  const maxRetries = 3
  const baseDelay = 1000 // 1 second

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using mini for cost efficiency, can upgrade to gpt-4o if needed
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3, // Lower temperature for more consistent, structured output
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      let analysis: CommunicationAnalysis
      try {
        analysis = JSON.parse(content) as CommunicationAnalysis
      } catch (parseError) {
        throw new Error(`Failed to parse LLM response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
      }

      // Validate required fields
      if (!analysis.customer?.name || !analysis.customer?.companyName) {
        throw new Error('Invalid analysis: missing required customer fields')
      }

      if (!analysis.conversation?.summary || !analysis.conversation?.sentiment) {
        throw new Error('Invalid analysis: missing required conversation fields')
      }

      // Validate topic fields exist, generate if missing
      if (!analysis.conversation.topic || !analysis.conversation.shortTopic || !analysis.conversation.longTopic) {
        // Generate topics from summary if LLM didn't provide them
        const summary = analysis.conversation.summary
        const intent = analysis.conversation.intent
        
        analysis.conversation.topic = analysis.conversation.topic || 
          (summary ? summary.split(' ').slice(0, 4).join(' ').substring(0, 30) : 'Communication')
        analysis.conversation.shortTopic = analysis.conversation.shortTopic || 
          (intent ? intent.split(' ').slice(0, 2).join(' ').substring(0, 20) : 'Communication')
        analysis.conversation.longTopic = analysis.conversation.longTopic || 
          (summary ? summary.substring(0, 200) : 'Communication')
      }

      // Validate recommendation field exists, generate if missing
      if (analysis.actionPlan && !analysis.actionPlan.recommendation) {
        // Generate recommendation from whatToDo if LLM didn't provide it
        const whatToDo = analysis.actionPlan.whatToDo
        if (whatToDo) {
          // Extract first sentence or first 100 characters, whichever is shorter
          const firstSentence = whatToDo.split(/[.!?]/)[0].trim()
          analysis.actionPlan.recommendation = firstSentence.length > 0 && firstSentence.length <= 100
            ? firstSentence
            : whatToDo.substring(0, 100).trim()
        } else {
          analysis.actionPlan.recommendation = 'Review communication and determine appropriate action'
        }
      }

      return analysis
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1
      
      // If it's a non-retryable error or last attempt, return fallback or throw
      if (error instanceof Error && (
        error.message.includes('API key') ||
        error.message.includes('Invalid analysis') ||
        error.message.includes('Failed to parse')
      )) {
        // Don't retry validation errors or API key errors
        if (isLastAttempt) {
          // Return fallback analysis
          return getFallbackAnalysis(channel, content, metadata)
        }
        throw error
      }

      // If it's the last attempt, return fallback
      if (isLastAttempt) {
        console.error(`LLM analysis failed after ${maxRetries} attempts:`, error)
        return getFallbackAnalysis(channel, content, metadata)
      }

      // Exponential backoff: wait before retrying
      const delay = baseDelay * Math.pow(2, attempt)
      console.warn(`LLM analysis attempt ${attempt + 1} failed, retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // Should never reach here, but TypeScript requires it
  return getFallbackAnalysis(channel, content, metadata)
}

/**
 * Fallback analysis when LLM fails
 */
function getFallbackAnalysis(
  _channel: 'phone' | 'email' | 'sms' | 'voice-message',
  content: string,
  metadata?: {
    subject?: string
    from?: string
    to?: string
    date?: string
    duration?: number
    messageCount?: number
  }
): CommunicationAnalysis {
  // Extract basic info from content
  const emailMatch = content.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i)
  const phoneMatch = content.match(/(\+?[\d\s\-\(\)]{10,})/i)
  const nameMatch = content.match(/(?:from|name|hi|hello|dear)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i)

  return {
    customer: {
      name: nameMatch?.[1] || metadata?.from?.split('@')[0] || 'Unknown Customer',
      companyName: metadata?.from?.split('@')[1]?.split('.')[0] || 'Unknown Company',
      email: emailMatch?.[1]?.toLowerCase() || metadata?.from?.toLowerCase(),
      phone: phoneMatch?.[1] || metadata?.from,
    },
    conversation: {
      summary: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
      sentiment: 'neutral',
      intent: 'General inquiry',
      insights: ['LLM analysis unavailable - using fallback parsing'],
      keyStats: {},
      topic: 'Communication',
      shortTopic: 'Communication',
      longTopic: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
    },
    actionPlan: {
      badge: 'follow-up',
      recommendation: 'Review communication and determine appropriate action',
      whatToDo: 'Review communication and determine appropriate action',
      whyStrategy: 'LLM analysis failed - manual review recommended',
      actionItems: [],
    },
    riskScore: 50,
    opportunityScore: 50,
  }
}

