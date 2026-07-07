import type { AppAuthUser } from "./auth";
import { getSupabaseAdmin } from "./supabase-admin";

export type AppRole = "user" | "admin" | "super_admin";

export type AppUserRecord = {
	id: string;
	clerk_user_id: string;
	email: string;
	name: string | null;
	avatar_url: string | null;
	role: AppRole;
	plan: "free" | "pro" | "business";
};

const roleRank: Record<AppRole, number> = {
	user: 0,
	admin: 1,
	super_admin: 2,
};

function getAuthRole(user: AppAuthUser): AppRole {
	if (user.isSuperAdmin) {
		return "super_admin";
	}

	if (user.isAdmin) {
		return "admin";
	}

	return "user";
}

function highestRole(...roles: AppRole[]) {
	return roles.reduce<AppRole>((highest, role) => (roleRank[role] > roleRank[highest] ? role : highest), "user");
}

async function getPendingAdminInvitation(email: string) {
	const supabase = getSupabaseAdmin();

	if (!supabase) {
		return null;
	}

	const { data, error } = await supabase
		.from("app_invitations")
		.select("id,role,expires_at")
		.eq("email", email.toLowerCase())
		.eq("status", "pending")
		.order("created_at", { ascending: false })
		.limit(1)
		.maybeSingle();

	if (error) {
		throw error;
	}

	if (!data || data.role !== "admin") {
		return null;
	}

	if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
		await supabase.from("app_invitations").update({ status: "expired" }).eq("id", data.id);
		return null;
	}

	return data;
}

async function acceptInvitation(invitationId: string, appUserId: string) {
	const supabase = getSupabaseAdmin();

	if (!supabase) {
		return;
	}

	await supabase
		.from("app_invitations")
		.update({
			status: "accepted",
			accepted_by_user_id: appUserId,
			accepted_at: new Date().toISOString(),
		})
		.eq("id", invitationId)
		.eq("status", "pending");
}

export async function ensureAppUser(user: AppAuthUser) {
	const supabase = getSupabaseAdmin();

	if (!supabase) {
		return null;
	}

	const { data: existing, error: existingError } = await supabase
		.from("app_users")
		.select("id,clerk_user_id,email,name,avatar_url,role,plan")
		.eq("clerk_user_id", user.clerkUserId)
		.maybeSingle();

	if (existingError) {
		throw existingError;
	}

	const normalizedEmail = user.email.toLowerCase();
	const pendingInvitation = await getPendingAdminInvitation(normalizedEmail);
	const invitedRole: AppRole = pendingInvitation ? "admin" : "user";
	const requestedRole = highestRole(getAuthRole(user), invitedRole);

	if (existing) {
		const nextRole = highestRole(existing.role as AppRole, requestedRole);
		const { data, error } = await supabase
			.from("app_users")
			.update({
				email: normalizedEmail,
				name: user.name,
				avatar_url: user.avatarUrl,
				role: nextRole,
			})
			.eq("id", existing.id)
			.select("id,clerk_user_id,email,name,avatar_url,role,plan")
			.single();

		if (error) {
			throw error;
		}

		if (pendingInvitation) {
			await acceptInvitation(pendingInvitation.id, data.id);
		}

		return data as AppUserRecord;
	}

	const { data, error } = await supabase
		.from("app_users")
		.insert({
			clerk_user_id: user.clerkUserId,
			email: normalizedEmail,
			name: user.name,
			avatar_url: user.avatarUrl,
			role: requestedRole,
			plan: "free",
		})
		.select("id,clerk_user_id,email,name,avatar_url,role,plan")
		.single();

	if (error) {
		throw error;
	}

	await supabase.from("subscriptions").insert({
		user_id: data.id,
		plan: "free",
		status: "active",
		monthly_request_limit: 10000,
	});

	if (pendingInvitation) {
		await acceptInvitation(pendingInvitation.id, data.id);
	}

	return data as AppUserRecord;
}
