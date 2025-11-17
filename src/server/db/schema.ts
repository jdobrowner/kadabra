import { pgTable, text, integer, timestamp, jsonb, pgEnum, boolean } from 'drizzle-orm/pg-core'

// Enums
export const badgeEnum = pgEnum('badge', ['at-risk', 'opportunity', 'lead', 'follow-up', 'no-action'])
export const channelEnum = pgEnum('channel', ['phone', 'email', 'chat', 'video', 'sms', 'ai-call', 'voice-message'])
export const sentimentEnum = pgEnum('sentiment', ['positive', 'neutral', 'negative', 'mixed'])
export const actionPlanStatusEnum = pgEnum('action_plan_status', ['active', 'completed', 'canceled'])
export const actionItemTypeEnum = pgEnum('action_item_type', ['email', 'call', 'task', 'text'])
export const actionItemStatusEnum = pgEnum('action_item_status', ['pending', 'completed'])
export const taskStatusEnum = pgEnum('task_status', ['todo', 'in_progress', 'done'])
export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high', 'urgent'])
export const reminderTypeEnum = pgEnum('reminder_type', ['email', 'call', 'text', 'task'])
export const reminderStatusEnum = pgEnum('reminder_status', ['pending', 'completed', 'dismissed'])
export const userRoleEnum = pgEnum('user_role', ['admin', 'developer', 'member'])
export const invitationStatusEnum = pgEnum('invitation_status', ['pending', 'accepted', 'rejected', 'expired', 'canceled'])
export const auditActionTypeEnum = pgEnum('audit_action_type', ['status_change', 'record_created', 'assigned', 'unassigned', 'updated'])
export const recordTypeEnum = pgEnum('record_type', ['Lead', 'Case', 'Opportunity', 'Task', 'Email'])
export const aiChatRoleEnum = pgEnum('ai_chat_role', ['user', 'assistant'])
export const teamStatusEnum = pgEnum('team_status', ['active', 'archived'])
export const teamMemberRoleEnum = pgEnum('team_member_role', ['owner', 'member', 'viewer'])
export const boardTypeEnum = pgEnum('board_type', ['kanban', 'list'])
export const boardVisibilityEnum = pgEnum('board_visibility', ['org', 'team'])
export const boardPermissionModeEnum = pgEnum('board_permission_mode', ['edit', 'view'])
export const boardCardTypeEnum = pgEnum('board_card_type', ['lead', 'case', 'deal', 'task', 'custom'])
export const boardCardStatusEnum = pgEnum('board_card_status', ['active', 'done', 'archived'])
export const routingConditionTypeEnum = pgEnum('routing_condition_type', [
  'badge',
  'intent',
  'urgency',
  'customer_segment',
  'channel',
  'custom',
])

// Organizations table
export const orgs = pgTable('orgs', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  role: userRoleEnum('role').notNull().default('member'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Invitations table
export const invitations = pgTable('invitations', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: userRoleEnum('role').notNull().default('member'),
  invitedByUserId: text('invited_by_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: invitationStatusEnum('status').notNull().default('pending'),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at'),
})

// API Keys table
export const apiKeys = pgTable('api_keys', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  keyHash: text('key_hash').notNull(),
  keyEncrypted: text('key_encrypted'),
  expiresAt: timestamp('expires_at'),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Teams table
export const teams = pgTable('teams', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  slug: text('slug'),
  status: teamStatusEnum('status').notNull().default('active'),
  isDefault: boolean('is_default').notNull().default(false),
  isAssignable: boolean('is_assignable').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Team members table
export const teamMembers = pgTable('team_members', {
  id: text('id').primaryKey(),
  teamId: text('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: teamMemberRoleEnum('role').notNull().default('member'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  removedAt: timestamp('removed_at'),
})

// Customers table
export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  companyName: text('company_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  avatar: text('avatar').notNull(),
  riskScore: integer('risk_score'),
  opportunityScore: integer('opportunity_score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Boards table
export const boards = pgTable('boards', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: boardTypeEnum('type').notNull().default('kanban'),
  slug: text('slug'),
  description: text('description'),
  cardType: boardCardTypeEnum('card_type').notNull().default('custom'),
  visibility: boardVisibilityEnum('visibility').notNull().default('org'),
  defaultTeamId: text('default_team_id').references(() => teams.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  archivedAt: timestamp('archived_at'),
})

// Board team permissions table
export const boardTeamPermissions = pgTable('board_team_permissions', {
  id: text('id').primaryKey(),
  boardId: text('board_id').notNull().references(() => boards.id, { onDelete: 'cascade' }),
  teamId: text('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  mode: boardPermissionModeEnum('mode').notNull().default('view'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Board columns table
export const boardColumns = pgTable('board_columns', {
  id: text('id').primaryKey(),
  boardId: text('board_id').notNull().references(() => boards.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  position: integer('position').notNull().default(0),
  wipLimit: integer('wip_limit'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Action Plans table
export const actionPlans = pgTable('action_plans', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  assignedToUserId: text('assigned_to_user_id').references(() => users.id, { onDelete: 'set null' }),
  assigneeTeamId: text('assignee_team_id').references(() => teams.id, { onDelete: 'set null' }),
  badge: badgeEnum('badge').notNull(),
  recommendation: text('recommendation').notNull(),
  whatToDo: text('what_to_do').notNull(),
  whyStrategy: text('why_strategy').notNull(),
  status: actionPlanStatusEnum('status').notNull().default('active'),
  routingMetadata: jsonb('routing_metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  canceledAt: timestamp('canceled_at'),
})

// Board cards table
export const boardCards = pgTable('board_cards', {
  id: text('id').primaryKey(),
  boardId: text('board_id').notNull().references(() => boards.id, { onDelete: 'cascade' }),
  columnId: text('column_id').notNull().references(() => boardColumns.id, { onDelete: 'cascade' }),
  actionPlanId: text('action_plan_id').references(() => actionPlans.id, { onDelete: 'set null' }),
  customerId: text('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  type: boardCardTypeEnum('type').notNull().default('custom'),
  status: boardCardStatusEnum('status').notNull().default('active'),
  position: integer('position').notNull().default(0),
  dueDate: timestamp('due_date'),
  priority: taskPriorityEnum('priority'),
  assigneeUserId: text('assignee_user_id').references(() => users.id, { onDelete: 'set null' }),
  assigneeTeamId: text('assignee_team_id').references(() => teams.id, { onDelete: 'set null' }),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  archivedAt: timestamp('archived_at'),
})

// Action Items table
export const actionItems = pgTable('action_items', {
  id: text('id').primaryKey(),
  actionPlanId: text('action_plan_id').notNull().references(() => actionPlans.id, { onDelete: 'cascade' }),
  type: actionItemTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: actionItemStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Conversations table
export const conversations = pgTable('conversations', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  recordedByUserId: text('recorded_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  channel: channelEnum('channel').notNull(),
  date: timestamp('date').notNull(),
  duration: integer('duration'),
  messageCount: integer('message_count'),
  transcript: text('transcript').notNull(),
  summary: text('summary'),
  sentiment: sentimentEnum('sentiment'),
  intent: text('intent'),
  agent: text('agent'),
  subject: text('subject'),
  insights: jsonb('insights').$type<string[]>(),
  coachingSuggestions: jsonb('coaching_suggestions').$type<string[]>(),
  keyStats: jsonb('key_stats').$type<Record<string, any>>(),
  messages: jsonb('messages').$type<Array<{
    role: 'assistant' | 'customer' | 'agent'
    content: string
    timestamp: string
  }>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Communications table
export const communications = pgTable('communications', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  type: channelEnum('type').notNull(),
  count: integer('count').notNull().default(0),
  lastTime: timestamp('last_time').notNull(),
})

// Last communications table
export const lastCommunications = pgTable('last_communications', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }).unique(),
  type: channelEnum('type').notNull(),
  time: timestamp('time').notNull(),
  topic: text('topic').notNull(),
  shortTopic: text('short_topic').notNull(),
  longTopic: text('long_topic').notNull(),
})

// Tasks table
export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
  customerId: text('customer_id').references(() => customers.id, { onDelete: 'cascade' }),
  conversationId: text('conversation_id').references(() => conversations.id, { onDelete: 'set null' }),
  actionPlanId: text('action_plan_id').references(() => actionPlans.id, { onDelete: 'set null' }),
  assigneeTeamId: text('assignee_team_id').references(() => teams.id, { onDelete: 'set null' }),
  boardCardId: text('board_card_id').references(() => boardCards.id, { onDelete: 'set null' }),
  ownerUserId: text('owner_user_id').references(() => users.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  priority: taskPriorityEnum('priority').notNull().default('medium'),
  status: taskStatusEnum('status').notNull().default('todo'),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Reminders table
export const reminders = pgTable('reminders', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  actionItemId: text('action_item_id').references(() => actionItems.id, { onDelete: 'set null' }),
  type: reminderTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  reminderDate: timestamp('reminder_date').notNull(),
  status: reminderStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Routing rules table
export const routingRules = pgTable('routing_rules', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  channel: channelEnum('channel'),
  conditionType: routingConditionTypeEnum('condition_type').notNull(),
  conditionValue: text('condition_value'),
  targetTeamId: text('target_team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
  targetBoardId: text('target_board_id').references(() => boards.id, { onDelete: 'set null' }),
  targetColumnId: text('target_column_id').references(() => boardColumns.id, { onDelete: 'set null' }),
  priority: integer('priority').notNull().default(100),
  enabled: boolean('enabled').notNull().default(true),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Action Plan Audit Logs table
export const actionPlanAuditLogs = pgTable('action_plan_audit_logs', {
  id: text('id').primaryKey(),
  actionPlanId: text('action_plan_id').notNull().references(() => actionPlans.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: auditActionTypeEnum('action').notNull(),
  recordType: recordTypeEnum('record_type'),
  recordId: text('record_id'),
  recordUrl: text('record_url'),
  previousStatus: actionPlanStatusEnum('previous_status'),
  newStatus: actionPlanStatusEnum('new_status'),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// AI Agent Chats table
export const aiAgentChats = pgTable('ai_agent_chats', {
  id: text('id').primaryKey(),
  orgId: text('org_id').notNull().references(() => orgs.id, { onDelete: 'cascade' }),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastMessageAt: timestamp('last_message_at').defaultNow().notNull(),
})

// AI Agent Messages table
export const aiAgentMessages = pgTable('ai_agent_messages', {
  id: text('id').primaryKey(),
  chatId: text('chat_id').notNull().references(() => aiAgentChats.id, { onDelete: 'cascade' }),
  role: aiChatRoleEnum('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
