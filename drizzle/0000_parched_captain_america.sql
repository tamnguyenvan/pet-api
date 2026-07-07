CREATE SCHEMA IF NOT EXISTS "extensions";--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";--> statement-breakpoint
SET search_path = public, extensions;--> statement-breakpoint
CREATE TYPE "public"."app_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."chat_role" AS ENUM('user', 'assistant', 'system');--> statement-breakpoint
CREATE TYPE "public"."document_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."feedback_rating" AS ENUM('positive', 'negative', 'neutral');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('free', 'pro', 'business');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trialing', 'active', 'past_due', 'canceled');--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid,
	"name" text NOT NULL,
	"key_prefix" text NOT NULL,
	"key_hash" text NOT NULL,
	"scopes" text[] DEFAULT ARRAY['pet:read']::text[] NOT NULL,
	"monthly_limit" integer DEFAULT 10000 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"avatar_url" text,
	"role" "app_role" DEFAULT 'user' NOT NULL,
	"plan" "subscription_plan" DEFAULT 'free' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assistant_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"rating" "feedback_rating" NOT NULL,
	"notes" text,
	"reviewed_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"role" "chat_role" NOT NULL,
	"content" text NOT NULL,
	"citations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"clerk_user_id" text,
	"visitor_id" text,
	"topic" text DEFAULT 'support' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"chunk_index" integer NOT NULL,
	"content" text NOT NULL,
	"token_count" integer DEFAULT 0 NOT NULL,
	"embedding" extensions.vector(1536),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "app_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_members_organization_id_user_id_pk" PRIMARY KEY("organization_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" text,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"organization_id" uuid,
	"plan" "subscription_plan" DEFAULT 'free' NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"monthly_request_limit" integer DEFAULT 10000 NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"category" text DEFAULT 'docs' NOT NULL,
	"source" text DEFAULT 'admin' NOT NULL,
	"body" text NOT NULL,
	"status" "document_status" DEFAULT 'published' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"uploaded_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_key_id" uuid,
	"user_id" uuid,
	"organization_id" uuid,
	"endpoint" text NOT NULL,
	"method" text NOT NULL,
	"status_code" integer NOT NULL,
	"latency_ms" integer NOT NULL,
	"request_id" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assistant_feedback" ADD CONSTRAINT "assistant_feedback_message_id_chat_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."chat_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assistant_feedback" ADD CONSTRAINT "assistant_feedback_reviewed_by_user_id_app_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."app_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_document_id_support_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."support_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_created_by_user_id_app_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."app_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_documents" ADD CONSTRAINT "support_documents_uploaded_by_user_id_app_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."app_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "api_keys_user_id_idx" ON "api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "api_keys_organization_id_idx" ON "api_keys" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "api_keys_key_hash_idx" ON "api_keys" USING btree ("key_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "app_users_clerk_user_id_idx" ON "app_users" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "app_users_email_idx" ON "app_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "app_users_role_idx" ON "app_users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "assistant_feedback_message_id_idx" ON "assistant_feedback" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "assistant_feedback_rating_idx" ON "assistant_feedback" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "chat_messages_session_id_idx" ON "chat_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "chat_messages_created_at_idx" ON "chat_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "chat_sessions_user_id_idx" ON "chat_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chat_sessions_visitor_id_idx" ON "chat_sessions" USING btree ("visitor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "document_chunks_document_id_chunk_index_idx" ON "document_chunks" USING btree ("document_id","chunk_index");--> statement-breakpoint
CREATE INDEX "document_chunks_document_id_idx" ON "document_chunks" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "document_chunks_embedding_hnsw_idx" ON "document_chunks" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "organization_members_user_id_idx" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_clerk_org_id_idx" ON "organizations" USING btree ("clerk_org_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_organization_id_idx" ON "subscriptions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "support_documents_slug_idx" ON "support_documents" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "support_documents_status_idx" ON "support_documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "usage_events_api_key_id_idx" ON "usage_events" USING btree ("api_key_id");--> statement-breakpoint
CREATE INDEX "usage_events_user_id_created_at_idx" ON "usage_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "usage_events_endpoint_idx" ON "usage_events" USING btree ("endpoint");--> statement-breakpoint
CREATE OR REPLACE FUNCTION "public"."set_updated_at"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	NEW.updated_at = now();
	RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "app_users_set_updated_at" BEFORE UPDATE ON "app_users" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();--> statement-breakpoint
CREATE TRIGGER "api_keys_set_updated_at" BEFORE UPDATE ON "api_keys" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();--> statement-breakpoint
CREATE TRIGGER "organizations_set_updated_at" BEFORE UPDATE ON "organizations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();--> statement-breakpoint
CREATE TRIGGER "subscriptions_set_updated_at" BEFORE UPDATE ON "subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();--> statement-breakpoint
CREATE TRIGGER "support_documents_set_updated_at" BEFORE UPDATE ON "support_documents" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();--> statement-breakpoint
CREATE TRIGGER "chat_sessions_set_updated_at" BEFORE UPDATE ON "chat_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();--> statement-breakpoint
ALTER TABLE "app_users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "organization_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "api_keys" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "usage_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "support_documents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "document_chunks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "chat_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "chat_messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "assistant_feedback" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
GRANT USAGE ON SCHEMA "public" TO "service_role";--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
	"app_users",
	"organizations",
	"organization_members",
	"subscriptions",
	"api_keys",
	"usage_events",
	"support_documents",
	"document_chunks",
	"chat_sessions",
	"chat_messages",
	"assistant_feedback"
TO "service_role";--> statement-breakpoint
CREATE OR REPLACE FUNCTION "public"."match_document_chunks"(
	query_embedding extensions.vector(1536),
	match_threshold float,
	match_count int,
	filter_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
	chunk_id uuid,
	document_id uuid,
	title text,
	content text,
	similarity float,
	metadata jsonb
)
LANGUAGE sql
STABLE
SET search_path = public, extensions
AS $$
	SELECT
		document_chunks.id AS chunk_id,
		support_documents.id AS document_id,
		support_documents.title,
		document_chunks.content,
		1 - (document_chunks.embedding <=> query_embedding) AS similarity,
		document_chunks.metadata
	FROM document_chunks
	INNER JOIN support_documents ON support_documents.id = document_chunks.document_id
	WHERE support_documents.status = 'published'
		AND document_chunks.embedding IS NOT NULL
		AND (
			filter_metadata = '{}'::jsonb
			OR document_chunks.metadata @> filter_metadata
			OR support_documents.metadata @> filter_metadata
		)
		AND 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
	ORDER BY document_chunks.embedding <=> query_embedding ASC
	LIMIT LEAST(match_count, 20);
$$;--> statement-breakpoint
REVOKE EXECUTE ON FUNCTION "public"."set_updated_at"() FROM PUBLIC, "anon", "authenticated";--> statement-breakpoint
REVOKE EXECUTE ON FUNCTION "public"."match_document_chunks"(extensions.vector, double precision, integer, jsonb) FROM PUBLIC, "anon", "authenticated";--> statement-breakpoint
GRANT EXECUTE ON FUNCTION "public"."set_updated_at"() TO "service_role";--> statement-breakpoint
GRANT EXECUTE ON FUNCTION "public"."match_document_chunks"(extensions.vector, double precision, integer, jsonb) TO "service_role";--> statement-breakpoint
INSERT INTO "support_documents" ("title", "slug", "category", "source", "body", "status", "metadata")
VALUES
	(
		'API Authentication',
		'api-authentication',
		'docs',
		'seed',
		'PetAPI Cloud uses bearer API keys. Create keys from the dashboard, label them by environment, send them in the Authorization header, and rotate or revoke them when needed. Production requests should keep keys server-side and never expose secret keys in browser code.',
		'published',
		'{"topic":"api-keys"}'::jsonb
	),
	(
		'Pricing and Limits',
		'pricing-and-limits',
		'billing',
		'seed',
		'The Free plan includes 10,000 requests per month, Pro includes 500,000 requests per month, and Business supports custom request limits, SLA options, team roles, and dedicated support. Rate-limit responses include reset metadata.',
		'published',
		'{"topic":"pricing"}'::jsonb
	),
	(
		'RAG Support Assistant',
		'rag-support-assistant',
		'ai-support',
		'seed',
		'The support assistant retrieves relevant chunks from product documentation stored in Supabase pgvector, sends the context to an OpenAI-compatible chat model, and stores conversation history and citations for review.',
		'published',
		'{"topic":"rag"}'::jsonb
	),
	(
		'Admin Knowledge Base',
		'admin-knowledge-base',
		'admin',
		'seed',
		'Admins can upload or edit documentation, re-index document chunks, monitor support questions, and review assistant answer quality. Re-indexing regenerates chunks and embeddings for vector retrieval.',
		'published',
		'{"topic":"admin"}'::jsonb
	)
ON CONFLICT ("slug") DO NOTHING;
