# Product Requirements Document: ActionPlanIt

## 1. Executive Summary

**Product Name**: ActionPlanIt  
**Vision**: An AI-powered customer relationship management platform that transforms reactive support into proactive, strategic customer success through intelligent triage and automated action planning.

**Target Users**: Customer success teams, sales teams, support organizations  
**Core Value Proposition**: Eliminate decision paralysis by surfacing the right customer at the right time with AI-generated, context-aware action plans.

### 1.1 Phasing Strategy
- **Phase 1 (MVP)**: Functional demo using local mock data and browser storage. No backend, no authentication. Focus on UI/UX excellence and data structure validation.
- **Phase 2 (Production)**: Backend integration, database, Google OAuth, real-time updates, API integrations.

### 1.2 Key Differentiators
- **AI-First Architecture**: Every screen powered by AI insights (risk scoring, action generation, conversation analysis)
- **Team-Centric Progress**: Track collective team performance, not just individual metrics
- **Nested Reminders**: Link reminders directly to action items for complete traceability
- **Multi-Board Workspace**: Flexible Kanban system with team-based permissions

---

## 2. Data Architecture

**Design Philosophy**: All data structures must be identical to future API responses. This ensures zero refactoring when connecting to backend services.

### 2.1. Core Types
```typescript
type BadgeType = 'at-risk' | 'opportunity' | 'lead' | 'follow-up' | 'no-action';
type ChannelType = 'phone' | 'video' | 'email' | 'chat' | 'sms' | 'ai-call' | 'voice-message';
type SentimentType = 'positive' | 'neutral' | 'negative' | 'mixed';
type PriorityType = 'low' | 'medium' | 'high' | 'urgent';
type ActionPlanStatusType = 'active' | 'completed' | 'canceled';
type UserRole = 'admin' | 'developer' | 'member';
```

### 2.2. Customer Entity
```typescript
interface Customer {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  avatar: string;
  riskScore: number; // 0-100, AI-calculated
  opportunityScore: number; // 0-100, AI-calculated
  
  // Aggregate metrics
  totalConversations: number;
  totalTasks: number;
  totalActionPlans: number;
  
  // Most recent communication context
  lastCommunication?: {
    type: ChannelType;
    time: string; // ISO 8601
    topic: string;
    shortTopic: string; // 1-2 words for compact display
  };
  
  createdAt: string;
  updatedAt: string;
}
```

### 2.3. Team Entity
```typescript
interface Team {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'archived';
  isAssignable: boolean; // Can work be assigned to this team?
  memberCount: number;
  boardCount: number;
  createdAt: string;
  updatedAt: string;
}
```

### 2.4. Action Plan Entity
**Cardinality**: One active action plan per customer maximum.

```typescript
interface ActionPlan {
  id: string;
  customerId: string;
  assigneeTeamId?: string | null; // Team responsible for execution
  badge: BadgeType;
  whatToDo: string; // AI-generated executive summary
  whyStrategy: string; // AI-generated strategic rationale
  status: ActionPlanStatusType;
  actionItems: ActionItem[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  canceledAt?: string | null;
}
```

### 2.5. Action Item Entities (Polymorphic)
**Design Philosophy**: Each action item type has its own data shape optimized for its use case.

```typescript
// Base action item (discriminated union)
type ActionItem = EmailActionItem | CallActionItem | TextActionItem | CreateCardActionItem;

// Common fields for all action items
interface BaseActionItem {
  id: string;
  status: 'pending' | 'completed';
  title: string;
  description: string;
  dueDate?: string | null;
  completedAt?: string | null;
  
  // Scheduling metadata (makes this a "reminder")
  reminderDate?: string | null; // ISO 8601 - when to surface this action
  autoExecute?: boolean; // If true, attempt auto-execution at reminderDate (email only)
}

// Email action item
interface EmailActionItem extends BaseActionItem {
  type: 'email';
  emailData: {
    to: string; // Email address or "customer"
    subject?: string; // AI-suggested subject
    draftBody?: string; // AI-generated draft
    cc?: string[];
    attachments?: string[];
  };
}

// Call action item
interface CallActionItem extends BaseActionItem {
  type: 'call';
  callData: {
    phoneNumber: string; // Phone number or "customer"
    duration?: number; // Expected duration in minutes
    talkingPoints?: string[]; // AI-suggested talking points
    scheduledTime?: string; // ISO 8601 - if scheduled
  };
}

// Text/SMS action item
interface TextActionItem extends BaseActionItem {
  type: 'text';
  textData: {
    phoneNumber: string; // Phone number or "customer"
    draftMessage?: string; // AI-suggested message
  };
}

// Create card action item (replaces old 'task' type)
interface CreateCardActionItem extends BaseActionItem {
  type: 'create-card';
  cardData: {
    boardId?: string; // Target board (optional, can be selected later)
    cardType: 'lead' | 'case' | 'deal' | 'task' | 'custom';
    suggestedTitle?: string;
    suggestedDescription?: string;
    assigneeTeamId?: string; // Suggested team assignment
    priority?: PriorityType;
  };
}
```

### 2.6. Reminder Concept
**Design Philosophy**: A reminder IS an action item with a `reminderDate` set.

**How It Works**:
- Any action item (email/call/text/create-card) can have a `reminderDate`
- When `reminderDate` is set, the action item appears in `/reminders` view
- The `/reminders` page shows all action items where `reminderDate` is set and status is 'pending'
- Action items can exist in:
  1. **Action Plans**: Part of a customer's action plan
  2. **Standalone**: Created directly from `/reminders` page (not part of any plan)

**Auto-Execution** (Email only):
- If `autoExecute: true` on an EmailActionItem, the system attempts to send the email automatically at `reminderDate`
- Requires email draft to be complete (to, subject, body)
- User can review and edit before enabling auto-execute
- Other action types (call/text/create-card) cannot be auto-executed

**Example**:
```typescript
// Email action item with reminder (can auto-execute)
{
  id: 'action-1',
  type: 'email',
  title: 'Send renewal reminder to John',
  description: 'Follow up on contract renewal',
  status: 'pending',
  reminderDate: '2024-03-20T09:00:00Z',
  autoExecute: true,
  emailData: {
    to: 'john@company.com',
    subject: 'Contract Renewal - Action Required',
    draftBody: 'Hi John,\n\nJust following up...'
  }
}

// Call action item with reminder (manual execution only)
{
  id: 'action-2',
  type: 'call',
  title: 'Call Sarah about billing',
  description: 'Discuss Q1 invoice discrepancy',
  status: 'pending',
  reminderDate: '2024-03-20T14:00:00Z',
  callData: {
    phoneNumber: '+1-555-0199',
    talkingPoints: ['Q1 invoice', 'Payment terms', 'Discount discussion']
  }
}
```

### 2.6. Board & Card Entities
```typescript
interface Board {
  id: string;
  name: string;
  description?: string;
  visibility: 'org' | 'team';
  cardType: 'lead' | 'case' | 'deal' | 'task' | 'custom';
  defaultTeamId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BoardColumn {
  id: string;
  boardId: string;
  name: string;
  position: number;
  wipLimit?: number | null; // Work-in-progress limit
}

interface BoardCard {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  status: 'active' | 'archived';
  assigneeUserId?: string | null;
  assigneeTeamId?: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

interface BoardPermission {
  id: string;
  boardId: string;
  teamId: string;
  mode: 'edit' | 'view';
}
```

### 2.7. Conversation Entity
```typescript
interface Conversation {
  id: string;
  customerId: string;
  channel: ChannelType;
  date: string; // ISO 8601
  duration?: number; // minutes (for calls/video)
  messageCount?: number; // for email/SMS threads
  transcript: string;
  summary?: string; // AI-generated
  sentiment?: SentimentType; // AI-analyzed
  intent?: string; // AI-detected customer intent
  messages: Message[];
  insights?: string[]; // AI-generated insights
  coachingSuggestions?: string[]; // AI-generated coaching tips
}

interface Message {
  role: 'assistant' | 'customer' | 'agent';
  content: string;
  timestamp: string;
}
```

### 2.8. Notification Entity
```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'card_assigned' | 'action_plan_assigned' | 'reminder_due' | 'mention';
  title: string;
  message: string;
  link?: string; // Deep link to relevant page
  read: boolean;
  createdAt: string;
}
```

---

## 3. Feature Specifications

### 3.1. Application Shell

#### Sidebar Navigation
- **State**: Collapsed by default (icon-only), expands on hover/click
- **Persistence**: Collapse state saved to localStorage
- **Navigation Items**:
  - Dashboard (`/`)
  - Triage (`/triage`)
  - History (`/history`)
  - Boards (`/boards`)
  - Reminders (`/reminders`)
  - Import Data (`/import-data`) - Admin/Developer only
  - Settings (`/settings`)
- **Contextual Breadcrumbs**: 
  - Appear right of sidebar ONLY on `/triage/customers/*` routes
  - Format: `Customer Name > Action Plan` or `Customer Name > Conversation Date`
- **Branding**: Sparkle icon + "ACTIONPLANIT" wordmark (visible when expanded)

#### Header Bar
- **Today's Progress Widget**:
  - Animated progress bar
  - Metric: "X / Y resolved" (team-wide, not individual)
  - Flyout on hover showing details
- **Notifications Bell**:
  - Badge with unread count
  - Dropdown list of recent notifications
  - Click notification → navigate to deep link
- **User Menu**:
  - Avatar with dropdown
  - Theme toggle (Light/Dark)
  - Demo Mode toggle (Phase 1 only)
  - Sign Out

#### AI Agent Sidebar (Contextual)
- **Visibility Rule**: ONLY appears on `/triage/customers/:id/*` routes
- **Features**:
  - Multiple chat threads per customer
  - Collapsible panel (state persisted)
  - Context header: "Focused on [Customer Name]"
  - Empty state with CTA to start chat

### 3.2. Dashboard (Home)

**Layout**: Grid with 4 primary widgets

1. **Welcome Stats** (3 cards)
   - Customers Analyzed (last 24h)
   - Action Plans Created (last 24h)
   - Urgent Action Plans (active)

2. **Customer Triage Preview**
   - Top 3 highest-priority customers
   - "View All" link to `/triage`
   - Columns: Customer, Badge, Last Contact, AI Recommendation

3. **Upcoming Reminders**
   - Next 5 upcoming reminders
   - Shows: Icon, Title, Customer, Relative Time
   - Click → navigate to `/reminders`

4. **Your Assigned Cards**
   - 5 most recently updated cards assigned to current user
   - Shows: Card ID, Title, Board Name
   - Click → navigate to board

**Critical**: NO "Recent Activity" feed, NO "Mini Calendar"

### 3.3. Triage Leaderboard

**Purpose**: Prioritized list of customers requiring attention

**Features**:
- Default sort: Risk Score DESC, then Opportunity Score DESC
- Filter by Badge type
- Search by name/company
- Columns:
  - Customer (Avatar, Name, Company)
  - Badge (visual indicator)
  - Risk/Opportunity Scores (progress rings)
  - Last Communication (type + relative time)
  - AI Recommendation (truncated)
- Click row → `/triage/customers/:id`

### 3.4. Customer Overview (360° View)

**Layout**: 3-column grid

**Left Column**: Customer Profile
- Contact information
- Risk/Opportunity scores
- Aggregate stats

**Center Column**: Action Plan
- Prominent card with badge
- "What to Do" (AI summary)
- "Why This Strategy" (AI rationale)
- Action items with checkboxes
- "Generate New Plan" button (AI refresh)

**Right Column**: Recent History
- Timeline of last 3-5 conversations
- Date, channel, summary
- Click → conversation transcript

### 3.5. Action Plan Detail Page

**Route**: `/triage/customers/:id/action-plans/:planId`

**Sections**:
1. **Header**: Customer context, badge, status
2. **Strategy**: Full "Why this strategy?" explanation
3. **Action Items List**: 
   - Each item shows type-specific details:
     - **Email**: Subject line, draft preview, recipient
     - **Call**: Phone number, talking points, suggested duration
     - **Text**: Draft message preview
     - **Create Card**: Card type, suggested board, priority
   - Status toggles
   - **Execute buttons** (type-specific):
     - Email: "Draft Email" → modal with AI-generated email (subject, body, to/cc)
     - Call: "Start Call" → opens dialer with talking points sidebar
     - Text: "Draft Text" → modal with AI-generated SMS
     - Create Card: "Create Card" → opens board card creation with pre-filled data
   - **Set Reminder**: Add reminder scheduling to any action item
4. **Context**: Related conversations, customer history

**Enhancement**: Action items should be hyper-specific with rich context (e.g., Email action with subject "Re: March 15th billing overcharge" and draft referencing specific complaint)

### 3.6. Conversation History & Transcript

**History View** (`/triage/customers/:id/conversations`):
- Vertical timeline
- Filter by channel
- Each item: Date, channel icon, summary

**Transcript View** (`/triage/customers/:id/conversations/:convId`):
- **Main Area**: Chat-style transcript
  - Distinct styling for assistant/customer/agent
  - Timestamps
- **Right Sidebar**: AI Analysis
  - Sentiment badge
  - Key insights (bullet list)
  - Coaching suggestions

### 3.7. Customer Directory

**Route**: `/customers` (new feature)

**Purpose**: Browse and manage all customers

**Features**:
- Searchable table (name, company)
- Filter by badge, company
- Add Customer button → modal form
- Edit Customer → inline or modal
- Columns: Name, Company, Badge, Last Contact, Actions

### 3.8. Action Items & Reminders

**Core Concept**: Reminders are scheduling metadata on action items, not separate entities.

#### Action Item Execution Patterns

**Email Action Items**:
- Display: Subject line, recipient, draft preview
- Execute: Opens modal with full AI-generated email
- Can set reminder: "Remind me to send this email tomorrow at 9am"

**Call Action Items**:
- Display: Phone number, expected duration, talking points
- Execute: Opens dialer (Phase 2) or shows talking points
- Can set reminder: "Remind me to call at 2pm today"

**Text Action Items**:
- Display: Phone number, draft message preview
- Execute: Opens SMS composer with draft
- Can set reminder: "Remind me to text in 1 hour"

**Create Card Action Items**:
- Display: Card type, suggested board, priority, draft title/description
- Execute: Opens board card creation modal with pre-filled data
- Can set reminder: "Remind me to create this case tomorrow"

#### Reminders View

**Route**: `/reminders`

**Purpose**: Unified view of all action items with active reminders

**Features**:
- **List View**: Shows action items that have `reminder` set
  - Icon based on action item type (email/call/text/create-card)
  - Title, Customer, Description
  - Reminder date/time
  - Overdue badge (red) for past-due reminders
- **Filters**: 
  - Status: Pending / Sent / Dismissed
  - Type: Email / Call / Text / Create Card
  - Customer
- **Actions**:
  - **Execute**: Performs the action item (opens email draft, dialer, etc.)
  - **Snooze**: Reschedule reminder
  - **Dismiss**: Remove reminder (action item remains in plan)
  - **Complete**: Mark action item as completed

**User Flow Example**:
1. User views action plan for Customer A
2. Action item: "Email John about renewal" (EmailActionItem)
3. User clicks "Set Reminder" → picks tomorrow 9am
4. Tomorrow at 9am, item appears in `/reminders` with "Overdue" or "Due Now" badge
5. User clicks "Execute" → email draft modal opens
6. User sends email → action item marked complete, reminder auto-dismissed

### 3.9. Boards (Kanban Workspace)

**Route**: `/boards` or `/boards/:boardId`

**Layout**:
- **Left Sidebar**: Board directory (user's accessible boards)
- **Main Area**: Kanban board with columns

**Features**:
- Drag-and-drop cards between columns
- Card assignment (user or team)
- WIP limits per column (visual warning when exceeded)
- Board types: Leads, Cases, Deals, Tasks, Custom
- Visibility: Org-wide or team-specific
- Permissions: Teams have Edit or View access

**Card Interaction**:
- Click card → detail modal
- Edit title, description
- Assign to user/team
- Archive card
- When assigned → notification sent + appears in dashboard widget

### 3.10. Settings

**Route**: `/settings`

**Tab Structure** (role-based visibility):

#### General Tab (All Users)
- Theme toggle (Light/Dark)
- Language preference (future)
- Notification preferences (future)

#### Users Tab (Admin Only)
- Table: Name, Email, Role, Joined Date
- Add user (future - requires backend)
- Change role (Admin/Developer/Member)
- Remove user

#### Teams Tab (Admin Only)
- **List View**: Name, Description, Status, Members, Boards
- **Create Team**: Name, description
- **Expandable Detail**:
  - Manage members (add/remove)
  - Toggle status (Active/Archived)
  - Toggle assignability
  - View linked boards with permissions

#### Boards Tab (Admin Only)
- **List View**: Name, Visibility, Card Type, Default Team
- **Create Board**: Name, description, visibility, card type, default team
- **Expandable Detail**:
  - **Columns**: Add, reorder, rename, set WIP limit, delete
  - **Team Permissions**: Grant Edit/View access to teams
  - **Visibility**:
    - Org: Everyone can see
    - Team: Only specified teams (via permissions)

#### Routing Tab (Admin Only)
- Configure lead routing rules (future spec)

#### API Keys Tab (Developer/Admin Only)
- Manage API keys for integrations

### 3.11. Notifications System

**Notification Types**:
1. **Card Assigned**: "Card #ABC123 assigned to you on [Board Name]"
2. **Action Plan Assigned**: "New action plan for [Customer Name]" (future)
3. **Reminder Due**: "[Reminder Title] is due in 1 hour"
4. **Mention**: "@mentioned in [Context]" (future)

**UI Elements**:
- Bell icon in header
- Badge with unread count
- Dropdown panel with recent notifications
- Click notification → navigate to deep link
- Mark as read (auto on click)

### 3.12. Today's Progress Widget

**Purpose**: Track team-wide action plan execution

**Calculation**:
- **X (Resolved)**: Action plans completed TODAY by ANY member of user's team(s)
- **Y (Total)**: ALL active action plans assigned to user's team(s)
- **Multi-Team**: If user belongs to multiple teams, aggregate across all

**Visual**:
- Animated progress bar
- Flyout on hover: "Today's Progress: X / Y resolved"
- Smooth animation on value changes

**Critical**: This is TEAM performance, NOT individual

---

## 4. User Roles & Permissions

| Feature | Member | Developer | Admin |
|---------|--------|-----------|-------|
| Dashboard | ✓ | ✓ | ✓ |
| Triage | ✓ | ✓ | ✓ |
| Customer Management | ✓ | ✓ | ✓ |
| Boards (View) | ✓ | ✓ | ✓ |
| Boards (Edit) | Team-based | Team-based | ✓ |
| Reminders | ✓ | ✓ | ✓ |
| Settings: General | ✓ | ✓ | ✓ |
| Settings: API Keys | ✗ | ✓ | ✓ |
| Settings: Users | ✗ | ✗ | ✓ |
| Settings: Teams | ✗ | ✗ | ✓ |
| Settings: Boards | ✗ | ✗ | ✓ |
| Settings: Routing | ✗ | ✗ | ✓ |
| Import Data | ✗ | ✓ | ✓ |

---

## 5. Technical Specifications

### 5.1. Technology Stack
- **Framework**: React 18+ with Vite
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS for rapid development and consistency
- **State Management**: Zustand with localStorage persistence
- **Routing**: React Router v6
- **Icons**: Phosphor Icons or Lucide React
- **Date Handling**: date-fns

### 5.2. State Management Architecture
**Stores** (Zustand):
- `useCustomersStore`
- `useActionPlansStore`
- `useConversationsStore`
- `useRemindersStore`
- `useBoardsStore`
- `useTeamsStore`
- `useNotificationsStore`
- `useAuthStore`

**Persistence**: All stores sync to localStorage for Phase 1

### 5.3. Routing Structure
```
/ → Dashboard
/signin → Sign In (Phase 1: mock)
/triage → Triage Leaderboard
/triage/customers/:id → Customer Overview
/triage/customers/:id/conversations → Conversation History
/triage/customers/:id/conversations/:convId → Transcript
/triage/customers/:id/action-plans/:planId → Action Plan Detail
/customers → Customer Directory
/history → Global History
/boards → Boards (redirects to first board)
/boards/:boardId → Specific Board
/reminders → Reminders
/settings → Settings (General tab)
/settings?tab=teams → Settings (Teams tab)
/import-data → Import Tool
```

### 5.4. Mock Data Requirements
- **Customers**: 15-20 with varied risk/opportunity scores
- **Teams**: 3-4 (e.g., "Customer Support", "Sales", "Technical Support", "Account Management")
- **Boards**: 2-3 with 3-5 columns each
- **Reminders**: 8-12 (mix of upcoming, today, overdue)
- **Conversations**: 3-7 per customer
- **Action Plans**: 1 per customer (some completed, some active)
- **Notifications**: 3-5 unread

---

## 6. UI/UX Principles

### 6.1. Design Aesthetic
- **Premium Enterprise**: Clean, professional, confidence-inspiring
- **Glassmorphism**: Subtle transparency and blur effects on cards
- **Color Palette**: 
  - Primary: Professional blue
  - Risk: Red/Orange gradient
  - Opportunity: Green/Teal gradient
  - Neutral: Grays with high contrast
- **Typography**: Modern sans-serif (Inter, Roboto, or similar)
- **Spacing**: Generous whitespace, 8px grid system

### 6.2. Interaction Patterns
- **Smooth Transitions**: 200-300ms ease-in-out
- **Hover States**: Subtle elevation and color shifts
- **Loading States**: Skeleton screens, not spinners
- **Empty States**: Helpful CTAs and illustrations
- **Error States**: Clear, actionable error messages

### 6.3. Responsive Behavior
- **Desktop-First**: Optimized for 1440px+ screens
- **Tablet**: Collapsible sidebars, stacked layouts
- **Mobile**: (Future scope for Phase 2)

---

## 7. Success Metrics (Phase 1)

**Usability**:
- Users can complete triage workflow in < 30 seconds
- Zero confusion on navigation (measured via user testing)
- 100% feature discoverability without documentation

**Technical**:
- Page load < 1 second
- Interaction response < 100ms
- Zero console errors
- Lighthouse score > 90

**Data Integrity**:
- All mock data conforms to interfaces
- localStorage persistence works across sessions
- No data loss on page refresh

---

## 8. Out of Scope (Phase 1)

- Real backend/database
- Authentication (Google OAuth)
- Real-time updates (WebSockets)
- Email/SMS sending
- Calendar integrations
- Mobile responsive design
- Accessibility audit (WCAG 2.1)
- Internationalization
- Advanced analytics
- Export/reporting features
