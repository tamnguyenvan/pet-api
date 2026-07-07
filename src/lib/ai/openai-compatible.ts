import type { AIProvider } from "./types";

type OpenAICompatibleConfig = {
	apiKey?: string;
	baseUrl: string;
	chatModel: string;
	embeddingModel: string;
	embeddingDimensions: number;
};

type EmbeddingResponse = {
	data?: Array<{
		embedding?: number[];
	}>;
};

type ChatResponse = {
	choices?: Array<{
		message?: {
			content?: string;
		};
	}>;
};

function trimTrailingSlash(value: string) {
	return value.replace(/\/+$/, "");
}

async function parseError(response: Response) {
	const text = await response.text().catch(() => "");

	try {
		const payload = JSON.parse(text) as { error?: { message?: string } };
		return payload.error?.message ?? response.statusText;
	} catch {
		return text || response.statusText;
	}
}

export function createOpenAICompatibleProvider(config: OpenAICompatibleConfig): AIProvider {
	return {
		name: "openai-compatible",
		isConfigured: Boolean(config.apiKey),
		chatModel: config.chatModel,
		embeddingModel: config.embeddingModel,
		embeddingDimensions: config.embeddingDimensions,
		async embedText({ text }) {
			if (!config.apiKey) {
				return null;
			}

			const response = await fetch(`${trimTrailingSlash(config.baseUrl)}/embeddings`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${config.apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: config.embeddingModel,
					input: text,
					dimensions: config.embeddingDimensions,
				}),
			});

			if (!response.ok) {
				throw new Error(`Embedding request failed: ${await parseError(response)}`);
			}

			const payload = (await response.json()) as EmbeddingResponse;
			return payload.data?.[0]?.embedding ?? null;
		},
		async generateText({ system, prompt, temperature = 0.2, maxOutputTokens = 1200 }) {
			if (!config.apiKey) {
				return null;
			}

			const response = await fetch(`${trimTrailingSlash(config.baseUrl)}/chat/completions`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${config.apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: config.chatModel,
					messages: [
						{ role: "system", content: system },
						{ role: "user", content: prompt },
					],
					temperature,
					max_tokens: maxOutputTokens,
				}),
			});

			if (!response.ok) {
				throw new Error(`Chat request failed: ${await parseError(response)}`);
			}

			const payload = (await response.json()) as ChatResponse;
			return payload.choices?.[0]?.message?.content?.trim() ?? null;
		},
	};
}
