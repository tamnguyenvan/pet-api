import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./env";

let cachedClient: SupabaseClient | null = null;

export function getSupabaseAdmin() {
	if (!isSupabaseConfigured) {
		return null;
	}

	if (!cachedClient) {
		cachedClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		});
	}

	return cachedClient;
}

export function getSupabaseSetupMessage() {
	return "Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable Supabase database access.";
}
