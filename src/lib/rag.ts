import { llmConfig, isLlmConfigured } from "./env";
import { slugify } from "./crypto";
import { getSupabaseAdmin } from "./supabase-admin";

export type RetrievedContext = {
	chunkId?: string;
	documentId?: string;
	title: string;
	content: string;
	similarity?: number;
	metadata?: Record<string, unknown>;
};

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
			"The assistant retrieves relevant chunks from Supabase pgvector, sends the context to an OpenAI-compatible chat model, and stores citations for review.",
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

function tokenize(input: string) {
	return input
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, " ")
		.split(/\s+/)
		.filter((term) => term.length > 2);
}

function scoreContexts(query: string, contexts: RetrievedContext[]) {
	const terms = tokenize(query);

	return contexts
		.map((context) => {
			const searchable = `${context.title} ${context.content}`.toLowerCase();
			const score = terms.reduce((total, term) => total + (searchable.includes(term) ? 1 : 0), 0);

			return { context, score };
		})
		.filter((result) => result.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, 4)
		.map((result) => result.context);
}

export function chunkText(text: string, maxWords = 180) {
	const words = text.split(/\s+/).filter(Boolean);
	const chunks: string[] = [];

	for (let index = 0; index < words.length; index += maxWords) {
		chunks.push(words.slice(index, index + maxWords).join(" "));
	}

	return chunks.length > 0 ? chunks : [text];
}

async function createEmbedding(input: string) {
	if (!isLlmConfigured) {
		return null;
	}

	const response = await fetch(`${llmConfig.baseUrl}/embeddings`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${llmConfig.apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: llmConfig.embeddingModel,
			input,
		}),
	});

	if (!response.ok) {
		return null;
	}

	const payload = (await response.json()) as { data?: Array<{ embedding?: number[] }> };
	return payload.data?.[0]?.embedding ?? null;
}

async function createChatAnswer(question: string, contexts: RetrievedContext[]) {
	if (!isLlmConfigured) {
		return null;
	}

	const contextBlock = contexts.map((context, index) => `[${index + 1}] ${context.title}\n${context.content}`).join("\n\n");

	const response = await fetch(`${llmConfig.baseUrl}/chat/completions`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${llmConfig.apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: llmConfig.chatModel,
			messages: [
				{
					role: "system",
					content:
						"You are PetAPI Cloud support. Answer using only the provided documentation context. If context is insufficient, say what is missing and suggest where to look next.",
				},
				{
					role: "user",
					content: `Question: ${question}\n\nDocumentation context:\n${contextBlock}`,
				},
			],
			temperature: 0.2,
		}),
	});

	if (!response.ok) {
		return null;
	}

	const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
	return payload.choices?.[0]?.message?.content ?? null;
}

async function retrieveFromSupabase(query: string): Promise<RetrievedContext[] | null> {
	const supabase = getSupabaseAdmin();

	if (!supabase) {
		return null;
	}

	const embedding = await createEmbedding(query);

	if (embedding) {
		const { data } = await supabase.rpc("match_document_chunks", {
			query_embedding: embedding,
			match_threshold: 0.65,
			match_count: 6,
			filter_metadata: {},
		});

		if (data?.length) {
			return data.map((row: Record<string, unknown>): RetrievedContext => ({
				chunkId: String(row.chunk_id),
				documentId: String(row.document_id),
				title: String(row.title),
				content: String(row.content),
				similarity: Number(row.similarity),
				metadata: row.metadata as Record<string, unknown>,
			}));
		}
	}

	const { data } = await supabase.from("support_documents").select("id,title,body,metadata").eq("status", "published").limit(25);

	if (!data?.length) {
		return null;
	}

	return scoreContexts(
		query,
		data.map((document): RetrievedContext => ({
			documentId: document.id,
			title: document.title,
			content: document.body,
			metadata: document.metadata,
		})),
	);
}

export async function answerSupportQuestion(question: string) {
	const contexts = (await retrieveFromSupabase(question)) ?? scoreContexts(question, fallbackDocuments);
	const selectedContexts: RetrievedContext[] = contexts.length > 0 ? contexts : fallbackDocuments.slice(0, 2);
	const llmAnswer = await createChatAnswer(question, selectedContexts);
	const answer =
		llmAnswer ??
		`Based on ${selectedContexts.map((context) => context.title).join(" and ")}: ${selectedContexts
			.map((context) => context.content)
			.join(" ")}`;

	return {
		answer,
		sources: selectedContexts.map((context) => ({
			title: context.title,
			chunkId: context.chunkId,
			documentId: context.documentId,
			similarity: context.similarity,
		})),
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

	let query = supabase.from("support_documents").select("id,title,body,category,metadata").eq("status", "published");

	if (documentId) {
		query = query.eq("id", documentId);
	}

	const { data: documents, error } = await query;

	if (error) {
		throw error;
	}

	let chunkCount = 0;

	for (const document of documents ?? []) {
		await supabase.from("document_chunks").delete().eq("document_id", document.id);

		const chunks = chunkText(document.body);
		const rows = await Promise.all(
			chunks.map(async (content, index) => ({
				document_id: document.id,
				chunk_index: index,
				content,
				token_count: content.split(/\s+/).filter(Boolean).length,
				embedding: await createEmbedding(`${document.title}\n\n${content}`),
				metadata: {
					category: document.category,
					title: document.title,
					...(document.metadata ?? {}),
				},
			})),
		);

		if (rows.length > 0) {
			await supabase.from("document_chunks").insert(rows);
			chunkCount += rows.length;
		}
	}

	return {
		documents: documents?.length ?? 0,
		chunks: chunkCount,
		embeddingsEnabled: isLlmConfigured,
	};
}
