import { BookOpen, Home, KeyRound, LayoutDashboard } from "lucide-react";
import AppShell, { ShellActionLink } from "../components/app-shell";
import { requireAdminUser } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/dashboard-data";
import AdminWorkspace from "./admin-workspace";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
	const authResult = await requireAdminUser();

	if (authResult.setupRequired || !authResult.user) {
		return <SetupRequired />;
	}

	const data = await getAdminDashboardData(authResult.user);
	const roleLabel = authResult.user.isSuperAdmin ? "super admin" : "admin";
	const navItems = [
		{ label: "Admin dashboard", href: "/admin", active: true, icon: <LayoutDashboard className="size-4" aria-hidden="true" /> },
		{ label: "User dashboard", href: "/dashboard", icon: <KeyRound className="size-4" aria-hidden="true" /> },
		{ label: "API docs", href: "/#developer-experience", icon: <BookOpen className="size-4" aria-hidden="true" /> },
		{ label: "Home", href: "/", icon: <Home className="size-4" aria-hidden="true" /> },
	];

	return (
		<AppShell
			title="Admin Dashboard"
			description="Operate users, usage, knowledge base documents, uploads, invitations, and RAG quality."
			eyebrow="Operations"
			navItems={navItems}
			user={{
				name: authResult.user.name,
				email: authResult.user.email,
				avatarUrl: authResult.user.avatarUrl,
				roleLabel,
			}}
			actions={
				<>
					<ShellActionLink href="/dashboard">User dashboard</ShellActionLink>
					<ShellActionLink href="/#developer-experience">Docs</ShellActionLink>
				</>
			}
		>
			<AdminWorkspace data={data} canInviteAdmins={authResult.user.isSuperAdmin} />
		</AppShell>
	);
}

function SetupRequired() {
	return (
		<main className="grid min-h-screen place-items-center bg-[#f7fbff] px-5 text-[#102133]">
			<section className="max-w-2xl rounded-[8px] border border-[#dbe7f3] bg-white p-6">
				<h1 className="text-2xl font-bold">Admin setup required</h1>
				<p className="mt-3 leading-7 text-[#52677d]">
					Configure Clerk first and add your email to `SUPER_ADMIN_EMAILS` or `ADMIN_EMAILS`, or set
					`publicMetadata.role` to `super_admin` or `admin` on your Clerk user. Supabase-backed admin data also
					requires the Supabase service role environment variables.
				</p>
			</section>
		</main>
	);
}
