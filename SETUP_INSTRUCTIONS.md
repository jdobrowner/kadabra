# Setup Instructions

Complete guide to setting up all services and dependencies for the Kadabra Demo application, from Vercel to databases to OAuth.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Vercel Setup](#vercel-setup)
3. [Database Setup](#database-setup)
4. [Google OAuth Setup](#google-oauth-setup)
5. [Environment Variables](#environment-variables)
6. [Local Development Setup](#local-development-setup)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** for version control
- A **Google account** (free account works, no business account needed)
- An **OpenAI API key** ([Get one here](https://platform.openai.com/api-keys))
- A **Vercel account** ([Sign up free](https://vercel.com/signup))

---

## Vercel Setup

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com) and sign up (or sign in)
2. Connect your GitHub/GitLab/Bitbucket account (optional but recommended)

### Step 2: Create a New Project

1. In the Vercel dashboard, click **"Add New..."** → **"Project"**
2. Import your repository (or create a new one)
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `kadabra-demo` (if your repo has multiple projects)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Set Up Postgres Database

Vercel offers integrations with several Postgres providers. **We recommend Neon** (serverless Postgres) for the best Vercel integration experience.

#### Option A: Neon (Recommended)

1. In your Vercel project dashboard, go to the **Storage** tab
2. Click **"Create Database"**
3. Select **"Neon"** from the options
4. Choose an integration mode:
   - **Create New Neon Account** (recommended for first-time users) - Billing managed through Vercel
   - **Link Existing Neon Account** - If you already have a Neon account
5. Configure the database:
   - Select a region (choose closest to your users)
   - Choose a plan (Free tier is available for development)
   - Provide a database name (e.g., `kadabra-demo-db`)
6. Click **"Create"** or **"Connect"**
7. Once created, Vercel automatically adds the `DATABASE_URL` environment variable to your project
8. **For local development**, copy the connection string:
   - In Vercel: Go to your project → **Settings** → **Environment Variables**
   - Find `DATABASE_URL` and copy its value
   - Add it to your local `.env` file as `POSTGRES_URL`:
     ```bash
     POSTGRES_URL=<paste the DATABASE_URL value here>
     ```
   - **Note**: The codebase uses `POSTGRES_URL`, while Vercel provides `DATABASE_URL`. You can use the same connection string value for both.

> **Note**: Neon connection string format: `postgres://user:password@host.neon.tech/dbname?sslmode=require`

---

## Database Setup

For detailed database setup instructions, see [DATABASE_SETUP.md](./DATABASE_SETUP.md).

### Quick Setup Summary

1. **Set up environment variables** (see [Environment Variables](#environment-variables) section)

2. **Push schema to database**:
   ```bash
   npm run db:push
   ```
   This creates all tables, enums, and relationships.

3. **Seed with sample data** (optional, for testing):
   ```bash
   npm run db:seed
   ```

4. **Verify setup** (optional):
   ```bash
   npm run db:studio
   ```
   This opens Drizzle Studio at `http://localhost:4983` where you can browse your database.

### Database Schema Overview

The application uses the following main tables:
- `orgs` - Organizations (multi-tenancy)
- `users` - User accounts
- `customers` - Customer records
- `conversations` - Communication records
- `action_plans` - Action plans with recommendations
- `action_items` - Items within action plans
- `action_plan_audit_logs` - Audit trail for action plans
- `api_keys` - API keys for integrations
- `invitations` - User invitations
- `tasks`, `calendar_events`, `communications`, `last_communications` - Additional data tables

---

## Google OAuth Setup

For detailed OAuth setup instructions, see [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md).

### Quick Setup Summary

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project (or use existing)

2. **Configure OAuth Consent Screen**:
   - Navigate to **APIs & Services** > **OAuth consent screen**
   - Select **External**
   - Fill in app name, support email, developer email
   - Add scopes: `userinfo.email`, `userinfo.profile`
   - Add test users (your email addresses)

3. **Create OAuth Credentials**:
   - Navigate to **APIs & Services** > **Credentials**
   - Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
   - Select **"Web application"**
   - Add authorized redirect URIs:
     - Local: `http://localhost:5173/api/auth/google/callback`
     - Production: `https://yourdomain.com/api/auth/google/callback`
   - Copy **Client ID** and **Client Secret**

4. **Update environment variables** (see below)

---

## Environment Variables

Create a `.env` file in the root of your project:

```bash
# Database
POSTGRES_URL=postgres://default:password@host:port/verceldb?sslmode=require

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:5173/api/auth/google/callback

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:5173

# JWT Secret (generate a random 32+ character string)
JWT_SECRET=your-random-secret-key-minimum-32-characters-long

# OpenAI API Key (for LLM analysis)
OPENAI_API_KEY=sk-your-openai-api-key-here

# API Key Encryption Key (optional, for viewing/copying API keys)
# If not set, a default key will be used (NOT recommended for production)
API_KEY_ENCRYPTION_KEY=your-secure-32-character-encryption-key-here
```

### Generating a JWT Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### Environment Variables for Production (Vercel)

1. In your Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Add each variable:
   - `POSTGRES_URL` - **Important**: Copy the value from `DATABASE_URL` (Vercel automatically adds `DATABASE_URL` when you create a Neon database, but the codebase uses `POSTGRES_URL`). 
     - Click on the `DATABASE_URL` variable in Vercel
     - Copy its value
     - Create a new variable called `POSTGRES_URL` with the same value
     - Select the appropriate environments (Production, Preview, Development)
   - `GOOGLE_CLIENT_ID` - From Google Cloud Console
   - `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
   - `GOOGLE_REDIRECT_URI` - Your production callback URL (e.g., `https://yourdomain.vercel.app/api/auth/google/callback`)
   - `FRONTEND_URL` - Your production frontend URL (e.g., `https://yourdomain.vercel.app`)
   - `JWT_SECRET` - Generate a new secret for production
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `API_KEY_ENCRYPTION_KEY` - (Optional) Generate a secure encryption key for API key storage. If not set, a default key is used (not recommended for production)

3. **Important**: Select the appropriate environments (Production, Preview, Development) for each variable

---

## Local Development Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd kadabra-demo

# Install dependencies
npm install
```

### Step 2: Configure Environment Variables

1. Create `.env` file in the root directory:
   ```bash
   cp .env.example .env  # If .env.example exists, or create manually
   ```

2. Fill in all required environment variables (see [Environment Variables](#environment-variables))

### Step 3: Set Up Database

```bash
# Push schema to database
npm run db:push

# Seed with sample data (optional)
npm run db:seed
```

### Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Step 5: Verify Setup

1. **Test OAuth**: Visit `http://localhost:5173/signin` and click "Sign in with Google"
2. **Test Database**: Use `npm run db:studio` to browse your database
3. **Test API**: See [TESTING_INSTRUCTIONS.md](./TESTING_INSTRUCTIONS.md)

---

## Production Deployment

### Deploying to Vercel

#### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### Option 2: Deploy via GitHub Integration

1. Push your code to GitHub
2. In Vercel dashboard, import your repository
3. Configure environment variables (see above)
4. Deploy automatically on every push to `main` branch

### Post-Deployment Checklist

- [ ] Verify all environment variables are set in Vercel
- [ ] Update `GOOGLE_REDIRECT_URI` to production URL
- [ ] Update `FRONTEND_URL` to production URL
- [ ] Add production redirect URI in Google Cloud Console
- [ ] Test OAuth flow in production
- [ ] Test database connection
- [ ] Test API endpoints
- [ ] Verify HTTPS is enabled (Vercel enables this automatically)

### Database Migrations in Production

For production, use migration files instead of `db:push`:

```bash
# Generate migration files
npm run db:generate

# Apply migrations (in production, run this via Vercel CLI or script)
npm run db:migrate
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Problem**: `Error: Connection refused` or `SSL connection required`

**Solutions**:
- Verify `POSTGRES_URL` is correct (copy from Vercel's `DATABASE_URL` environment variable)
- Check that database is accessible from your IP (Neon databases are accessible from anywhere)
- Ensure SSL mode is included: `?sslmode=require`
- For Neon: Make sure you're using the connection string from Vercel's environment variables (not from Neon dashboard directly, as Vercel may use connection pooling)

#### 2. OAuth Redirect URI Mismatch

**Problem**: `redirect_uri_mismatch` error

**Solutions**:
- Ensure redirect URI in Google Cloud Console **exactly matches** `GOOGLE_REDIRECT_URI`
- Check for trailing slashes
- Verify `http` vs `https`
- Verify port numbers (5173 for local, none for production)

#### 3. JWT Token Errors

**Problem**: `Invalid token` or `Unauthorized` errors

**Solutions**:
- Verify `JWT_SECRET` is set correctly
- Ensure `JWT_SECRET` is at least 32 characters
- Check that token is being sent in `Authorization` header
- Verify token format: `Bearer <token>`

#### 4. OpenAI API Errors

**Problem**: LLM analysis fails

**Solutions**:
- Verify `OPENAI_API_KEY` is valid
- Check API key has sufficient credits
- Verify API key has access to `gpt-4o-mini` model
- Check rate limits (see [TESTING_INSTRUCTIONS.md](./TESTING_INSTRUCTIONS.md))

#### 5. Environment Variables Not Loading

**Problem**: `undefined` environment variables

**Solutions**:
- Restart development server after adding `.env` file
- Verify `.env` file is in project root
- Check variable names match exactly (case-sensitive)
- For Vercel, ensure variables are set in dashboard and environment is selected

#### 6. Build Failures

**Problem**: Build fails on Vercel

**Solutions**:
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure Node.js version is compatible (check `package.json` engines)
- Check for TypeScript errors: `npm run build` locally

### Getting Help

1. Check existing documentation:
   - [DATABASE_SETUP.md](./DATABASE_SETUP.md)
   - [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)
   - [TESTING_INSTRUCTIONS.md](./TESTING_INSTRUCTIONS.md)

2. Review application logs:
   - Local: Check terminal output
   - Vercel: Check deployment logs and function logs

3. Verify setup step by step:
   - Database connection
   - OAuth credentials
   - Environment variables
   - API keys

---

## Next Steps

After setup is complete:

1. **Test the application**: See [TESTING_INSTRUCTIONS.md](./TESTING_INSTRUCTIONS.md)
2. **Create API keys**: Use the UI (Settings → API Keys) or tRPC
3. **Invite users**: Use the UI (Settings → Invitations) or tRPC
4. **Test ingestion**: Use the `/api/ingest` endpoint with your API key

---

## Security Best Practices

1. **Never commit secrets**:
   - `.env` should be in `.gitignore`
   - Use environment variables for all secrets

2. **Use strong secrets**:
   - `JWT_SECRET` should be 32+ random characters
   - Rotate secrets periodically

3. **Production security**:
   - Use HTTPS (Vercel enables this automatically)
   - Set secure cookie flags
   - Implement rate limiting (already included)
   - Review API key permissions regularly

4. **Database security**:
   - Use connection pooling
   - Limit database access to necessary IPs
   - Regularly update database credentials

5. **OAuth security**:
   - Keep client secret secure
   - Use HTTPS for redirect URIs
   - Regularly review OAuth scopes

---

## Summary

This setup guide covers:
- ✅ Vercel project and database setup
- ✅ Google OAuth configuration
- ✅ Environment variable configuration
- ✅ Local development setup
- ✅ Production deployment
- ✅ Troubleshooting common issues

For detailed testing instructions, see [TESTING_INSTRUCTIONS.md](./TESTING_INSTRUCTIONS.md).

