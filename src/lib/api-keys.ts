import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "./supabase-admin";
import { sha256Hex } from "./crypto";

type ValidApiKey = {
	id: string;
	user_id: string;
	organization_id: string | null;
	name: string;
	key_prefix: string;
	monthly_limit: number;
};

type ApiKeyValidation =
	| { ok: true; demo: true; apiKey: null }
	| { ok: true; demo: false; apiKey: ValidApiKey }
	| { ok: false; response: Response };

export function extractBearerToken(request: Request) {
	const authorization = request.headers.get("authorization");

	if (!authorization?.startsWith("Bearer ")) {
		return null;
	}

	return authorization.slice("Bearer ".length).trim();
}

export async function validatePetApiKey(request: Request): Promise<ApiKeyValidation> {
	const supabase = getSupabaseAdmin();

	if (!supabase) {
		return { ok: true, demo: true, apiKey: null };
	}

	const token = extractBearerToken(request);

	if (!token) {
		return {
			ok: false,
			response: NextResponse.json({ error: "Missing API key. Send Authorization: Bearer <pet_api_key>." }, { status: 401 }),
		};
	}

	const keyHash = await sha256Hex(token);
	const { data, error } = await supabase
		.from("api_keys")
		.select("id,user_id,organization_id,name,key_prefix,monthly_limit,is_active,revoked_at")
		.eq("key_hash", keyHash)
		.maybeSingle();

	if (error || !data || !data.is_active || data.revoked_at) {
		return { ok: false, response: NextResponse.json({ error: "Invalid or revoked API key." }, { status: 401 }) };
	}

	await supabase.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);

	return { ok: true, demo: false, apiKey: data };
}

export async function logUsageEvent({
	apiKey,
	endpoint,
	method,
	statusCode,
	latencyMs,
	requestId,
	metadata = {},
}: {
	apiKey: ValidApiKey | null;
	endpoint: string;
	method: string;
	statusCode: number;
	latencyMs: number;
	requestId: string;
	metadata?: Record<string, unknown>;
}) {
	const supabase = getSupabaseAdmin();

	if (!supabase || !apiKey) {
		return;
	}

	await supabase.from("usage_events").insert({
		api_key_id: apiKey.id,
		user_id: apiKey.user_id,
		organization_id: apiKey.organization_id,
		endpoint,
		method,
		status_code: statusCode,
		latency_ms: latencyMs,
		request_id: requestId,
		metadata,
	});
}
