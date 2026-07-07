import { NextResponse } from "next/server";
import { getOptionalAuthUser } from "@/lib/auth";
import { answerSupportQuestion } from "@/lib/rag";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ensureAppUser } from "@/lib/users";

export const runtime = "edge";

export async function POST(request: Request) {
	const body = (await request.json().catch(() => null)) as { message?: string; sessionId?: string; visitorId?: string } | null;
	const message = body?.message?.trim();

	if (!message) {
		return NextResponse.json({ error: "Message is required." }, { status: 400 });
	}

	const authUser = await getOptionalAuthUser();
	const appUser = authUser ? await ensureAppUser(authUser) : null;
	const result = await answerSupportQuestion(message);
	const supabase = getSupabaseAdmin();
	let sessionId = body?.sessionId;
	let assistantMessageId: string | undefined;

	if (supabase) {
		if (!sessionId) {
			const { data: session } = await supabase
				.from("chat_sessions")
				.insert({
					user_id: appUser?.id,
					clerk_user_id: authUser?.clerkUserId,
					visitor_id: body?.visitorId,
					topic: "support",
				})
				.select("id")
				.single();
			sessionId = session?.id;
		}

		if (sessionId) {
			await supabase.from("chat_messages").insert({
				session_id: sessionId,
				role: "user",
				content: message,
			});

			const { data: assistantMessage } = await supabase
				.from("chat_messages")
				.insert({
					session_id: sessionId,
					role: "assistant",
					content: result.answer,
					citations: result.sources,
				})
				.select("id")
				.single();
			assistantMessageId = assistantMessage?.id;
		}
	}

	return NextResponse.json({
		answer: result.answer,
		sources: result.sources,
		sessionId,
		messageId: assistantMessageId,
	});
}
