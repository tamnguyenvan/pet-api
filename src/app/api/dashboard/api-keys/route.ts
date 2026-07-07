import { NextResponse } from "next/server";
import { requireAuthApiUser } from "@/lib/auth";
import { createApiKeySecret, getApiKeyPrefix, sha256Hex } from "@/lib/crypto";
import { getSupabaseAdmin, getSupabaseSetupMessage } from "@/lib/supabase-admin";
import { ensureAppUser } from "@/lib/users";

export async function POST(request: Request) {
	const authResult = await requireAuthApiUser();

	if (!authResult.ok) {
		return authResult.response;
	}

	const supabase = getSupabaseAdmin();

	if (!supabase) {
		return NextResponse.json({ error: getSupabaseSetupMessage() }, { status: 503 });
	}

	const body = (await request.json().catch(() => null)) as { name?: string } | null;
	const appUser = await ensureAppUser(authResult.user);
	const secret = createApiKeySecret();
	const keyHash = await sha256Hex(secret);
	const keyPrefix = getApiKeyPrefix(secret);

	if (!appUser) {
		return NextResponse.json({ error: getSupabaseSetupMessage() }, { status: 503 });
	}

	const { data, error } = await supabase
		.from("api_keys")
		.insert({
			user_id: appUser.id,
			name: body?.name?.trim() || "Default key",
			key_prefix: keyPrefix,
			key_hash: keyHash,
			monthly_limit: appUser.plan === "pro" ? 500000 : appUser.plan === "business" ? 5000000 : 10000,
		})
		.select("id,name,key_prefix,monthly_limit,created_at")
		.single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({
		apiKey: secret,
		record: data,
		message: "Copy this key now. Only the hash is stored.",
	});
}
