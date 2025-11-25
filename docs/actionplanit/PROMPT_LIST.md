# ActionPlanIt: Google AI Studio Prompt Sequence

## Overview

This document contains a carefully sequenced series of prompts designed to build **ActionPlanIt** using Google AI Studio (or similar AI coding assistants). Each prompt builds upon the previous, creating a production-quality application incrementally.

**Strategy**: Start with core infrastructure and data, then layer features progressively. Each prompt should result in a working, testable increment.

---

## Prompt 1: Foundation & Core Triage

**Goal**: Establish project structure, data layer, and the primary triage workflow.

**Estimated Completion**: 20-30 minutes

### Prompt Text:

```markdown
I need you to build a customer triage and action planning application called **ActionPlanIt**. This is a React + TypeScript + Vite application with a premium, modern UI.

### 1. Project Setup
Initialize a new Vite + React + TypeScript project with the following:
- Tailwind CSS for styling
- React Router v6 for routing
- Zustand for state management
- Phosphor Icons for iconography
- date-fns for date handling

Configure Tailwind with a professional color palette:
- Primary: Blue (#3B82F6)
- Risk: Red-Orange gradient
- Opportunity: Green-Teal gradient
- Neutral grays with good contrast

### 2. Data Layer
Create separate Zustand stores in a `src/store` directory:
- `useCustomersStore.ts`
- `useActionPlansStore.ts`
- `useConversationsStore.ts`
- `useRemindersStore.ts`
- `useBoardsStore.ts`
- `useTeamsStore.ts`
- `useNotificationsStore.ts`
- `useAuthStore.ts`

Use these EXACT TypeScript interfaces (critical for future API compatibility):

```typescript
type BadgeType = 'at-risk' | 'opportunity' | 'lead' | 'follow-up' | 'no-action';
type ChannelType = 'phone' | 'video' | 'email' | 'chat' | 'sms' | 'ai-call' | 'voice-message';
type SentimentType = 'positive' | 'neutral' | 'negative' | 'mixed';
type ActionPlanStatusType = 'active' | 'completed' | 'canceled';

interface Customer {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  avatar: string;
  riskScore: number; // 0-100
  opportunityScore: number; // 0-100
  totalConversations: number;
  totalTasks: number;
  totalActionPlans: number;
  lastCommunication?: {
    type: ChannelType;
    time: string;
    topic: string;
    shortTopic: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ActionPlan {
  id: string;
  customerId: string;
  assigneeTeamId?: string | null;
  badge: BadgeType;
  whatToDo: string;
  whyStrategy: string;
  status: ActionPlanStatusType;
  actionItems: ActionItem[];
  createdAt: string;
  updatedAt: string;
}

// Polymorphic Action Items - each type has its own data shape
type ActionItem = EmailActionItem | CallActionItem | TextActionItem | CreateCardActionItem;

interface BaseActionItem {
  id: string;
  status: 'pending' | 'completed';
  title: string;
  description: string;
  dueDate?: string | null;
  completedAt?: string | null;
  reminder?: {
    reminderDate: string;
    reminderStatus: 'pending' | 'sent' | 'dismissed';
  };
}

interface EmailActionItem extends BaseActionItem {
  type: 'email';
  emailData: {
    to: string;
    subject?: string;
    draftBody?: string;
    cc?: string[];
  };
}

interface CallActionItem extends BaseActionItem {
  type: 'call';
  callData: {
    phoneNumber: string;
    duration?: number;
    talkingPoints?: string[];
    scheduledTime?: string;
  };
}

interface TextActionItem extends BaseActionItem {
  type: 'text';
  textData: {
    phoneNumber: string;
    draftMessage?: string;
  };
}

interface CreateCardActionItem extends BaseActionItem {
  type: 'create-card';
  cardData: {
    boardId?: string;
    cardType: 'lead' | 'case' | 'deal' | 'task' | 'custom';
    suggestedTitle?: string;
    suggestedDescription?: string;
    assigneeTeamId?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  };
}

interface Team {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'archived';
  isAssignable: boolean;
  memberCount: number;
  boardCount: number;
  createdAt: string;
  updatedAt: string;
}
```

**Mock Data Requirements**:
- Generate 15-20 customers with realistic names and companies
- 5 should be 'at-risk' (riskScore > 70)
- 5 should be 'opportunity' (opportunityScore > 70)
- Each customer has 1 action plan with 3-5 specific action items
- Generate 3 teams: "Customer Support", "Sales", "Technical Support"
- Ensure all dates are ISO 8601 format

### 3. Application Shell
Create a layout with:

**Sidebar** (left, collapsible):
- Logo: Sparkle icon + "ACTIONPLANIT" wordmark
- Navigation: Dashboard, Triage, History, Boards, Reminders, Settings
- Collapsed by default, expands on hover
- Persist state to localStorage
- **Contextual Breadcrumbs**: Show to the right of sidebar ONLY on `/triage/customers/*` routes

**Header** (top):
- **Today's Progress**: Progress bar showing "X / Y resolved" (we'll implement calculation later)
- **Notifications**: Bell icon with badge (placeholder for now)
- **User Menu**: Avatar dropdown with Theme Toggle and Sign Out

**AI Agent Sidebar** (right, contextual):
- ONLY visible on `/triage/customers/:id/*` routes
- Collapsible panel
- Header: "Focused on [Customer Name]"
- Chat interface (placeholder for now)

### 4. Triage Leaderboard (Home Page)
Route: `/triage`

Display a table/list of customers with:
- Avatar, Name, Company
- Badge (color-coded chip)
- Risk/Opportunity scores (visual indicators like progress rings)
- Last communication (icon + relative time)
- AI Recommendation (truncated from action plan)

**Sorting**: Default to Risk Score DESC, then Opportunity Score DESC
**Interaction**: Click row → navigate to `/triage/customers/:id`

### 5. Deliverables
Provide complete, production-ready code with:
- Clean component structure
- Proper TypeScript types
- Tailwind styling (premium aesthetic)
- Working navigation
- Mock data loaded into stores
```

---

## Prompt 2: Customer Deep Dive & Action Plans

**Goal**: Build the detailed customer view and interactive action planning.

### Prompt Text:

```markdown
Great work! Now let's build the **Customer Overview** and **Action Plan** features.

### 1. Customer Overview Page
Route: `/triage/customers/:id`

**Layout**: 3-column grid

**Left Column**: Customer Profile Card
- Avatar, Name, Company
- Contact info (email, phone)
- Risk/Opportunity scores with visual indicators
- Stats: Total Conversations, Tasks, Action Plans

**Center Column**: Action Plan Card (prominent)
- Badge at top
- "What to Do" section (AI summary)
- "Why This Strategy" section (AI rationale)
- Action Items list with:
  - Checkboxes (toggle completion)
  - Type icon (email/call/task/text)
  - Title and description
- "Generate New Plan" button (simulates AI refresh with new mock data)

**Right Column**: Recent History
- Timeline of last 3-5 conversations
- Each item: Date, channel icon, topic summary
- Click → navigate to conversation transcript

### 2. Action Plan Interactivity
When user checks an action item:
- Update Zustand store immediately
- Persist to localStorage
- Update "Today's Progress" in header (we'll refine calculation in Prompt 6)

### 3. Breadcrumbs
Ensure sidebar breadcrumbs update to show: `[Customer Name] > Action Plan`

### 4. AI Agent Sidebar
Verify the AI Agent Sidebar appears on this page with customer context.

### 5. Polish
- Use glassmorphism effects on cards (subtle transparency, blur)
- Smooth transitions on checkbox toggles
- Hover effects on action items
```

---

## Prompt 3: Conversation Intelligence

**Goal**: Implement conversation history and AI-powered transcript analysis.

### Prompt Text:

```markdown
Now let's add **Conversation History** and **Transcript** views.

### 1. Conversation Data Structure
Add to your stores:

```typescript
interface Conversation {
  id: string;
  customerId: string;
  channel: ChannelType;
  date: string;
  duration?: number;
  messageCount?: number;
  transcript: string;
  summary?: string;
  sentiment?: SentimentType;
  intent?: string;
  messages: Message[];
  insights?: string[];
  coachingSuggestions?: string[];
}

interface Message {
  role: 'assistant' | 'customer' | 'agent';
  content: string;
  timestamp: string;
}
```

Generate 3-7 conversations per customer with realistic transcripts.

### 2. Conversation History Page
Route: `/triage/customers/:id/conversations`

- Vertical timeline view
- Each item: Date, channel icon, summary, sentiment badge
- Filter by channel (dropdown)
- Click item → navigate to transcript

### 3. Transcript Page
Route: `/triage/customers/:id/conversations/:convId`

**Main Area**: Chat-style transcript
- Messages styled differently by role (assistant/customer/agent)
- Timestamps
- Scrollable

**Right Sidebar**: AI Analysis
- Sentiment badge (large, color-coded)
- "Key Insights" section (bullet list)
- "Coaching Suggestions" section (bullet list)

### 4. Breadcrumbs
Update to show: `[Customer Name] > [Conversation Date]`

### 5. AI Agent Sidebar
Ensure it's still visible and contextual to the customer.
```

---

## Prompt 4: Customer Management & Settings

**Goal**: Add CRUD for customers and comprehensive settings.

### Prompt Text:

```markdown
Let's add **Customer Management** and **Settings**.

### 1. Customer Directory
Route: `/customers`

- Searchable, filterable table of ALL customers
- Search bar (filters by name or company)
- Badge filter dropdown
- Columns: Avatar, Name, Company, Badge, Last Contact, Actions
- "Add Customer" button → modal form
- Edit icon per row → modal form

**Add/Edit Form**:
- Fields: Name, Company, Email, Phone
- On save: Create/update in Zustand store, persist to localStorage

### 2. Settings Page
Route: `/settings`

Use tabs with role-based visibility:

**General Tab** (all users):
- Theme toggle (Light/Dark mode)
- Persist theme to localStorage

**Users Tab** (admin only):
- Table: Name, Email, Role, Joined Date
- Change role dropdown (Admin/Developer/Member)
- Remove user button
- Mock current user as 'admin'

**Teams Tab** (admin only):
- Table: Name, Description, Status, Members, Boards
- "Create Team" button → form (name, description)
- Expandable row for each team:
  - Members list with add/remove
  - Toggle status (Active/Archived)
  - Toggle assignability
  - Linked boards list

**Boards Tab** (admin only):
- Table: Name, Visibility, Card Type, Default Team
- "Create Board" button → form
- Expandable row:
  - Manage columns (add, reorder, rename, set WIP limit, delete)
  - Team permissions (grant Edit/View access)

**API Keys Tab** (developer/admin only):
- Placeholder: "API Keys will be available in Phase 2"

### 3. Role-Based Access
Implement `useAuthStore` with mock user:
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'developer' | 'member';
}
```

Hide tabs based on role. Redirect unauthorized users to General tab.

### 4. Persistence
All customer, team, and board changes must persist to localStorage.
```

---

## Prompt 5: Team Collaboration (Boards & Reminders)

**Goal**: Implement Kanban boards, reminders, and notifications.

### Prompt Text:

```markdown
Now we're adding **Boards**, **Reminders**, and **Notifications**.

### 1. Data Structures
Add these interfaces:

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
  wipLimit?: number | null;
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

interface Reminder {
  id: string;
  customerId: string;
  actionItemId?: string | null;
  type: 'email' | 'call' | 'text' | 'task';
  title: string;
  description?: string;
  reminderDate: string;
  status: 'pending' | 'completed' | 'dismissed';
  createdAt: string;
  updatedAt: string;
}

interface Notification {
  id: string;
  userId: string;
  type: 'card_assigned' | 'action_plan_assigned' | 'reminder_due' | 'mention';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
```

Generate mock data:
- 2 boards with 3-4 columns each
- 10-15 cards across boards
- 8-12 reminders (mix of upcoming, today, overdue)
- 3-5 notifications

### 2. Boards Page
Route: `/boards/:boardId`

**Layout**:
- Left sidebar: Board directory (list of boards)
- Main area: Kanban board

**Kanban Board**:
- Columns with cards
- Drag-and-drop cards between columns (use a library like dnd-kit or react-beautiful-dnd)
- Click card → detail modal (edit title, description, assign user/team, archive)
- WIP limit indicator (visual warning if exceeded)

**Board Directory**:
- Click board → navigate to `/boards/:boardId`
- Auto-select first board on `/boards`

### 3. Reminders Page
Route: `/reminders`

- Filters: Status, Type, Customer
- List view: Icon, Title, Customer, Description, Due Date, Status
- Overdue badge (red) for pending reminders past due
- Actions: Complete, Dismiss, Edit, Delete
- "Create Reminder" button → form (title, description, type, customer, due date, optional actionItemId)

### 4. Dashboard Updates
Update Dashboard (`/`) to replace old widgets:

**Remove**: "Recent Activity"

**Add**:
- **Upcoming Reminders**: Next 5 reminders
- **Your Assigned Cards**: 5 most recent cards assigned to current user

### 5. Notifications
- Bell icon in header with badge (unread count)
- Dropdown panel with notifications list
- Click notification → navigate to link
- Mark as read on click
- Generate notification when card is assigned to user

### 6. Card Assignment Flow
When a card is assigned to a user:
1. Create notification
2. Add card to user's "Your Assigned Cards" dashboard widget
3. Persist to localStorage
```

---

## Prompt 6: Team Progress & Final Polish

**Goal**: Implement team-wide progress tracking and final refinements.

### Prompt Text:

```markdown
Final step: **Team Progress Tracker** and polish.

### 1. Today's Progress Widget (Header)
Update the progress bar to calculate team-wide metrics:

**Logic**:
1. Get current user's teams from `useAuthStore`
2. Find all action plans where `assigneeTeamId` matches user's team(s)
3. Count completed action plans TODAY (check `completedAt` date)
4. Count total active action plans for those teams
5. Calculate: X / Y resolved

**Display**:
- Animated progress bar (smooth transitions)
- Flyout on hover: "Today's Progress: X / Y resolved"
- If 100% complete: Show "Complete" badge with star icon

**Critical**: This is TEAM performance, not individual.

### 2. Action Plan Assignment
Add `assigneeTeamId` field to action plans in mock data.
Ensure some action plans are assigned to different teams.

### 3. Polish Pass
- **Loading States**: Add skeleton screens for data fetching
- **Empty States**: Add helpful empty states with CTAs
- **Error Handling**: Add error boundaries
- **Animations**: Ensure smooth transitions throughout
- **Accessibility**: Add proper ARIA labels
- **Responsive**: Ensure layout works on tablet (1024px+)

### 4. Demo Mode Toggle
In header user menu, add "Demo Mode" toggle that:
- Shows a banner when active
- Could be used to switch between mock and real data (Phase 2)

### 5. Final Checklist
- [ ] All routes work correctly
- [ ] All stores persist to localStorage
- [ ] Theme toggle works
- [ ] Breadcrumbs update correctly
- [ ] AI Agent Sidebar appears only on customer routes
- [ ] Notifications system works
- [ ] Drag-and-drop on boards works
- [ ] Team progress calculates correctly
- [ ] No console errors
- [ ] Premium aesthetic throughout

### 6. Documentation
Create a README.md with:
- Project overview
- Setup instructions
- Available scripts
- Technology stack
- Project structure
```

---

## Usage Notes

1. **Sequential Execution**: Run prompts in order. Each builds on the previous.
2. **Iteration**: If AI misses requirements, provide specific feedback and re-run that section.
3. **Testing**: Test thoroughly after each prompt before proceeding.
4. **Customization**: Adjust mock data quantities and specifics to your needs.
5. **AI Model**: Works best with Claude 3.5 Sonnet, GPT-4, or Google Gemini 1.5 Pro.

## Expected Timeline

- Prompt 1: 20-30 min
- Prompt 2: 15-20 min
- Prompt 3: 15-20 min
- Prompt 4: 20-25 min
- Prompt 5: 25-35 min
- Prompt 6: 15-20 min

**Total**: ~2-2.5 hours for complete implementation
