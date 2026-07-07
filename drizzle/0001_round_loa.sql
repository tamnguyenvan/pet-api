CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'revoked', 'expired');--> statement-breakpoint
CREATE TYPE "public"."rag_file_status" AS ENUM('uploaded', 'indexed', 'failed', 'deleted');--> statement-breakpoint
ALTER TYPE "public"."app_role" ADD VALUE IF NOT EXISTS 'super_admin';--> statement-breakpoint
CREATE TABLE "app_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"role" "app_role" DEFAULT 'admin' NOT NULL,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"clerk_invitation_id" text,
	"invited_by_user_id" uuid,
	"accepted_by_user_id" uuid,
	"expires_at" timestamp with time zone,
	"accepted_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rag_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid,
	"uploaded_by_user_id" uuid,
	"original_file_name" text NOT NULL,
	"storage_bucket" text NOT NULL,
	"storage_path" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"status" "rag_file_status" DEFAULT 'uploaded' NOT NULL,
	"error_message" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app_invitations" ADD CONSTRAINT "app_invitations_invited_by_user_id_app_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."app_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_invitations" ADD CONSTRAINT "app_invitations_accepted_by_user_id_app_users_id_fk" FOREIGN KEY ("accepted_by_user_id") REFERENCES "public"."app_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rag_files" ADD CONSTRAINT "rag_files_document_id_support_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."support_documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rag_files" ADD CONSTRAINT "rag_files_uploaded_by_user_id_app_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."app_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "app_invitations_email_idx" ON "app_invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "app_invitations_status_idx" ON "app_invitations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "app_invitations_invited_by_user_id_idx" ON "app_invitations" USING btree ("invited_by_user_id");--> statement-breakpoint
CREATE INDEX "app_invitations_accepted_by_user_id_idx" ON "app_invitations" USING btree ("accepted_by_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "app_invitations_clerk_invitation_id_idx" ON "app_invitations" USING btree ("clerk_invitation_id");--> statement-breakpoint
CREATE INDEX "rag_files_uploaded_by_user_id_idx" ON "rag_files" USING btree ("uploaded_by_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rag_files_document_id_idx" ON "rag_files" USING btree ("document_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rag_files_storage_bucket_path_idx" ON "rag_files" USING btree ("storage_bucket","storage_path");--> statement-breakpoint
CREATE INDEX "rag_files_status_idx" ON "rag_files" USING btree ("status");--> statement-breakpoint
CREATE TRIGGER "app_invitations_set_updated_at" BEFORE UPDATE ON "app_invitations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();--> statement-breakpoint
CREATE TRIGGER "rag_files_set_updated_at" BEFORE UPDATE ON "rag_files" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();--> statement-breakpoint
ALTER TABLE "app_invitations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "rag_files" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
GRANT USAGE ON TYPE "public"."app_role" TO "service_role";--> statement-breakpoint
GRANT USAGE ON TYPE "public"."invitation_status" TO "service_role";--> statement-breakpoint
GRANT USAGE ON TYPE "public"."rag_file_status" TO "service_role";--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
	"app_invitations",
	"rag_files"
TO "service_role";--> statement-breakpoint
REVOKE ALL ON TABLE
	"app_invitations",
	"rag_files"
FROM "anon", "authenticated";--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'storage') THEN
		INSERT INTO storage.buckets ("id", "name", "public", "file_size_limit")
		VALUES ('rag-uploads', 'rag-uploads', false, 6291456)
		ON CONFLICT ("id") DO UPDATE
		SET
			"public" = false,
			"file_size_limit" = 6291456;
	END IF;
END;
$$;
