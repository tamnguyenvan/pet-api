import { aiConfig } from "../env";
import { createGeminiProvider } from "./gemini";
import { createOpenAICompatibleProvider } from "./openai-compatible";
import type { AIProvider } from "./types";

let cachedProvider: AIProvider | null = null;

export function getAiProvider() {
	if (cachedProvider) {
		return cachedProvider;
	}

	cachedProvider =
		aiConfig.provider === "openai-compatible" || aiConfig.provider === "openai"
			? createOpenAICompatibleProvider(aiConfig.openaiCompatible)
			: createGeminiProvider(aiConfig.gemini);

	return cachedProvider;
}

export function isAiConfigured() {
	return getAiProvider().isConfigured;
}

export type { AIProvider, AIProviderContext } from "./types";
