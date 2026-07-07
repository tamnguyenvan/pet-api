import { NextResponse } from "next/server";
import { requireSuperAdminApiUser } from "@/lib/auth";
import { inviteAdminUser, listAdminInvitations } from "@/lib/invitations";

export async function GET() {
	const authResult = await requireSuperAdminApiUser();

	if (!authResult.ok) {
		return authResult.response;
	}

	try {
		const invitations = await listAdminInvitations();
		return NextResponse.json({ invitations });
	} catch (error) {
		return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load invitations." }, { status: 500 });
	}
}

export async function POST(request: Request) {
	const authResult = await requireSuperAdminApiUser();

	if (!authResult.ok) {
		return authResult.response;
	}

	const body = (await request.json().catch(() => null)) as { email?: string } | null;

	if (!body?.email?.trim()) {
		return NextResponse.json({ error: "Email is required." }, { status: 400 });
	}

	try {
		const result = await inviteAdminUser({
			inviter: authResult.user,
			email: body.email,
		});

		return NextResponse.json(result);
	} catch (error) {
		return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to invite admin." }, { status: 400 });
	}
}
