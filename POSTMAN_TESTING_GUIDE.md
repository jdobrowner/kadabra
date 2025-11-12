# Postman Testing Guide

Complete step-by-step guide for testing the Kadabra Demo API using Postman.

## Table of Contents

1. [Setup](#setup)
2. [Testing Order](#testing-order)
3. [Endpoint Testing](#endpoint-testing)
4. [Sample Data](#sample-data)
5. [Verification Steps](#verification-steps)
6. [Troubleshooting](#troubleshooting)

---

## Setup

### 1. Import Postman Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select the `POSTMAN_COLLECTION.json` file
4. The collection "Kadabra Demo API" will appear in your workspace

### 2. Create Environment

1. Click **Environments** in the left sidebar
2. Click **+** to create a new environment
3. Name it: `Kadabra Demo - Local`
4. Add the following variables:

| Variable | Initial Value | Current Value | Description |
|----------|---------------|---------------|-------------|
| `base_url` | `http://localhost:3000` | `http://localhost:3000` | API server URL |
| `api_key` | (leave empty) | (will set after step 3) | Your API key |
| `redirect_url` | `http://localhost:5173/auth/callback` | `http://localhost:5173/auth/callback` | OAuth redirect |
| `oauth_code` | (leave empty) | (leave empty) | OAuth code (auto-filled) |
| `state` | (leave empty) | (leave empty) | OAuth state (auto-filled) |

5. Click **Save**
6. Select this environment from the environment dropdown (top right)

### 3. Get Your API Key

**Option A: From the UI (Recommended)**
1. Start the application: `npm run dev`
2. Sign in to the application
3. Navigate to **Settings → API Keys**
4. Click **Create API Key**
5. Enter a name (e.g., "Postman Testing")
6. Copy the API key (shown only once!)
7. Paste it into Postman environment variable `api_key`

**Option B: From Database**
```sql
SELECT id, name, key_hash, expires_at, created_at 
FROM api_keys 
WHERE org_id = 'your-org-id';
```
Note: You'll need the plain key, which is only shown once when created.

---

## Testing Order

**IMPORTANT**: Execute requests in the "Test Scenarios (Execute in Order)" folder sequentially (01-07) for proper test flow.

### Phase 1: Authentication & Setup
1. ✅ Verify API key is set in environment variables
2. ✅ Test invalid/missing API key (error handling tests)

### Phase 2: Main Test Scenarios (Execute 01-07 in Order)

Execute these requests in the exact order shown in Postman:

**01_At-Risk Customer (Churn)**
- Tests badge detection for customers threatening cancellation
- Expected badge: `at-risk`
- Verify in UI: Customer should show as "At-Risk" with high priority

**02_Opportunity Customer (Upgrade)**
- Tests badge detection for upgrade/sales opportunities
- Expected badge: `opportunity`
- Verify in UI: Customer should show as "Opportunity" with upgrade recommendation

**03_Lead Customer (New Interest)**
- Tests badge detection for new potential customers
- Expected badge: `lead`
- Verify in UI: Customer should show as "Lead" with demo request recommendation

**04_Follow-Up Customer (Simple Question)**
- Tests badge detection for routine follow-ups
- Expected badge: `follow-up`
- Verify in UI: Customer should show as "Follow-Up" with standard response needed

**05_No-Action Customer (Closing Comment)**
- Tests badge detection for resolved/no-action-needed communications
- Expected badge: `no-action`
- Verify in UI: Customer should show as "No-Action" or may not have an action plan

**06_Customer Message 1 (Grouping Test)**
- First message from a customer
- Creates new customer record
- Note the customer email: `buyer@testcompany.com`

**07_Customer Message 2 (Grouping Test)**
- Second message from the SAME customer (same email)
- Should be grouped with message 06
- Verify in UI: Both conversations appear under the same customer record

### Phase 3: Error Handling
- Test invalid channel
- Test missing required fields
- Test rate limiting

### Phase 4: Verification
- Verify all badges are correctly assigned in UI
- Verify customer grouping works (messages 06 & 07)
- Verify action plans are created with correct badges
- Verify topics are generated (not just copied from content)

---

## Endpoint Testing

### Test 1: Verify API Key Setup

**Request**: `Ingest - Missing API Key` (in Error Handling Tests folder)

**Expected Response**:
```json
{
  "error": "Missing X-API-Key header"
}
```
**Status Code**: `401 Unauthorized`

**Action**: If this works, your API key setup is correct. If you get a different error, check your environment variables.

---

## Main Test Scenarios

### Test 2: 01_At-Risk Customer (Churn)

**Request**: `01_At-Risk Customer (Churn)`

**What to Verify**:
- ✅ Response includes `customerId`, `conversationId`, and `actionPlanId`
- ✅ In UI: Customer shows badge as "At-Risk" (not "Follow-Up")
- ✅ In UI: Action plan badge is `at-risk`
- ✅ In UI: Topic is a summary, not just copied from email content
- ✅ In UI: Customer has high priority/urgency

**Expected Badge**: `at-risk`

---

### Test 3: 02_Opportunity Customer (Upgrade)

**Request**: `02_Opportunity Customer (Upgrade)`

**What to Verify**:
- ✅ Response includes `customerId`, `conversationId`, and `actionPlanId`
- ✅ In UI: Customer shows badge as "Opportunity" (not "Follow-Up")
- ✅ In UI: Action plan badge is `opportunity`
- ✅ In UI: Recommendation suggests upgrade/sales action

**Expected Badge**: `opportunity`

---

### Test 4: 03_Lead Customer (New Interest)

**Request**: `03_Lead Customer (New Interest)`

**What to Verify**:
- ✅ Response includes `customerId`, `conversationId`, and `actionPlanId`
- ✅ In UI: Customer shows badge as "Lead" (not "Follow-Up")
- ✅ In UI: Action plan badge is `lead`
- ✅ In UI: Recommendation suggests demo/sales outreach

**Expected Badge**: `lead`

---

### Test 5: 04_Follow-Up Customer (Simple Question)

**Request**: `04_Follow-Up Customer (Simple Question)`

**What to Verify**:
- ✅ Response includes `customerId`, `conversationId`, and `actionPlanId`
- ✅ In UI: Customer shows badge as "Follow-Up"
- ✅ In UI: Action plan badge is `follow-up`
- ✅ In UI: Recommendation suggests providing information/response

**Expected Badge**: `follow-up`

---

### Test 6: 05_No-Action Customer (Closing Comment)

**Request**: `05_No-Action Customer (Closing Comment)`

**What to Verify**:
- ✅ Response includes `customerId`, `conversationId`
- ✅ In UI: Customer shows badge as "No-Action" OR no action plan is created
- ✅ If action plan exists, badge is `no-action`
- ✅ In UI: Low priority, informational only

**Expected Badge**: `no-action`

---

### Test 7: 06_Customer Message 1 (Grouping Test)

**Request**: `06_Customer Message 1 (Grouping Test)`

**What to Verify**:
- ✅ Response includes `customerId`, `conversationId`, and `actionPlanId`
- ✅ Note the `customerId` from the response
- ✅ In UI: New customer appears with email `buyer@testcompany.com`
- ✅ In UI: One conversation visible for this customer

**Important**: Remember this customer ID or email for the next test.

---

### Test 8: 07_Customer Message 2 (Grouping Test)

**Request**: `07_Customer Message 2 (Grouping Test)`

**What to Verify**:
- ✅ Response includes `customerId` - **Should match the customerId from Test 7**
- ✅ Response includes `conversationId` - **Should be different from Test 7**
- ✅ In UI: Same customer (`buyer@testcompany.com`) now shows **TWO conversations**
- ✅ In UI: Both conversations appear under the same customer record
- ✅ In UI: Customer detail page shows conversation history with both messages

**Critical Verification**: The `customerId` in the response must be the same as Test 7, proving customer grouping works correctly.

---

## Error Handling Tests

### Test 9: Error Handling - Invalid API Key

**Request**: `Ingest - Invalid Channel` (in Error Handling Tests folder)

**Expected Response**:
```json
{
  "error": "Invalid channel. Must be one of: email, sms, phone, voice-message"
}
```
**Status Code**: `400 Bad Request`

---

### Test 10: Rate Limiting

**Request**: Send multiple `Ingest Email` requests rapidly (10+ requests in quick succession)

**Expected Behavior**:
- ✅ First requests succeed (check `X-RateLimit-Remaining` header)
- ✅ After exceeding limit, you may see rate limit errors
- ✅ Rate limit headers are present in all responses

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 90
X-RateLimit-Reset: 1234567890
```

---

## Sample Data

### Email Examples

#### High Priority - Billing Issue
```json
{
  "channel": "email",
  "content": "URGENT: I've been charged twice for my subscription this month. This is unacceptable and I need an immediate refund. My account number is 12345.",
  "metadata": {
    "subject": "URGENT: Double Billing Issue",
    "from": "angry.customer@example.com",
    "to": "support@company.com",
    "date": "2025-11-06T10:00:00Z"
  }
}
```

#### Positive Feedback
```json
{
  "channel": "email",
  "content": "I just wanted to say thank you! Your product has been amazing and has really helped our team. Keep up the great work!",
  "metadata": {
    "subject": "Thank You!",
    "from": "happy.customer@example.com",
    "to": "support@company.com",
    "date": "2025-11-06T12:00:00Z"
  }
}
```

#### Feature Request
```json
{
  "channel": "email",
  "content": "Hi, I love your product but I was wondering if you could add support for exporting reports to PDF? This would be really helpful for our monthly reviews.",
  "metadata": {
    "subject": "Feature Request: PDF Export",
    "from": "user@example.com",
    "to": "support@company.com",
    "date": "2025-11-06T13:00:00Z"
  }
}
```

### SMS Examples

#### Order Inquiry
```json
{
  "channel": "sms",
  "content": "Where is my order? Order #7890. Expected delivery was yesterday.",
  "metadata": {
    "from": "+15551234567",
    "to": "+15559876543",
    "date": "2025-11-06T15:00:00Z"
  }
}
```

#### Appointment Confirmation
```json
{
  "channel": "sms",
  "content": "Yes, I can make the appointment on Tuesday at 2pm. See you then!",
  "metadata": {
    "from": "+15551234567",
    "to": "+15559876543",
    "date": "2025-11-06T16:00:00Z"
  }
}
```

### Phone Call Examples

#### Support Call
```json
{
  "channel": "phone",
  "content": "Agent: Hello, thank you for calling support. How can I assist you today?\nCustomer: Hi, I'm having trouble logging into my account. I keep getting an error message.\nAgent: I can help with that. Can you tell me what error message you're seeing?\nCustomer: It says 'Invalid credentials' but I know my password is correct.\nAgent: Let me reset your password. What's the email associated with your account?\nCustomer: jane.smith@example.com\nAgent: I've sent a password reset email. You should receive it within a few minutes.\nCustomer: Great, thank you so much!\nAgent: You're welcome. Is there anything else I can help with?\nCustomer: No, that's all. Thanks again!",
  "metadata": {
    "from": "+15551234567",
    "to": "+15559876543",
    "date": "2025-11-06T17:00:00Z",
    "duration": 240
  }
}
```

---

## Verification Steps

After executing all test scenarios (01-07), verify the following in the UI:

### 1. Check Dashboard
- Navigate to `http://localhost:5173/`
- Verify all 6 customers appear in the customer list (messages 06 & 07 are the same customer)
- **Critical**: Verify badges are correct:
  - At-Risk customer shows "At-Risk" badge (not "Follow-Up")
  - Opportunity customer shows "Opportunity" badge
  - Lead customer shows "Lead" badge
  - Follow-Up customer shows "Follow-Up" badge
  - No-Action customer shows "No-Action" or no badge
- Check that topics are summaries, not just copied from email content

### 2. Check Customer Grouping (Messages 06 & 07)
- Find the customer with email `buyer@testcompany.com`
- Click on the customer to view details
- **Verify**: Customer detail page shows **TWO conversations**
- Both conversations should be listed in conversation history
- Verify both have different timestamps and content

### 3. Check Action Plans
- For each customer, verify action plan badge matches expected badge
- Verify action plan status is "active"
- **Critical**: Verify that only ONE active action plan exists per customer
- If a customer has multiple conversations, only the most recent should have an active action plan

### 4. Check Topics
- Verify `topic` field is a short 2-4 word summary (not full email content)
- Verify `longTopic` is a 1-2 sentence summary (not just copied from conversation)
- Topics should be AI-generated summaries, not verbatim copies

### 5. Check Database (Optional)
```sql
-- Check customers and their badges
SELECT c.id, c.name, c.email, ap.badge, ap.status, ap.created_at
FROM customers c
LEFT JOIN action_plans ap ON ap.customer_id = c.id AND ap.status = 'active'
ORDER BY c.created_at DESC
LIMIT 10;

-- Check customer grouping (should show 2 conversations for buyer@testcompany.com)
SELECT c.email, COUNT(conv.id) as conversation_count
FROM customers c
JOIN conversations conv ON conv.customer_id = c.id
WHERE c.email = 'buyer@testcompany.com'
GROUP BY c.email;

-- Verify only one active action plan per customer
SELECT customer_id, COUNT(*) as active_plans
FROM action_plans
WHERE status = 'active'
GROUP BY customer_id
HAVING COUNT(*) > 1;
-- This query should return 0 rows (no customer should have multiple active plans)
```

---

## Troubleshooting

### Issue: "Missing X-API-Key header"
**Solution**: 
- Check that `api_key` variable is set in your Postman environment
- Verify the environment is selected (top right dropdown)
- Check the request headers include `X-API-Key: {{api_key}}`

### Issue: "Invalid or expired API key"
**Solution**:
- Verify your API key is correct (copy from UI again)
- Check if API key has expired
- Ensure you're using the key from the correct organization

### Issue: Rate limit errors
**Solution**:
- Wait for the rate limit window to reset (check `X-RateLimit-Reset` header)
- Use a different API key for testing
- Reduce request frequency

### Issue: LLM analysis fails
**Solution**:
- Check `OPENAI_API_KEY` is set in your `.env` file
- Verify OpenAI API key is valid and has credits
- Check server logs for LLM errors
- The system should fall back to basic analysis if LLM fails

### Issue: Customer not matching
**Solution**:
- Verify email/phone format matches exactly (case-insensitive for email)
- Check phone numbers are normalized (formatting differences are handled)
- For name matching, ensure names are similar enough for fuzzy matching

### Issue: No action plan created
**Solution**:
- Action plans are only created if LLM recommends an action
- Check LLM response in server logs
- Some communications may not require action plans

---

## Testing Checklist

Use this checklist to ensure comprehensive testing:

- [ ] API key authentication works
- [ ] Invalid API key returns 401
- [ ] Missing API key returns 401
- [ ] Email ingestion creates customer
- [ ] Email ingestion creates conversation
- [ ] Email ingestion creates action plan
- [ ] Customer matching by email works
- [ ] Customer matching by phone works
- [ ] SMS ingestion works
- [ ] Phone call ingestion works
- [ ] Voice message ingestion works
- [ ] Invalid channel returns 400
- [ ] Rate limiting headers are present
- [ ] Data appears correctly in UI
- [ ] Multiple conversations link to same customer
- [ ] Action plans have correct status
- [ ] LLM analysis generates insights
- [ ] Fallback analysis works if LLM fails

---

## Next Steps

After completing Postman testing:

1. **UI Testing**: Test the full user flows in the browser
2. **Integration Testing**: Test end-to-end scenarios
3. **Load Testing**: Test with high volume of requests
4. **Error Scenarios**: Test edge cases and error recovery

See `TESTING_INSTRUCTIONS.md` for comprehensive testing guide.

