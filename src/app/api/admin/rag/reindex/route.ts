import { NextResponse } from "next/server";
import { requireAdminApiUser } from "@/lib/auth";
import { reindexKnowledgeBase } from "@/lib/rag";

export const runtime = "edge";

export async function POST(request: Request) {
	const authResult = await requireAdminApiUser();

	if (!authResult.ok) {
		return authResult.response;
	}

	const body = (await request.json().catch(() => null)) as { documentId?: string } | null;

	try {
		const result = await reindexKnowledgeBase(body?.documentId);
		return NextResponse.json(result);
	} catch (error) {
		return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to re-index documents." }, { status: 500 });
	}
}
