import { baseState } from './data'
import { clone, generateMockId, isoDate, daysAgo, isSameDay, matchIncludes } from './utils'
import type { MockHandlers } from './types'

type CustomerRecord = typeof baseState.customers[number] & { actionPlanId: string | null }
type ActionPlanRecord = typeof baseState.actionPlans[number]
type TaskRecord = typeof baseState.tasks[number]
type ConversationRecord = typeof baseState.conversations[number]
type CalendarEventRecord = typeof baseState.calendarEvents[number]
type InvitationRecord = typeof baseState.invitations[number]
type ApiKeyRecord = typeof baseState.apiKeys[number]
type AiAgentChatRecord = typeof baseState.aiAgentChats[number]
type AiAgentMessageRecord = typeof baseState.aiAgentMessages[number]
type TeamRecord = typeof baseState.teams[number]
type TeamMemberRecord = typeof baseState.teamMembers[number]
type BoardRecord = typeof baseState.boards[number]
type BoardColumnRecord = typeof baseState.boardColumns[number]
type BoardCardRecord = typeof baseState.boardCards[number]
type BoardTeamPermissionRecord = typeof baseState.boardTeamPermissions[number]
type RoutingRuleRecord = typeof baseState.routingRules[number]

const state = {
  org: clone(baseState.org),
  users: clone(baseState.users),
  invitations: clone(baseState.invitations),
  apiKeys: clone(baseState.apiKeys),
  customers: clone(baseState.customers) as CustomerRecord[],
  actionPlans: clone(baseState.actionPlans) as ActionPlanRecord[],
  tasks: clone(baseState.tasks) as TaskRecord[],
  conversations: clone(baseState.conversations) as ConversationRecord[],
  calendarEvents: clone(baseState.calendarEvents) as CalendarEventRecord[],
  aiAgentChats: clone(baseState.aiAgentChats) as AiAgentChatRecord[],
  aiAgentMessages: clone(baseState.aiAgentMessages) as AiAgentMessageRecord[],
  teams: clone(baseState.teams) as TeamRecord[],
  teamMembers: clone(baseState.teamMembers) as TeamMemberRecord[],
  boards: clone(baseState.boards) as BoardRecord[],
  boardColumns: clone(baseState.boardColumns) as BoardColumnRecord[],
  boardCards: clone(baseState.boardCards) as BoardCardRecord[],
  boardTeamPermissions: clone(baseState.boardTeamPermissions) as BoardTeamPermissionRecord[],
  routingRules: clone(baseState.routingRules) as RoutingRuleRecord[],
}

function getActiveActionPlan(customerId: string) {
  return state.actionPlans.find(
    (plan) => plan.customerId === customerId && plan.status === 'active'
  )
}

function formatCustomerSummary(customer: CustomerRecord) {
  const activePlan = getActiveActionPlan(customer.id)

  return {
    id: customer.id,
    name: customer.name,
    companyName: customer.companyName,
    email: customer.email,
    phone: customer.phone,
    avatar: customer.avatar,
    riskScore: customer.riskScore,
    opportunityScore: customer.opportunityScore,
    communications: clone(customer.communications),
    lastCommunication: customer.lastCommunication ? clone(customer.lastCommunication) : undefined,
    actionPlan: activePlan
      ? {
          id: activePlan.id,
          badge: activePlan.badge,
          aiRecommendation: activePlan.recommendation || activePlan.whatToDo.slice(0, 100),
        }
      : null,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    totalConversations: customer.totalConversations,
    totalTasks: customer.totalTasks,
    totalActionPlans: customer.totalActionPlans,
  }
}

function formatCustomerDetail(customerId: string) {
  const customer = state.customers.find((c) => c.id === customerId)
  if (!customer) {
    throw new Error(`Customer ${customerId} not found`)
  }
  return {
    id: customer.id,
    name: customer.name,
    companyName: customer.companyName,
    email: customer.email,
    phone: customer.phone,
    riskScore: customer.riskScore,
    opportunityScore: customer.opportunityScore,
    avatar: customer.avatar,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    totalConversations: customer.totalConversations,
    totalTasks: customer.totalTasks,
    totalActionPlans: customer.totalActionPlans,
  }
}

function formatActionPlan(plan: ActionPlanRecord, includeCustomer: boolean = true) {
  const customer = state.customers.find((c) => c.id === plan.customerId)
  return {
    id: plan.id,
    customerId: plan.customerId,
    customer: includeCustomer && customer
      ? {
          id: customer.id,
          name: customer.name,
          companyName: customer.companyName,
          avatar: customer.avatar,
        }
      : undefined,
    badge: plan.badge,
    recommendation: plan.recommendation,
    whatToDo: plan.whatToDo,
    whyStrategy: plan.whyStrategy,
    status: plan.status,
    actionItems: clone(plan.actionItems),
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    completedAt: plan.completedAt,
    canceledAt: plan.canceledAt,
  }
}

function formatTask(task: TaskRecord) {
  return {
    id: task.id,
    customerId: task.customerId,
    conversationId: task.conversationId ?? null,
    actionPlanId: task.actionPlanId ?? null,
    title: task.title,
    description: task.description ?? null,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ?? null,
    ownerUserId: task.ownerUserId ?? null,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }
}

function formatConversation(conversation: ConversationRecord) {
  const customer = state.customers.find((c) => c.id === conversation.customerId)
  return {
    id: conversation.id,
    customerId: conversation.customerId,
    customer: customer
      ? {
          id: customer.id,
          name: customer.name,
          companyName: customer.companyName,
          avatar: customer.avatar,
        }
      : undefined,
    channel: conversation.channel,
    date: conversation.date,
    duration: conversation.duration ?? null,
    messageCount: conversation.messageCount ?? null,
    transcript: conversation.transcript,
    summary: conversation.summary,
    sentiment: conversation.sentiment,
    intent: conversation.intent,
    agent: conversation.agent,
    subject: conversation.subject,
    insights: clone(conversation.insights ?? []),
    coachingSuggestions: clone(conversation.coachingSuggestions ?? []),
    keyStats: clone(conversation.keyStats ?? null),
    messages: clone(conversation.messages ?? null),
    createdAt: conversation.createdAt,
  }
}

function formatCalendarEvent(event: CalendarEventRecord) {
  return {
    id: event.id,
    customerId: event.customerId,
    title: event.title,
    date: event.date,
    type: event.type,
    goal: event.goal,
    prepNotes: event.prepNotes ?? null,
    talkingPoints: clone(event.talkingPoints ?? []),
    createdAt: event.createdAt,
  }
}

function ensureCustomerTotals(task: TaskRecord) {
  if (!task.customerId) return
  const customer = state.customers.find((c) => c.id === task.customerId)
  if (customer) {
    customer.totalTasks = state.tasks.filter((t) => t.customerId === customer.id).length
    customer.updatedAt = isoDate(new Date())
  }
}

function removeActivePlan(customerId: string, planId: string) {
  const customer = state.customers.find((c) => c.id === customerId)
  if (customer && customer.actionPlanId === planId) {
    ;(customer as { actionPlanId: string | null }).actionPlanId = null
  }
}

export const mockHandlers: MockHandlers = {
  'auth.me': {
    query: () => ({
      user: clone(state.users[0]),
      org: clone(state.org),
    }),
  },
  'auth.getGoogleAuthUrl': {
    query: () => ({
      authUrl: 'https://accounts.google.com/o/oauth2/auth?mock=true',
    }),
  },
  'customers.list': {
    query: (input: any = {}) => {
      const { badge, sortBy, timeframe } = input ?? {}
      const cutoff =
        timeframe && timeframe !== 'all'
          ? (() => {
              switch (timeframe) {
                case 'today':
                  return daysAgo(0)
                case '24h':
                  return isoDate(new Date(Date.now() - 24 * 60 * 60 * 1000))
                case '7d':
                  return isoDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                case '30d':
                  return isoDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                default:
                  return null
              }
            })()
          : null

      let customers = state.customers
        .filter((customer) => {
          if (badge && badge !== 'all') {
            const plan = getActiveActionPlan(customer.id)
            if (!plan || plan.badge !== badge) {
              return false
            }
          }
          if (cutoff) {
            const lastTime = customer.lastCommunication?.time
            if (!lastTime || new Date(lastTime).getTime() < new Date(cutoff).getTime()) {
              return false
            }
          }
          return true
        })
        .map((customer) => formatCustomerSummary(customer))

      if (sortBy === 'most-recent') {
        customers = customers.sort((a, b) => {
          const aTime = a.lastCommunication?.time || a.createdAt
          const bTime = b.lastCommunication?.time || b.createdAt
          return new Date(bTime).getTime() - new Date(aTime).getTime()
        })
      } else {
        customers = customers.sort((a, b) => {
          const aScore = (a.riskScore || 0) + (a.opportunityScore || 0)
          const bScore = (b.riskScore || 0) + (b.opportunityScore || 0)
          return bScore - aScore
        })
      }

      return clone(customers)
    },
  },
  'customers.getById': {
    query: (input: { id: string }) => clone(formatCustomerDetail(input.id)),
  },
  'actionPlans.list': {
    query: (input: any = {}) => {
      const { status, badge, customerId } = input ?? {}
      let plans = state.actionPlans.filter((plan) => {
        if (customerId && plan.customerId !== customerId) {
          return false
        }
        if (status && status !== 'all' && plan.status !== status) {
          return false
        }
        if (badge && badge !== 'all' && plan.badge !== badge) {
          return false
        }
        return true
      })

      plans = plans.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )

      return clone(plans.map((plan) => formatActionPlan(plan)))
    },
  },
  'actionPlans.getById': {
    query: (input: { id: string }) => {
      const plan = state.actionPlans.find((p) => p.id === input.id)
      if (!plan) {
        throw new Error(`Action plan ${input.id} not found`)
      }
      return clone(formatActionPlan(plan))
    },
  },
  'actionPlans.getByCustomerId': {
    query: (input: { customerId: string }) => {
      const plan = state.actionPlans.find(
        (p) => p.customerId === input.customerId && p.status === 'active'
      )
      return plan ? clone(formatActionPlan(plan, false)) : null
    },
  },
  'actionPlans.markComplete': {
    mutation: (input: { id: string }) => {
      const plan = state.actionPlans.find((p) => p.id === input.id)
      if (!plan) {
        throw new Error(`Action plan ${input.id} not found`)
      }
      plan.status = 'completed'
      plan.completedAt = isoDate(new Date())
      plan.updatedAt = plan.completedAt
      removeActivePlan(plan.customerId, plan.id)

      return {
        success: true,
        actionPlan: clone(formatActionPlan(plan)),
      }
    },
  },
  'actionPlans.markIncomplete': {
    mutation: (input: { id: string }) => {
      const plan = state.actionPlans.find((p) => p.id === input.id)
      if (!plan) {
        throw new Error(`Action plan ${input.id} not found`)
      }
      plan.status = 'active'
      plan.completedAt = null
      plan.updatedAt = isoDate(new Date())

      const customer = state.customers.find((c) => c.id === plan.customerId)
      if (customer) {
        customer.actionPlanId = plan.id
        customer.updatedAt = plan.updatedAt
      }

      return {
        success: true,
        actionPlan: clone(formatActionPlan(plan)),
      }
    },
  },
  'actionPlans.markCanceled': {
    mutation: (input: { id: string }) => {
      const plan = state.actionPlans.find((p) => p.id === input.id)
      if (!plan) {
        throw new Error(`Action plan ${input.id} not found`)
      }
      ;(plan as { status: 'active' | 'completed' | 'canceled' }).status = 'canceled'
      ;(plan as { canceledAt: string | null }).canceledAt = isoDate(new Date())
      plan.updatedAt = (plan as { canceledAt: string | null }).canceledAt || isoDate(new Date())
      removeActivePlan(plan.customerId, plan.id)

      return {
        success: true,
        actionPlan: clone(formatActionPlan(plan)),
      }
    },
  },
  'tasks.list': {
    query: (input: any = {}) => {
      const { customerId, status, priority } = input ?? {}
      const tasks = state.tasks.filter((task) => {
        if (customerId && task.customerId !== customerId) {
          return false
        }
        if (status && status !== 'all' && task.status !== status) {
          return false
        }
        if (priority && priority !== 'all' && task.priority !== priority) {
          return false
        }
        return true
      })

      return clone(tasks.map(formatTask))
    },
  },
  'tasks.create': {
    mutation: (input: any) => {
      const newTask: TaskRecord = {
        id: generateMockId('task'),
        orgId: state.org.id,
        customerId: input.customerId ?? null,
        actionPlanId: input.actionPlanId ?? null,
        conversationId: input.conversationId ?? null,
        ownerUserId: input.ownerUserId ?? state.users[0].id,
        title: input.title,
        description: input.description ?? null,
        priority: input.priority ?? 'medium',
        status: 'todo',
        dueDate: input.dueDate ?? null,
        createdAt: isoDate(new Date()),
        updatedAt: isoDate(new Date()),
      }

      state.tasks = [newTask, ...state.tasks]
      ensureCustomerTotals(newTask)

      return {
        success: true,
        task: clone(formatTask(newTask)),
      }
    },
  },
  'tasks.updateStatus': {
    mutation: (input: { id: string; status: string }) => {
      const task = state.tasks.find((t) => t.id === input.id)
      if (!task) {
        throw new Error(`Task ${input.id} not found`)
      }
      task.status = input.status
      task.updatedAt = isoDate(new Date())
      return { success: true }
    },
  },
  'dashboard.stats': {
    query: () => {
      const customersAnalyzed = state.customers.length
      const activePlans = state.actionPlans.filter((plan) => plan.status === 'active')
      const urgentPlans = activePlans.filter((plan) => plan.badge === 'at-risk')

      return {
        customersAnalyzed,
        actionPlansCreated: activePlans.length,
        urgentActionPlans: urgentPlans.length,
      }
    },
  },
  'calendar.today': {
    query: () => {
      const todayEvents = state.calendarEvents.filter((event) =>
        isSameDay(event.date)
      )
      return clone(todayEvents.map(formatCalendarEvent))
    },
  },
  'calendar.getByCustomerId': {
    query: (input: { customerId: string }) => {
      const events = state.calendarEvents.filter(
        (event) => event.customerId === input.customerId
      )
      return clone(events.map(formatCalendarEvent))
    },
  },
  'conversations.getByCustomerId': {
    query: (input: { customerId: string }) => {
      const conversations = state.conversations.filter(
        (conversation) => conversation.customerId === input.customerId
      )
      return clone(conversations.map(formatConversation))
    },
  },
  'conversations.getById': {
    query: (input: { id: string }) => {
      const conversation = state.conversations.find((conv) => conv.id === input.id)
      if (!conversation) {
        throw new Error(`Conversation ${input.id} not found`)
      }
      return clone(formatConversation(conversation))
    },
  },
  'conversations.uploadCsv': {
    mutation: () => ({
      total: 1,
      success: 1,
      failed: 0,
      errors: [],
    }),
  },
  'conversations.uploadAudio': {
    mutation: () => ({
      success: true,
    }),
  },
  'search.query': {
    query: (input: any = {}) => {
      const query = (input.q || '').trim()
      const results: Array<{
        type: string
        id: string
        title: string
        subtitle: string
        link: string
        date: string
        metadata: Record<string, any>
      }> = []

      state.customers.forEach((customer) => {
        if (!query || matchIncludes(customer.name, query) || matchIncludes(customer.companyName, query)) {
          results.push({
            type: 'customer',
            id: customer.id,
            title: `${customer.name} • ${customer.companyName}`,
            subtitle: `Risk: ${customer.riskScore ?? 0} | Opportunity: ${customer.opportunityScore ?? 0}`,
            link: `/triage/customers/${customer.id}`,
            date: customer.updatedAt,
            metadata: {
              badge: getActiveActionPlan(customer.id)?.badge ?? null,
            },
          })
        }
      })

      state.actionPlans.forEach((plan) => {
        const customer = state.customers.find((c) => c.id === plan.customerId)
        if (!customer) return
        if (
          !query ||
          matchIncludes(plan.whatToDo, query) ||
          matchIncludes(customer.name, query)
        ) {
          results.push({
            type: 'action-plan',
            id: plan.id,
            title: `${customer.name} • ${plan.badge.toUpperCase()}`,
            subtitle: plan.recommendation ?? plan.whatToDo,
            link: plan.customerId ? `/triage/customers/${plan.customerId}/action-plans/${plan.id}` : `/triage`,
            date: plan.updatedAt,
            metadata: {
              status: plan.status,
            },
          })
        }
      })

      state.conversations.forEach((conversation) => {
        const customer = state.customers.find((c) => c.id === conversation.customerId)
        if (!customer) return
        if (
          !query ||
          matchIncludes(conversation.summary || '', query) ||
          matchIncludes(conversation.intent || '', query)
        ) {
          results.push({
            type: 'conversation',
            id: conversation.id,
            title: `${customer.name} • ${conversation.channel}`,
            subtitle: conversation.summary || conversation.transcript.slice(0, 80),
            link: conversation.customerId ? `/triage/customers/${conversation.customerId}/conversations/${conversation.id}` : `/triage`,
            date: conversation.date,
            metadata: {
              sentiment: conversation.sentiment,
            },
          })
        }
      })

      return {
        results: clone(results),
        total: results.length,
      }
    },
  },
  'users.list': {
    query: () => clone(state.users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }))),
  },
  'users.remove': {
    mutation: (input: { userId: string }) => {
      if (state.users.length <= 1) {
        throw new Error('Cannot remove the last user')
      }
      state.users = state.users.filter((user) => user.id !== input.userId)
      return { success: true }
    },
  },
  'users.updateRole': {
    mutation: (input: { userId: string; role: 'admin' | 'developer' | 'member' }) => {
      const user = state.users.find((u) => u.id === input.userId)
      if (!user) {
        throw new Error(`User ${input.userId} not found`)
      }
      user.role = input.role
      user.updatedAt = isoDate(new Date())
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      }
    },
  },
  'invitations.list': {
    query: (input: { status?: string } = {}) => {
      const status = input.status ?? 'all'
      const invitations = state.invitations
        .filter((invitation) => status === 'all' || invitation.status === status)
        .map((invitation) => {
          const invitedBy = state.users.find((user) => user.id === invitation.invitedByUserId)
          return {
            id: invitation.id,
            email: invitation.email,
            role: invitation.role,
            status: invitation.status,
            token: invitation.token,
            expiresAt: invitation.expiresAt,
            createdAt: invitation.createdAt,
            acceptedAt: invitation.acceptedAt,
            invitedBy: invitedBy
              ? {
                  id: invitedBy.id,
                  name: invitedBy.name,
                  email: invitedBy.email,
                }
              : null,
            org: {
              id: state.org.id,
              name: state.org.name,
            },
          }
        })

      return clone(invitations)
    },
  },
  'invitations.create': {
    mutation: (input: { email: string; role: 'admin' | 'developer' | 'member' }) => {
      const invitation: InvitationRecord = {
        id: generateMockId('invitation'),
        orgId: state.org.id,
        email: input.email.toLowerCase(),
        role: input.role === 'admin' ? 'member' : (input.role === 'developer' ? 'member' : input.role),
        status: 'pending',
        token: generateMockId('token'),
        expiresAt: daysAgo(-7),
        createdAt: isoDate(new Date()),
        acceptedAt: null,
        invitedByUserId: state.users[0].id,
      }
      state.invitations = [invitation, ...state.invitations]
      const invitedBy = state.users.find((user) => user.id === invitation.invitedByUserId)
      return {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        token: invitation.token,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
        invitedBy: invitedBy
          ? {
              id: invitedBy.id,
              name: invitedBy.name,
              email: invitedBy.email,
            }
          : null,
        org: {
          id: state.org.id,
          name: state.org.name,
        },
      }
    },
  },
  'invitations.cancel': {
    mutation: (input: { id: string }) => {
      const invitation = state.invitations.find((inv) => inv.id === input.id)
      if (!invitation) {
        throw new Error(`Invitation ${input.id} not found`)
      }
      ;(invitation as { status: 'pending' | 'accepted' | 'canceled' }).status = 'canceled'
      invitation.acceptedAt = null
      return { success: true }
    },
  },
  'apiKeys.list': {
    query: () =>
      clone(
        state.apiKeys.map((key) => ({
          id: key.id,
          name: key.name,
          keyMasked: key.keyMasked,
          hasEncryptedKey: key.hasEncryptedKey,
          lastUsedAt: key.lastUsedAt,
          createdAt: key.createdAt,
          expiresAt: key.expiresAt,
        }))
      ),
  },
  'apiKeys.create': {
    mutation: (input: { name: string; expiresAt?: string }) => {
      const plainKey = `pk_mock_${generateMockId('key').replace('-', '')}`
      const createdAt = isoDate(new Date())
      const expiresAt = input.expiresAt ?? null
      const apiKey: ApiKeyRecord = {
        id: generateMockId('api-key'),
        name: input.name,
        keyMasked: '••••••••' as string,
        hasEncryptedKey: true,
        lastUsedAt: null as any,
        createdAt,
        expiresAt,
        orgId: state.org.id,
        keyPlain: plainKey,
      }
      state.apiKeys = [apiKey, ...state.apiKeys]
      return {
        id: apiKey.id,
        name: apiKey.name,
        key: plainKey,
        createdAt,
        expiresAt,
      }
    },
  },
  'apiKeys.delete': {
    mutation: (input: { id: string }) => {
      state.apiKeys = state.apiKeys.filter((key) => key.id !== input.id)
      return { success: true }
    },
  },
  'apiKeys.reveal': {
    query: (input: { id: string }) => {
      const key = state.apiKeys.find((apiKey) => apiKey.id === input.id)
      if (!key) {
        throw new Error(`API key ${input.id} not found`)
      }
      return { key: key.keyPlain }
    },
  },
  'aiAgent.listChats': {
    query: (input: { customerId: string }) => {
      const chats = state.aiAgentChats
        .filter((chat) => chat.customerId === input.customerId)
        .sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1))
        .map((chat) => {
          const messageCount = state.aiAgentMessages.filter((msg) => msg.chatId === chat.id).length
          return {
            ...chat,
            messageCount,
          }
        })
      return clone(chats)
    },
  },
  'aiAgent.getChat': {
    query: (input: { chatId: string }) => {
      const chat = state.aiAgentChats.find((item) => item.id === input.chatId)
      if (!chat) {
        throw new Error(`Chat ${input.chatId} not found`)
      }

      const messages = state.aiAgentMessages
        .filter((message) => message.chatId === chat.id)
        .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))

      return {
        chat: clone({
          ...chat,
          messageCount: messages.length,
        }),
        messages: clone(messages),
      }
    },
  },
  'aiAgent.createChat': {
    mutation: (input: { customerId: string; title?: string }) => {
      const now = isoDate(new Date())
      const chat: AiAgentChatRecord = {
        id: generateMockId('ai-chat'),
        orgId: state.org.id,
        customerId: input.customerId,
        userId: state.users[0]?.id ?? 'user-mock-admin',
        title: input.title?.trim() || 'New Chat',
        createdAt: now,
        updatedAt: now,
        lastMessageAt: now,
      }
      state.aiAgentChats = [chat, ...state.aiAgentChats]
      return clone(chat)
    },
  },
  'aiAgent.deleteChat': {
    mutation: (input: { chatId: string }) => {
      state.aiAgentChats = state.aiAgentChats.filter((chat) => chat.id !== input.chatId)
      state.aiAgentMessages = state.aiAgentMessages.filter((message) => message.chatId !== input.chatId)
      return { chatId: input.chatId }
    },
  },
  'aiAgent.query': {
    mutation: (input: { message: string; chatId?: string; customerId?: string }) => {
      const now = new Date()
      let chat =
        input.chatId && state.aiAgentChats.find((existing) => existing.id === input.chatId)

      if (!chat) {
        const customerId = input.customerId
        if (!customerId) {
          throw new Error('customerId is required to start a new chat in mock mode')
        }
        const timestamp = isoDate(now)
        chat = {
          id: generateMockId('ai-chat'),
          orgId: state.org.id,
          customerId,
          userId: state.users[0]?.id ?? 'user-mock-admin',
          title: input.message.trim().slice(0, 60) || 'New Chat',
          createdAt: timestamp,
          updatedAt: timestamp,
          lastMessageAt: timestamp,
        }
        state.aiAgentChats = [chat, ...state.aiAgentChats]
      }

      const messageTimestamp = isoDate(now)
      const userMessage: AiAgentMessageRecord = {
        id: generateMockId('ai-msg'),
        chatId: chat.id,
        role: 'user',
        content: input.message,
        createdAt: messageTimestamp,
      }

      const assistantResponse = `Thanks for the context! Here's how I'd approach it:\n\n- Revisit the most recent conversations for additional clues.\n- Align the next touchpoint with the current action plan.\n- Summarize key risks and opportunities before your outreach.\n\n(Mock response generated locally for ${chat.customerId}).`

      const assistantMessage: AiAgentMessageRecord = {
        id: generateMockId('ai-msg'),
        chatId: chat.id,
        role: 'assistant',
        content: assistantResponse,
        createdAt: isoDate(new Date()),
      }

      state.aiAgentMessages = [...state.aiAgentMessages, userMessage, assistantMessage]

      chat.title =
        chat.title === 'New Chat' || !chat.title.trim()
          ? input.message.trim().slice(0, 60) || chat.title
          : chat.title
      chat.updatedAt = assistantMessage.createdAt
      chat.lastMessageAt = assistantMessage.createdAt

      const messagesForChat = state.aiAgentMessages.filter((msg) => msg.chatId === chat.id)

      return {
        chat: clone({
          ...chat,
          messageCount: messagesForChat.length,
        }),
        userMessage: clone(userMessage),
        assistantMessage: clone(assistantMessage),
      }
    },
  },
  'teams.list': {
    query: () => {
      const currentUserId = state.users[0]?.id
      return state.teams.map((team) => {
        const members = state.teamMembers.filter((m) => m.teamId === team.id)
        const boardPerms = state.boardTeamPermissions.filter((p) => p.teamId === team.id)
        return {
          id: team.id,
          name: team.name,
          description: team.description,
          status: team.status,
          slug: team.slug,
          isDefault: team.isDefault,
          isAssignable: team.isAssignable,
          memberCount: members.length,
          boardCount: boardPerms.length,
          isMember: members.some((m) => m.userId === currentUserId),
          createdAt: team.createdAt,
          updatedAt: team.updatedAt,
        }
      })
    },
  },
  'teams.detail': {
    query: (input: { id: string }) => {
      const team = state.teams.find((t) => t.id === input.id)
      if (!team) {
        throw new Error(`Team ${input.id} not found`)
      }
      const currentUserId = state.users[0]?.id
      const members = state.teamMembers
        .filter((m) => m.teamId === team.id)
        .map((m) => {
          const user = state.users.find((u) => u.id === m.userId)
          return {
            membershipId: m.id,
            userId: m.userId,
            name: user?.name || 'Unknown',
            email: user?.email || '',
            role: m.role,
          }
        })
      const boardPerms = state.boardTeamPermissions
        .filter((p) => p.teamId === team.id)
        .map((p) => {
          const board = state.boards.find((b) => b.id === p.boardId)
          return {
            permissionId: p.id,
            boardId: p.boardId,
            boardName: board?.name || 'Unknown',
            mode: p.mode,
          }
        })
      const userTeams = new Set(
        state.teamMembers.filter((m) => m.userId === currentUserId).map((m) => m.teamId)
      )
      return {
        team: {
          id: team.id,
          name: team.name,
          description: team.description,
          slug: team.slug,
          status: team.status,
          isDefault: team.isDefault,
          isAssignable: team.isAssignable,
          memberCount: members.length,
          boardCount: boardPerms.length,
          isMember: userTeams.has(team.id),
          createdAt: team.createdAt,
          updatedAt: team.updatedAt,
        },
        members: clone(members),
        boards: clone(boardPerms),
      }
    },
  },
  'teams.create': {
    mutation: (input: { name: string; description?: string; isDefault?: boolean; isAssignable?: boolean }) => {
      const slug = input.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 64)
      const team: TeamRecord = {
        id: generateMockId('team'),
        orgId: state.org.id,
        name: input.name,
        description: (input.description || null) as string | null,
        slug,
        status: 'active',
        isDefault: input.isDefault ?? false,
        isAssignable: input.isAssignable ?? true,
        createdAt: isoDate(new Date()),
        updatedAt: isoDate(new Date()),
      }
      state.teams = [...state.teams, team]
      return { success: true, teamId: team.id }
    },
  },
  'teams.update': {
    mutation: (input: {
      id: string
      name?: string
      description?: string | null
      status?: 'active' | 'archived'
      isAssignable?: boolean
      isDefault?: boolean
    }) => {
      const team = state.teams.find((t) => t.id === input.id)
      if (!team) {
        throw new Error(`Team ${input.id} not found`)
      }
      if (input.name) {
        team.name = input.name
        ;(team as { slug: string }).slug = input.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 64)
      }
      if (input.description !== undefined) {
        ;(team as { description: string | null }).description = input.description
      }
      if (input.status) {
        ;(team as { status: 'active' | 'archived' }).status = input.status
      }
      if (input.isAssignable !== undefined) {
        team.isAssignable = input.isAssignable
      }
      if (input.isDefault !== undefined) {
        team.isDefault = input.isDefault
      }
      team.updatedAt = isoDate(new Date())
      return { success: true }
    },
  },
  'teams.delete': {
    mutation: (input: { id: string }) => {
      const index = state.teams.findIndex((t) => t.id === input.id)
      if (index === -1) {
        throw new Error(`Team ${input.id} not found`)
      }
      state.teams = state.teams.filter((t) => t.id !== input.id)
      state.teamMembers = state.teamMembers.filter((m) => m.teamId !== input.id)
      return { success: true }
    },
  },
  'teams.addMember': {
    mutation: (input: { teamId: string; userId: string; role?: 'owner' | 'member' | 'viewer' }) => {
      const team = state.teams.find((t) => t.id === input.teamId)
      if (!team) {
        throw new Error(`Team ${input.teamId} not found`)
      }
      const user = state.users.find((u) => u.id === input.userId)
      if (!user) {
        throw new Error(`User ${input.userId} not found`)
      }
      const existing = state.teamMembers.find(
        (m) => m.teamId === input.teamId && m.userId === input.userId
      )
      if (existing) {
        throw new Error('User is already a member of this team')
      }
      const member: TeamMemberRecord = {
        id: generateMockId('team-member'),
        teamId: input.teamId,
        userId: input.userId,
        role: (input.role || 'member') as 'owner' | 'member' | 'viewer',
      }
      state.teamMembers = [...state.teamMembers, member]
      return { success: true }
    },
  },
  'teams.removeMember': {
    mutation: (input: { teamId: string; userId: string }) => {
      const existing = state.teamMembers.find(
        (m) => m.teamId === input.teamId && m.userId === input.userId
      )
      if (!existing) {
        throw new Error('Membership not found')
      }
      state.teamMembers = state.teamMembers.filter(
        (m) => !(m.teamId === input.teamId && m.userId === input.userId)
      )
      return { success: true }
    },
  },
  'boards.list': {
    query: () => {
      const currentUserId = state.users[0]?.id
      const userTeamIds = new Set(
        state.teamMembers.filter((m) => m.userId === currentUserId).map((m) => m.teamId)
      )
      return state.boards.map((board) => {
        const permissions = state.boardTeamPermissions.filter((p) => p.boardId === board.id)
        const hasTeamAccess =
          board.visibility === 'org' ||
          (board.defaultTeamId && userTeamIds.has(board.defaultTeamId)) ||
          permissions.some((p) => userTeamIds.has(p.teamId))
        return {
          id: board.id,
          name: board.name,
          description: board.description,
          visibility: board.visibility,
          cardType: board.cardType,
          defaultTeamId: board.defaultTeamId,
          isEditable: hasTeamAccess,
          permissions: permissions.map((p) => ({ teamId: p.teamId, mode: p.mode })),
          createdAt: board.createdAt,
          updatedAt: board.updatedAt,
        }
      })
    },
  },
  'boards.detail': {
    query: (input: { id: string }) => {
      const board = state.boards.find((b) => b.id === input.id)
      if (!board) {
        throw new Error(`Board ${input.id} not found`)
      }
      const currentUserId = state.users[0]?.id
      const userTeamIds = new Set(
        state.teamMembers.filter((m) => m.userId === currentUserId).map((m) => m.teamId)
      )
      const permissions = state.boardTeamPermissions.filter((p) => p.boardId === board.id)
      const hasTeamAccess =
        board.visibility === 'org' ||
        (board.defaultTeamId && userTeamIds.has(board.defaultTeamId)) ||
        permissions.some((p) => userTeamIds.has(p.teamId))
      const columns = state.boardColumns
        .filter((c) => c.boardId === board.id)
        .sort((a, b) => a.position - b.position)
        .map((c) => ({
          id: c.id,
          name: c.name,
          position: c.position,
          wipLimit: c.wipLimit,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        }))
      const cards = state.boardCards
        .filter((c) => c.boardId === board.id)
        .sort((a, b) => a.position - b.position)
        .map((c) => ({
          id: c.id,
          actionPlanId: c.actionPlanId,
          customerId: c.customerId,
          columnId: c.columnId,
          title: c.title,
          description: c.description,
          type: c.type,
          status: c.status,
          position: c.position,
          dueDate: c.dueDate,
          assigneeUserId: c.assigneeUserId,
          assigneeTeamId: c.assigneeTeamId,
          metadata: c.metadata,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        }))
      return {
        board: {
          id: board.id,
          name: board.name,
          description: board.description,
          visibility: board.visibility,
          cardType: board.cardType,
          defaultTeamId: board.defaultTeamId,
          isEditable: hasTeamAccess,
          permissions: permissions.map((p) => ({ teamId: p.teamId, mode: p.mode })),
          createdAt: board.createdAt,
          updatedAt: board.updatedAt,
        },
        columns: clone(columns),
        cards: clone(cards),
        permissions: permissions.map((p) => ({ id: p.id, teamId: p.teamId, mode: p.mode })),
      }
    },
  },
  'boards.create': {
    mutation: (input: {
      name: string
      description?: string
      visibility: 'org' | 'team'
      cardType: 'lead' | 'case' | 'deal' | 'task' | 'custom'
      defaultTeamId?: string | null
      initialColumns?: Array<{ name: string }>
    }) => {
      const board: BoardRecord = {
        id: generateMockId('board'),
        orgId: state.org.id,
        name: input.name,
        description: (input.description || null) as string | null,
        visibility: input.visibility,
        cardType: input.cardType,
        defaultTeamId: (input.defaultTeamId || null) as string | null,
        createdAt: isoDate(new Date()),
        updatedAt: isoDate(new Date()),
      }
      state.boards = [...state.boards, board]
      const defaultColumns = [
        { name: 'Backlog', position: 0 },
        { name: 'In Progress', position: 1 },
        { name: 'Done', position: 2 },
      ]
      const columns = input.initialColumns?.length ? input.initialColumns : defaultColumns
      const newColumns = columns.map((col, index) => ({
        id: generateMockId('board-col'),
        boardId: board.id,
        name: col.name,
        position: index,
        wipLimit: null,
        createdAt: isoDate(new Date()),
        updatedAt: isoDate(new Date()),
      }))
      state.boardColumns = [...state.boardColumns, ...newColumns]
      return { success: true, boardId: board.id }
    },
  },
  'boards.update': {
    mutation: (input: {
      id: string
      name?: string
      description?: string | null
      visibility?: 'org' | 'team'
      cardType?: 'lead' | 'case' | 'deal' | 'task' | 'custom'
      defaultTeamId?: string | null
    }) => {
      const board = state.boards.find((b) => b.id === input.id)
      if (!board) {
        throw new Error(`Board ${input.id} not found`)
      }
      if (input.name) {
        board.name = input.name
      }
      if (input.description !== undefined) {
        ;(board as { description: string | null }).description = input.description
      }
      if (input.visibility) {
        board.visibility = input.visibility
      }
      if (input.cardType) {
        board.cardType = input.cardType
      }
      if (input.defaultTeamId !== undefined) {
        ;(board as { defaultTeamId: string | null }).defaultTeamId = input.defaultTeamId
      }
      board.updatedAt = isoDate(new Date())
      return { success: true }
    },
  },
  'boards.delete': {
    mutation: (input: { id: string }) => {
      const index = state.boards.findIndex((b) => b.id === input.id)
      if (index === -1) {
        throw new Error(`Board ${input.id} not found`)
      }
      state.boards = state.boards.filter((b) => b.id !== input.id)
      state.boardColumns = state.boardColumns.filter((c) => c.boardId !== input.id)
      state.boardCards = state.boardCards.filter((c) => c.boardId !== input.id)
      state.boardTeamPermissions = state.boardTeamPermissions.filter((p) => p.boardId !== input.id)
      return { success: true }
    },
  },
  'boards.createColumn': {
    mutation: (input: { boardId: string; name: string }) => {
      const board = state.boards.find((b) => b.id === input.boardId)
      if (!board) {
        throw new Error(`Board ${input.boardId} not found`)
      }
      const columns = state.boardColumns.filter((c) => c.boardId === input.boardId)
      const position = columns.length
      const column: BoardColumnRecord = {
        id: generateMockId('board-col'),
        boardId: input.boardId,
        name: input.name,
        position,
        wipLimit: null,
        createdAt: isoDate(new Date()),
        updatedAt: isoDate(new Date()),
      }
      state.boardColumns = [...state.boardColumns, column]
      return { success: true, columnId: column.id }
    },
  },
  'boards.updateColumn': {
    mutation: (input: { columnId: string; name?: string; wipLimit?: number | null }) => {
      const column = state.boardColumns.find((c) => c.id === input.columnId)
      if (!column) {
        throw new Error(`Column ${input.columnId} not found`)
      }
      if (input.name) {
        column.name = input.name
      }
      if (input.wipLimit !== undefined) {
        column.wipLimit = input.wipLimit
      }
      column.updatedAt = isoDate(new Date())
      return { success: true }
    },
  },
  'boards.deleteColumn': {
    mutation: (input: { columnId: string }) => {
      const column = state.boardColumns.find((c) => c.id === input.columnId)
      if (!column) {
        throw new Error(`Column ${input.columnId} not found`)
      }
      state.boardColumns = state.boardColumns.filter((c) => c.id !== input.columnId)
      state.boardCards = state.boardCards.filter((c) => c.columnId !== input.columnId)
      const remainingColumns = state.boardColumns
        .filter((c) => c.boardId === column.boardId)
        .sort((a, b) => a.position - b.position)
      remainingColumns.forEach((col, index) => {
        col.position = index
        col.updatedAt = isoDate(new Date())
      })
      return { success: true }
    },
  },
  'boards.reorderColumns': {
    mutation: (input: { boardId: string; columnIds: string[] }) => {
      const columns = state.boardColumns.filter((c) => c.boardId === input.boardId)
      input.columnIds.forEach((id, index) => {
        const column = columns.find((c) => c.id === id)
        if (column) {
          column.position = index
          column.updatedAt = isoDate(new Date())
        }
      })
      return { success: true }
    },
  },
  'boards.createCard': {
    mutation: (input: {
      boardId: string
      columnId: string
      title: string
      description?: string
      type?: 'lead' | 'case' | 'deal' | 'task' | 'custom'
      assigneeTeamId?: string | null
    }) => {
      const board = state.boards.find((b) => b.id === input.boardId)
      if (!board) {
        throw new Error(`Board ${input.boardId} not found`)
      }
      const column = state.boardColumns.find((c) => c.id === input.columnId)
      if (!column) {
        throw new Error(`Column ${input.columnId} not found`)
      }
      const cardsInColumn = state.boardCards.filter((c) => c.columnId === input.columnId)
      const position = cardsInColumn.length
      const card: BoardCardRecord = {
        id: generateMockId('board-card'),
        boardId: input.boardId,
        columnId: input.columnId,
        actionPlanId: null,
        customerId: null as string | null,
        title: input.title,
        description: (input.description || null) as string | null,
        type: (input.type || board.cardType) as 'lead' | 'case' | 'deal' | 'task' | 'custom',
        status: 'active',
        position,
        dueDate: null,
        assigneeTeamId: input.assigneeTeamId || null,
        assigneeUserId: null,
        metadata: null,
        createdAt: isoDate(new Date()),
        updatedAt: isoDate(new Date()),
      }
      state.boardCards = [...state.boardCards, card]
      return { success: true, cardId: card.id }
    },
  },
  'boards.updateCard': {
    mutation: (input: {
      cardId: string
      title?: string
      description?: string
      status?: 'active' | 'done' | 'archived'
      assigneeTeamId?: string | null
    }) => {
      const card = state.boardCards.find((c) => c.id === input.cardId)
      if (!card) {
        throw new Error(`Card ${input.cardId} not found`)
      }
      if (input.title) {
        card.title = input.title
      }
      if (input.description !== undefined) {
        card.description = input.description
      }
      if (input.status) {
        ;(card as { status: 'active' | 'done' | 'archived' }).status = input.status
      }
      if (input.assigneeTeamId !== undefined) {
        ;(card as { assigneeTeamId: string | null }).assigneeTeamId = input.assigneeTeamId
      }
      card.updatedAt = isoDate(new Date())
      return { success: true }
    },
  },
  'boards.moveCard': {
    mutation: (input: { cardId: string; columnId: string; position: number }) => {
      const card = state.boardCards.find((c) => c.id === input.cardId)
      if (!card) {
        throw new Error(`Card ${input.cardId} not found`)
      }
      const column = state.boardColumns.find((c) => c.id === input.columnId)
      if (!column) {
        throw new Error(`Column ${input.columnId} not found`)
      }
      const oldColumnId = card.columnId
      card.columnId = input.columnId
      card.position = input.position
      card.updatedAt = isoDate(new Date())
      const cardsInOldColumn = state.boardCards
        .filter((c) => c.columnId === oldColumnId && c.id !== input.cardId)
        .sort((a, b) => a.position - b.position)
      cardsInOldColumn.forEach((c, index) => {
        c.position = index
        c.updatedAt = isoDate(new Date())
      })
      const cardsInNewColumn = state.boardCards
        .filter((c) => c.columnId === input.columnId && c.id !== input.cardId)
        .sort((a, b) => a.position - b.position)
      cardsInNewColumn.forEach((c, index) => {
        if (index >= input.position) {
          c.position = index + 1
          c.updatedAt = isoDate(new Date())
        }
      })
      return { success: true }
    },
  },
  'boards.deleteCard': {
    mutation: (input: { cardId: string }) => {
      const index = state.boardCards.findIndex((c) => c.id === input.cardId)
      if (index === -1) {
        throw new Error(`Card ${input.cardId} not found`)
      }
      const card = state.boardCards[index]
      state.boardCards = state.boardCards.filter((c) => c.id !== input.cardId)
      const remainingCards = state.boardCards
        .filter((c) => c.columnId === card.columnId)
        .sort((a, b) => a.position - b.position)
      remainingCards.forEach((c, index) => {
        c.position = index
        c.updatedAt = isoDate(new Date())
      })
      return { success: true }
    },
  },
  'boards.addPermission': {
    mutation: (input: { boardId: string; teamId: string; mode: 'edit' | 'view' }) => {
      const board = state.boards.find((b) => b.id === input.boardId)
      if (!board) {
        throw new Error(`Board ${input.boardId} not found`)
      }
      const team = state.teams.find((t) => t.id === input.teamId)
      if (!team) {
        throw new Error(`Team ${input.teamId} not found`)
      }
      const existing = state.boardTeamPermissions.find(
        (p) => p.boardId === input.boardId && p.teamId === input.teamId
      )
      if (existing) {
        throw new Error('Team already has access to this board')
      }
      const permission: BoardTeamPermissionRecord = {
        id: generateMockId('board-perm'),
        boardId: input.boardId,
        teamId: input.teamId,
        mode: input.mode,
      }
      state.boardTeamPermissions = [...state.boardTeamPermissions, permission]
      return { success: true, permissionId: permission.id }
    },
  },
  'boards.removePermission': {
    mutation: (input: { permissionId: string }) => {
      const index = state.boardTeamPermissions.findIndex((p) => p.id === input.permissionId)
      if (index === -1) {
        throw new Error(`Permission ${input.permissionId} not found`)
      }
      state.boardTeamPermissions = state.boardTeamPermissions.filter((p) => p.id !== input.permissionId)
      return { success: true }
    },
  },
  'routingRules.list': {
    query: () => {
      return state.routingRules
        .sort((a, b) => a.priority - b.priority)
        .map((rule) => {
          const team = state.teams.find((t) => t.id === rule.targetTeamId)
          const board = rule.targetBoardId ? state.boards.find((b) => b.id === rule.targetBoardId) : null
          const column = rule.targetColumnId
            ? state.boardColumns.find((c) => c.id === rule.targetColumnId)
            : null
          return {
            id: rule.id,
            name: rule.name,
            channel: rule.channel,
            conditionType: rule.conditionType,
            conditionValue: rule.conditionValue,
            targetTeam: team
              ? {
                  id: team.id,
                  name: team.name,
                }
              : null,
            targetBoard: board
              ? {
                  id: board.id,
                  name: board.name,
                }
              : null,
            targetColumn: column
              ? {
                  id: column.id,
                  name: column.name,
                }
              : null,
            priority: rule.priority,
            enabled: rule.enabled,
            metadata: rule.metadata,
            createdAt: rule.createdAt,
            updatedAt: rule.updatedAt,
          }
        })
    },
  },
  'routingRules.create': {
    mutation: (input: {
      name: string
      channel?: 'phone' | 'email' | 'chat' | 'video' | 'sms' | 'ai-call' | 'voice-message' | null
      conditionType: 'badge' | 'intent' | 'urgency' | 'customer_segment' | 'channel' | 'custom'
      conditionValue?: string | null
      targetTeamId: string
      targetBoardId?: string | null
      targetColumnId?: string | null
      priority?: number
      enabled?: boolean
      metadata?: Record<string, unknown>
    }) => {
      const team = state.teams.find((t) => t.id === input.targetTeamId)
      if (!team) {
        throw new Error(`Target team ${input.targetTeamId} not found`)
      }
      if (input.targetBoardId) {
        const board = state.boards.find((b) => b.id === input.targetBoardId)
        if (!board) {
          throw new Error(`Target board ${input.targetBoardId} not found`)
        }
      }
      if (input.targetColumnId) {
        const column = state.boardColumns.find((c) => c.id === input.targetColumnId)
        if (!column) {
          throw new Error(`Target column ${input.targetColumnId} not found`)
        }
      }
      const rule: RoutingRuleRecord = {
        id: generateMockId('routing-rule'),
        orgId: state.org.id,
        name: input.name,
        channel: input.channel || null,
        conditionType: input.conditionType,
        conditionValue: (input.conditionValue || null) as string | null,
        targetTeamId: input.targetTeamId,
        targetBoardId: (input.targetBoardId || null) as string | null,
        targetColumnId: (input.targetColumnId || null) as string | null,
        priority: input.priority ?? 100,
        enabled: input.enabled ?? true,
        metadata: (input.metadata ?? null) as Record<string, unknown> | null,
        createdAt: isoDate(new Date()),
        updatedAt: isoDate(new Date()),
      }
      state.routingRules = [...state.routingRules, rule]
      return { success: true, ruleId: rule.id }
    },
  },
  'routingRules.update': {
    mutation: (input: {
      id: string
      name?: string
      channel?: 'phone' | 'email' | 'chat' | 'video' | 'sms' | 'ai-call' | 'voice-message' | null
      conditionType?: 'badge' | 'intent' | 'urgency' | 'customer_segment' | 'channel' | 'custom'
      conditionValue?: string | null
      targetTeamId?: string
      targetBoardId?: string | null
      targetColumnId?: string | null
      priority?: number
      enabled?: boolean
      metadata?: Record<string, unknown> | null
    }) => {
      const rule = state.routingRules.find((r) => r.id === input.id)
      if (!rule) {
        throw new Error(`Routing rule ${input.id} not found`)
      }
      if (input.name) {
        rule.name = input.name
      }
      if (input.channel !== undefined) {
        ;(rule as { channel: 'phone' | 'email' | 'chat' | 'video' | 'sms' | 'ai-call' | 'voice-message' | null }).channel = input.channel
      }
      if (input.conditionType) {
        ;(rule as { conditionType: 'badge' | 'intent' | 'urgency' | 'customer_segment' | 'channel' | 'custom' }).conditionType = input.conditionType
      }
      if (input.conditionValue !== undefined) {
        ;(rule as { conditionValue: string | null }).conditionValue = input.conditionValue
      }
      if (input.targetTeamId) {
        const team = state.teams.find((t) => t.id === input.targetTeamId)
        if (!team) {
          throw new Error(`Target team ${input.targetTeamId} not found`)
        }
        rule.targetTeamId = input.targetTeamId
      }
      if (input.targetBoardId !== undefined) {
        if (input.targetBoardId) {
          const board = state.boards.find((b) => b.id === input.targetBoardId)
          if (!board) {
            throw new Error(`Target board ${input.targetBoardId} not found`)
          }
        }
        ;(rule as { targetBoardId: string | null }).targetBoardId = input.targetBoardId
      }
      if (input.targetColumnId !== undefined) {
        if (input.targetColumnId) {
          const column = state.boardColumns.find((c) => c.id === input.targetColumnId)
          if (!column) {
            throw new Error(`Target column ${input.targetColumnId} not found`)
          }
        }
        ;(rule as { targetColumnId: string | null }).targetColumnId = input.targetColumnId
      }
      if (input.priority !== undefined) {
        rule.priority = input.priority
      }
      if (input.enabled !== undefined) {
        rule.enabled = input.enabled
      }
      if (input.metadata !== undefined) {
        ;(rule as { metadata: Record<string, unknown> | null }).metadata = input.metadata
      }
      rule.updatedAt = isoDate(new Date())
      return { success: true }
    },
  },
  'routingRules.delete': {
    mutation: (input: { id: string }) => {
      const index = state.routingRules.findIndex((r) => r.id === input.id)
      if (index === -1) {
        throw new Error(`Routing rule ${input.id} not found`)
      }
      state.routingRules = state.routingRules.filter((r) => r.id !== input.id)
      return { success: true }
    },
  },
  'routingRules.reorder': {
    mutation: (input: { ruleIds: string[] }) => {
      input.ruleIds.forEach((id, index) => {
        const rule = state.routingRules.find((r) => r.id === id)
        if (rule) {
          rule.priority = index * 10
          rule.updatedAt = isoDate(new Date())
        }
      })
      return { success: true }
    },
  },
}

