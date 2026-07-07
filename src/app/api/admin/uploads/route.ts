import { NextResponse } from "next/server";
import { requireAdminApiUser } from "@/lib/auth";
import { listKnowledgeFiles, uploadKnowledgeFile } from "@/lib/rag-files";

export const runtime = "edge";

export async function GET() {
	const authResult = await requireAdminApiUser();

	if (!authResult.ok) {
		return authResult.response;
	}

	try {
		const files = await listKnowledgeFiles(authResult.user);
		return NextResponse.json({ files });
	} catch (error) {
		return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load uploaded files." }, { status: 500 });
	}
}

export async function POST(request: Request) {
	const authResult = await requireAdminApiUser();

	if (!authResult.ok) {
		return authResult.response;
	}

	const formData = await request.formData().catch(() => null);
	const file = formData?.get("file");
	const title = formData?.get("title");
	const category = formData?.get("category");

	if (!(file instanceof File)) {
		return NextResponse.json({ error: "File is required." }, { status: 400 });
	}

	try {
		const result = await uploadKnowledgeFile({
			user: authResult.user,
			file,
			title: typeof title === "string" ? title : undefined,
			category: typeof category === "string" ? category : undefined,
		});

		return NextResponse.json(result);
	} catch (error) {
		return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to upload file." }, { status: 400 });
	}
}
