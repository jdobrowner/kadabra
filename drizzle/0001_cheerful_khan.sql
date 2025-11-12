DO $$ BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_type WHERE typname = 'ai_chat_role'
	) THEN
		CREATE TYPE "public"."ai_chat_role" AS ENUM('user', 'assistant');
	END IF;
END $$;
--> statement-breakpoint
CREATE TABLE "ai_agent_chats" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_message_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_agent_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"chat_id" text NOT NULL,
	"role" "ai_chat_role" NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_agent_chats" ADD CONSTRAINT "ai_agent_chats_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agent_chats" ADD CONSTRAINT "ai_agent_chats_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agent_chats" ADD CONSTRAINT "ai_agent_chats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_agent_messages" ADD CONSTRAINT "ai_agent_messages_chat_id_ai_agent_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."ai_agent_chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_plans" ADD COLUMN "recommendation" text;
UPDATE "action_plans" SET "recommendation" = COALESCE("what_to_do", 'Recommendation pending') WHERE "recommendation" IS NULL;
ALTER TABLE "action_plans" ALTER COLUMN "recommendation" SET NOT NULL;