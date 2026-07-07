export const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);

export const isSupabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

function parsePositiveInteger(value: string | undefined, fallback: number) {
	const parsed = Number.parseInt(value ?? "", 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseFloatSetting(value: string | undefined, fallback: number) {
	const parsed = Number.parseFloat(value ?? "");
	return Number.isFinite(parsed) ? parsed : fallback;
}

export const aiConfig = {
	provider: (process.env.AI_PROVIDER ?? "gemini").toLowerCase(),
	gemini: {
		apiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY,
		baseUrl: process.env.GEMINI_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta",
		chatModel: process.env.GEMINI_CHAT_MODEL ?? "gemini-3.1-flash-lite",
		embeddingModel: process.env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-2",
		embeddingDimensions: parsePositiveInteger(process.env.GEMINI_EMBEDDING_DIMENSIONS, 1536),
	},
	openaiCompatible: {
		apiKey: process.env.OPENAI_COMPATIBLE_API_KEY ?? process.env.OPENAI_API_KEY,
		baseUrl: process.env.OPENAI_COMPATIBLE_BASE_URL ?? "https://api.openai.com/v1",
		chatModel: process.env.OPENAI_COMPATIBLE_CHAT_MODEL ?? "gpt-4o-mini",
		embeddingModel: process.env.OPENAI_COMPATIBLE_EMBEDDING_MODEL ?? "text-embedding-3-small",
		embeddingDimensions: parsePositiveInteger(process.env.OPENAI_COMPATIBLE_EMBEDDING_DIMENSIONS, 1536),
	},
};

export const ragConfig = {
	chunkWords: parsePositiveInteger(process.env.RAG_CHUNK_WORDS, 220),
	chunkOverlapWords: parsePositiveInteger(process.env.RAG_CHUNK_OVERLAP_WORDS, 40),
	matchThreshold: parseFloatSetting(process.env.RAG_MATCH_THRESHOLD, 0.62),
	matchCount: parsePositiveInteger(process.env.RAG_MATCH_COUNT, 6),
	maxContextChunks: parsePositiveInteger(process.env.RAG_MAX_CONTEXT_CHUNKS, 5),
};

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
