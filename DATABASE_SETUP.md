# Database Setup Guide

This guide will help you set up the PostgreSQL database for kadabra-demo.

## Prerequisites

- A Vercel Postgres database (or any PostgreSQL database)
- Node.js and npm installed

## Step 1: Get Your Database Connection String

### Option A: Using Neon via Vercel (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project or select an existing one
3. Go to the **Storage** tab
4. Click **Create Database** → Select **Neon**
5. Choose integration mode:
   - **Create New Neon Account** (billing through Vercel)
   - **Link Existing Neon Account** (if you have one)
6. Configure database (region, plan, name)
7. Once created, Vercel automatically adds `DATABASE_URL` to your project environment variables
8. **For local development**: 
   - Go to Vercel project → **Settings** → **Environment Variables**
   - Copy the value of `DATABASE_URL`
   - Add it to your local `.env` file as `POSTGRES_URL` (the codebase uses `POSTGRES_URL` while Vercel provides `DATABASE_URL`)

> **Note**: Neon provides serverless Postgres with a free tier, perfect for Vercel deployments.

### Option B: Using Supabase via Vercel

1. Go to Vercel Dashboard → **Storage** tab
2. Click **Create Database** → Select **Supabase**
3. Follow integration setup
4. Vercel will auto-add `DATABASE_URL` - copy its value to `POSTGRES_URL` in your local `.env` file

### Option C: Using Local PostgreSQL

If you're running PostgreSQL locally:

```bash
# Install PostgreSQL locally (if not already installed)
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Create a database
createdb kadabra_demo

# Connection string format:
# postgresql://username:password@localhost:5432/kadabra_demo
```

## Step 2: Set Up Environment Variables

1. Create a `.env` file in the root of the project:

```bash
cp .env.example .env
```

2. Edit `.env` and add your database connection string:

```env
POSTGRES_URL=postgres://user:password@host:port/database?sslmode=require
OPENAI_API_KEY=your_openai_api_key_here
```

**Note:** The `.env` file is gitignored and will not be committed to version control.

## Step 3: Generate Database Migrations

Generate migration files based on your schema:

```bash
npm run db:generate
```

This will create migration files in the `drizzle/` directory.

## Step 4: Apply Migrations to Database

### Option A: Push Schema Directly (Recommended for Development)

Push the schema directly to your database without migration files:

```bash
npm run db:push
```

This will:
- Create all tables
- Create all enums
- Set up relationships
- Handle schema changes automatically

### Option B: Use Migration Files (Recommended for Production)

Apply migrations using migration files:

```bash
npm run db:migrate
```

## Step 5: Seed the Database

Populate the database with sample data:

```bash
npm run db:seed
```

This will:
- Clear existing data
- Insert mock customers
- Insert mock action plans
- Insert mock conversations
- Insert mock tasks
- Insert mock calendar events
- Insert communications data

## Step 6: Verify Setup

You can use Drizzle Studio to visually inspect your database:

```bash
npm run db:studio
```

This will open a web interface at `http://localhost:4983` where you can:
- Browse tables
- View data
- Edit records
- Run queries

## Troubleshooting

### Connection Errors

If you get connection errors:

1. **Check your POSTGRES_URL format:**
   - Must start with `postgres://` or `postgresql://`
   - Include username, password, host, port, and database name
   - For Vercel Postgres, use the full connection string with SSL parameters

2. **Verify database is accessible:**
   ```bash
   # Test connection (replace with your connection string)
   psql "postgres://user:password@host:port/database?sslmode=require"
   ```

3. **Check environment variables are loaded:**
   - Make sure `.env` file is in the project root
   - Restart your terminal/IDE after creating `.env`

### Migration Issues

If migrations fail:

1. **Check if tables already exist:**
   - Use `db:studio` to see current database state
   - You may need to drop existing tables if schema changed significantly

2. **Reset database (⚠️ WARNING: This deletes all data):**
   ```bash
   # Connect to database and drop all tables
   # Then run migrations again
   npm run db:push
   ```

### Seeding Issues

If seeding fails:

1. **Check for foreign key constraints:**
   - Make sure customers are seeded before action plans
   - Check that customer IDs in mock data match

2. **Verify mock data format:**
   - Check `src/data/mockCustomers.ts` and other mock files
   - Ensure all required fields are present

## Next Steps

Once your database is set up:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. The app will connect to your database automatically
3. API endpoints will use the database for data

## Database Schema

The database includes the following tables:

- **customers** - Customer information
- **action_plans** - Action plans with badges (at-risk, opportunity, lead, follow-up, no-action)
- **action_items** - Items within action plans
- **conversations** - Customer conversations (phone, email, chat, video, sms, ai-call, voice-message)
- **tasks** - Task management
- **calendar_events** - Calendar events
- **communications** - Aggregated communication counts
- **last_communications** - Most recent communication per customer

For detailed schema information, see `src/server/db/schema.ts`.

