import { NextResponse } from "next/server";
import { requireAdminApiUser } from "@/lib/auth";
import { deleteKnowledgeFile, RagFileForbiddenError } from "@/lib/rag-files";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	const authResult = await requireAdminApiUser();

	if (!authResult.ok) {
		return authResult.response;
	}

	const { id } = await params;

	try {
		const result = await deleteKnowledgeFile(authResult.user, id);
		return NextResponse.json(result);
	} catch (error) {
		if (error instanceof RagFileForbiddenError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}

		return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete file." }, { status: 500 });
	}
}
