import { clerkClient } from "@clerk/nextjs/server";
import type { AppAuthUser } from "./auth";
import { getSupabaseAdmin } from "./supabase-admin";
import { ensureAppUser, type AppRole } from "./users";

export type AdminInvitation = {
	id: string;
	email: string;
	role: AppRole;
	status: "pending" | "accepted" | "revoked" | "expired";
	clerk_invitation_id: string | null;
	expires_at: string | null;
	accepted_at: string | null;
	created_at: string;
};

const inviteTtlDays = 7;

function normalizeEmail(email: string) {
	return email.trim().toLowerCase();
}

function assertValidEmail(email: string) {
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		throw new Error("Enter a valid email address.");
	}
}

function getErrorMessage(error: unknown) {
	if (error instanceof Error) {
		return error.message;
	}

	return "Unable to create invitation.";
}

export async function listAdminInvitations() {
	const supabase = getSupabaseAdmin();

	if (!supabase) {
		throw new Error("Supabase is not configured.");
	}

	const { data, error } = await supabase
		.from("app_invitations")
		.select("id,email,role,status,clerk_invitation_id,expires_at,accepted_at,created_at")
		.order("created_at", { ascending: false })
		.limit(25);

	if (error) {
		throw error;
	}

	return (data ?? []) as AdminInvitation[];
}

export async function inviteAdminUser({ inviter, email }: { inviter: AppAuthUser; email: string }) {
	const supabase = getSupabaseAdmin();

	if (!supabase) {
		throw new Error("Supabase is not configured.");
	}

	const normalizedEmail = normalizeEmail(email);
	assertValidEmail(normalizedEmail);

	if (normalizedEmail === inviter.email.toLowerCase()) {
		throw new Error("You cannot invite yourself.");
	}

	const inviterAppUser = await ensureAppUser(inviter);

	if (!inviterAppUser || inviterAppUser.role !== "super_admin") {
		throw new Error("Only super admins can invite admins.");
	}

	const expiresAt = new Date(Date.now() + inviteTtlDays * 24 * 60 * 60 * 1000).toISOString();
	const { data: existingUser, error: existingUserError } = await supabase
		.from("app_users")
		.select("id,email,role")
		.ilike("email", normalizedEmail)
		.maybeSingle();

	if (existingUserError) {
		throw existingUserError;
	}

	if (existingUser) {
		const nextRole: AppRole = existingUser.role === "super_admin" ? "super_admin" : "admin";

		const { error: updateError } = await supabase.from("app_users").update({ role: nextRole }).eq("id", existingUser.id);

		if (updateError) {
			throw updateError;
		}

		const { data: invitation, error: invitationError } = await supabase
			.from("app_invitations")
			.insert({
				email: normalizedEmail,
				role: "admin",
				status: "accepted",
				invited_by_user_id: inviterAppUser.id,
				accepted_by_user_id: existingUser.id,
				accepted_at: new Date().toISOString(),
				metadata: {
					mode: "existing_user_promoted",
				},
			})
			.select("id,email,role,status,clerk_invitation_id,expires_at,accepted_at,created_at")
			.single();

		if (invitationError) {
			throw invitationError;
		}

		return { mode: "promoted" as const, invitation: invitation as AdminInvitation };
	}

	try {
		const clerk = await clerkClient();
		const clerkInvitation = await clerk.invitations.createInvitation({
			emailAddress: normalizedEmail,
			expiresInDays: inviteTtlDays,
			redirectUrl: "/sign-up",
			publicMetadata: {
				role: "admin",
				invitedBy: inviter.clerkUserId,
				source: "petapi-admin-invite",
			},
		});

		const { data: invitation, error } = await supabase
			.from("app_invitations")
			.insert({
				email: normalizedEmail,
				role: "admin",
				status: "pending",
				clerk_invitation_id: clerkInvitation.id,
				invited_by_user_id: inviterAppUser.id,
				expires_at: expiresAt,
				metadata: {
					clerk_status: clerkInvitation.status,
				},
			})
			.select("id,email,role,status,clerk_invitation_id,expires_at,accepted_at,created_at")
			.single();

		if (error) {
			throw error;
		}

		return { mode: "invited" as const, invitation: invitation as AdminInvitation };
	} catch (error) {
		throw new Error(getErrorMessage(error));
	}
}
