# ActionPlanIt: Testing & Verification Guide

## Overview

This guide provides systematic testing procedures for **ActionPlanIt** corresponding to each development prompt. Use this to verify functionality after each build increment.

**Testing Philosophy**: Test early, test often. Each phase should be fully verified before proceeding to the next prompt.

---

## Phase 1: Foundation & Core Triage

**Corresponds to**: Prompt 1  
**Focus**: Project setup, data layer, navigation, triage leaderboard

### 1.1 Project Setup
- [ ] Run `npm install` without errors
- [ ] Run `npm run dev` - app loads at `http://localhost:5173`
- [ ] No console errors on initial load
- [ ] Tailwind CSS is working (check styling)

### 1.2 Data Layer
- [ ] Open browser DevTools → Application → Local Storage
- [ ] Verify stores are initialized with mock data
- [ ] Check `customers` store has 15-20 customers
- [ ] Check `actionPlans` store has plans for each customer
- [ ] Check `teams` store has 3 teams
- [ ] Verify all dates are in ISO 8601 format

### 1.3 Application Shell

**Sidebar**:
- [ ] Sidebar is collapsed by default (icon-only)
- [ ] Hover over sidebar → expands smoothly
- [ ] Click outside → collapses
- [ ] Navigation items visible: Dashboard, Triage, History, Boards, Reminders, Settings
- [ ] Logo and "ACTIONPLANIT" wordmark visible when expanded
- [ ] Collapse state persists after page refresh

**Header**:
- [ ] "Today's Progress" widget visible (placeholder OK for now)
- [ ] Bell icon visible (placeholder OK)
- [ ] User avatar visible
- [ ] Click avatar → dropdown appears
- [ ] Theme toggle present in dropdown
- [ ] Sign Out option present

**Breadcrumbs**:
- [ ] Navigate to `/triage` → NO breadcrumbs visible
- [ ] Navigate to `/` → NO breadcrumbs visible

### 1.4 Triage Leaderboard
- [ ] Navigate to `/triage`
- [ ] Table/list displays all customers
- [ ] Customers sorted by risk score (highest first)
- [ ] Each row shows: Avatar, Name, Company, Badge, Scores, Last Contact, AI Recommendation
- [ ] Badge colors are distinct (at-risk = red/orange, opportunity = green/teal)
- [ ] Risk/Opportunity scores have visual indicators
- [ ] Click any row → navigates to `/triage/customers/:id`

---

## Phase 2: Customer Deep Dive & Action Plans

**Corresponds to**: Prompt 2  
**Focus**: Customer overview, action plans, interactivity

### 2.1 Customer Overview Page
- [ ] Navigate to `/triage/customers/:id` (pick any customer)
- [ ] **Breadcrumbs**: Verify breadcrumbs NOW appear to right of sidebar
- [ ] Breadcrumbs show: `[Customer Name] > Action Plan`
- [ ] **AI Agent Sidebar**: Verify right sidebar appears
- [ ] AI Agent header shows: "Focused on [Customer Name]"

**Layout**:
- [ ] 3-column grid layout visible
- [ ] Left: Customer profile card with avatar, name, company, contact info, scores, stats
- [ ] Center: Action Plan card (prominent)
- [ ] Right: Recent History timeline

### 2.2 Action Plan Card
- [ ] Badge displayed at top (color-coded)
- [ ] "What to Do" section visible
- [ ] "Why This Strategy" section visible
- [ ] Action items list visible
- [ ] Each action item has: Checkbox, Icon, Title, Description
- [ ] "Generate New Plan" button visible

**Interactivity**:
- [ ] Check an action item checkbox → updates immediately
- [ ] Uncheck → reverts immediately
- [ ] Refresh page → checkbox state persists
- [ ] Check DevTools → localStorage updated
- [ ] "Today's Progress" in header updates (even if calculation is simple for now)

### 2.3 Recent History
- [ ] Timeline shows 3-5 conversations
- [ ] Each item: Date, channel icon, topic summary
- [ ] Click conversation → navigates to transcript page

### 2.4 Visual Polish
- [ ] Cards have glassmorphism effect (subtle transparency/blur)
- [ ] Checkbox toggle has smooth transition
- [ ] Hover over action items shows visual feedback

---

## Phase 3: Conversation Intelligence

**Corresponds to**: Prompt 3  
**Focus**: Conversation history, transcripts, AI analysis

### 3.1 Conversation History Page
- [ ] Navigate to `/triage/customers/:id/conversations`
- [ ] **Breadcrumbs**: Update to show `[Customer Name] > Conversations`
- [ ] **AI Agent Sidebar**: Still visible
- [ ] Vertical timeline displayed
- [ ] Each conversation shows: Date, channel icon, summary, sentiment badge
- [ ] Filter dropdown visible (filter by channel)
- [ ] Apply filter → list updates

### 3.2 Transcript Page
- [ ] Click a conversation → navigates to `/triage/customers/:id/conversations/:convId`
- [ ] **Breadcrumbs**: Show `[Customer Name] > [Conversation Date]`
- [ ] **AI Agent Sidebar**: Still visible

**Main Area**:
- [ ] Chat-style transcript displayed
- [ ] Messages styled differently by role (assistant/customer/agent)
- [ ] Timestamps visible
- [ ] Scrollable if long

**Right Sidebar (AI Analysis)**:
- [ ] Sentiment badge displayed (large, color-coded)
- [ ] "Key Insights" section with bullet list
- [ ] "Coaching Suggestions" section with bullet list

### 3.3 Navigation Flow
- [ ] From transcript, click breadcrumb customer name → returns to customer overview
- [ ] From history, click breadcrumb customer name → returns to customer overview
- [ ] Sidebar navigation still works throughout

---

## Phase 4: Customer Management & Settings

**Corresponds to**: Prompt 4  
**Focus**: CRUD operations, settings, role-based access

### 4.1 Customer Directory
- [ ] Navigate to `/customers`
- [ ] Table displays all customers
- [ ] Search bar visible
- [ ] Type in search → filters by name/company in real-time
- [ ] Badge filter dropdown visible
- [ ] Select badge filter → list updates
- [ ] "Add Customer" button visible

**Add Customer**:
- [ ] Click "Add Customer" → modal opens
- [ ] Form fields: Name, Company, Email, Phone
- [ ] Fill form → click Save
- [ ] Modal closes
- [ ] New customer appears in list
- [ ] Refresh page → new customer persists

**Edit Customer**:
- [ ] Click edit icon on a customer → modal opens
- [ ] Form pre-filled with customer data
- [ ] Change name → Save
- [ ] Customer name updates in list
- [ ] Refresh → change persists

### 4.2 Settings Page
- [ ] Navigate to `/settings`
- [ ] Tabs visible: General, Users, Teams, Boards, API Keys
- [ ] Default tab: General

**General Tab**:
- [ ] Theme toggle visible
- [ ] Click toggle → theme changes (Light ↔ Dark)
- [ ] Refresh page → theme persists

**Users Tab** (admin only):
- [ ] Tab is accessible (mock user is admin)
- [ ] Table shows users: Name, Email, Role, Joined Date
- [ ] Role dropdown per user
- [ ] Change a user's role → updates immediately
- [ ] Remove user button → removes user from list

**Teams Tab** (admin only):
- [ ] Table shows teams: Name, Description, Status, Members, Boards
- [ ] "Create Team" button visible
- [ ] Click → form appears
- [ ] Fill name and description → Create
- [ ] New team appears in table
- [ ] Click team row → expands to show details
- [ ] Members list visible
- [ ] Add member → updates list
- [ ] Remove member → updates list
- [ ] Toggle status → updates
- [ ] Toggle assignability → updates

**Boards Tab** (admin only):
- [ ] Table shows boards: Name, Visibility, Card Type, Default Team
- [ ] "Create Board" button visible
- [ ] Create new board → appears in table
- [ ] Expand board → shows column management
- [ ] Add column → appears in list
- [ ] Reorder columns → order updates
- [ ] Rename column → name updates
- [ ] Set WIP limit → saves
- [ ] Delete column → removes from list
- [ ] Team permissions section visible
- [ ] Add team permission → appears in list
- [ ] Remove permission → removes from list

**API Keys Tab** (developer/admin only):
- [ ] Tab accessible
- [ ] Placeholder message visible

### 4.3 Role-Based Access
- [ ] Mock user as 'member' (change in code temporarily)
- [ ] Navigate to `/settings`
- [ ] Verify Users, Teams, Boards tabs are HIDDEN
- [ ] Attempt to navigate to `/settings?tab=teams` → redirects to General
- [ ] Change back to 'admin' → tabs visible again

### 4.4 Persistence
- [ ] Make changes to customer, team, board
- [ ] Refresh page
- [ ] Verify all changes persist

---

## Phase 5: Team Collaboration

**Corresponds to**: Prompt 5  
**Focus**: Boards, reminders, notifications, dashboard updates

### 5.1 Boards Page
- [ ] Navigate to `/boards`
- [ ] Redirects to `/boards/:boardId` (first board)
- [ ] **Layout**: Left sidebar (board directory) + Main area (kanban)

**Board Directory**:
- [ ] Lists all boards
- [ ] Click board → navigates to that board
- [ ] Active board highlighted

**Kanban Board**:
- [ ] Columns displayed
- [ ] Cards in columns
- [ ] Drag a card to another column → moves smoothly
- [ ] Drop card → position updates
- [ ] Refresh → card position persists
- [ ] WIP limit indicator visible if column has limit
- [ ] Exceeding WIP limit → visual warning

**Card Interaction**:
- [ ] Click card → detail modal opens
- [ ] Modal shows: Title, Description, Assignee
- [ ] Edit title → updates
- [ ] Edit description → updates
- [ ] Assign to user → updates
- [ ] Assign to team → updates
- [ ] Archive card → removes from board
- [ ] Close modal → changes persist

### 5.2 Card Assignment & Notifications
- [ ] Assign a card to current user
- [ ] Check header bell icon → badge count increases
- [ ] Click bell → dropdown opens
- [ ] Notification visible: "Card #[ID] assigned to you on [Board Name]"
- [ ] Click notification → navigates to board
- [ ] Notification marked as read
- [ ] Badge count decreases

### 5.3 Reminders Page
- [ ] Navigate to `/reminders`
- [ ] List displays reminders
- [ ] Filters visible: Status, Type, Customer
- [ ] Apply filters → list updates
- [ ] Overdue reminders show red "Overdue" badge

**Create Reminder**:
- [ ] Click "Create Reminder" → form opens
- [ ] Fill: Title, Description, Type, Customer, Due Date
- [ ] Optionally link to action item
- [ ] Save → reminder appears in list
- [ ] Refresh → reminder persists

**Actions**:
- [ ] Mark reminder as complete → status updates
- [ ] Dismiss reminder → status updates
- [ ] Edit reminder → changes save
- [ ] Delete reminder → removes from list

### 5.4 Dashboard Updates
- [ ] Navigate to `/` (Dashboard)
- [ ] **Verify NO "Recent Activity" section**
- [ ] **Upcoming Reminders** widget visible
- [ ] Shows next 5 upcoming reminders
- [ ] Click reminder → navigates to `/reminders`
- [ ] **Your Assigned Cards** widget visible
- [ ] Shows 5 most recent cards assigned to you
- [ ] Click card → navigates to board

### 5.5 Notifications System
- [ ] Bell icon in header
- [ ] Badge shows unread count
- [ ] Click bell → dropdown with notifications list
- [ ] Each notification: Title, Message, Time
- [ ] Click notification → navigates to link
- [ ] Notification marked as read
- [ ] Badge updates

---

## Phase 6: Team Progress & Final Polish

**Corresponds to**: Prompt 6  
**Focus**: Team-wide metrics, polish, final verification

### 6.1 Team Progress Tracker
- [ ] Navigate to any customer with action plan
- [ ] Check an action item → mark as complete
- [ ] Navigate to Dashboard
- [ ] Check "Today's Progress" in header
- [ ] Verify it shows team-wide progress (not just your actions)

**Calculation Verification**:
- [ ] Open DevTools console
- [ ] Log current user's teams
- [ ] Log all action plans assigned to those teams
- [ ] Count completed TODAY
- [ ] Count total active
- [ ] Verify header shows correct X / Y

**Visual**:
- [ ] Progress bar animates smoothly
- [ ] Hover over bar → flyout appears
- [ ] Flyout shows: "Today's Progress: X / Y resolved"
- [ ] If 100% → "Complete" badge and star icon visible

### 6.2 Action Plan Assignment
- [ ] Verify some action plans have `assigneeTeamId` in mock data
- [ ] Verify progress tracker only counts plans for user's team(s)
- [ ] Change user's team (in mock data) → progress updates accordingly

### 6.3 Polish Verification

**Loading States**:
- [ ] Simulate slow data load → skeleton screens appear
- [ ] Data loads → smooth transition to content

**Empty States**:
- [ ] Navigate to board with no cards → helpful empty state
- [ ] Navigate to reminders with no reminders → helpful empty state
- [ ] Each empty state has clear CTA

**Error Handling**:
- [ ] Trigger an error (e.g., invalid route) → error boundary catches
- [ ] Error message is user-friendly

**Animations**:
- [ ] Page transitions are smooth
- [ ] Hover effects work throughout
- [ ] No janky animations

**Accessibility**:
- [ ] Tab through interface → focus visible
- [ ] Screen reader labels present (check with DevTools)
- [ ] Color contrast sufficient (use DevTools audit)

**Responsive**:
- [ ] Resize browser to 1024px → layout adapts
- [ ] Sidebar collapses gracefully
- [ ] Cards stack appropriately

### 6.4 Demo Mode Toggle
- [ ] Click user menu → "Demo Mode" toggle visible
- [ ] Toggle ON → banner appears
- [ ] Toggle OFF → banner disappears
- [ ] State persists after refresh

### 6.5 Final Checklist
- [ ] All routes work correctly
- [ ] All stores persist to localStorage
- [ ] Theme toggle works and persists
- [ ] Breadcrumbs update correctly on all customer routes
- [ ] AI Agent Sidebar appears ONLY on customer routes
- [ ] Notifications system fully functional
- [ ] Drag-and-drop on boards works smoothly
- [ ] Team progress calculates correctly
- [ ] No console errors anywhere
- [ ] Premium aesthetic throughout (glassmorphism, smooth transitions, good typography)

### 6.6 Cross-Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge

### 6.7 Performance
- [ ] Run Lighthouse audit
- [ ] Performance score > 90
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] Page load < 1 second
- [ ] Interaction response < 100ms

---

## Regression Testing

After completing all phases, run through this quick regression checklist:

- [ ] Create customer → appears in triage → view overview → check action item → verify progress
- [ ] Create reminder → appears on dashboard → mark complete → verify status
- [ ] Assign card to user → notification appears → click notification → navigates correctly
- [ ] Create team → assign to board → verify permissions work
- [ ] Toggle theme → refresh → theme persists
- [ ] Collapse sidebar → refresh → state persists
- [ ] Filter triage by badge → results correct
- [ ] Search customers → results correct
- [ ] View conversation transcript → AI analysis visible
- [ ] Drag card on board → position persists after refresh

---

## Bug Reporting Template

If you find issues, document them using this format:

**Bug ID**: [Unique identifier]  
**Phase**: [Which testing phase]  
**Severity**: [Critical / High / Medium / Low]  
**Description**: [What's wrong]  
**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [etc.]

**Expected**: [What should happen]  
**Actual**: [What actually happens]  
**Screenshot**: [If applicable]  
**Console Errors**: [If any]

---

## Success Criteria

The application is ready for demo when:
- ✅ All Phase 1-6 tests pass
- ✅ No console errors
- ✅ All data persists correctly
- ✅ Lighthouse scores > 90
- ✅ Cross-browser compatible
- ✅ Premium aesthetic achieved
- ✅ All user flows work end-to-end
