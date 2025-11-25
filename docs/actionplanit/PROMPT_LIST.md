# ActionPlanIt: Google AI Studio Prompt Sequence

## Overview

This document contains a carefully sequenced series of prompts designed to build **ActionPlanIt** using Google AI Studio. The first prompt is comprehensive and designed to generate a substantial, working application. Subsequent prompts add advanced features incrementally.

**Strategy**: Maximize the initial generation with a detailed first prompt, then layer complexity progressively.

---

## Prompt 1: Complete Foundation with Core Features

**Goal**: Generate a fully functional application with triage, customer overview, action plans, dark mode, and user switching.

**Estimated Completion**: 45-60 minutes

### Prompt Text:

```markdown
I need you to build **ActionPlanIt** - a premium AI-powered customer triage and action planning application. This is a React + TypeScript + Vite application with a sophisticated, modern UI inspired by https://www.craft.do/

## Design Inspiration

Study https://www.craft.do/ for design inspiration. Key elements to emulate:
- **Clean, premium aesthetic** with generous whitespace
- **Subtle animations** and smooth transitions
- **Glassmorphism** effects on cards (subtle transparency and blur)
- **Professional typography** with clear hierarchy
- **Thoughtful color usage** - not overwhelming, purposeful accents
- **Dark mode** that feels native, not like an afterthought

## 1. Project Setup

Initialize a new Vite + React + TypeScript project:

```bash
npm create vite@latest actionplanit -- --template react-ts
cd actionplanit
npm install
npm install tailwind css postcss autoprefixer
npm install react-router-dom zustand date-fns
npm install @phosphor-icons/react
npx tailwindcss init -p
```

### Tailwind Configuration

Configure `tailwind.config.js`:

```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          dark: '#60A5FA',
        },
        risk: {
          DEFAULT: '#EF4444',
          dark: '#F87171',
        },
        opportunity: {
          DEFAULT: '#10B981',
          dark: '#34D399',
        },
        action: {
          DEFAULT: '#8B5CF6',
          hover: '#7C3AED',
          dark: '#A78BFA',
        },
      },
    },
  },
  plugins: [],
}
```

### CSS Variables for Dark Mode

Create `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Light mode */
  --color-primary: #3B82F6;
  --color-primary-hover: #2563EB;
  
  --color-risk: #EF4444;
  --color-risk-gradient: linear-gradient(135deg, #EF4444, #F97316);
  
  --color-opportunity: #10B981;
  --color-opportunity-gradient: linear-gradient(135deg, #10B981, #14B8A6);
  
  --color-action-item: #8B5CF6;
  --color-action-item-hover: #7C3AED;
  
  --color-background: #FFFFFF;
  --color-surface: #F9FAFB;
  --color-surface-elevated: #FFFFFF;
  
  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-text-tertiary: #9CA3AF;
  
  --color-border: #E5E7EB;
  --color-border-hover: #D1D5DB;
  
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.dark {
  /* Dark mode */
  --color-primary: #60A5FA;
  --color-primary-hover: #3B82F6;
  
  --color-risk: #F87171;
  --color-risk-gradient: linear-gradient(135deg, #F87171, #FB923C);
  
  --color-opportunity: #34D399;
  --color-opportunity-gradient: linear-gradient(135deg, #34D399, #2DD4BF);
  
  --color-action-item: #A78BFA;
  --color-action-item-hover: #8B5CF6;
  
  --color-background: #0F172A;
  --color-surface: #1E293B;
  --color-surface-elevated: #334155;
  
  --color-text-primary: #F1F5F9;
  --color-text-secondary: #CBD5E1;
  --color-text-tertiary: #94A3B8;
  
  --color-border: #334155;
  --color-border-hover: #475569;
  
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5);
}

* {
  transition: background-color 200ms ease-in-out, border-color 200ms ease-in-out;
}
```

## 2. Data Layer (Zustand Stores)

Create these stores in `src/store/`:

### `useAuthStore.ts`

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'developer' | 'member';
  teamIds: string[];
}

interface AuthState {
  user: User | null;
  users: User[]; // All mock users for switching
  isAuthenticated: boolean;
  switchUser: (userId: string) => void;
  signOut: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

Generate 8-10 mock users across different teams with varied roles.

### `useCustomersStore.ts`, `useActionPlansStore.ts`, etc.

Use these EXACT TypeScript interfaces:

```typescript
type BadgeType = 'at-risk' | 'opportunity' | 'lead' | 'follow-up' | 'no-action';
type ChannelType = 'phone' | 'video' | 'email' | 'chat' | 'sms' | 'ai-call' | 'voice-message';
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
    time: string; // ISO 8601
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
  whatToDo: string; // AI-generated summary
  whyStrategy: string; // AI-generated rationale
  status: ActionPlanStatusType;
  actionItems: ActionItem[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

// Polymorphic Action Items
type ActionItem = EmailActionItem | CallActionItem | TextActionItem | CreateCardActionItem;

interface BaseActionItem {
  id: string;
  status: 'pending' | 'completed';
  title: string;
  description: string;
  dueDate?: string | null;
  completedAt?: string | null;
  reminderDate?: string | null; // Makes it a "reminder"
  autoExecute?: boolean; // Email only
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
  createdAt: string;
  updatedAt: string;
}
```

### Mock Data Requirements

- **Customers**: 15-20 with realistic names and companies
  - 5 'at-risk' (riskScore > 70)
  - 5 'opportunity' (opportunityScore > 70)
  - ~70% have action plans, ~30% have none
- **Users**: 8-10 across different teams with varied roles
- **Teams**: 3-4 (e.g., "Customer Support", "Sales", "Technical Support")
- **Action Plans**: Each has 3-5 polymorphic action items (mix of email/call/text/create-card)
- **Reminders**: Some action items should have `reminderDate` set (user-specific)
- All dates in ISO 8601 format

## 3. Application Shell

### Sidebar (Left, Collapsible)

- **Logo**: Sparkle icon (⚡) + "ACTIONPLANIT" wordmark
- **Navigation** (top to bottom):
  - Triage (`/triage`)
  - History (`/history`)
  - Boards (`/boards`)
  - Reminders (`/reminders`)
  - Import Data (`/import-data`) - Admin/Dev only
  - *(spacer)*
  - **Notifications** - Bell icon with badge (bottom section)
  - **Settings** (`/settings`) - Gear icon (bottom)
- **Contextual Breadcrumbs**: Appear to right of sidebar ONLY on `/triage/customers/*` routes
- **State**: Collapsed by default, expands on hover, persists to localStorage
- **Styling**: Use glassmorphism effect, subtle backdrop blur

### Header (Top)

- **Today's Progress**: Animated progress bar
  - Hover flyout shows:
    - "Team Progress: X / Y resolved"
    - "Your Progress: X / Y resolved"
  - Calculate from action plans completed today
- **User Avatar**: Dropdown menu with:
  - **User Switcher**: Dropdown to switch between mock users
  - **Theme Toggle**: Light/Dark mode
  - **Sign Out**

### AI Agent Sidebar (Right, Contextual)

- **Visibility**: ONLY on `/triage/customers/:id/*` routes
- **Header**: "Focused on [Customer Name]"
- **Content**: Chat interface placeholder
- **Collapsible**: State persists to localStorage

## 4. Core Pages

### 4.1. Triage Leaderboard (`/triage`)

**Layout**: Table/list of customers

**Columns**:
- Avatar + Name + Company
- Badge (color-coded chip based on type)
- Risk/Opportunity scores (circular progress indicators)
- Last communication (icon + relative time using date-fns)
- AI Recommendation (truncated from action plan `whatToDo`)

**Sorting**: Risk Score DESC, then Opportunity Score DESC

**Interaction**: Click row → navigate to `/triage/customers/:id`

**Styling**: 
- Hover effect with subtle elevation
- Glassmorphism on cards
- Purple accent for action items

### 4.2. Customer Overview (`/triage/customers/:id`)

**Layout**: 3-column grid

**Left Column**: Customer Profile
- Avatar, Name, Company
- Contact info (email, phone)
- Risk/Opportunity scores (visual indicators)
- Stats: Total Conversations, Tasks, Action Plans

**Center Column**: Action Plan Card (if exists)
- Badge at top
- "What to Do" section
- "Why This Strategy" section
- Action Items list:
  - Checkboxes (toggle completion)
  - Type-specific icons and previews:
    - Email: Subject line
    - Call: Phone number, talking points count
    - Text: Message preview
    - Create Card: Card type, board
  - "Set Reminder" button
  - "Execute" button (type-specific modals)
- "Generate New Plan" button

**Right Column**: Recent History
- Timeline of last 3-5 conversations
- Date, channel icon, topic summary
- Click → navigate to conversation

**Empty State**: If no action plan, show helpful message

### 4.3. Reminders Page (`/reminders`)

**Purpose**: Show all action items where `reminderDate` is set

**List View**:
- Type icon, Title, Customer, Description
- Reminder date/time
- Overdue badge (red) if past due
- Auto-execute badge (email only)

**Filters**:
- Type: Email / Call / Text / Create Card
- Customer dropdown
- Date: Today / This Week / Overdue

**Actions**:
- Execute (opens type-specific modal)
- Snooze (update reminderDate)
- Complete
- Delete

**Create Button**: Opens modal to create standalone action item with reminder

## 5. Polish & Details

### Glassmorphism Components

Create reusable components with glassmorphism:

```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: var(--shadow-lg);
}

.dark .glass-card {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Animations

- Smooth page transitions (200-300ms)
- Hover effects with subtle elevation
- Progress bar animations
- Skeleton loading states

### Responsive

- Desktop-first (optimized for 1440px+)
- Tablet: Collapsible sidebars
- Mobile: Future scope

## 6. Routing

Set up React Router:

```
/ → Redirect to /triage
/triage → Triage Leaderboard
/triage/customers/:id → Customer Overview
/triage/customers/:id/action-plans/:planId → Action Plan Detail
/reminders → Reminders Page
/boards → Boards (placeholder for now)
/history → Global History (placeholder)
/settings → Settings (placeholder)
```

## 7. Key Features to Implement

✅ **Dark Mode**: Toggle via user menu, persists to localStorage, uses CSS variables
✅ **User Switching**: Dropdown in user menu to switch between mock users
✅ **Polymorphic Action Items**: Each type renders differently
✅ **Reminders**: Action items with `reminderDate` set
✅ **Team Progress**: Calculate from user's team(s)
✅ **Glassmorphism**: Cards, modals, sidebars
✅ **Contextual AI Sidebar**: Only on customer routes
✅ **Breadcrumbs**: Only on customer routes
✅ **Notifications**: Bell icon in sidebar bottom

## 8. Deliverables

Provide complete, production-ready code with:
- Clean component structure (separate files)
- Proper TypeScript types (no `any`)
- Tailwind + CSS variables for styling
- Working navigation and routing
- Mock data loaded into stores
- Dark mode fully functional
- User switcher functional
- All stores persisting to localStorage
- Premium aesthetic inspired by Craft.do

Make it look AMAZING. This should feel like a $50k enterprise SaaS product.
```

---

## Prompt 2: Conversation Intelligence

**Goal**: Add conversation history and AI-powered transcript analysis.

**Estimated Completion**: 20-25 minutes

### Prompt Text:

```markdown
Great work! Now let's add **Conversation History** and **Transcript** views.

### 1. Conversation Data Structure

Add to `useConversationsStore.ts`:

```typescript
interface Conversation {
  id: string;
  customerId: string;
  channel: ChannelType;
  date: string; // ISO 8601
  duration?: number; // minutes
  messageCount?: number;
  transcript: string;
  summary?: string; // AI-generated
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed';
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

**Route**: `/triage/customers/:id/conversations`

- Vertical timeline view
- Each item: Date, channel icon, summary, sentiment badge
- Filter by channel dropdown
- Click → navigate to transcript

### 3. Transcript Page

**Route**: `/triage/customers/:id/conversations/:convId`

**Main Area**: Chat-style transcript
- Messages styled by role (assistant/customer/agent)
- Timestamps
- Scrollable

**Right Sidebar**: AI Analysis
- Large sentiment badge (color-coded)
- "Key Insights" section (bullet list)
- "Coaching Suggestions" section (bullet list)

### 4. Breadcrumbs

Update to show: `[Customer Name] > [Conversation Date]`

### 5. Styling

- Use glassmorphism for message bubbles
- Smooth scroll animations
- Syntax highlighting for insights
```

---

## Prompt 3: Boards & Team Collaboration

**Goal**: Implement Kanban boards with drag-and-drop and team permissions.

**Estimated Completion**: 30-40 minutes

### Prompt Text:

```markdown
Now we're adding **Kanban Boards** for team collaboration.

### 1. Data Structures

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

interface Notification {
  id: string;
  userId: string;
  type: 'card_assigned' | 'action_plan_assigned' | 'reminder_due';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
```

Generate mock data:
- 2-3 boards with 3-4 columns each
- 10-15 cards across boards
- 3-5 notifications per user

### 2. Boards Page

**Route**: `/boards/:boardId`

**Layout**:
- Left sidebar: Board directory
- Main area: Kanban board

**Features**:
- Drag-and-drop cards (use `@dnd-kit/core` or `react-beautiful-dnd`)
- Click card → detail modal
- WIP limit indicators
- Assign to user/team

### 3. Notifications

- Bell icon in sidebar bottom (above Settings)
- Badge with unread count
- Dropdown panel
- Click notification → navigate to link
- Generate notification when card assigned

### 4. Dashboard Updates

Update `/` (Dashboard):
- Welcome stats (3 cards)
- Customer Triage Preview (top 3)
- Upcoming Reminders (next 5)
- Your Assigned Cards (5 most recent)
```

---

## Prompt 4: Settings & Admin Features

**Goal**: Complete settings page with role-based access control.

**Estimated Completion**: 25-30 minutes

### Prompt Text:

```markdown
Final step: **Settings** and **Admin Features**.

### 1. Settings Page

**Route**: `/settings`

**Tabs** (role-based visibility):
- **General** (all users): Theme toggle
- **Users** (admin only): User management, role changes
- **Teams** (admin only): Create/manage teams, add/remove members
- **Boards** (admin only): Configure boards, columns, permissions
- **API Keys** (dev/admin only): Placeholder

### 2. Teams Tab

- Table: Name, Description, Status, Members, Boards
- Create team form
- Expandable row:
  - Manage members
  - Toggle status (Active/Archived)
  - Toggle assignability
  - View linked boards

### 3. Boards Tab

- Table: Name, Visibility, Card Type, Default Team
- Create board form
- Expandable row:
  - Manage columns (add, reorder, rename, WIP limits, delete)
  - Team permissions (grant Edit/View access)

### 4. Polish

- Loading states (skeleton screens)
- Empty states with CTAs
- Error boundaries
- Accessibility (ARIA labels)
- Final aesthetic pass

### 5. README

Create comprehensive README.md with:
- Project overview
- Setup instructions
- Available scripts
- Technology stack
- Project structure
```

---

## Usage Notes

1. **Sequential Execution**: Run prompts in order
2. **First Prompt is Comprehensive**: Expect 45-60 minutes for initial generation
3. **Test After Each Prompt**: Verify functionality before proceeding
4. **Iteration**: Provide specific feedback if AI misses requirements
5. **AI Model**: Works best with Claude 3.5 Sonnet, GPT-4, or Gemini 1.5 Pro

## Expected Timeline

- Prompt 1: 45-60 min (comprehensive foundation)
- Prompt 2: 20-25 min (conversations)
- Prompt 3: 30-40 min (boards & collaboration)
- Prompt 4: 25-30 min (settings & polish)

**Total**: ~2-2.5 hours for complete implementation
