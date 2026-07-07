"use client";

import { FormEvent } from "react";
import { Bot, ChevronDown, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useSupportChatStore } from "@/lib/stores/support-chat-store";

const quickPrompts = [
	"How do API keys work?",
	"What is included in Pro?",
	"Can admins re-index docs?",
];

export default function SupportChat() {
	const { isOpen, messages, input, isSending, setIsOpen, toggleOpen, setInput, sendMessage } = useSupportChatStore();
	const hasUserMessages = messages.some((message) => message.role === "user");

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		void sendMessage(input);
	}

	return (
		<div className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2.5rem)] flex-col items-end gap-3">
			{isOpen ? (
				<section
					className="animate-chat-panel w-[min(420px,calc(100vw-2.5rem))] overflow-hidden rounded-[8px] border border-[#dbe7f3] bg-white shadow-[0_24px_80px_rgba(16,33,51,0.22)]"
					aria-label="PetAPI support chat"
				>
					<div className="flex items-start justify-between gap-4 bg-[#102133] p-4 text-white">
						<div className="flex items-start gap-3">
							<span className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-[#9fe5df] text-[#102133]">
								<Bot className="size-5" aria-hidden="true" />
							</span>
							<div>
								<p className="font-bold">PetAPI Assistant</p>
								<p className="text-xs text-[#c3d4e3]">RAG over Supabase product docs</p>
							</div>
						</div>
						<button
							type="button"
							className="grid size-9 place-items-center rounded-[8px] border border-white/20 text-sm font-semibold transition hover:bg-white/10"
							onClick={() => setIsOpen(false)}
							aria-label="Close support chat"
						>
							<X className="size-4" aria-hidden="true" />
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
							<div className="mr-auto flex max-w-[92%] items-center gap-2 rounded-[8px] border border-[#dbe7f3] bg-white p-3 text-sm text-[#6b8196]">
								<Loader2 className="size-4 animate-spin text-[#1e7f86]" aria-hidden="true" />
								<span>Searching docs...</span>
							</div>
						) : null}
					</div>

					<div className="border-t border-[#dbe7f3] bg-white p-4">
						{hasUserMessages ? null : (
							<div className="mb-3 flex flex-wrap gap-2">
								{quickPrompts.map((prompt) => (
									<button
										key={prompt}
										type="button"
										className="inline-flex items-center gap-2 rounded-[8px] border border-[#dbe7f3] px-3 py-2 text-xs font-semibold text-[#40566d] transition hover:-translate-y-0.5 hover:border-[#1e7f86] hover:text-[#1e7f86]"
										onClick={() => void sendMessage(prompt)}
										disabled={isSending}
									>
										<Sparkles className="size-3.5" aria-hidden="true" />
										{prompt}
									</button>
								))}
							</div>
						)}
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
								className="inline-flex items-center gap-2 rounded-[8px] bg-[#e85d4f] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#d84c40] disabled:cursor-not-allowed disabled:opacity-60"
								disabled={isSending}
							>
								<Send className="size-4" aria-hidden="true" />
								Send
							</button>
						</form>
					</div>
				</section>
			) : null}

			<button
				type="button"
				className="flex items-center gap-3 rounded-full bg-[#102133] px-5 py-4 font-bold text-white shadow-[0_16px_45px_rgba(16,33,51,0.28)] transition duration-300 hover:-translate-y-1 hover:bg-[#1e7f86]"
				onClick={toggleOpen}
				aria-expanded={isOpen}
				aria-label="Open PetAPI support chat"
			>
				<span className="grid size-8 place-items-center rounded-full bg-[#9fe5df] text-sm text-[#102133]">
					{isOpen ? <ChevronDown className="size-4" aria-hidden="true" /> : <MessageCircle className="size-4" aria-hidden="true" />}
				</span>
				<span className="hidden sm:inline">Ask PetAPI</span>
			</button>
		</div>
	);
}
