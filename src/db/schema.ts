import { relations, sql } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	vector,
} from "drizzle-orm/pg-core";

const metadata = () => jsonb("metadata").$type<Record<string, unknown>>().default(sql`'{}'::jsonb`).notNull();

const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();

export const appRole = pgEnum("app_role", ["user", "admin", "super_admin"]);
export const invitationStatus = pgEnum("invitation_status", ["pending", "accepted", "revoked", "expired"]);
export const ragFileStatus = pgEnum("rag_file_status", ["uploaded", "indexed", "failed", "deleted"]);
export const subscriptionPlan = pgEnum("subscription_plan", ["free", "pro", "business"]);
export const subscriptionStatus = pgEnum("subscription_status", ["trialing", "active", "past_due", "canceled"]);
export const documentStatus = pgEnum("document_status", ["draft", "published", "archived"]);
export const chatRole = pgEnum("chat_role", ["user", "assistant", "system"]);
export const feedbackRating = pgEnum("feedback_rating", ["positive", "negative", "neutral"]);

export const appUsers = pgTable(
	"app_users",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		clerkUserId: text("clerk_user_id").notNull(),
		email: text("email").notNull(),
		name: text("name"),
		avatarUrl: text("avatar_url"),
		role: appRole("role").default("user").notNull(),
		plan: subscriptionPlan("plan").default("free").notNull(),
		createdAt: createdAt(),
		updatedAt: updatedAt(),
	},
	(table) => [
		uniqueIndex("app_users_clerk_user_id_idx").on(table.clerkUserId),
		index("app_users_email_idx").on(table.email),
		index("app_users_role_idx").on(table.role),
	],
);

export const appInvitations = pgTable(
	"app_invitations",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		email: text("email").notNull(),
		role: appRole("role").default("admin").notNull(),
		status: invitationStatus("status").default("pending").notNull(),
		clerkInvitationId: text("clerk_invitation_id"),
		invitedByUserId: uuid("invited_by_user_id").references(() => appUsers.id, { onDelete: "set null" }),
		acceptedByUserId: uuid("accepted_by_user_id").references(() => appUsers.id, { onDelete: "set null" }),
		expiresAt: timestamp("expires_at", { withTimezone: true }),
		acceptedAt: timestamp("accepted_at", { withTimezone: true }),
		metadata: metadata(),
		createdAt: createdAt(),
		updatedAt: updatedAt(),
	},
	(table) => [
		index("app_invitations_email_idx").on(table.email),
		index("app_invitations_status_idx").on(table.status),
		index("app_invitations_invited_by_user_id_idx").on(table.invitedByUserId),
		index("app_invitations_accepted_by_user_id_idx").on(table.acceptedByUserId),
		uniqueIndex("app_invitations_clerk_invitation_id_idx").on(table.clerkInvitationId),
	],
);

export const organizations = pgTable(
	"organizations",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		clerkOrgId: text("clerk_org_id"),
		name: text("name").notNull(),
		slug: text("slug").notNull(),
		createdByUserId: uuid("created_by_user_id").references(() => appUsers.id, { onDelete: "set null" }),
		createdAt: createdAt(),
		updatedAt: updatedAt(),
	},
	(table) => [
		uniqueIndex("organizations_clerk_org_id_idx").on(table.clerkOrgId),
		uniqueIndex("organizations_slug_idx").on(table.slug),
	],
);

export const organizationMembers = pgTable(
	"organization_members",
	{
		organizationId: uuid("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		userId: uuid("user_id")
			.notNull()
			.references(() => appUsers.id, { onDelete: "cascade" }),
		role: appRole("role").default("user").notNull(),
		createdAt: createdAt(),
	},
	(table) => [primaryKey({ columns: [table.organizationId, table.userId] }), index("organization_members_user_id_idx").on(table.userId)],
);

export const subscriptions = pgTable(
	"subscriptions",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: uuid("user_id").references(() => appUsers.id, { onDelete: "cascade" }),
		organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
		plan: subscriptionPlan("plan").default("free").notNull(),
		status: subscriptionStatus("status").default("active").notNull(),
		monthlyRequestLimit: integer("monthly_request_limit").default(10000).notNull(),
		stripeCustomerId: text("stripe_customer_id"),
		stripeSubscriptionId: text("stripe_subscription_id"),
		currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
		currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
		createdAt: createdAt(),
		updatedAt: updatedAt(),
	},
	(table) => [
		index("subscriptions_user_id_idx").on(table.userId),
		index("subscriptions_organization_id_idx").on(table.organizationId),
		index("subscriptions_status_idx").on(table.status),
	],
);

export const apiKeys = pgTable(
	"api_keys",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: uuid("user_id")
			.notNull()
			.references(() => appUsers.id, { onDelete: "cascade" }),
		organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		keyPrefix: text("key_prefix").notNull(),
		keyHash: text("key_hash").notNull(),
		scopes: text("scopes").array().default(sql`ARRAY['pet:read']::text[]`).notNull(),
		monthlyLimit: integer("monthly_limit").default(10000).notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
		revokedAt: timestamp("revoked_at", { withTimezone: true }),
		createdAt: createdAt(),
		updatedAt: updatedAt(),
	},
	(table) => [
		index("api_keys_user_id_idx").on(table.userId),
		index("api_keys_organization_id_idx").on(table.organizationId),
		uniqueIndex("api_keys_key_hash_idx").on(table.keyHash),
	],
);

export const usageEvents = pgTable(
	"usage_events",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		apiKeyId: uuid("api_key_id").references(() => apiKeys.id, { onDelete: "set null" }),
		userId: uuid("user_id").references(() => appUsers.id, { onDelete: "set null" }),
		organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "set null" }),
		endpoint: text("endpoint").notNull(),
		method: text("method").notNull(),
		statusCode: integer("status_code").notNull(),
		latencyMs: integer("latency_ms").notNull(),
		requestId: text("request_id").notNull(),
		metadata: metadata(),
		createdAt: createdAt(),
	},
	(table) => [
		index("usage_events_api_key_id_idx").on(table.apiKeyId),
		index("usage_events_user_id_created_at_idx").on(table.userId, table.createdAt),
		index("usage_events_endpoint_idx").on(table.endpoint),
	],
);

export const supportDocuments = pgTable(
	"support_documents",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		title: text("title").notNull(),
		slug: text("slug").notNull(),
		category: text("category").default("docs").notNull(),
		source: text("source").default("admin").notNull(),
		body: text("body").notNull(),
		status: documentStatus("status").default("published").notNull(),
		metadata: metadata(),
		uploadedByUserId: uuid("uploaded_by_user_id").references(() => appUsers.id, { onDelete: "set null" }),
		createdAt: createdAt(),
		updatedAt: updatedAt(),
	},
	(table) => [uniqueIndex("support_documents_slug_idx").on(table.slug), index("support_documents_status_idx").on(table.status)],
);

export const ragFiles = pgTable(
	"rag_files",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		documentId: uuid("document_id").references(() => supportDocuments.id, { onDelete: "set null" }),
		uploadedByUserId: uuid("uploaded_by_user_id").references(() => appUsers.id, { onDelete: "set null" }),
		originalFileName: text("original_file_name").notNull(),
		storageBucket: text("storage_bucket").notNull(),
		storagePath: text("storage_path").notNull(),
		mimeType: text("mime_type").notNull(),
		sizeBytes: integer("size_bytes").notNull(),
		status: ragFileStatus("status").default("uploaded").notNull(),
		errorMessage: text("error_message"),
		metadata: metadata(),
		createdAt: createdAt(),
		updatedAt: updatedAt(),
	},
	(table) => [
		index("rag_files_uploaded_by_user_id_idx").on(table.uploadedByUserId),
		uniqueIndex("rag_files_document_id_idx").on(table.documentId),
		uniqueIndex("rag_files_storage_bucket_path_idx").on(table.storageBucket, table.storagePath),
		index("rag_files_status_idx").on(table.status),
	],
);

export const documentChunks = pgTable(
	"document_chunks",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		documentId: uuid("document_id")
			.notNull()
			.references(() => supportDocuments.id, { onDelete: "cascade" }),
		chunkIndex: integer("chunk_index").notNull(),
		content: text("content").notNull(),
		tokenCount: integer("token_count").default(0).notNull(),
		embedding: vector("embedding", { dimensions: 1536 }),
		metadata: metadata(),
		createdAt: createdAt(),
	},
	(table) => [
		uniqueIndex("document_chunks_document_id_chunk_index_idx").on(table.documentId, table.chunkIndex),
		index("document_chunks_document_id_idx").on(table.documentId),
		index("document_chunks_embedding_hnsw_idx").using("hnsw", table.embedding.op("vector_cosine_ops")),
	],
);

export const chatSessions = pgTable(
	"chat_sessions",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: uuid("user_id").references(() => appUsers.id, { onDelete: "set null" }),
		clerkUserId: text("clerk_user_id"),
		visitorId: text("visitor_id"),
		topic: text("topic").default("support").notNull(),
		createdAt: createdAt(),
		updatedAt: updatedAt(),
	},
	(table) => [index("chat_sessions_user_id_idx").on(table.userId), index("chat_sessions_visitor_id_idx").on(table.visitorId)],
);

export const chatMessages = pgTable(
	"chat_messages",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		sessionId: uuid("session_id")
			.notNull()
			.references(() => chatSessions.id, { onDelete: "cascade" }),
		role: chatRole("role").notNull(),
		content: text("content").notNull(),
		citations: jsonb("citations").$type<Array<{ title: string; chunkId?: string; similarity?: number }>>().default(sql`'[]'::jsonb`).notNull(),
		createdAt: createdAt(),
	},
	(table) => [index("chat_messages_session_id_idx").on(table.sessionId), index("chat_messages_created_at_idx").on(table.createdAt)],
);

export const assistantFeedback = pgTable(
	"assistant_feedback",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		messageId: uuid("message_id")
			.notNull()
			.references(() => chatMessages.id, { onDelete: "cascade" }),
		rating: feedbackRating("rating").notNull(),
		notes: text("notes"),
		reviewedByUserId: uuid("reviewed_by_user_id").references(() => appUsers.id, { onDelete: "set null" }),
		createdAt: createdAt(),
	},
	(table) => [index("assistant_feedback_message_id_idx").on(table.messageId), index("assistant_feedback_rating_idx").on(table.rating)],
);

export const appUsersRelations = relations(appUsers, ({ many }) => ({
	apiKeys: many(apiKeys),
	invitationsSent: many(appInvitations, { relationName: "invitationsSent" }),
	invitationsAccepted: many(appInvitations, { relationName: "invitationsAccepted" }),
	ragFiles: many(ragFiles),
	usageEvents: many(usageEvents),
	chatSessions: many(chatSessions),
}));

export const appInvitationsRelations = relations(appInvitations, ({ one }) => ({
	invitedBy: one(appUsers, {
		fields: [appInvitations.invitedByUserId],
		references: [appUsers.id],
		relationName: "invitationsSent",
	}),
	acceptedBy: one(appUsers, {
		fields: [appInvitations.acceptedByUserId],
		references: [appUsers.id],
		relationName: "invitationsAccepted",
	}),
}));

export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
	user: one(appUsers, {
		fields: [apiKeys.userId],
		references: [appUsers.id],
	}),
	usageEvents: many(usageEvents),
}));

export const supportDocumentsRelations = relations(supportDocuments, ({ many, one }) => ({
	chunks: many(documentChunks),
	ragFile: one(ragFiles),
}));

export const ragFilesRelations = relations(ragFiles, ({ one }) => ({
	document: one(supportDocuments, {
		fields: [ragFiles.documentId],
		references: [supportDocuments.id],
	}),
	uploadedBy: one(appUsers, {
		fields: [ragFiles.uploadedByUserId],
		references: [appUsers.id],
	}),
}));

export const documentChunksRelations = relations(documentChunks, ({ one }) => ({
	document: one(supportDocuments, {
		fields: [documentChunks.documentId],
		references: [supportDocuments.id],
	}),
}));

export const chatSessionsRelations = relations(chatSessions, ({ many }) => ({
	messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one, many }) => ({
	session: one(chatSessions, {
		fields: [chatMessages.sessionId],
		references: [chatSessions.id],
	}),
	feedback: many(assistantFeedback),
}));
