# API Documentation

This document provides a consolidated view of all API endpoints for the Kadabra Demo application.

## OpenAPI/Swagger Specification

The complete API specification is available in **`API_DOCUMENTATION.yaml`** (OpenAPI 3.0 format).

### Viewing the API Documentation

You can import the `API_DOCUMENTATION.yaml` file into:

1. **Swagger UI** (Online):
   - Go to [Swagger Editor](https://editor.swagger.io/)
   - File → Import File → Select `API_DOCUMENTATION.yaml`

2. **Postman**:
   - Open Postman
   - Import → File → Select `API_DOCUMENTATION.yaml`
   - Creates a collection with all endpoints

3. **Redoc** (Alternative):
   - Go to [Redoc Demo](https://redocly.github.io/redoc/)
   - Upload `API_DOCUMENTATION.yaml`

4. **VS Code** (with extensions):
   - Install "OpenAPI (Swagger) Editor" extension
   - Open `API_DOCUMENTATION.yaml`

## API Overview

### Base URLs

- **Local Development**: `http://localhost:5173`
- **Production**: `https://your-domain.com` (update in YAML)

### Authentication

The API supports two authentication methods:

1. **API Key Authentication** (for `/api/ingest`)
   - Header: `X-API-Key: kad_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Create keys via UI (Settings → API Keys) or tRPC

2. **JWT Token Authentication** (for tRPC endpoints)
   - Header: `Authorization: Bearer <token>`
   - Obtain token via Google OAuth flow

### Rate Limiting

- **API Key endpoints**: 100 requests/minute per API key
- **LLM endpoints**: 20 requests/minute per organization
- Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## REST API Endpoints

### Communication Ingestion

#### `POST /api/ingest`

Ingests and analyzes communications (email, SMS, phone calls, voice messages).

**Authentication**: API Key (required)

**Request Body**:
```json
{
  "channel": "email",
  "content": "Full text content...",
  "metadata": {
    "subject": "Email subject",
    "from": "sender@example.com",
    "to": "recipient@example.com",
    "date": "2024-01-15T10:30:00Z",
    "duration": 15,
    "messageCount": 3
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "customerId": "customer-123",
  "conversationId": "conversation-456",
  "actionPlanId": "action-plan-789"
}
```

**Error Responses**:
- `400` - Bad request (missing fields, invalid channel)
- `401` - Unauthorized (missing/invalid API key)
- `404` - Organization not found
- `429` - Rate limit exceeded
- `500` - Internal server error

See [INGEST_API.md](./INGEST_API.md) for detailed documentation.

### Authentication

#### `GET /api/auth/google/authorize`

Initiates Google OAuth flow. Redirects to Google's consent screen.

**Query Parameters**:
- `redirect` (optional): URL to redirect after authentication
- `invitation` (optional): Invitation token

**Response**: `302 Redirect` to Google OAuth

#### `GET /api/auth/google/callback`

OAuth callback handler (called by Google). Redirects to frontend with JWT token.

**Query Parameters**:
- `code` (required): Authorization code from Google
- `error` (optional): Error code if authorization failed
- `state` (optional): State parameter

**Response**: `302 Redirect` to frontend with token

See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for setup instructions.

## tRPC Endpoints

The application uses tRPC for type-safe API calls. All tRPC endpoints are available at `/api/trpc/[procedure]`.

**Note**: tRPC endpoints are not included in the OpenAPI spec as they use a different protocol. See the codebase for tRPC router definitions.

### Available tRPC Routers

- `auth.*` - Authentication (getGoogleAuthUrl, me)
- `customers.*` - Customer management
- `actionPlans.*` - Action plan management
- `conversations.*` - Conversation management
- `tasks.*` - Task management
- `calendar.*` - Calendar events
- `dashboard.*` - Dashboard statistics
- `apiKeys.*` - API key management
- `users.*` - User management
- `invitations.*` - Invitation management
- `search.*` - Search functionality
- `aiAgent.*` - AI agent queries

See [API_RESPONSE_DESIGN.md](./API_RESPONSE_DESIGN.md) for detailed tRPC endpoint structures.

## Common Data Types

### Communication Channels
- `phone` - Phone call
- `email` - Email
- `sms` - SMS/text message
- `voice-message` - Voice message

### Badge Types
- `at-risk` - Customer shows signs of churn
- `opportunity` - Sales opportunity
- `lead` - New potential customer
- `follow-up` - Needs follow-up
- `no-action` - No action needed

### Action Plan Status
- `active` - Active (default)
- `completed` - Completed
- `canceled` - Canceled

### Sentiment
- `positive` - Positive sentiment
- `neutral` - Neutral sentiment
- `negative` - Negative sentiment
- `mixed` - Mixed sentiment

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional details (optional)"
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `429` - Rate limit exceeded
- `500` - Internal server error

## Rate Limiting

When rate limits are exceeded, the API returns:

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

With headers:
- `Retry-After: 60` (seconds)
- `X-RateLimit-Limit: 100`
- `X-RateLimit-Remaining: 0`
- `X-RateLimit-Reset: 1642248060` (unix timestamp)

## Examples

### Example 1: Ingest Email

```bash
curl -X POST http://localhost:5173/api/ingest \
  -H "Content-Type: application/json" \
  -H "X-API-Key: kad_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "channel": "email",
    "content": "Hi, I am having issues with my billing.",
    "metadata": {
      "subject": "Billing Issue",
      "from": "customer@example.com",
      "to": "support@company.com",
      "date": "2024-01-15T10:30:00Z"
    }
  }'
```

### Example 2: Ingest SMS

```bash
curl -X POST http://localhost:5173/api/ingest \
  -H "Content-Type: application/json" \
  -H "X-API-Key: kad_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "channel": "sms",
    "content": "Customer: Hi, I want to cancel\nAgent: Can you tell me why?",
    "metadata": {
      "from": "+1234567890",
      "to": "+0987654321",
      "date": "2024-01-15T14:00:00Z",
      "messageCount": 2
    }
  }'
```

### Example 3: Ingest Phone Call

```bash
curl -X POST http://localhost:5173/api/ingest \
  -H "Content-Type: application/json" \
  -H "X-API-Key: kad_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "channel": "phone",
    "content": "Agent: Hello, how can I help?\nCustomer: I am interested in your premium plan.",
    "metadata": {
      "from": "+1234567890",
      "to": "+0987654321",
      "date": "2024-01-15T09:00:00Z",
      "duration": 15
    }
  }'
```

## Testing

See [TESTING_INSTRUCTIONS.md](./TESTING_INSTRUCTIONS.md) for comprehensive testing guides, including Postman collection setup.

## Related Documentation

- [INGEST_API.md](./INGEST_API.md) - Detailed ingestion API documentation
- [API_RESPONSE_DESIGN.md](./API_RESPONSE_DESIGN.md) - tRPC endpoint structures
- [TESTING_INSTRUCTIONS.md](./TESTING_INSTRUCTIONS.md) - API testing guide
- [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) - Setup and configuration

