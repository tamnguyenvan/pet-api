import type { AppAuthUser } from "./auth";
import { getSupabaseAdmin } from "./supabase-admin";
import { ensureAppUser } from "./users";

const monthStart = () => {
	const date = new Date();
	date.setUTCDate(1);
	date.setUTCHours(0, 0, 0, 0);
	return date.toISOString();
};

export async function getUserDashboardData(authUser: AppAuthUser) {
	const supabase = getSupabaseAdmin();
	const appUser = await ensureAppUser(authUser);

	if (!supabase || !appUser) {
		return {
			mode: "setup" as const,
			appUser: null,
			subscription: null,
			apiKeys: [],
			usageEvents: [],
			requestsThisMonth: 0,
			chatSessions: [],
		};
	}

	const since = monthStart();
	const [apiKeysResult, subscriptionResult, usageResult, usageCountResult, chatSessionsResult] = await Promise.all([
		supabase
			.from("api_keys")
			.select("id,name,key_prefix,monthly_limit,is_active,last_used_at,created_at")
			.eq("user_id", appUser.id)
			.order("created_at", { ascending: false }),
		supabase
			.from("subscriptions")
			.select("plan,status,monthly_request_limit,current_period_end")
			.eq("user_id", appUser.id)
			.order("created_at", { ascending: false })
			.limit(1)
			.maybeSingle(),
		supabase
			.from("usage_events")
			.select("id,endpoint,method,status_code,latency_ms,request_id,created_at")
			.eq("user_id", appUser.id)
			.order("created_at", { ascending: false })
			.limit(12),
		supabase.from("usage_events").select("id", { count: "exact", head: true }).eq("user_id", appUser.id).gte("created_at", since),
		supabase
			.from("chat_sessions")
			.select("id,topic,created_at,updated_at")
			.eq("user_id", appUser.id)
			.order("updated_at", { ascending: false })
			.limit(6),
	]);

	return {
		mode: "live" as const,
		appUser,
		subscription: subscriptionResult.data,
		apiKeys: apiKeysResult.data ?? [],
		usageEvents: usageResult.data ?? [],
		requestsThisMonth: usageCountResult.count ?? 0,
		chatSessions: chatSessionsResult.data ?? [],
	};
}

export async function getAdminDashboardData(authUser: AppAuthUser) {
	const supabase = getSupabaseAdmin();
	const appUser = await ensureAppUser(authUser);

	if (!supabase || !appUser) {
		return {
			mode: "setup" as const,
			counts: {
				users: 0,
				apiKeys: 0,
				requests: 0,
				documents: 0,
				files: 0,
				supportQuestions: 0,
			},
			documents: [],
			files: [],
			invitations: [],
			recentUsage: [],
			feedback: [],
		};
	}

	const filesQuery = supabase
		.from("rag_files")
		.select("id,document_id,uploaded_by_user_id,original_file_name,mime_type,size_bytes,status,error_message,created_at,updated_at")
		.neq("status", "deleted")
		.order("created_at", { ascending: false })
		.limit(12);

	if (appUser.role !== "super_admin") {
		filesQuery.eq("uploaded_by_user_id", appUser.id);
	}

	const invitationsQuery =
		appUser.role === "super_admin"
			? supabase
					.from("app_invitations")
					.select("id,email,role,status,expires_at,accepted_at,created_at")
					.order("created_at", { ascending: false })
					.limit(12)
			: Promise.resolve({ data: [] });

	const [users, apiKeys, requests, documentsCount, files, supportQuestions, documents, recentUsage, feedback, uploadedFiles, invitations] = await Promise.all([
		supabase.from("app_users").select("id", { count: "exact", head: true }),
		supabase.from("api_keys").select("id", { count: "exact", head: true }),
		supabase.from("usage_events").select("id", { count: "exact", head: true }),
		supabase.from("support_documents").select("id", { count: "exact", head: true }),
		supabase.from("rag_files").select("id", { count: "exact", head: true }).neq("status", "deleted"),
		supabase.from("chat_messages").select("id", { count: "exact", head: true }).eq("role", "user"),
		supabase
			.from("support_documents")
			.select("id,title,slug,category,status,source,updated_at")
			.order("updated_at", { ascending: false })
			.limit(8),
		supabase
			.from("usage_events")
			.select("id,endpoint,method,status_code,latency_ms,created_at")
			.order("created_at", { ascending: false })
			.limit(8),
		supabase
			.from("assistant_feedback")
			.select("id,rating,notes,created_at")
			.order("created_at", { ascending: false })
			.limit(8),
		filesQuery,
		invitationsQuery,
	]);

	return {
		mode: "live" as const,
		counts: {
			users: users.count ?? 0,
			apiKeys: apiKeys.count ?? 0,
			requests: requests.count ?? 0,
			documents: documentsCount.count ?? 0,
			files: files.count ?? 0,
			supportQuestions: supportQuestions.count ?? 0,
		},
		documents: documents.data ?? [],
		files: uploadedFiles.data ?? [],
		invitations: invitations.data ?? [],
		recentUsage: recentUsage.data ?? [],
		feedback: feedback.data ?? [],
	};
}
