"use client";

import { create } from "zustand";

export type SupportMessage = {
	id: string;
	role: "assistant" | "user";
	text: string;
	sources?: string[];
};

type ChatResponse = {
	answer?: string;
	sources?: Array<{ title: string }>;
	sessionId?: string;
	error?: string;
};

const initialMessages: SupportMessage[] = [
	{
		id: "welcome",
		role: "assistant",
		text:
			"Ask me about PetAPI Cloud pricing, API usage, docs, billing, dashboard setup, or RAG support. I will answer from the product knowledge base.",
		sources: ["Product docs", "Support knowledge base"],
	},
];

type SupportChatState = {
	isOpen: boolean;
	messages: SupportMessage[];
	input: string;
	sessionId?: string;
	isSending: boolean;
	setIsOpen: (isOpen: boolean) => void;
	toggleOpen: () => void;
	setInput: (input: string) => void;
	sendMessage: (question: string) => Promise<void>;
};

export const useSupportChatStore = create<SupportChatState>((set, get) => ({
	isOpen: false,
	messages: initialMessages,
	input: "",
	sessionId: undefined,
	isSending: false,
	setIsOpen: (isOpen) => set({ isOpen }),
	toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
	setInput: (input) => set({ input }),
	async sendMessage(question) {
		const trimmedQuestion = question.trim();
		const { isSending, sessionId } = get();

		if (!trimmedQuestion || isSending) {
			return;
		}

		set((state) => ({
			messages: [
				...state.messages,
				{
					id: `user-${state.messages.length}`,
					role: "user",
					text: trimmedQuestion,
				},
			],
			input: "",
			isOpen: true,
			isSending: true,
		}));

		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ message: trimmedQuestion, sessionId }),
			});
			const payload = (await response.json()) as ChatResponse;

			set((state) => ({
				sessionId: payload.sessionId ?? state.sessionId,
				messages: [
					...state.messages,
					{
						id: `assistant-${state.messages.length}`,
						role: "assistant",
						text: payload.answer ?? payload.error ?? "I could not answer that yet. Try asking about API keys, pricing, docs, billing, or RAG.",
						sources: payload.sources?.map((source) => source.title) ?? ["Support knowledge base"],
					},
				],
			}));
		} catch {
			set((state) => ({
				messages: [
					...state.messages,
					{
						id: `assistant-${state.messages.length}`,
						role: "assistant",
						text: "The support API is unavailable right now. Try again after the backend is configured.",
						sources: ["Support API"],
					},
				],
			}));
		} finally {
			set({ isSending: false });
		}
	},
}));
