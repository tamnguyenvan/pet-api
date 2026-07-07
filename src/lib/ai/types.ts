export type AIProviderName = "gemini" | "openai-compatible";

export type AIProviderContext = {
	chunkId?: string;
	documentId?: string;
	title: string;
	content: string;
	similarity?: number;
	metadata?: Record<string, unknown>;
};

export type GenerateTextInput = {
	system: string;
	prompt: string;
	temperature?: number;
	maxOutputTokens?: number;
};

export type EmbedTextInput = {
	text: string;
};

export type ExtractFileTextInput = {
	fileName: string;
	mimeType: string;
	data: ArrayBuffer;
};

export type AIProvider = {
	name: AIProviderName;
	isConfigured: boolean;
	chatModel: string;
	embeddingModel: string;
	embeddingDimensions: number;
	embedText(input: EmbedTextInput): Promise<number[] | null>;
	generateText(input: GenerateTextInput): Promise<string | null>;
	extractFileText?(input: ExtractFileTextInput): Promise<string | null>;
};
