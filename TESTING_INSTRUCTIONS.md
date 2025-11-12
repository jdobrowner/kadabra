# Testing Instructions

Comprehensive guide for testing all application flows, including manual testing, API testing with Postman, and end-to-end user flows.

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Postman Setup](#postman-setup)
3. [Authentication Testing](#authentication-testing)
4. [API Endpoint Testing](#api-endpoint-testing)
5. [UI Flow Testing](#ui-flow-testing)
6. [Integration Testing](#integration-testing)
7. [Test Data Setup](#test-data-setup)
8. [Troubleshooting](#troubleshooting)

---

## Testing Overview

### Testing Approaches

1. **Manual UI Testing**: Test user-facing flows through the web interface
2. **Postman Collection**: Test API endpoints directly (recommended for `/api/ingest`)
3. **Browser DevTools**: Test tRPC endpoints via network tab
4. **Database Inspection**: Verify data using Drizzle Studio

### Test Environment Setup

Before testing, ensure:
- ✅ Application is running (`npm run dev`)
- ✅ Database is set up and seeded (`npm run db:push && npm run db:seed`)
- ✅ Google OAuth is configured
- ✅ Environment variables are set
- ✅ You have an admin user account

---

## Postman Setup

### Why Use Postman?

**Yes, you should use Postman** for testing:
- API endpoints (especially `/api/ingest`)
- Authentication flows
- tRPC endpoints (via REST conversion)
- Testing with different API keys
- Rate limiting verification

### Import Postman Collection

1. **Download Postman** ([Download](https://www.postman.com/downloads/))

2. **Create a new Collection**: "Kadabra Demo API"

3. **Set up Environment Variables**:
   - Create a new Environment in Postman
   - Add variables:
     ```
     base_url: http://localhost:5173
     api_key: (your API key - get from UI)
     jwt_token: (your JWT token - get from OAuth flow)
     ```

4. **Import Collection** (or create manually):

```json
{
  "info": {
    "name": "Kadabra Demo API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Ingestion API",
      "item": [
        {
          "name": "Ingest Email",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "X-API-Key",
                "value": "{{api_key}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"channel\": \"email\",\n  \"content\": \"Hi, I am having issues with my billing. The charge on my card is incorrect and I need this resolved ASAP.\",\n  \"metadata\": {\n    \"subject\": \"Billing Issue - Urgent\",\n    \"from\": \"customer@example.com\",\n    \"to\": \"support@company.com\",\n    \"date\": \"2024-01-15T10:30:00Z\"\n  }\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/ingest",
              "host": ["{{base_url}}"],
              "path": ["api", "ingest"]
            }
          }
        }
      ]
    }
  ]
}
```

---

## Authentication Testing

### Test 1: Google OAuth Flow

**Steps**:
1. Navigate to `http://localhost:5173/signin`
2. Click "Sign in with Google"
3. Select a Google account
4. Authorize the application
5. Verify redirect to dashboard
6. Verify user is logged in (check header for user info)

**Expected Result**:
- ✅ Redirects to Google OAuth
- ✅ After authorization, redirects back to app
- ✅ JWT token is stored in localStorage
- ✅ User sees dashboard with stats

**Verify in Browser DevTools**:
```javascript
// Check localStorage
localStorage.getItem('auth-token')

// Check token is valid (decode JWT)
// Use jwt.io or browser console
```

### Test 2: Invitation Flow

**Prerequisites**: You need to be logged in as an admin user.

**Steps**:
1. Navigate to Settings → Invitations
2. Click "Invite User"
3. Enter email: `test@example.com`
4. Select role: `member`
5. Click "Send Invitation"
6. Copy invitation link
7. Open incognito/private window
8. Navigate to invitation link (or `http://localhost:5173/signin?invitation=TOKEN`)
9. Sign in with Google using `test@example.com`
10. Verify invitation is accepted

**Expected Result**:
- ✅ Invitation is created
- ✅ Invitation link is generated
- ✅ Email field is pre-filled on sign-in page
- ✅ After OAuth, user is added to organization
- ✅ Success message shows organization name

### Test 3: Protected Routes

**Steps**:
1. Without logging in, navigate to:
   - `http://localhost:5173/dashboard`
   - `http://localhost:5173/triage`
   - `http://localhost:5173/settings`
2. Verify redirect to `/signin`

**Expected Result**:
- ✅ All protected routes redirect to sign-in
- ✅ After sign-in, user is redirected to intended page

---

## API Endpoint Testing

### Test 1: Create API Key

**Method**: UI or tRPC

**Via UI**:
1. Log in as admin or developer
2. Navigate to Settings → API Keys
3. Click "Create API Key"
4. Enter name: "Test API Key"
5. Click "Create"
6. **Copy the key immediately** (shown only once)

**Via Postman/tRPC** (if you have JWT token):
```http
POST http://localhost:5173/api/trpc/apiKeys.create
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "Test API Key",
  "expiresAt": null
}
```

**Expected Result**:
- ✅ API key is created
- ✅ Key is displayed once (format: `kad_...`)
- ✅ Key appears in API Keys list
- ✅ Key can be used for authentication

### Test 2: Ingestion API - Email

**Use Postman** (recommended):

```http
POST http://localhost:5173/api/ingest
Content-Type: application/json
X-API-Key: kad_your_api_key_here

{
  "channel": "email",
  "content": "Hi, I am having issues with my billing. The charge on my card is incorrect and I need this resolved ASAP. Please contact me.",
  "metadata": {
    "subject": "Billing Issue - Urgent",
    "from": "customer@example.com",
    "to": "support@company.com",
    "date": "2024-01-15T10:30:00Z"
  }
}
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "customerId": "customer-...",
  "conversationId": "conversation-...",
  "actionPlanId": "action-plan-..." | null
}
```

**Verify in Database**:
```bash
npm run db:studio
```
Check:
- ✅ Customer created/updated in `customers` table
- ✅ Conversation created in `conversations` table
- ✅ Action plan created (if LLM recommended)
- ✅ Action items created (if action plan exists)

**Verify in UI**:
1. Navigate to Dashboard
2. Check if new customer appears
3. Navigate to Triage page
4. Verify customer is listed

### Test 3: Ingestion API - SMS

```http
POST http://localhost:5173/api/ingest
Content-Type: application/json
X-API-Key: kad_your_api_key_here

{
  "channel": "sms",
  "content": "Customer: Hi, I want to cancel my subscription\nAgent: I am sorry to hear that. Can you tell me why?\nCustomer: The service is too expensive and I am not using it much",
  "metadata": {
    "from": "+1234567890",
    "to": "+0987654321",
    "date": "2024-01-15T14:00:00Z",
    "messageCount": 3
  }
}
```

**Expected Result**:
- ✅ Customer matched or created
- ✅ Conversation created with SMS channel
- ✅ Sentiment analysis performed
- ✅ Action plan may be created (if "cancel" triggers at-risk)

### Test 4: Ingestion API - Phone Call (Transcribed)

```http
POST http://localhost:5173/api/ingest
Content-Type: application/json
X-API-Key: kad_your_api_key_here

{
  "channel": "phone",
  "content": "Agent: Hello, thank you for calling. How can I help you today?\nCustomer: Hi, I am interested in your premium plan. Can you tell me more about the features?\nAgent: Absolutely! Our premium plan includes advanced analytics, priority support, and unlimited API calls.\nCustomer: That sounds great. What's the pricing?\nAgent: The premium plan is $99 per month. Would you like me to set up a trial?",
  "metadata": {
    "from": "+1234567890",
    "to": "+0987654321",
    "date": "2024-01-15T09:00:00Z",
    "duration": 15
  }
}
```

**Expected Result**:
- ✅ Customer matched or created
- ✅ Conversation created with phone channel
- ✅ Opportunity badge may be assigned
- ✅ Action plan may be created with "lead" or "opportunity" badge

### Test 5: Rate Limiting

**Test API Key Rate Limit** (100 requests/minute):

```bash
# Run 101 requests quickly
for i in {1..101}; do
  curl -X POST http://localhost:5173/api/ingest \
    -H "Content-Type: application/json" \
    -H "X-API-Key: kad_your_api_key_here" \
    -d '{"channel":"email","content":"Test"}'
  echo "Request $i"
done
```

**Expected Result**:
- ✅ First 100 requests succeed
- ✅ 101st request returns `429 Too Many Requests`
- ✅ Response includes `Retry-After` header
- ✅ Response includes rate limit headers

**Test LLM Rate Limit** (20 requests/minute):

Same as above, but the LLM limit is separate. You'll hit LLM limit first if making many requests quickly.

### Test 6: Error Cases

**Missing API Key**:
```http
POST http://localhost:5173/api/ingest
Content-Type: application/json

{
  "channel": "email",
  "content": "Test"
}
```

**Expected**: `401 Unauthorized` - "Missing X-API-Key header"

**Invalid API Key**:
```http
POST http://localhost:5173/api/ingest
Content-Type: application/json
X-API-Key: invalid_key

{
  "channel": "email",
  "content": "Test"
}
```

**Expected**: `401 Unauthorized` - "Invalid or expired API key"

**Missing Required Fields**:
```http
POST http://localhost:5173/api/ingest
Content-Type: application/json
X-API-Key: kad_your_api_key_here

{
  "channel": "email"
}
```

**Expected**: `400 Bad Request` - "Missing required fields: content"

**Invalid Channel**:
```http
POST http://localhost:5173/api/ingest
Content-Type: application/json
X-API-Key: kad_your_api_key_here

{
  "channel": "invalid",
  "content": "Test"
}
```

**Expected**: `400 Bad Request` - "Invalid channel..."

---

## UI Flow Testing

### Test 1: Dashboard Flow

**Steps**:
1. Log in as admin
2. Navigate to Dashboard
3. Verify stats display (customers analyzed, action plans, urgent)
4. Wait 45 seconds (or click Refresh)
5. Verify data refreshes
6. Click on a customer card
7. Verify navigation to customer detail

**Expected Result**:
- ✅ Stats display correctly
- ✅ Auto-refresh works (every 45 seconds)
- ✅ Manual refresh works
- ✅ Customer cards are clickable

### Test 2: Triage Flow

**Steps**:
1. Navigate to Triage page
2. Verify customer list displays
3. Test sorting (by priority, customer, status)
4. Test filtering (by status, badge)
5. Click on a customer row
6. Verify navigation to customer detail

**Expected Result**:
- ✅ Customers are listed
- ✅ Sorting works
- ✅ Filtering works
- ✅ Navigation works

### Test 3: Customer Detail Flow

**Steps**:
1. Navigate to a customer detail page
2. Verify customer metadata displays
3. Verify action plan card displays
4. Verify conversation history displays
5. Click "Mark Complete" or "Mark Canceled"
6. Verify status updates
7. Verify audit log entry is created
8. Wait 45 seconds (or click Refresh)
9. Verify data refreshes

**Expected Result**:
- ✅ All customer info displays
- ✅ Action plan status can be updated
- ✅ Audit logs appear after actions
- ✅ Auto-refresh works

### Test 4: Action Plan Detail Flow

**Steps**:
1. Navigate to an action plan detail page
2. Verify action plan info displays
3. Verify action items list
4. Click "Mark Complete"
5. Enter optional reason
6. Verify status updates
7. Verify audit log entry
8. Click "Record Created"
9. Enter record details (Case #5002, etc.)
10. Verify action plan is marked complete
11. Verify audit logs show both entries

**Expected Result**:
- ✅ Action plan details display
- ✅ Status can be updated with reason
- ✅ Record creation can be tracked
- ✅ Audit logs show all actions

### Test 5: User Management Flow (Admin Only)

**Steps**:
1. Navigate to Settings → Users
2. Verify user list displays
3. Change a user's role (admin → member)
4. Verify role updates
5. Try to remove a user
6. Verify confirmation dialog
7. Confirm removal
8. Verify user is removed

**Expected Result**:
- ✅ Users list displays
- ✅ Roles can be updated
- ✅ Users can be removed (with confirmation)
- ✅ Cannot remove last admin

### Test 6: Invitation Flow (Admin Only)

**Steps**:
1. Navigate to Settings → Invitations
2. Click "Invite User"
3. Enter email and role
4. Send invitation
5. Verify invitation appears in list
6. Copy invitation link
7. Cancel invitation (optional)
8. Verify invitation status updates

**Expected Result**:
- ✅ Invitations can be created
- ✅ Invitation links are generated
- ✅ Invitations can be canceled
- ✅ Status filters work

### Test 7: API Keys Management Flow (Admin/Developer)

**Steps**:
1. Navigate to Settings → API Keys
2. Verify API keys list (if any)
3. Click "Create API Key"
4. Enter name and optional expiration
5. Click "Create"
6. **Copy key immediately** (shown only once)
7. Verify key appears in list
8. Delete a key
9. Verify key is removed

**Expected Result**:
- ✅ API keys can be created
- ✅ Key is shown only once
- ✅ Keys can be deleted
- ✅ Expired keys show "Expired" badge

### Test 8: AI Assistant Panel

**Steps**:
1. Navigate to a customer detail page from Triage or Dashboard.
2. Verify the AI Assistant panel appears on the right with the correct customer name.
3. Click **New Chat** and confirm an empty thread is selected.
4. Send a prompt (e.g., “Give me talking points for the next call”) and wait for the response.
5. Verify both the user prompt and assistant reply appear immediately.
6. Navigate to Action Plan, Conversation History, and Conversation Transcript for the same customer.
7. Confirm the panel reuses the chat list, preserves history, and allows sending follow-up questions.
8. Delete a chat from the list and verify it disappears and the thread clears.

**Expected Result**:
- ✅ Panel loads on all customer-context pages with consistent customer info.
- ✅ Chats can be created, selected, and deleted without errors.
- ✅ Messages append in real time and the send button reflects loading state.
- ✅ Switching pages preserves the active chat and history.

---

## Integration Testing

### Test 1: End-to-End Ingestion Flow

**Complete Flow**:
1. Create API key via UI
2. Use Postman to ingest an email
3. Verify customer created in database
4. Verify conversation created
5. Verify action plan created (if applicable)
6. Verify customer appears in Dashboard
7. Navigate to customer detail
8. Verify all data displays correctly
9. Mark action plan as complete
10. Verify audit log entry

**Expected Result**:
- ✅ Complete flow works end-to-end
- ✅ Data is consistent across UI and database
- ✅ Audit trail is maintained

### Test 2: Multi-User Flow

**Steps**:
1. Create two admin users (via invitations)
2. Log in as first admin
3. Create an action plan (via ingestion)
4. Log in as second admin
5. Verify action plan is visible
6. Assign action plan to second admin
7. Mark as complete
8. Verify audit log shows both users

**Expected Result**:
- ✅ Multi-tenancy works (users see same org data)
- ✅ Assignment works
- ✅ Audit logs track all users

### Test 3: Customer Matching Flow

**Test Cases**:
1. **Email Match**: Ingest with `customer@example.com`, then ingest again with same email
2. **Phone Match**: Ingest with `+1234567890`, then ingest with `(123) 456-7890`
3. **Name + Company Match**: Ingest with "John Doe" at "Acme Corp", then "John Doe" at "Acme Corporation"

**Expected Result**:
- ✅ Email matching is case-insensitive
- ✅ Phone matching normalizes formatting
- ✅ Company name matching handles variations (Corp/Corporation)

### Test 4: LLM Error Handling

**Test Cases**:
1. **Invalid API Key**: Set invalid `OPENAI_API_KEY` temporarily
2. **Network Failure**: Disconnect internet temporarily
3. **Rate Limit**: Make 25+ requests quickly

**Expected Result**:
- ✅ Retry logic works (3 attempts)
- ✅ Fallback analysis is used if LLM fails
- ✅ Rate limiting prevents excessive calls
- ✅ Error messages are clear

---

## Test Data Setup

### Seed Database

```bash
npm run db:seed
```

This creates:
- 1 default organization
- 1 admin user (you'll need to sign in with Google to create your account)
- Sample customers
- Sample action plans
- Sample conversations

### Create Test API Key

1. Log in as admin
2. Go to Settings → API Keys
3. Create key: "Test API Key"
4. Copy key for use in Postman

### Create Test Customers via Ingestion

Use Postman to ingest various scenarios:

1. **At-Risk Customer**: Use content with "cancel", "refund", "complaint"
2. **Opportunity Customer**: Use content with "interested", "pricing", "premium"
3. **Lead Customer**: Use content with "new customer", "sign up", "trial"
4. **Follow-Up Customer**: Use neutral content

---

## Troubleshooting

### Common Test Issues

#### 1. API Key Not Working

**Problem**: `401 Unauthorized` even with valid key

**Solutions**:
- Verify key format: `kad_...`
- Check key hasn't expired
- Verify key belongs to your organization
- Check API key is in database: `npm run db:studio`

#### 2. OAuth Not Working

**Problem**: OAuth redirect fails

**Solutions**:
- Verify redirect URI matches exactly
- Check `GOOGLE_REDIRECT_URI` environment variable
- Verify Google OAuth credentials are correct
- Check browser console for errors

#### 3. Data Not Appearing

**Problem**: Ingested data doesn't show in UI

**Solutions**:
- Check database: `npm run db:studio`
- Verify organization ID matches
- Check browser cache (hard refresh)
- Verify polling is working (wait 45 seconds)

#### 4. LLM Analysis Fails

**Problem**: Ingestion returns 500 error

**Solutions**:
- Check `OPENAI_API_KEY` is valid
- Verify API key has credits
- Check server logs for detailed error
- Test with simpler content

#### 5. Rate Limiting Issues

**Problem**: Getting 429 errors during testing

**Solutions**:
- Wait for rate limit window to reset (1 minute)
- Use different API keys for parallel testing
- Reduce request frequency

---

## Testing Checklist

Use this checklist to ensure all features are tested:

### Authentication
- [ ] Google OAuth sign-in
- [ ] OAuth callback handling
- [ ] Protected routes redirect
- [ ] Invitation flow
- [ ] JWT token storage and usage

### API Endpoints
- [ ] Create API key
- [ ] List API keys
- [ ] Delete API key
- [ ] Ingest email
- [ ] Ingest SMS
- [ ] Ingest phone call
- [ ] Rate limiting (API key)
- [ ] Rate limiting (LLM)
- [ ] Error handling (missing fields)
- [ ] Error handling (invalid key)

### UI Flows
- [ ] Dashboard display and refresh
- [ ] Triage page with sorting/filtering
- [ ] Customer detail page
- [ ] Action plan detail page
- [ ] Mark complete/canceled
- [ ] Record creation tracking
- [ ] Audit logs display
- [ ] User management (admin)
- [ ] Invitation management (admin)
- [ ] API key management (admin/developer)

### Integration
- [ ] End-to-end ingestion flow
- [ ] Customer matching (email, phone, name)
- [ ] Multi-user scenarios
- [ ] LLM error handling
- [ ] Real-time updates (polling)

---

## Summary

**Testing Tools**:
- ✅ **Postman** - Recommended for API testing (especially `/api/ingest`)
- ✅ **Browser DevTools** - For inspecting network requests and tRPC calls
- ✅ **Drizzle Studio** - For database inspection
- ✅ **UI** - For user-facing flows

**Key Test Scenarios**:
1. Authentication and authorization
2. API key creation and usage
3. Communication ingestion
4. Customer matching
5. Action plan workflows
6. Audit logging
7. Rate limiting
8. Error handling

For setup instructions, see [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md).

