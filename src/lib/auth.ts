import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getAdminEmails, getSuperAdminEmails, isClerkConfigured } from "./env";
import { ensureAppUser } from "./users";

export type AppAuthUser = {
	clerkUserId: string;
	email: string;
	name: string | null;
	avatarUrl: string | null;
	isAdmin: boolean;
	isSuperAdmin: boolean;
};

export async function getOptionalAuthUser(): Promise<AppAuthUser | null> {
	if (!isClerkConfigured) {
		return null;
	}

	const session = await auth();

	if (!session.userId) {
		return null;
	}

	const user = await currentUser();
	const email = user?.emailAddresses.find((address) => address.id === user.primaryEmailAddressId)?.emailAddress ?? user?.emailAddresses[0]?.emailAddress;
	const adminEmails = getAdminEmails();
	const superAdminEmails = getSuperAdminEmails();
	const metadataRole = user?.publicMetadata?.role;
	const normalizedEmail = email?.toLowerCase();
	const isSuperAdmin = metadataRole === "super_admin" || Boolean(normalizedEmail && superAdminEmails.includes(normalizedEmail));
	const isAdmin =
		isSuperAdmin || metadataRole === "admin" || Boolean(normalizedEmail && adminEmails.includes(normalizedEmail));

	return {
		clerkUserId: session.userId,
		email: email ?? `${session.userId}@clerk.local`,
		name: user?.fullName ?? user?.username ?? null,
		avatarUrl: user?.imageUrl ?? null,
		isAdmin,
		isSuperAdmin,
	};
}

export async function requireAuthUser() {
	if (!isClerkConfigured) {
		return { setupRequired: true as const, user: null };
	}

	const user = await getOptionalAuthUser();

	if (!user) {
		redirect("/sign-in");
	}

	return { setupRequired: false as const, user };
}

export async function requireAdminUser() {
	const result = await requireAuthUser();

	if (result.setupRequired || !result.user) {
		return result;
	}

	const user = await withResolvedAdminRole(result.user);

	if (!user.isAdmin) {
		redirect("/dashboard");
	}

	return { ...result, user };
}

export async function requireSuperAdminUser() {
	const result = await requireAuthUser();

	if (result.setupRequired || !result.user) {
		return result;
	}

	const user = await withResolvedAdminRole(result.user);

	if (!user.isSuperAdmin) {
		redirect("/admin");
	}

	return { ...result, user };
}

export async function requireAuthApiUser() {
	if (!isClerkConfigured) {
		return {
			ok: false as const,
			response: NextResponse.json({ error: "Clerk is not configured for authenticated API routes." }, { status: 503 }),
		};
	}

	const user = await getOptionalAuthUser();

	if (!user) {
		return { ok: false as const, response: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };
	}

	return { ok: true as const, user };
}

export async function requireAdminApiUser() {
	const result = await requireAuthApiUser();

	if (!result.ok) {
		return result;
	}

	const user = await withResolvedAdminRole(result.user);

	if (!user.isAdmin) {
		return { ok: false as const, response: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
	}

	return { ok: true as const, user };
}

export async function requireSuperAdminApiUser() {
	const result = await requireAuthApiUser();

	if (!result.ok) {
		return result;
	}

	const user = await withResolvedAdminRole(result.user);

	if (!user.isSuperAdmin) {
		return { ok: false as const, response: NextResponse.json({ error: "Super admin access required." }, { status: 403 }) };
	}

	return { ok: true as const, user };
}

async function withResolvedAdminRole(user: AppAuthUser): Promise<AppAuthUser> {
	if (user.isSuperAdmin) {
		return { ...user, isAdmin: true };
	}

	const appUser = await ensureAppUser(user);

	if (appUser?.role === "super_admin") {
		return { ...user, isAdmin: true, isSuperAdmin: true };
	}

	if (appUser?.role !== "admin") {
		return user;
	}

	return { ...user, isAdmin: true };
}
