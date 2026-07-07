export const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);

export const isSupabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export const llmConfig = {
	apiKey: process.env.OPENAI_COMPATIBLE_API_KEY ?? process.env.OPENAI_API_KEY,
	baseUrl: process.env.OPENAI_COMPATIBLE_BASE_URL ?? "https://api.openai.com/v1",
	chatModel: process.env.OPENAI_COMPATIBLE_CHAT_MODEL ?? "gpt-4o-mini",
	embeddingModel: process.env.OPENAI_COMPATIBLE_EMBEDDING_MODEL ?? "text-embedding-3-small",
};

export const isLlmConfigured = Boolean(llmConfig.apiKey);

export const ragUploadsBucket = process.env.RAG_UPLOADS_BUCKET ?? "rag-uploads";

export function getAdminEmails() {
	return (process.env.ADMIN_EMAILS ?? "")
		.split(",")
		.map((email) => email.trim().toLowerCase())
		.filter(Boolean);
}

export function getSuperAdminEmails() {
	return (process.env.SUPER_ADMIN_EMAILS ?? "")
		.split(",")
		.map((email) => email.trim().toLowerCase())
		.filter(Boolean);
}
