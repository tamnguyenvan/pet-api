import { NextResponse } from "next/server";
import { requireAdminApiUser } from "@/lib/auth";
import { createSupportDocument } from "@/lib/rag";
import { getSupabaseAdmin, getSupabaseSetupMessage } from "@/lib/supabase-admin";
import { ensureAppUser } from "@/lib/users";

export async function GET() {
	const authResult = await requireAdminApiUser();

	if (!authResult.ok) {
		return authResult.response;
	}

	const supabase = getSupabaseAdmin();

	if (!supabase) {
		return NextResponse.json({ error: getSupabaseSetupMessage() }, { status: 503 });
	}

	const { data, error } = await supabase
		.from("support_documents")
		.select("id,title,slug,category,status,source,created_at,updated_at")
		.order("updated_at", { ascending: false });

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ documents: data });
}

export async function POST(request: Request) {
	const authResult = await requireAdminApiUser();

	if (!authResult.ok) {
		return authResult.response;
	}

	const body = (await request.json().catch(() => null)) as { title?: string; body?: string; category?: string } | null;

	if (!body?.title?.trim() || !body.body?.trim()) {
		return NextResponse.json({ error: "Document title and body are required." }, { status: 400 });
	}

	const appUser = await ensureAppUser(authResult.user);

	try {
		const document = await createSupportDocument({
			title: body.title.trim(),
			body: body.body.trim(),
			category: body.category?.trim() || "docs",
			uploadedByUserId: appUser?.id,
		});

		return NextResponse.json({ document });
	} catch (error) {
		return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save document." }, { status: 500 });
	}
}
