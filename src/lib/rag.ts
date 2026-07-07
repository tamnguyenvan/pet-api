import { getAiProvider } from "./ai";
import type { AIProvider, AIProviderContext } from "./ai";
import { slugify } from "./crypto";
import { ragConfig } from "./env";
import { getSupabaseAdmin } from "./supabase-admin";

export type RetrievedContext = AIProviderContext;

type RetrievalMode = "vector" | "keyword" | "fallback";

const fallbackDocuments: RetrievedContext[] = [
	{
		title: "API Authentication",
		content:
			"PetAPI Cloud uses bearer API keys. Create keys from the dashboard, label them by environment, send them in the Authorization header, and rotate or revoke them when needed.",
	},
	{
		title: "Pricing and Limits",
		content:
			"Free includes 10,000 requests per month, Pro includes 500,000 requests per month, and Business supports custom limits, SLA options, team roles, and dedicated support.",
	},
	{
		title: "RAG Support Assistant",
		content:
			"The assistant retrieves relevant chunks from Supabase pgvector, sends the context to the configured Gemini or OpenAI-compatible chat model, and stores citations for review.",
	},
	{
		title: "Admin Knowledge Base",
		content:
			"Admins can upload or edit documentation, re-index document chunks, monitor support questions, and review assistant answer quality.",
	},
	{
		title: "Troubleshooting",
		content:
			"Check the request ID, API key status, plan limits, rate-limit reset metadata, billing status, and the latest service status when troubleshooting API errors.",
	},
];

function normalizeWhitespace(input: string) {
	return input.replace(/\s+/g, " ").trim();
}

function tokenize(input: string) {
	return input
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, " ")
		.split(/\s+/)
		.filter((term) => term.length > 2);
}

function scoreContexts(query: string, contexts: RetrievedContext[]) {
	const terms = tokenize(query);

	if (terms.length === 0) {
		return [];
	}

	return contexts
		.map((context) => {
			const searchable = `${context.title} ${context.content}`.toLowerCase();
			const score = terms.reduce((total, term) => total + (searchable.includes(term) ? 1 : 0), 0);

			return {
				context: {
					...context,
					similarity: context.similarity ?? Number((score / terms.length).toFixed(4)),
				},
				score,
			};
		})
		.filter((result) => result.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, ragConfig.maxContextChunks)
		.map((result) => result.context);
}

export function chunkText(text: string, maxWords = ragConfig.chunkWords, overlapWords = ragConfig.chunkOverlapWords) {
	const normalizedText = normalizeWhitespace(text);

	if (!normalizedText) {
		return [];
	}

	const words = normalizedText.split(" ");
	const safeMaxWords = Math.max(50, maxWords);
	const safeOverlapWords = Math.min(Math.max(0, overlapWords), safeMaxWords - 1);
	const step = safeMaxWords - safeOverlapWords;
	const chunks: string[] = [];

	for (let index = 0; index < words.length; index += step) {
		chunks.push(words.slice(index, index + safeMaxWords).join(" "));

		if (index + safeMaxWords >= words.length) {
			break;
		}
	}

	return chunks;
}

function formatQueryForEmbedding(query: string) {
	return `task: question answering | query: ${normalizeWhitespace(query)}`;
}

function formatDocumentForEmbedding(title: string, content: string) {
	return `title: ${normalizeWhitespace(title) || "none"} | text: ${normalizeWhitespace(content)}`;
}

function getEmbeddingMetadata(provider: AIProvider) {
	return {
		embeddingProvider: provider.name,
		embeddingModel: provider.embeddingModel,
		embeddingDimensions: provider.embeddingDimensions,
		embeddingTask: "question_answering",
	};
}

function normalizeEmbedding(provider: AIProvider, embedding: number[] | null) {
	if (!embedding) {
		return null;
	}

	if (embedding.length !== provider.embeddingDimensions || embedding.some((value) => !Number.isFinite(value))) {
		console.warn(
			`Ignoring ${provider.name} embedding with invalid shape. Expected ${provider.embeddingDimensions} dimensions, received ${embedding.length}.`,
		);
		return null;
	}

	return embedding;
}

async function createEmbedding(provider: AIProvider, text: string) {
	if (!provider.isConfigured) {
		return null;
	}

	try {
		return normalizeEmbedding(provider, await provider.embedText({ text }));
	} catch (error) {
		console.warn(error instanceof Error ? error.message : "Embedding request failed.");
		return null;
	}
}

function limitText(value: string, maxLength = 2800) {
	if (value.length <= maxLength) {
		return value;
	}

	return `${value.slice(0, maxLength).trim()}...`;
}

function buildContextBlock(contexts: RetrievedContext[]) {
	return contexts
		.map((context, index) => {
			const similarity = typeof context.similarity === "number" ? `\nSimilarity: ${context.similarity.toFixed(3)}` : "";
			return `[${index + 1}] ${context.title}${similarity}\n${limitText(context.content)}`;
		})
		.join("\n\n");
}

async function createChatAnswer(question: string, contexts: RetrievedContext[]) {
	const provider = getAiProvider();

	if (!provider.isConfigured) {
		return null;
	}

	try {
		return await provider.generateText({
			system:
				"You are PetAPI Cloud support. Answer only from the supplied documentation context. If the context is insufficient, say exactly what is missing and suggest the next concrete place to check. Be concise, accurate, and do not expose hidden reasoning.",
			prompt: `Question:\n${question}\n\nDocumentation context:\n${buildContextBlock(contexts)}\n\nReturn a helpful support answer. Reference source numbers when useful.`,
			temperature: 0.2,
			maxOutputTokens: 1200,
		});
	} catch (error) {
		console.warn(error instanceof Error ? error.message : "Chat generation failed.");
		return null;
	}
}

async function retrieveFromSupabase(query: string): Promise<{ contexts: RetrievedContext[]; mode: RetrievalMode } | null> {
	const supabase = getSupabaseAdmin();

	if (!supabase) {
		return null;
	}

	const provider = getAiProvider();
	const embedding = await createEmbedding(provider, formatQueryForEmbedding(query));

	if (embedding) {
		const { data, error } = await supabase.rpc("match_document_chunks", {
			query_embedding: embedding,
			match_threshold: ragConfig.matchThreshold,
			match_count: ragConfig.matchCount,
			filter_metadata: getEmbeddingMetadata(provider),
		});

		if (error) {
			console.warn(`Supabase vector retrieval failed: ${error.message}`);
		}

		if (data?.length) {
			return {
				mode: "vector",
				contexts: data.slice(0, ragConfig.maxContextChunks).map((row: Record<string, unknown>): RetrievedContext => ({
					chunkId: String(row.chunk_id),
					documentId: String(row.document_id),
					title: String(row.title),
					content: String(row.content),
					similarity: Number(row.similarity),
					metadata: row.metadata as Record<string, unknown>,
				})),
			};
		}
	}

	const { data, error } = await supabase
		.from("support_documents")
		.select("id,title,body,metadata")
		.eq("status", "published")
		.order("updated_at", { ascending: false })
		.limit(50);

	if (error) {
		console.warn(`Supabase keyword retrieval failed: ${error.message}`);
		return null;
	}

	if (!data?.length) {
		return null;
	}

	const contexts = scoreContexts(
		query,
		data.map((document): RetrievedContext => ({
			documentId: document.id,
			title: document.title,
			content: document.body,
			metadata: document.metadata,
		})),
	);

	return contexts.length ? { contexts, mode: "keyword" } : null;
}

function createFallbackAnswer(selectedContexts: RetrievedContext[]) {
	return `Based on ${selectedContexts.map((context) => context.title).join(" and ")}: ${selectedContexts
		.map((context) => context.content)
		.join(" ")}`;
}

export async function answerSupportQuestion(question: string) {
	const retrieved = await retrieveFromSupabase(question);
	const contexts = retrieved?.contexts ?? scoreContexts(question, fallbackDocuments);
	const selectedContexts: RetrievedContext[] = contexts.length > 0 ? contexts : fallbackDocuments.slice(0, 2);
	const llmAnswer = await createChatAnswer(question, selectedContexts);
	const provider = getAiProvider();

	return {
		answer: llmAnswer ?? createFallbackAnswer(selectedContexts),
		sources: selectedContexts.map((context) => ({
			title: context.title,
			chunkId: context.chunkId,
			documentId: context.documentId,
			similarity: context.similarity,
		})),
		rag: {
			provider: provider.name,
			chatModel: provider.chatModel,
			embeddingModel: provider.embeddingModel,
			embeddingDimensions: provider.embeddingDimensions,
			retrievalMode: retrieved?.mode ?? "fallback",
			generatedWithAi: Boolean(llmAnswer),
		},
	};
}

export async function createOrUpdateSupportDocument({
	title,
	body,
	category = "docs",
	source = "admin",
	uploadedByUserId,
	metadata,
}: {
	title: string;
	body: string;
	category?: string;
	source?: string;
	uploadedByUserId?: string;
	metadata?: Record<string, unknown>;
}) {
	return createSupportDocument({ title, body, category, source, uploadedByUserId, metadata });
}

export async function createSupportDocument({
	title,
	body,
	category = "docs",
	source = "admin",
	uploadedByUserId,
	metadata,
}: {
	title: string;
	body: string;
	category?: string;
	source?: string;
	uploadedByUserId?: string;
	metadata?: Record<string, unknown>;
}) {
	const supabase = getSupabaseAdmin();

	if (!supabase) {
		throw new Error("Supabase is not configured.");
	}

	const baseSlug = slugify(title) || "document";
	const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;
	const { data, error } = await supabase
		.from("support_documents")
		.insert({
			title,
			slug,
			body,
			category,
			source,
			uploaded_by_user_id: uploadedByUserId,
			status: "published",
			metadata: metadata ?? {},
		})
		.select("id,title,body,category,metadata")
		.single();

	if (error) {
		throw error;
	}

	await reindexKnowledgeBase(data.id);
	return data;
}

export async function reindexKnowledgeBase(documentId?: string) {
	const supabase = getSupabaseAdmin();

	if (!supabase) {
		throw new Error("Supabase is not configured.");
	}

	const provider = getAiProvider();
	let query = supabase.from("support_documents").select("id,title,body,category,metadata").eq("status", "published");

	if (documentId) {
		query = query.eq("id", documentId);
	}

	const { data: documents, error } = await query;

	if (error) {
		throw error;
	}

	let chunkCount = 0;
	let embeddedChunkCount = 0;
	let failedEmbeddingCount = 0;

	for (const document of documents ?? []) {
		await supabase.from("document_chunks").delete().eq("document_id", document.id);

		const chunks = chunkText(document.body);
		const rows = [];

		for (const [index, content] of chunks.entries()) {
			const embedding = await createEmbedding(provider, formatDocumentForEmbedding(document.title, content));

			if (embedding) {
				embeddedChunkCount += 1;
			} else if (provider.isConfigured) {
				failedEmbeddingCount += 1;
			}

			rows.push({
				document_id: document.id,
				chunk_index: index,
				content,
				token_count: content.split(/\s+/).filter(Boolean).length,
				embedding,
				metadata: {
					category: document.category,
					title: document.title,
					chunkWords: ragConfig.chunkWords,
					chunkOverlapWords: ragConfig.chunkOverlapWords,
					indexedAt: new Date().toISOString(),
					embeddingStatus: embedding ? "embedded" : provider.isConfigured ? "failed" : "disabled",
					...getEmbeddingMetadata(provider),
					...(document.metadata ?? {}),
				},
			});
		}

		if (rows.length > 0) {
			const { error: insertError } = await supabase.from("document_chunks").insert(rows);

			if (insertError) {
				throw insertError;
			}

			chunkCount += rows.length;
		}
	}

	return {
		documents: documents?.length ?? 0,
		chunks: chunkCount,
		embeddedChunks: embeddedChunkCount,
		failedEmbeddings: failedEmbeddingCount,
		embeddingsEnabled: provider.isConfigured,
		provider: provider.name,
		embeddingModel: provider.embeddingModel,
		embeddingDimensions: provider.embeddingDimensions,
	};
}
