DO $$ BEGIN
    CREATE TYPE "team_status" AS ENUM ('active', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "team_member_role" AS ENUM ('owner', 'member', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "board_type" AS ENUM ('kanban', 'list');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "board_visibility" AS ENUM ('org', 'team');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "board_permission_mode" AS ENUM ('edit', 'view');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "board_card_type" AS ENUM ('lead', 'case', 'deal', 'task', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "board_card_status" AS ENUM ('active', 'done', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "routing_condition_type" AS ENUM ('badge', 'intent', 'urgency', 'customer_segment', 'channel', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "teams" (
    "id" text PRIMARY KEY,
    "org_id" text NOT NULL,
    "name" text NOT NULL,
    "description" text,
    "slug" text,
    "status" "team_status" DEFAULT 'active' NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "is_assignable" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT teams_org_id_orgs_id_fk FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS "team_members" (
    "id" text PRIMARY KEY,
    "team_id" text NOT NULL,
    "user_id" text NOT NULL,
    "role" "team_member_role" DEFAULT 'member' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "removed_at" timestamp,
    CONSTRAINT team_members_team_id_teams_id_fk FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE cascade ON UPDATE no action,
    CONSTRAINT team_members_user_id_users_id_fk FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS "boards" (
    "id" text PRIMARY KEY,
    "org_id" text NOT NULL,
    "name" text NOT NULL,
    "type" "board_type" DEFAULT 'kanban' NOT NULL,
    "slug" text,
    "description" text,
    "card_type" "board_card_type" DEFAULT 'custom' NOT NULL,
    "visibility" "board_visibility" DEFAULT 'org' NOT NULL,
    "default_team_id" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "archived_at" timestamp,
    CONSTRAINT boards_org_id_orgs_id_fk FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE cascade ON UPDATE no action,
    CONSTRAINT boards_default_team_id_teams_id_fk FOREIGN KEY ("default_team_id") REFERENCES "teams"("id") ON DELETE set null ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS "board_team_permissions" (
    "id" text PRIMARY KEY,
    "board_id" text NOT NULL,
    "team_id" text NOT NULL,
    "mode" "board_permission_mode" DEFAULT 'view' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT board_team_permissions_board_id_boards_id_fk FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE cascade ON UPDATE no action,
    CONSTRAINT board_team_permissions_team_id_teams_id_fk FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE IF NOT EXISTS "board_columns" (
    "id" text PRIMARY KEY,
    "board_id" text NOT NULL,
    "name" text NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    "wip_limit" integer,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT board_columns_board_id_boards_id_fk FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE cascade ON UPDATE no action
);

ALTER TABLE "action_plans"
    ADD COLUMN IF NOT EXISTS "assignee_team_id" text,
    ADD COLUMN IF NOT EXISTS "routing_metadata" jsonb;

ALTER TABLE "action_plans"
    ADD CONSTRAINT action_plans_assignee_team_id_teams_id_fk FOREIGN KEY ("assignee_team_id") REFERENCES "teams"("id") ON DELETE set null ON UPDATE no action;

CREATE TABLE IF NOT EXISTS "board_cards" (
    "id" text PRIMARY KEY,
    "board_id" text NOT NULL,
    "column_id" text NOT NULL,
    "action_plan_id" text,
    "customer_id" text,
    "title" text NOT NULL,
    "description" text,
    "type" "board_card_type" DEFAULT 'custom' NOT NULL,
    "status" "board_card_status" DEFAULT 'active' NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    "due_date" timestamp,
    "priority" "task_priority",
    "assignee_user_id" text,
    "assignee_team_id" text,
    "metadata" jsonb,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "completed_at" timestamp,
    "archived_at" timestamp,
    CONSTRAINT board_cards_board_id_boards_id_fk FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE cascade ON UPDATE no action,
    CONSTRAINT board_cards_column_id_board_columns_id_fk FOREIGN KEY ("column_id") REFERENCES "board_columns"("id") ON DELETE cascade ON UPDATE no action,
    CONSTRAINT board_cards_action_plan_id_action_plans_id_fk FOREIGN KEY ("action_plan_id") REFERENCES "action_plans"("id") ON DELETE set null ON UPDATE no action,
    CONSTRAINT board_cards_customer_id_customers_id_fk FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE set null ON UPDATE no action,
    CONSTRAINT board_cards_assignee_user_id_users_id_fk FOREIGN KEY ("assignee_user_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action,
    CONSTRAINT board_cards_assignee_team_id_teams_id_fk FOREIGN KEY ("assignee_team_id") REFERENCES "teams"("id") ON DELETE set null ON UPDATE no action
);

ALTER TABLE "tasks"
    ADD COLUMN IF NOT EXISTS "assignee_team_id" text,
    ADD COLUMN IF NOT EXISTS "board_card_id" text;

ALTER TABLE "tasks"
    ADD CONSTRAINT tasks_assignee_team_id_teams_id_fk FOREIGN KEY ("assignee_team_id") REFERENCES "teams"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "tasks"
    ADD CONSTRAINT tasks_board_card_id_board_cards_id_fk FOREIGN KEY ("board_card_id") REFERENCES "board_cards"("id") ON DELETE set null ON UPDATE no action;

CREATE TABLE IF NOT EXISTS "routing_rules" (
    "id" text PRIMARY KEY,
    "org_id" text NOT NULL,
    "name" text NOT NULL,
    "channel" "channel",
    "condition_type" "routing_condition_type" NOT NULL,
    "condition_value" text,
    "target_team_id" text NOT NULL,
    "target_board_id" text,
    "target_column_id" text,
    "priority" integer DEFAULT 100 NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "metadata" jsonb,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT routing_rules_org_id_orgs_id_fk FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE cascade ON UPDATE no action,
    CONSTRAINT routing_rules_target_team_id_teams_id_fk FOREIGN KEY ("target_team_id") REFERENCES "teams"("id") ON DELETE cascade ON UPDATE no action,
    CONSTRAINT routing_rules_target_board_id_boards_id_fk FOREIGN KEY ("target_board_id") REFERENCES "boards"("id") ON DELETE set null ON UPDATE no action,
    CONSTRAINT routing_rules_target_column_id_board_columns_id_fk FOREIGN KEY ("target_column_id") REFERENCES "board_columns"("id") ON DELETE set null ON UPDATE no action
);
