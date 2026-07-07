import type { AIProvider } from "./types";

type GeminiConfig = {
	apiKey?: string;
	baseUrl: string;
	chatModel: string;
	embeddingModel: string;
	embeddingDimensions: number;
};

type GeminiEmbeddingResponse = {
	embedding?: {
		values?: number[];
	};
	embeddings?: Array<{
		values?: number[];
	}>;
};

type GeminiGenerateResponse = {
	candidates?: Array<{
		content?: {
			parts?: Array<{
				text?: string;
			}>;
		};
	}>;
};

function trimTrailingSlash(value: string) {
	return value.replace(/\/+$/, "");
}

function toModelPath(model: string) {
	return model.replace(/^models\//, "");
}

function getEndpoint(baseUrl: string, model: string, method: "embedContent" | "generateContent") {
	return `${trimTrailingSlash(baseUrl)}/models/${encodeURIComponent(toModelPath(model))}:${method}`;
}

function getEmbeddingValues(payload: GeminiEmbeddingResponse) {
	return payload.embeddings?.[0]?.values ?? payload.embedding?.values ?? null;
}

function getGeneratedText(payload: GeminiGenerateResponse) {
	return payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim() || null;
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

function cleanExtractedText(value: string) {
	return value
		.replace(/^```(?:text|markdown)?/i, "")
		.replace(/```$/i, "")
		.trim();
}

export function createGeminiProvider(config: GeminiConfig): AIProvider {
	return {
		name: "gemini",
		isConfigured: Boolean(config.apiKey),
		chatModel: config.chatModel,
		embeddingModel: config.embeddingModel,
		embeddingDimensions: config.embeddingDimensions,
		async embedText({ text }) {
			if (!config.apiKey) {
				return null;
			}

			const response = await fetch(getEndpoint(config.baseUrl, config.embeddingModel, "embedContent"), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-goog-api-key": config.apiKey,
				},
				body: JSON.stringify({
					model: `models/${toModelPath(config.embeddingModel)}`,
					content: {
						parts: [{ text }],
					},
					output_dimensionality: config.embeddingDimensions,
				}),
			});

			if (!response.ok) {
				throw new Error(`Gemini embedding failed: ${await parseError(response)}`);
			}

			return getEmbeddingValues((await response.json()) as GeminiEmbeddingResponse);
		},
		async generateText({ system, prompt, temperature = 0.2, maxOutputTokens = 1200 }) {
			if (!config.apiKey) {
				return null;
			}

			const response = await fetch(getEndpoint(config.baseUrl, config.chatModel, "generateContent"), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-goog-api-key": config.apiKey,
				},
				body: JSON.stringify({
					systemInstruction: {
						parts: [{ text: system }],
					},
					contents: [
						{
							role: "user",
							parts: [{ text: prompt }],
						},
					],
					generationConfig: {
						temperature,
						maxOutputTokens,
					},
				}),
			});

			if (!response.ok) {
				throw new Error(`Gemini generation failed: ${await parseError(response)}`);
			}

			return getGeneratedText((await response.json()) as GeminiGenerateResponse);
		},
		async extractFileText({ fileName, mimeType, data }) {
			if (!config.apiKey) {
				return null;
			}

			const response = await fetch(getEndpoint(config.baseUrl, config.chatModel, "generateContent"), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-goog-api-key": config.apiKey,
				},
				body: JSON.stringify({
					systemInstruction: {
						parts: [
							{
								text:
									"You extract text for a retrieval system. Return only clean plain text. Preserve headings, lists, tables, product names, limits, and procedures. Do not summarize.",
							},
						],
					},
					contents: [
						{
							role: "user",
							parts: [
								{
									text: `Extract all useful text from this file for RAG indexing. File name: ${fileName}`,
								},
								{
									inlineData: {
										mimeType,
										data: Buffer.from(data).toString("base64"),
									},
								},
							],
						},
					],
					generationConfig: {
						temperature: 0,
						maxOutputTokens: 8192,
					},
				}),
			});

			if (!response.ok) {
				throw new Error(`Gemini file text extraction failed: ${await parseError(response)}`);
			}

			const text = getGeneratedText((await response.json()) as GeminiGenerateResponse);
			return text ? cleanExtractedText(text) : null;
		},
	};
}
