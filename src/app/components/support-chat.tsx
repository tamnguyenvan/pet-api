"use client";

import { FormEvent, useState } from "react";

type Message = {
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

const quickPrompts = [
	"How do API keys work?",
	"What is included in Pro?",
	"Can admins re-index docs?",
];

const initialMessages: Message[] = [
	{
		id: "welcome",
		role: "assistant",
		text:
			"Ask me about PetAPI Cloud pricing, API usage, docs, billing, dashboard setup, or RAG support. I will answer from the product knowledge base.",
		sources: ["Product docs", "Support knowledge base"],
	},
];

export default function SupportChat() {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState<Message[]>(initialMessages);
	const [input, setInput] = useState("");
	const [sessionId, setSessionId] = useState<string>();
	const [isSending, setIsSending] = useState(false);

	async function sendMessage(question: string) {
		const trimmedQuestion = question.trim();

		if (!trimmedQuestion || isSending) {
			return;
		}

		setMessages((currentMessages) => [
			...currentMessages,
			{
				id: `user-${currentMessages.length}`,
				role: "user",
				text: trimmedQuestion,
			},
		]);
		setInput("");
		setIsOpen(true);
		setIsSending(true);

		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ message: trimmedQuestion, sessionId }),
			});
			const payload = (await response.json()) as ChatResponse;

			if (payload.sessionId) {
				setSessionId(payload.sessionId);
			}

			setMessages((currentMessages) => [
				...currentMessages,
				{
					id: `assistant-${currentMessages.length}`,
					role: "assistant",
					text: payload.answer ?? payload.error ?? "I could not answer that yet. Try asking about API keys, pricing, docs, billing, or RAG.",
					sources: payload.sources?.map((source) => source.title) ?? ["Support knowledge base"],
				},
			]);
		} catch {
			setMessages((currentMessages) => [
				...currentMessages,
				{
					id: `assistant-${currentMessages.length}`,
					role: "assistant",
					text: "The support API is unavailable right now. Try again after the backend is configured.",
					sources: ["Support API"],
				},
			]);
		} finally {
			setIsSending(false);
		}
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		sendMessage(input);
	}

	return (
		<div className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2.5rem)] flex-col items-end gap-3">
			{isOpen ? (
				<section
					className="w-[min(420px,calc(100vw-2.5rem))] overflow-hidden rounded-[8px] border border-[#dbe7f3] bg-white shadow-[0_24px_80px_rgba(16,33,51,0.22)]"
					aria-label="PetAPI support chat"
				>
					<div className="flex items-start justify-between gap-4 bg-[#102133] p-4 text-white">
						<div>
							<p className="font-bold">PetAPI Assistant</p>
							<p className="text-xs text-[#c3d4e3]">RAG over Supabase product docs</p>
						</div>
						<button
							type="button"
							className="rounded-[8px] border border-white/20 px-3 py-1 text-sm font-semibold hover:bg-white/10"
							onClick={() => setIsOpen(false)}
							aria-label="Close support chat"
						>
							Close
						</button>
					</div>

					<div className="max-h-[430px] space-y-3 overflow-y-auto bg-[#f8fbff] p-4" aria-live="polite">
						{messages.map((message) => (
							<div
								key={message.id}
								className={`rounded-[8px] p-3 text-sm leading-6 ${
									message.role === "user"
										? "ml-auto max-w-[86%] bg-[#1e7f86] text-white"
										: "mr-auto max-w-[92%] border border-[#dbe7f3] bg-white text-[#40566d]"
								}`}
							>
								<p>{message.text}</p>
								{message.sources ? (
									<p className={`mt-2 text-xs ${message.role === "user" ? "text-white/80" : "text-[#6b8196]"}`}>
										Sources: {message.sources.join(", ")}
									</p>
								) : null}
							</div>
						))}
						{isSending ? (
							<div className="mr-auto max-w-[92%] rounded-[8px] border border-[#dbe7f3] bg-white p-3 text-sm text-[#6b8196]">
								Searching docs...
							</div>
						) : null}
					</div>

					<div className="border-t border-[#dbe7f3] bg-white p-4">
						<div className="mb-3 flex flex-wrap gap-2">
							{quickPrompts.map((prompt) => (
								<button
									key={prompt}
									type="button"
									className="rounded-[8px] border border-[#dbe7f3] px-3 py-2 text-xs font-semibold text-[#40566d] hover:border-[#1e7f86] hover:text-[#1e7f86]"
									onClick={() => sendMessage(prompt)}
									disabled={isSending}
								>
									{prompt}
								</button>
							))}
						</div>
						<form className="flex gap-2" onSubmit={handleSubmit}>
							<label className="sr-only" htmlFor="support-question">
								Ask PetAPI Assistant
							</label>
							<input
								id="support-question"
								className="min-w-0 flex-1 rounded-[8px] border border-[#b7c8d9] px-3 py-3 text-sm text-[#102133] outline-none focus:border-[#1e7f86] focus:ring-2 focus:ring-[#b9e1e1]"
								placeholder="Ask about API keys, billing, docs..."
								value={input}
								onChange={(event) => setInput(event.target.value)}
								disabled={isSending}
							/>
							<button
								type="submit"
								className="rounded-[8px] bg-[#e85d4f] px-4 py-3 text-sm font-bold text-white hover:bg-[#d84c40] disabled:cursor-not-allowed disabled:opacity-60"
								disabled={isSending}
							>
								Send
							</button>
						</form>
					</div>
				</section>
			) : null}

			<button
				type="button"
				className="flex items-center gap-3 rounded-full bg-[#102133] px-5 py-4 font-bold text-white shadow-[0_16px_45px_rgba(16,33,51,0.28)] transition hover:bg-[#1e7f86]"
				onClick={() => setIsOpen((currentValue) => !currentValue)}
				aria-expanded={isOpen}
				aria-label="Open PetAPI support chat"
			>
				<span className="grid size-8 place-items-center rounded-full bg-[#9fe5df] text-sm text-[#102133]">AI</span>
				<span className="hidden sm:inline">Ask PetAPI</span>
			</button>
		</div>
	);
}
