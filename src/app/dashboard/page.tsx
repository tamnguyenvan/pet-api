import { BookOpen, Home, LayoutDashboard, ShieldCheck } from "lucide-react";
import AppShell, { ShellActionLink } from "../components/app-shell";
import { requireAuthUser } from "@/lib/auth";
import { getUserDashboardData } from "@/lib/dashboard-data";
import DashboardWorkspace from "./dashboard-workspace";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
	const authResult = await requireAuthUser();

	if (authResult.setupRequired || !authResult.user) {
		return <SetupRequired title="Dashboard setup required" />;
	}

	const data = await getUserDashboardData(authResult.user);
	const subscription = data.subscription;
	const requestLimit = subscription?.monthly_request_limit ?? 10000;
	const isAdmin = authResult.user.isAdmin || data.appUser?.role === "admin" || data.appUser?.role === "super_admin";
	const navItems = [
		{ label: "Dashboard", href: "/dashboard", active: true, icon: <LayoutDashboard className="size-4" aria-hidden="true" /> },
		{ label: "API docs", href: "/#developer-experience", icon: <BookOpen className="size-4" aria-hidden="true" /> },
		...(isAdmin ? [{ label: "Admin", href: "/admin", icon: <ShieldCheck className="size-4" aria-hidden="true" /> }] : []),
		{ label: "Home", href: "/", icon: <Home className="size-4" aria-hidden="true" /> },
	];

	return (
		<AppShell
			title="User Dashboard"
			description="Manage API keys, monitor monthly usage, and review support activity from one workspace."
			eyebrow="Workspace"
			navItems={navItems}
			user={{
				name: authResult.user.name,
				email: authResult.user.email,
				avatarUrl: authResult.user.avatarUrl,
				roleLabel: data.appUser?.role?.replace("_", " ") ?? "user",
			}}
			actions={
				<>
					<ShellActionLink href="/#developer-experience">Docs</ShellActionLink>
					{isAdmin ? <ShellActionLink href="/admin">Admin</ShellActionLink> : null}
				</>
			}
		>
			<DashboardWorkspace data={data} requestLimit={requestLimit} />
		</AppShell>
	);
}

function SetupRequired({ title }: { title: string }) {
	return (
		<main className="grid min-h-screen place-items-center bg-[#f7fbff] px-5 text-[#102133]">
			<section className="max-w-2xl rounded-[8px] border border-[#dbe7f3] bg-white p-6">
				<h1 className="text-2xl font-bold">{title}</h1>
				<p className="mt-3 leading-7 text-[#52677d]">
					Configure Clerk first: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. Supabase-backed data
					requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
				</p>
			</section>
		</main>
	);
}
