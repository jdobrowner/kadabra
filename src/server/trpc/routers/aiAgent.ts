import { z } from 'zod'
import { nanoid } from 'nanoid'
import OpenAI from 'openai'
import { router, protectedProcedure, TRPCError } from '../trpc'
import {
  customers,
  conversations,
  tasks,
  actionPlans,
  actionItems,
  aiAgentChats,
  aiAgentMessages,
} from '../../db/schema'
import { and, asc, desc, eq, sql } from 'drizzle-orm'

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

const DEFAULT_CHAT_TITLE = 'New Chat'

function getSuggestedTitle(message: string): string {
  const trimmed = message.trim()
  if (!trimmed) {
    return DEFAULT_CHAT_TITLE
  }
  return trimmed.length > 60 ? `${trimmed.slice(0, 57)}...` : trimmed
}

export const aiAgentRouter = router({
  listChats: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      const chats = await db
        .select({
          id: aiAgentChats.id,
          title: aiAgentChats.title,
          customerId: aiAgentChats.customerId,
          createdAt: aiAgentChats.createdAt,
          updatedAt: aiAgentChats.updatedAt,
          lastMessageAt: aiAgentChats.lastMessageAt,
          messageCount: sql<number>`count(${aiAgentMessages.id})`,
        })
        .from(aiAgentChats)
        .leftJoin(aiAgentMessages, eq(aiAgentMessages.chatId, aiAgentChats.id))
        .where(
          and(
            eq(aiAgentChats.orgId, org.id),
            eq(aiAgentChats.userId, user.id),
            eq(aiAgentChats.customerId, input.customerId)
          )
        )
        .groupBy(
          aiAgentChats.id,
          aiAgentChats.title,
          aiAgentChats.customerId,
          aiAgentChats.createdAt,
          aiAgentChats.updatedAt,
          aiAgentChats.lastMessageAt
        )
        .orderBy(desc(aiAgentChats.lastMessageAt))

      return chats
    }),

  getChat: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      const [chat] = await db
        .select()
        .from(aiAgentChats)
        .where(
          and(
            eq(aiAgentChats.id, input.chatId),
            eq(aiAgentChats.orgId, org.id),
            eq(aiAgentChats.userId, user.id)
          )
        )
        .limit(1)

      if (!chat) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chat not found',
        })
      }

      const messages = await db
        .select()
        .from(aiAgentMessages)
        .where(eq(aiAgentMessages.chatId, chat.id))
        .orderBy(asc(aiAgentMessages.createdAt))

      return { chat, messages }
    }),

  createChat: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        title: z.string().min(1).max(140).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      const [customer] = await db
        .select({ id: customers.id })
        .from(customers)
        .where(and(eq(customers.id, input.customerId), eq(customers.orgId, org.id)))
        .limit(1)

      if (!customer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        })
      }

      const now = new Date()
      const [chat] = await db
        .insert(aiAgentChats)
        .values({
          id: nanoid(),
          orgId: org.id,
          userId: user.id,
          customerId: input.customerId,
          title: input.title?.trim() || DEFAULT_CHAT_TITLE,
          createdAt: now,
          updatedAt: now,
          lastMessageAt: now,
        })
        .returning()

      return chat
    }),

  deleteChat: protectedProcedure
    .input(z.object({ chatId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      const deleted = await db
        .delete(aiAgentChats)
        .where(
          and(
            eq(aiAgentChats.id, input.chatId),
            eq(aiAgentChats.orgId, org.id),
            eq(aiAgentChats.userId, user.id)
          )
        )
        .returning({ id: aiAgentChats.id })

      if (deleted.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chat not found',
        })
      }

      return { chatId: deleted[0].id }
    }),

  query: protectedProcedure
    .input(
      z
        .object({
          message: z.string().min(1),
          chatId: z.string().optional(),
          customerId: z.string().optional(),
        })
        .refine((value) => value.chatId || value.customerId, {
          message: 'chatId or customerId is required',
          path: ['chatId'],
        })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, org, user } = ctx

      if (!openai) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'OpenAI API key not configured',
        })
      }

      let chatId = input.chatId ?? null
      let chat = null as typeof aiAgentChats.$inferSelect | null

      if (chatId) {
        const [existingChat] = await db
          .select()
          .from(aiAgentChats)
          .where(
            and(
              eq(aiAgentChats.id, chatId),
              eq(aiAgentChats.orgId, org.id),
              eq(aiAgentChats.userId, user.id)
            )
          )
          .limit(1)

        if (!existingChat) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Chat not found',
          })
        }

        chat = existingChat
      } else {
        const customerId = input.customerId!
        const [customer] = await db
          .select({ id: customers.id })
          .from(customers)
          .where(and(eq(customers.id, customerId), eq(customers.orgId, org.id)))
          .limit(1)

        if (!customer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Customer not found',
          })
        }

        const now = new Date()
        const [newChat] = await db
          .insert(aiAgentChats)
          .values({
            id: nanoid(),
            orgId: org.id,
            userId: user.id,
            customerId,
            title: getSuggestedTitle(input.message),
            createdAt: now,
            updatedAt: now,
            lastMessageAt: now,
          })
          .returning()

        chat = newChat
        chatId = newChat.id
      }

      const customerId = chat.customerId

      const [customer] = await db
        .select()
        .from(customers)
        .where(and(eq(customers.id, customerId), eq(customers.orgId, org.id)))
        .limit(1)

      if (!customer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Customer not found',
        })
      }

      const recentConvs = await db
        .select()
        .from(conversations)
        .where(eq(conversations.customerId, customerId))
        .orderBy(desc(conversations.date))
        .limit(5)

      const openTasks = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.customerId, customerId), eq(tasks.orgId, org.id)))

      const [actionPlan] = await db
        .select()
        .from(actionPlans)
        .where(eq(actionPlans.customerId, customerId))
        .limit(1)

      let actionPlanItems: typeof actionItems.$inferSelect[] = []
      if (actionPlan) {
        actionPlanItems = await db
          .select()
          .from(actionItems)
          .where(eq(actionItems.actionPlanId, actionPlan.id))
      }

      const context = `Customer Context:
- Name: ${customer.name}
- Company: ${customer.companyName}
- Risk Score: ${customer.riskScore ?? 'N/A'}
- Opportunity Score: ${customer.opportunityScore ?? 'N/A'}

Recent Conversations (${recentConvs.length}):
${recentConvs.map((c) => `- ${c.channel} on ${c.date.toISOString()}: ${c.summary || 'No summary'}`).join('\n')}

Open Tasks (${openTasks.length}):
${openTasks.map((t) => `- ${t.title} (${t.status}, ${t.priority} priority)`).join('\n')}

Action Plan:
${actionPlan ? `- Status: ${actionPlan.status}
- Badge: ${actionPlan.badge}
- Strategy: ${actionPlan.whatToDo}
- Why: ${actionPlan.whyStrategy}
- Action Items: ${actionPlanItems.map((i) => `${i.title} (${i.status})`).join(', ')}` : 'No action plan'}
`

      const historyMessages = await db
        .select()
        .from(aiAgentMessages)
        .where(eq(aiAgentMessages.chatId, chatId))
        .orderBy(asc(aiAgentMessages.createdAt))

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content:
            'You are a helpful AI assistant for customer relationship management. You help users understand customer interactions, action plans, and provide recommendations. Always respond in markdown format.',
        },
        {
          role: 'system',
          content: context,
        },
        ...historyMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user',
          content: input.message,
        },
      ]

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
        })

        const assistantContent = completion.choices[0]?.message?.content || 'No response generated'
        const now = new Date()

        const [userMessage] = await db
          .insert(aiAgentMessages)
          .values({
            id: nanoid(),
            chatId,
            role: 'user',
            content: input.message,
            createdAt: now,
          })
          .returning()

        const [assistantMessage] = await db
          .insert(aiAgentMessages)
          .values({
            id: nanoid(),
            chatId,
            role: 'assistant',
            content: assistantContent,
            createdAt: new Date(),
          })
          .returning()

        const newTitle =
          chat.title === DEFAULT_CHAT_TITLE || !chat.title?.trim()
            ? getSuggestedTitle(input.message)
            : chat.title

        const [updatedChat] = await db
          .update(aiAgentChats)
          .set({
            updatedAt: assistantMessage.createdAt,
            lastMessageAt: assistantMessage.createdAt,
            title: newTitle,
          })
          .where(eq(aiAgentChats.id, chatId))
          .returning()

        return {
          chat: updatedChat,
          userMessage,
          assistantMessage,
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to generate AI response',
        })
      }
    }),
})

