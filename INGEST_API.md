# Communication Ingestion API

This document describes the communication ingestion endpoint that processes incoming communications (email, SMS, transcribed calls, voice messages), analyzes them with an LLM, and creates database records.

## Endpoint

**POST** `/api/ingest`

## Authentication

The endpoint requires API key authentication via the `X-API-Key` header. API keys are scoped to organizations and can only ingest data into their associated organization.

**To create an API key:**
- Use the tRPC endpoint: `trpc.apiKeys.create` (admin or developer only)
- Or use the UI: Settings → API Keys tab (visible to admin and developer users)
- The API key is only shown once upon creation - save it securely
- API keys can optionally have an expiration date

**To list/manage API keys:**
- Use the tRPC endpoints: `trpc.apiKeys.list` and `trpc.apiKeys.delete` (admin or developer only)
- Or use the UI: Settings → API Keys tab

## Request Body

```typescript
{
  channel: 'phone' | 'email' | 'sms' | 'voice-message'  // Required: Communication channel
  content: string                  // Required: Full text content (transcript, email body, SMS thread)
  metadata?: {                     // Optional: Additional metadata
    subject?: string               // Email subject
    from?: string                  // Sender email/phone
    to?: string                    // Recipient email/phone
    date?: string                  // ISO 8601 date string
    duration?: number              // Duration in minutes (for calls)
    messageCount?: number          // Number of messages in thread
    messages?: Array<{             // Structured message format (optional)
      role: 'assistant' | 'customer' | 'agent'
      content: string
      timestamp: string
    }>
  }
}
```

## Response

### Success Response (200)

```typescript
{
  success: true
  customerId: string
  conversationId: string
  actionPlanId: string | null
}
```

### Error Response (400/401/404/500)

**401 Unauthorized:**
```typescript
{
  error: "Missing X-API-Key header" | "Invalid or expired API key"
}
```

**400 Bad Request:**
```typescript
{
  error: "Missing required fields: channel, content" | "Invalid channel..."
}
```

**404 Not Found:**
```typescript
{
  error: "Organization not found"
}
```

**500 Internal Server Error:**

```typescript
{
  error: string
  details?: string
}
```

## How It Works

1. **Validation**: Validates required fields and channel type
2. **LLM Analysis**: Sends the communication to OpenAI GPT-4o-mini for analysis
3. **Customer Matching**: Attempts to find existing customer by:
   - Email (case-insensitive)
   - Phone number
   - Name + Company name
4. **Customer Creation**: If no match found, creates a new customer record
5. **Conversation Creation**: Creates a conversation record with:
   - Full transcript
   - AI-generated summary
   - Sentiment analysis
   - Intent classification
   - Key insights
6. **Aggregations**: Updates communication counts and last communication records
7. **Action Plan**: If recommended by LLM, creates:
   - Action plan with badge and recommendations
   - Associated action items

## LLM Analysis Output

The LLM analyzes the communication and extracts:

- **Customer Information**: Name, company, email, phone
- **Conversation Insights**: Summary, sentiment, intent, key insights
- **Action Recommendations**: Badge type, what to do, why, action items
- **Scores**: Risk score (0-100), opportunity score (0-100)

### Badge Types

- `at-risk`: Customer shows signs of churn or dissatisfaction
- `opportunity`: Sales opportunity, upsell, or new business
- `lead`: New potential customer inquiry
- `follow-up`: Needs follow-up but not urgent
- `no-action`: No action needed, informational only

## Example Requests

### Email Example

```bash
curl -X POST http://localhost:5173/api/ingest \
  -H "Content-Type: application/json" \
  -H "X-API-Key: kad_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "channel": "email",
    "content": "Hi, I am having issues with my billing. The charge on my card is incorrect and I need this resolved ASAP. Please contact me.",
    "metadata": {
      "subject": "Billing Issue - Urgent",
      "from": "customer@example.com",
      "to": "support@company.com",
      "date": "2024-01-15T10:30:00Z"
    }
  }'
```

**Note:** The `orgId` is automatically determined from the API key - you no longer need to include it in the request body.

### SMS Example

```bash
curl -X POST http://localhost:5173/api/ingest \
  -H "Content-Type: application/json" \
  -H "X-API-Key: kad_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "channel": "sms",
    "content": "Customer: Hi, I want to cancel my subscription\nAgent: I am sorry to hear that. Can you tell me why?\nCustomer: The service is too expensive and I am not using it much",
    "metadata": {
      "from": "+1234567890",
      "to": "+0987654321",
      "date": "2024-01-15T14:00:00Z",
      "messageCount": 3
    }
  }'
```

### Transcribed Call Example

```bash
curl -X POST http://localhost:5173/api/ingest \
  -H "Content-Type: application/json" \
  -H "X-API-Key: kad_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "channel": "phone",
    "content": "Agent: Hello, thank you for calling. How can I help you today?\nCustomer: Hi, I am interested in your premium plan. Can you tell me more about the features?\nAgent: Absolutely! Our premium plan includes...",
    "metadata": {
      "from": "+1234567890",
      "to": "+0987654321",
      "date": "2024-01-15T09:00:00Z",
      "duration": 15
    }
  }'
```

## Environment Variables

Required:
- `OPENAI_API_KEY`: Your OpenAI API key for LLM analysis

## Error Handling

The endpoint handles various error scenarios:

- **400 Bad Request**: Missing required fields or invalid channel
- **404 Not Found**: Organization not found
- **500 Internal Server Error**: LLM analysis failure, database errors, etc.

Errors are logged to the console for debugging.

## Database Schema Impact

The ingestion endpoint creates/updates records in:

- `customers`: Customer information
- `conversations`: Individual communication records
- `action_plans`: Recommended actions
- `action_items`: Specific action items within action plans
- `communications`: Aggregated communication counts per customer
- `last_communications`: Most recent communication per customer

## Notes

- Customer matching is case-insensitive for emails
- If a customer is found, the record is updated with new information (email, phone, scores) if available
- Action plans are only created if the LLM recommends them
- All timestamps are stored in UTC
- The LLM uses `gpt-4o-mini` for cost efficiency (can be upgraded to `gpt-4o` if needed)

