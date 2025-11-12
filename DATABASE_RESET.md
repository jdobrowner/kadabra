# Database Reset Guide

Complete guide for resetting database data in the Kadabra Demo application.

## Table of Contents

1. [Quick Reset (All Data)](#quick-reset-all-data)
2. [Selective Reset (Preserve Orgs/Users)](#selective-reset-preserve-orgsusers)
3. [Schema Reset (Full Rebuild)](#schema-reset-full-rebuild)
4. [Troubleshooting](#troubleshooting)

---

## Quick Reset (All Data)

This will delete ALL data from the database, including organizations and users. Use this when you want a completely fresh start.

### Option A: Using SQL (Recommended)

Connect to your database and run:

```sql
-- Truncate all data tables (preserves schema)
TRUNCATE TABLE 
  action_plan_audit_logs,
  action_items,
  action_plans,
  communications,
  conversations,
  last_communications,
  customers,
  api_keys,
  invitations,
  users,
  orgs
CASCADE;
```

**Note**: The `CASCADE` option ensures foreign key constraints are handled properly.

### Option B: Using Drizzle Studio

1. Start Drizzle Studio:
   ```bash
   npm run db:studio
   ```

2. Navigate to `http://localhost:4983`

3. For each table, click the table name → Click "Delete All" or manually delete rows

### Option C: Using psql Command Line

```bash
# Connect to your database
psql $POSTGRES_URL

# Run the TRUNCATE command
TRUNCATE TABLE 
  action_plan_audit_logs,
  action_items,
  action_plans,
  communications,
  conversations,
  last_communications,
  customers,
  api_keys,
  invitations,
  users,
  orgs
CASCADE;
```

---

## Selective Reset (Preserve Orgs/Users)

This will delete customer data but keep your organizations and user accounts. Useful for testing with fresh customer data while maintaining your login.

### Using SQL

```sql
-- Delete customer-related data only
TRUNCATE TABLE 
  action_plan_audit_logs,
  action_items,
  action_plans,
  communications,
  conversations,
  last_communications,
  customers
CASCADE;

-- Note: API keys are preserved (they're linked to orgs)
-- If you want to delete API keys too, add: api_keys
```

### What Gets Preserved

- ✅ Organizations (`orgs` table)
- ✅ Users (`users` table)
- ✅ API Keys (`api_keys` table)
- ✅ Invitations (`invitations` table)

### What Gets Deleted

- ❌ Customers
- ❌ Conversations
- ❌ Action Plans
- ❌ Action Items
- ❌ Communications
- ❌ Last Communications
- ❌ Action Plan Audit Logs

---

## Schema Reset (Full Rebuild)

This will drop and recreate all tables. **WARNING**: This deletes ALL data including schema structure.

### Using Drizzle Push

```bash
# This will drop and recreate all tables
npm run db:push
```

**Note**: `db:push` will:
- Drop existing tables
- Recreate tables with current schema
- **All data will be lost**

### When to Use

- After schema changes that require table recreation
- When you want to ensure schema matches code exactly
- During development when you don't care about data

---

## Reset Specific Tables

If you only want to reset specific tables:

```sql
-- Reset only customers and related data
TRUNCATE TABLE customers CASCADE;

-- Reset only conversations
TRUNCATE TABLE conversations CASCADE;

-- Reset only action plans
TRUNCATE TABLE action_plans CASCADE;
```

**Note**: Using `CASCADE` automatically handles foreign key relationships.

---

## After Reset

### 1. Re-seed Sample Data (Optional)

If you want sample data for testing:

```bash
npm run db:seed
```

### 2. Re-authenticate

After resetting users, you'll need to:
- Sign out of the application
- Sign in again with Google OAuth
- Your user account will be recreated

### 3. Recreate API Keys

If you reset the `api_keys` table:
- Go to Settings → API Keys
- Create new API keys
- Update your Postman environment variables

---

## Troubleshooting

### Error: "cannot truncate a table referenced in a foreign key constraint"

**Solution**: Use `CASCADE` option:
```sql
TRUNCATE TABLE table_name CASCADE;
```

### Error: "permission denied"

**Solution**: Ensure your database user has TRUNCATE permissions. For managed databases (Neon, Supabase), this should work automatically.

### Error: "relation does not exist"

**Solution**: Check that you're connected to the correct database and that tables exist:
```sql
\dt  -- List all tables (psql)
```

### Data Still Appears After Reset

**Possible Causes**:
1. You're connected to a different database
2. Transaction wasn't committed (run `COMMIT;` in psql)
3. Caching in the application (restart the dev server)

**Solution**:
```bash
# Restart the development server
npm run dev
```

---

## Best Practices

1. **Backup First**: Before major resets, export important data:
   ```bash
   pg_dump $POSTGRES_URL > backup.sql
   ```

2. **Use Transactions**: Wrap TRUNCATE in a transaction for safety:
   ```sql
   BEGIN;
   TRUNCATE TABLE customers CASCADE;
   -- Verify it worked
   SELECT COUNT(*) FROM customers;  -- Should be 0
   COMMIT;  -- Or ROLLBACK if something went wrong
   ```

3. **Test Environment**: Always test reset procedures in a development environment first.

4. **Document Changes**: If you modify the reset process, update this document.

---

## Quick Reference

| Reset Type | Command | Preserves Orgs/Users | Preserves Schema |
|------------|---------|---------------------|------------------|
| Quick Reset | `TRUNCATE TABLE ... CASCADE` | ❌ | ✅ |
| Selective Reset | `TRUNCATE TABLE customers ... CASCADE` | ✅ | ✅ |
| Schema Reset | `npm run db:push` | ❌ | ❌ (recreates) |

---

## Related Documentation

- [Database Setup Guide](./DATABASE_SETUP.md)
- [Testing Instructions](./TESTING_INSTRUCTIONS.md)

