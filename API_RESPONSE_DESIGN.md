# API Response Data Structure Design

This document outlines the proposed API response structures for kadabra-demo. These structures are designed to match what the UI components expect and provide efficient data access.

## Base Types

All IDs are strings (will be converted from database integers for consistency).
All dates are ISO 8601 strings (e.g., "2024-01-15T14:30:00Z").

---

## 1. Customers API

### `GET /api/trpc/customers.list`

**Query Parameters:**
```typescript
{
  badge?: 'at-risk' | 'opportunity' | 'lead' | 'follow-up' | 'no-action' | 'all'
  sortBy?: 'priority' | 'most-recent'
  assignee?: string
  timeframe?: 'all' | 'today' | '24h' | '7d' | '30d'
}
```

**Response:**
```typescript
Array<{
  id: string
  name: string
  companyName: string
  email?: string
  phone?: string
  riskScore?: number // 0-100 scale
  opportunityScore?: number // 0-100 scale
  communications: Array<{
    type: 'phone' | 'video' | 'email' | 'sms' | 'ai-call' | 'voice-message'
    count: number
    lastTime: string // ISO 8601 date string
  }>
  lastCommunication?: {
    type: 'phone' | 'video' | 'email' | 'sms' | 'chat' | 'ai-call' | 'voice-message'
    time: string // ISO 8601 date string
    topic: string // Short topic summary
    shortTopic: string // Very brief topic (1-2 words)
    longTopic: string // Detailed topic description
  }
  actionPlan?: {
    id: string
    badge: 'at-risk' | 'opportunity' | 'lead' | 'follow-up' | 'no-action'
    aiRecommendation: string
  } | null
  avatar: string // URL
  createdAt: string
  updatedAt: string
  // Aggregate counts
  totalConversations?: number
  totalTasks?: number
  totalActionPlans?: number
}>
```

**Notes:**
- Badge and AI recommendation are scoped under actionPlan (null if no action plan exists)
- All time fields use ISO 8601 format
- Last communication includes topic information
- Filtering done via query parameters instead of separate endpoints
- Includes aggregate counts for related data

---

### `GET /api/trpc/customers.getById`

**Response:**
```typescript
{
  id: string
  name: string
  companyName: string
  email?: string
  phone?: string
  riskScore?: number // 0-100 scale
  opportunityScore?: number // 0-100 scale
  avatar: string
  createdAt: string
  updatedAt: string
  // Aggregate counts
  totalConversations: number
  totalTasks: number
  totalActionPlans: number
}
```

**Notes:**
- Badge is not on customer - it lives on the action plan
- No status field on customer
- Includes aggregate counts for related data

---

## 2. Action Plans API

### `GET /api/trpc/actionPlans.list`

**Query Parameters:**
```typescript
{
  status?: 'all' | 'active' | 'completed' | 'canceled'
  badge?: 'at-risk' | 'opportunity' | 'lead' | 'follow-up' | 'no-action' | 'all'
  customerId?: string
}
```

**Response:**
```typescript
Array<{
  id: string
  customerId: string
  customer?: { // Optional populated customer data
    id: string
    name: string
    companyName: string
    avatar: string
  }
  badge: 'at-risk' | 'opportunity' | 'potential-lead' | 'follow-up' | 'no-action'
  whatToDo: string
  whyStrategy: string
  status: 'active' | 'completed' | 'canceled'
  actionItems: Array<{
    id: string
    type: 'email' | 'call' | 'task' | 'text'
    title: string
    description: string
    status: 'pending' | 'completed'
  }>
  createdAt: string
  updatedAt: string
  completedAt?: string
  canceledAt?: string
}>
```

**Notes:**
- Badge lives on action plan, not customer
- Action item type includes 'text' option
- Status includes 'canceled'
- Filtering done via query parameters

---

### `GET /api/trpc/actionPlans.getById`

**Response:**
```typescript
{
  id: string
  customerId: string
  customer: { // Always populated
    id: string
    name: string
    companyName: string
    avatar: string
  }
  badge: 'at-risk' | 'opportunity' | 'potential-lead' | 'follow-up' | 'no-action'
  whatToDo: string
  whyStrategy: string
  status: 'active' | 'completed' | 'canceled'
  actionItems: Array<{
    id: string
    type: 'email' | 'call' | 'task' | 'text'
    title: string
    description: string
    status: 'pending' | 'completed'
  }>
  createdAt: string
  updatedAt: string
  completedAt?: string
  canceledAt?: string
}
```

**Notes:**
- Badge lives on action plan
- Action item type includes 'text' option

---

### `GET /api/trpc/actionPlans.getByCustomerId`

**Response:**
```typescript
{
  id: string
  customerId: string
  badge: 'at-risk' | 'opportunity' | 'potential-lead' | 'follow-up' | 'no-action'
  whatToDo: string
  whyStrategy: string
  status: 'active' | 'completed' | 'canceled'
  actionItems: Array<{
    id: string
    type: 'email' | 'call' | 'task' | 'text'
    title: string
    description: string
    status: 'pending' | 'completed'
  }>
  createdAt: string
  updatedAt: string
  completedAt?: string
  canceledAt?: string
} | null
```

**Notes:**
- Returns single action plan or null (each customer has 0 or 1 action plan)
- Badge lives on action plan
- Action item type includes 'text' option
- Used for Customer Overview page

---

### `POST /api/trpc/actionPlans.markComplete`

**Input:**
```typescript
{
  id: string
}
```

**Response:**
```typescript
{
  success: true
  actionPlan: {
    // Same structure as getById
  }
}
```

---

## 3. Conversations API

### `GET /api/trpc/conversations.list`

**Response:**
```typescript
Array<{
  id: string
  customerId: string
  customer?: { // Optional populated
    id: string
    name: string
    companyName: string
  }
  channel: 'phone' | 'email' | 'chat' | 'video' | 'sms' | 'ai-call' | 'voice-message'
  date: string
  duration?: number // minutes (for phone/video/ai-call)
  messageCount?: number // For email/sms threads - count of messages in thread
  transcript: string
  summary?: string
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed'
  intent?: string
  agent?: string
  subject?: string // for email
  createdAt: string
}>
```

**Notes:**
- Channel includes 'sms'
- For email/sms channels, messageCount indicates number of messages in thread
- Threads are split when communication arrives from a different channel

---

### `GET /api/trpc/conversations.getById`

**Response:**
```typescript
{
  id: string
  customerId: string
  customer: { // Always populated
    id: string
    name: string
    companyName: string
    avatar: string
  }
  channel: 'phone' | 'email' | 'chat' | 'video' | 'sms'
  date: string
  duration?: number // minutes (for phone/video)
  messageCount?: number // For email/sms threads
  transcript: string
  messages: Array<{ // Always included - structured transcript
    role: 'assistant' | 'customer' | 'agent'
    content: string
    timestamp: string
  }>
  summary?: string
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed'
  intent?: string // Only at root level, not in keyStats
  agent?: string
  subject?: string // for email
  // AI Analysis fields (for Conversation Transcript page)
  insights?: string[] // Array of insight strings
  coachingSuggestions?: string[] // Array of coaching suggestion strings
  keyStats?: {
    sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
    duration?: number
    wordCount?: number
    talkToListenRatio?: string
    [key: string]: any
  }
  createdAt: string
}
```

**Notes:**
- Channel includes 'sms'
- Messages always included (structured transcript)
- Insights and coachingSuggestions are arrays
- Intent only at root level (removed duplicate from keyStats)
- For email/sms, messageCount indicates number of messages in thread

---

### `GET /api/trpc/conversations.getByCustomerId`

**Response:**
```typescript
Array<{
  id: string
  customerId: string
  channel: 'phone' | 'email' | 'chat' | 'video' | 'sms' | 'ai-call' | 'voice-message'
  date: string
  duration?: number // minutes (for phone/video/ai-call)
  messageCount?: number // For email/sms threads - count of messages in thread
  transcript: string
  summary?: string
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed'
  intent?: string
  agent?: string
  subject?: string // for email
  createdAt: string
}>
```

**Notes:**
- Used for Conversation History timeline
- Returns in reverse chronological order (newest first)
- Channel includes 'sms'
- For email/sms channels, messageCount indicates number of messages in thread
- Each item represents either: a phone call, video call, chat session, email thread, or SMS thread
- Threads are split when communication arrives from a different channel

---

## 4. Tasks API

### `GET /api/trpc/tasks.list`

**Query Parameters:**
```typescript
{
  customerId?: string
  status?: 'all' | 'todo' | 'in_progress' | 'done'
  priority?: 'all' | 'low' | 'medium' | 'high' | 'urgent'
}
```

**Response:**
```typescript
Array<{
  id: string
  customerId?: string
  conversationId?: string
  actionPlanId?: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in_progress' | 'done'
  dueDate?: string
  owner?: string
  createdAt: string
  updatedAt: string
}>
```

---

### `GET /api/trpc/tasks.getByCustomerId`

**Response:** Same as `tasks.list` (filtered by customerId)

---

### `POST /api/trpc/tasks.create`

**Input:**
```typescript
{
  customerId: string
  conversationId?: string
  actionPlanId?: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  owner?: string
}
```

**Response:**
```typescript
{
  success: true
  task: {
    // Same structure as tasks.list item
  }
}
```

---

### `POST /api/trpc/tasks.updateStatus`

**Input:**
```typescript
{
  id: string
  status: 'todo' | 'in_progress' | 'done'
}
```

**Response:**
```typescript
{
  success: true
}
```

---

## 5. Calendar API

### `GET /api/trpc/calendar.today`

**Response:**
```typescript
Array<{
  id: string
  customerId: string
  customer?: { // Optional populated
    id: string
    name: string
    companyName: string
  }
  title: string
  date: string
  type: 'call' | 'meeting' | 'follow_up' | 'demo'
  goal: string
  prepNotes?: string
  talkingPoints?: string[]
  createdAt: string
}>
```

**Notes:**
- Returns only events for today
- Used for Dashboard MiniCalendar

---

### `GET /api/trpc/calendar.getByCustomerId`

**Response:** Same as `calendar.today` (filtered by customerId)

---

## 6. Dashboard API

### `GET /api/trpc/dashboard.stats`

**Response:**
```typescript
{
  customersAnalyzed: number // Last 24 hours
  actionPlansCreated: number // Last 24 hours
  urgentActionPlans: number // Active action plans with urgent items
}
```

**Notes:**
- All counts are for last 24 hours
- Used for Dashboard WelcomeStats component

---

## 7. AI Agent API

### `POST /api/trpc/aiAgent.query`

**Input:**
```typescript
{
  message: string
  customerId?: string // Optional - if provided, include customer context
  history?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}
```

**Response:**
```typescript
{
  reply: string // Markdown formatted text
}
```

**Notes:**
- Single AI agent endpoint (not multiple)
- Reply is formatted as markdown to support text formatting
- Always includes full customer and task context when customerId is provided
- Context includes:
  - Customer details (name, company, riskScore, opportunityScore)
  - Customer conversations (last 5, with summaries)
  - Customer tasks (all open tasks)
  - Customer action plan (if exists, with badge and recommendation)

---

## 8. Search API

### `GET /api/trpc/search.query`

**Input (query params):**
```typescript
{
  q?: string // Search query
  type?: 'all' | 'customers' | 'conversations' | 'action-plans'
  priority?: 'all' | 'at-risk' | 'opportunity' | 'potential-lead' | 'follow-up' | 'no-action'
  status?: 'all' | 'active' | 'completed' | 'canceled'
  sortBy?: 'recent' | 'relevance'
  limit?: number
  offset?: number
}
```

**Response:**
```typescript
{
  results: Array<{
    type: 'customer' | 'conversation' | 'action-plan'
    id: string
    title: string
    subtitle: string
    link: string // Relative URL like "/customers/1" or "/conversations/conv-1"
    date: string
    metadata?: {
      // Additional type-specific metadata
      [key: string]: any
    }
  }>
  total: number
  limit: number
  offset: number
}
```

---

## Design Decisions

1. **IDs as strings**: All IDs returned as strings for consistency, even if stored as integers in DB
2. **Optional populated relations**: Some endpoints optionally include related data (e.g., customer in conversations.list) to reduce requests
3. **Date formats**: ISO 8601 strings for all dates (no human-readable alternatives like "2h ago")
4. **Single AI agent**: One endpoint that handles all contexts, rather than separate endpoints
5. **Action plan cardinality**: Explicitly designed for 0 or 1 action plan per customer
6. **Badge on action plan**: Badge lives on action plan, not customer (customer has no badge if no action plan)
7. **Filtering via query params**: All list endpoints support filtering via query parameters instead of separate endpoints
8. **No pagination**: List endpoints return all results (can be extended later if needed)
9. **Action items in action plans**: Action items always included within action plan responses
10. **Messages always included**: Conversation messages always included in getById responses
11. **Aggregate counts**: Customer responses include aggregate counts for related data
12. **Email/SMS threads**: Each conversation item represents a thread; messageCount indicates number of messages in thread
13. **AI response as markdown**: AI agent responses formatted as markdown for rich text display

---

## Changes from Initial Design

Based on review feedback:

1. ✅ Badge moved from customer to action plan
2. ✅ Status removed from customer, riskLevel changed to riskScore (number)
3. ✅ Separate badge endpoints removed - filtering via query params on list endpoint
4. ✅ Action item type expanded to include 'text'
5. ✅ Action plan status expanded to include 'canceled'
6. ✅ Channel type expanded to include 'sms'
7. ✅ Insights and coachingSuggestions changed to arrays
8. ✅ Duplicate intent removed from keyStats
9. ✅ MessageCount added for email/sms threads
10. ✅ LastCommunication object created with topic information
11. ✅ Aggregate counts added to customer responses
12. ✅ AI response formatted as markdown
