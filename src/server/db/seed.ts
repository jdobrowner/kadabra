import 'dotenv/config'

import { db } from './index'
import {
  orgs,
  users,
  invitations,
  customers,
  actionPlans,
  actionItems,
  conversations,
  tasks,
  calendarEvents,
  communications,
  lastCommunications,
  aiAgentChats,
  aiAgentMessages,
  teams,
  teamMembers,
  boards,
  boardColumns,
  boardTeamPermissions,
  boardCards,
  routingRules,
} from './schema'
import { mockCustomers } from '../../data/mockCustomers'
import { mockActionPlans } from '../../data/mockActionPlans'
import { mockConversations } from '../../data/mockConversations'
import { mockTasks } from '../../data/mockTasks'
import { mockCalendarEvents } from '../../data/mockCalendarEvents'

const TEAM_SUPPORT = 'team-support'
const TEAM_RETENTION = 'team-retention'
const TEAM_GROWTH = 'team-growth'
const TEAM_SALES = 'team-sales'

const BOARD_CASES = 'board-cases'
const BOARD_LEADS = 'board-leads'
const BOARD_DEALS = 'board-deals'

async function seed() {
  console.log('Starting database seed...')

  // Clear existing data (children first)
  console.log('Clearing existing data...')
  await db.delete(aiAgentMessages)
  await db.delete(aiAgentChats)
  await db.delete(calendarEvents)
  await db.delete(tasks)
  await db.delete(routingRules)
  await db.delete(boardCards)
  await db.delete(boardColumns)
  await db.delete(boardTeamPermissions)
  await db.delete(boards)
  await db.delete(teamMembers)
  await db.delete(teams)
  await db.delete(conversations)
  await db.delete(actionItems)
  await db.delete(actionPlans)
  await db.delete(lastCommunications)
  await db.delete(communications)
  await db.delete(customers)
  await db.delete(invitations)
  await db.delete(users)
  await db.delete(orgs)

  // Seed organization
  console.log('Seeding organization...')
  const defaultOrgId = 'org-1'
  await db.insert(orgs).values({
    id: defaultOrgId,
    name: 'Demo Organization',
    slug: 'demo',
  })

  // Seed user
  console.log('Seeding users & teams...')
  const defaultUserId = 'user-1'
  await db.insert(users).values({
    id: defaultUserId,
    orgId: defaultOrgId,
    email: 'admin@demo.com',
    name: 'Admin User',
    role: 'admin',
  })

  const teamDefinitions = [
    {
      id: TEAM_SUPPORT,
      name: 'Customer Support',
      description: 'Handles inbound escalations and retention cases',
      slug: 'support',
      isDefault: true,
    },
    {
      id: TEAM_RETENTION,
      name: 'Retention & Success',
      description: 'Owns lifecycle moments and customer success follow-up',
      slug: 'retention',
      isDefault: false,
    },
    {
      id: TEAM_GROWTH,
      name: 'Growth & Expansion',
      description: 'Identifies upsell paths and coordinates cross-sell plays',
      slug: 'growth',
      isDefault: false,
    },
    {
      id: TEAM_SALES,
      name: 'Sales',
      description: 'Owns new business pipeline and deal execution',
      slug: 'sales',
      isDefault: false,
    },
  ] as const

  for (const team of teamDefinitions) {
    await db.insert(teams).values({
      id: team.id,
      orgId: defaultOrgId,
      name: team.name,
      description: team.description,
      slug: team.slug,
      isDefault: team.isDefault,
    })

    await db.insert(teamMembers).values({
      id: `${team.id}-member-${defaultUserId}`,
      teamId: team.id,
      userId: defaultUserId,
      role: team.id === TEAM_SUPPORT ? 'owner' : 'member',
    })
  }

  // Boards & columns
  console.log('Seeding boards...')
  const boardDefinitions = [
    {
      id: BOARD_CASES,
      name: 'Customer Cases',
      cardType: 'case',
      defaultTeamId: TEAM_SUPPORT,
      permissions: [
        { id: 'perm-cases-support', teamId: TEAM_SUPPORT, mode: 'edit' as const },
        { id: 'perm-cases-retention', teamId: TEAM_RETENTION, mode: 'view' as const },
      ],
      columns: [
        { id: 'col-cases-intake', key: 'intake', name: 'Intake', position: 0 },
        { id: 'col-cases-investigating', key: 'investigating', name: 'Investigating', position: 1 },
        { id: 'col-cases-resolved', key: 'resolved', name: 'Resolved', position: 2 },
      ],
    },
    {
      id: BOARD_LEADS,
      name: 'Growth Leads',
      cardType: 'lead',
      defaultTeamId: TEAM_GROWTH,
      permissions: [
        { id: 'perm-leads-growth', teamId: TEAM_GROWTH, mode: 'edit' as const },
        { id: 'perm-leads-sales', teamId: TEAM_SALES, mode: 'view' as const },
      ],
      columns: [
        { id: 'col-leads-new', key: 'new', name: 'New Lead', position: 0 },
        { id: 'col-leads-contacted', key: 'contacted', name: 'Contacted', position: 1 },
        { id: 'col-leads-qualified', key: 'qualified', name: 'Qualified', position: 2 },
      ],
    },
    {
      id: BOARD_DEALS,
      name: 'Sales Deals',
      cardType: 'deal',
      defaultTeamId: TEAM_SALES,
      permissions: [
        { id: 'perm-deals-sales', teamId: TEAM_SALES, mode: 'edit' as const },
        { id: 'perm-deals-growth', teamId: TEAM_GROWTH, mode: 'view' as const },
      ],
      columns: [
        { id: 'col-deals-prospecting', key: 'prospecting', name: 'Prospecting', position: 0 },
        { id: 'col-deals-proposal', key: 'proposal', name: 'Proposal', position: 1 },
        { id: 'col-deals-closed', key: 'closed', name: 'Closed Won', position: 2 },
      ],
    },
  ]

  const boardColumnLookup = new Map<string, string>()

  for (const board of boardDefinitions) {
    await db.insert(boards).values({
      id: board.id,
      orgId: defaultOrgId,
      name: board.name,
      cardType: board.cardType as 'lead' | 'case' | 'deal' | 'task' | 'custom',
      visibility: 'team',
      defaultTeamId: board.defaultTeamId,
    })

    for (const column of board.columns) {
      await db.insert(boardColumns).values({
        id: column.id,
        boardId: board.id,
        name: column.name,
        position: column.position,
      })
      boardColumnLookup.set(`${board.id}:${column.key}`, column.id)
    }

    for (const permission of board.permissions) {
      await db.insert(boardTeamPermissions).values({
        id: permission.id,
        boardId: board.id,
        teamId: permission.teamId,
        mode: permission.mode,
      })
    }
  }

  // Routing rules (after columns exist)
  console.log('Seeding routing rules...')
  const routingRulesSeed = [
    {
      id: 'routing-at-risk-support',
      name: 'At-Risk → Support Cases',
      conditionType: 'badge',
      conditionValue: 'at-risk',
      targetTeamId: TEAM_SUPPORT,
      targetBoardId: BOARD_CASES,
      targetColumnKey: 'intake',
      priority: 10,
    },
    {
      id: 'routing-opportunity-growth',
      name: 'Opportunity → Growth Leads',
      conditionType: 'badge',
      conditionValue: 'opportunity',
      targetTeamId: TEAM_GROWTH,
      targetBoardId: BOARD_LEADS,
      targetColumnKey: 'new',
      priority: 20,
    },
    {
      id: 'routing-lead-sales',
      name: 'Lead → Sales Deals',
      conditionType: 'badge',
      conditionValue: 'lead',
      targetTeamId: TEAM_SALES,
      targetBoardId: BOARD_DEALS,
      targetColumnKey: 'prospecting',
      priority: 30,
    },
    {
      id: 'routing-followup-retention',
      name: 'Follow-Up → Retention',
      conditionType: 'badge',
      conditionValue: 'follow-up',
      targetTeamId: TEAM_RETENTION,
      targetBoardId: BOARD_CASES,
      targetColumnKey: 'investigating',
      priority: 40,
    },
  ]

  for (const rule of routingRulesSeed) {
    await db.insert(routingRules).values({
      id: rule.id,
      orgId: defaultOrgId,
      name: rule.name,
      conditionType: rule.conditionType as 'badge' | 'intent' | 'urgency' | 'customer_segment' | 'channel' | 'custom',
      conditionValue: rule.conditionValue,
      targetTeamId: rule.targetTeamId,
      targetBoardId: rule.targetBoardId,
      targetColumnId: boardColumnLookup.get(`${rule.targetBoardId}:${rule.targetColumnKey}`) ?? null,
      priority: rule.priority,
      enabled: true,
    })
  }

  // Seed customers & communications
  console.log('Seeding customers...')
  for (const mockCustomer of mockCustomers) {
    await db.insert(customers).values({
      id: mockCustomer.id,
      orgId: defaultOrgId,
      name: mockCustomer.name,
      companyName: mockCustomer.companyName,
      email: mockCustomer.name.toLowerCase().replace(' ', '.') + '@example.com',
      phone: '+1-555-0100',
      avatar: mockCustomer.avatar,
      riskScore: mockCustomer.badge === 'at-risk' ? 85 : mockCustomer.badge === 'opportunity' ? 60 : 40,
      opportunityScore: mockCustomer.badge === 'opportunity' ? 80 : mockCustomer.badge === 'lead' ? 70 : 30,
    })

    for (const comm of mockCustomer.communications) {
      const commValue: {
        id: string
        customerId: string
        type: 'phone' | 'email' | 'chat' | 'video' | 'sms' | 'ai-call' | 'voice-message'
        count: number
        lastTime: Date
      } = {
        id: `comm-${mockCustomer.id}-${comm.type}`,
        customerId: mockCustomer.id,
        type: comm.type as 'phone' | 'email' | 'chat' | 'video' | 'sms' | 'ai-call' | 'voice-message',
        count: comm.count,
        lastTime: new Date(),
      }
      await db.insert(communications).values(commValue)
    }

    const lastComm = mockCustomer.communications[0] || { type: 'phone' as const }
    await db.insert(lastCommunications).values({
      id: `lastcomm-${mockCustomer.id}`,
      customerId: mockCustomer.id,
      type: lastComm.type,
      time: new Date(),
      topic: mockCustomer.topic,
      shortTopic: mockCustomer.topic.split(' ').slice(0, 2).join(' '),
      longTopic: mockCustomer.longTopic,
    })
  }

  // Seed action plans & action items
  console.log('Seeding action plans...')
  const badgeTeamMap: Record<string, string> = {
    'at-risk': TEAM_SUPPORT,
    opportunity: TEAM_GROWTH,
    lead: TEAM_SALES,
    'follow-up': TEAM_RETENTION,
  }

  const teamPromotionRoutes: Record<string, { boardId: string; columnId: string | undefined; cardType: 'case' | 'lead' | 'deal' | 'task' | 'custom' }> = {
    [TEAM_SUPPORT]: { boardId: BOARD_CASES, columnId: boardColumnLookup.get(`${BOARD_CASES}:intake`), cardType: 'case' },
    [TEAM_RETENTION]: { boardId: BOARD_CASES, columnId: boardColumnLookup.get(`${BOARD_CASES}:investigating`), cardType: 'case' },
    [TEAM_GROWTH]: { boardId: BOARD_LEADS, columnId: boardColumnLookup.get(`${BOARD_LEADS}:new`), cardType: 'lead' },
    [TEAM_SALES]: { boardId: BOARD_DEALS, columnId: boardColumnLookup.get(`${BOARD_DEALS}:prospecting`), cardType: 'deal' },
  }

  const routingRuleByBadge: Record<string, string> = {
    'at-risk': 'routing-at-risk-support',
    opportunity: 'routing-opportunity-growth',
    lead: 'routing-lead-sales',
    'follow-up': 'routing-followup-retention',
  }

  const actionPlanCards = new Map<string, string>()
  const actionPlanTeams = new Map<string, string>()
  const columnPositions = new Map<string, number>()

  for (const mockPlan of mockActionPlans) {
    const customer = mockCustomers.find((c) => c.id === mockPlan.customerId)
    const badge = customer?.badge || 'follow-up'
    const assignedTeamId = badgeTeamMap[badge] ?? TEAM_RETENTION
    const routingMeta = routingRuleByBadge[badge]

    await db.insert(actionPlans).values({
      id: mockPlan.id,
      customerId: mockPlan.customerId,
      badge: badge as any,
      recommendation: mockPlan.whatToDo.substring(0, 100),
      whatToDo: mockPlan.whatToDo,
      whyStrategy: mockPlan.whyStrategy,
      status: mockPlan.status,
      createdAt: new Date(mockPlan.createdAt),
      updatedAt: new Date(mockPlan.updatedAt),
      completedAt: mockPlan.completedAt ? new Date(mockPlan.completedAt) : undefined,
      assigneeTeamId: assignedTeamId,
      routingMetadata: routingMeta
        ? {
            matchedRuleId: routingMeta,
            matchedAt: new Date().toISOString(),
            sourceBadge: badge,
          }
        : undefined,
    })

    actionPlanTeams.set(mockPlan.id, assignedTeamId)

    if (mockPlan.actionItems) {
      for (const item of mockPlan.actionItems) {
        await db.insert(actionItems).values({
          id: item.id,
          actionPlanId: mockPlan.id,
          type: item.type,
          title: item.title,
          description: item.description,
          status: item.status,
        })
      }
    }

    const promotion = teamPromotionRoutes[assignedTeamId]
    if (promotion?.columnId && mockPlan.status === 'active') {
      const columnId = promotion.columnId
      const position = columnPositions.get(columnId) ?? 0
      columnPositions.set(columnId, position + 1)

      const cardId = `card-${mockPlan.id}`
      const cardStatus: 'active' | 'done' = 'active'
      await db.insert(boardCards).values({
        id: cardId,
        boardId: promotion.boardId,
        columnId,
        actionPlanId: mockPlan.id,
        customerId: mockPlan.customerId,
        title: mockPlan.whatToDo,
        description: mockPlan.whyStrategy,
        type: promotion.cardType as 'lead' | 'case' | 'deal' | 'task' | 'custom',
        status: cardStatus,
        position,
        assigneeTeamId: assignedTeamId,
        assigneeUserId: defaultUserId,
        metadata: { badge },
        completedAt: undefined,
      })

      actionPlanCards.set(mockPlan.id, cardId)
    }
  }

  // Seed conversations
  console.log('Seeding conversations...')
  for (const mockConv of mockConversations) {
    await db.insert(conversations).values({
      id: mockConv.id,
      customerId: mockConv.customerId,
      channel: mockConv.channel,
      date: new Date(mockConv.date),
      duration: mockConv.duration,
      messageCount: mockConv.channel === 'email' || mockConv.channel === 'sms' ? 5 : undefined,
      transcript: mockConv.transcript,
      summary: mockConv.summary,
      sentiment: mockConv.sentiment,
      intent: mockConv.intent,
      agent: mockConv.agent,
      subject: mockConv.subject,
      insights: mockConv.insights || [],
      coachingSuggestions: mockConv.coachingSuggestions || [],
      keyStats: mockConv.keyStats || {},
      messages: mockConv.messages,
    })
  }

  // Seed tasks
  console.log('Seeding tasks...')
  for (const mockTask of mockTasks) {
    const relatedTeamId = mockTask.actionPlanId ? actionPlanTeams.get(mockTask.actionPlanId) : undefined
    const relatedCardId = mockTask.actionPlanId ? actionPlanCards.get(mockTask.actionPlanId) : undefined

    await db.insert(tasks).values({
      id: mockTask.id,
      orgId: defaultOrgId,
      customerId: mockTask.customerId,
      conversationId: mockTask.conversationId,
      actionPlanId: mockTask.actionPlanId,
      title: mockTask.title,
      description: mockTask.description,
      priority: mockTask.priority,
      status: mockTask.status,
      dueDate: mockTask.dueDate ? new Date(mockTask.dueDate) : undefined,
      createdAt: new Date(mockTask.createdAt),
      updatedAt: new Date(mockTask.updatedAt),
      assigneeTeamId: relatedTeamId,
      boardCardId: relatedCardId,
    })
  }

  // Seed calendar events
  console.log('Seeding calendar events...')
  for (const mockEvent of mockCalendarEvents) {
    await db.insert(calendarEvents).values({
      id: mockEvent.id,
      orgId: defaultOrgId,
      customerId: mockEvent.customerId,
      title: mockEvent.title,
      date: new Date(mockEvent.date),
      type: mockEvent.type,
      goal: mockEvent.goal,
      prepNotes: mockEvent.prepNotes,
      talkingPoints: mockEvent.talkingPoints,
    })
  }

  // Seed sample AI assistant chat for the first customer
  const firstCustomer = mockCustomers[0]
  if (firstCustomer) {
    const sampleChatId = 'ai-chat-sample-1'
    console.log('Seeding AI assistant chat...')
    await db.insert(aiAgentChats).values({
      id: sampleChatId,
      orgId: defaultOrgId,
      customerId: firstCustomer.id,
      userId: defaultUserId,
      title: 'Renewal strategy discussion',
    })

    await db.insert(aiAgentMessages).values([
      {
        id: 'ai-chat-sample-1-msg-1',
        chatId: sampleChatId,
        role: 'user',
        content: 'Give me quick talking points for Jamie’s renewal call.',
      },
      {
        id: 'ai-chat-sample-1-msg-2',
        chatId: sampleChatId,
        role: 'assistant',
        content:
          '- Highlight roadmap investments and analytics improvements\n- Address pricing concerns with phased adjustments\n- Reconfirm executive sponsorship next steps',
      },
    ])
  }

  console.log('Database seed completed!')
}

seed()
  .catch((error) => {
    console.error('Error seeding database:', error)
    process.exit(1)
  })
