import {
	Activity,
	BarChart3,
	Bot,
	CircleGauge,
	Home,
	KeyRound,
	LayoutDashboard,
	LifeBuoy,
	ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import AppShell, { ShellActionLink } from "../components/app-shell";
import { requireAuthUser } from "@/lib/auth";
import { getUserDashboardData } from "@/lib/dashboard-data";
import CreateApiKeyForm from "./create-api-key-form";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
	const authResult = await requireAuthUser();

	if (authResult.setupRequired || !authResult.user) {
		return <SetupRequired title="Dashboard setup required" />;
	}

	const data = await getUserDashboardData(authResult.user);
	const subscription = data.subscription;
	const requestLimit = subscription?.monthly_request_limit ?? 10000;
	const usagePercent = requestLimit > 0 ? Math.min(100, Math.round((data.requestsThisMonth / requestLimit) * 100)) : 0;
	const isAdmin = authResult.user.isAdmin || data.appUser?.role === "admin" || data.appUser?.role === "super_admin";

	const navItems = [
		{ label: "Overview", href: "/dashboard", active: true, icon: <LayoutDashboard className="size-4" aria-hidden="true" /> },
		{ label: "API keys", href: "#api-keys", icon: <KeyRound className="size-4" aria-hidden="true" /> },
		{ label: "Usage", href: "#usage", icon: <BarChart3 className="size-4" aria-hidden="true" /> },
		{ label: "Support", href: "#support", icon: <LifeBuoy className="size-4" aria-hidden="true" /> },
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
			<section className="grid gap-4 xl:grid-cols-4">
				<MetricCard icon={<CircleGauge className="size-5" aria-hidden="true" />} label="Plan" value={subscription?.plan ?? "free"} detail={subscription?.status ?? "active"} />
				<MetricCard
					icon={<Activity className="size-5" aria-hidden="true" />}
					label="Requests this month"
					value={`${data.requestsThisMonth.toLocaleString()} / ${requestLimit.toLocaleString()}`}
					detail={`${usagePercent}% used`}
				/>
				<MetricCard icon={<KeyRound className="size-5" aria-hidden="true" />} label="API keys" value={String(data.apiKeys.length)} detail="Active and disabled keys" />
				<MetricCard icon={<Bot className="size-5" aria-hidden="true" />} label="Support chats" value={String(data.chatSessions.length)} detail="Recent assistant sessions" />
			</section>

			<section className="mt-6 grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
				<div className="space-y-6">
					<CreateApiKeyForm />

					<Panel id="api-keys" title="API keys" description="Keys are stored hashed. Copy new secrets immediately after creation.">
						<div className="space-y-3">
							{data.apiKeys.length ? (
								data.apiKeys.map((key) => (
									<div key={key.id} className="rounded-[8px] border border-[#dbe7f3] bg-[#f8fbff] p-4">
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0">
												<p className="truncate font-bold">{key.name}</p>
												<code className="mt-2 block text-sm text-[#52677d]">{key.key_prefix}</code>
											</div>
											<StatusBadge tone={key.is_active ? "success" : "neutral"}>{key.is_active ? "Active" : "Disabled"}</StatusBadge>
										</div>
										<div className="mt-4 grid gap-3 text-sm text-[#52677d] sm:grid-cols-2">
											<p>Monthly limit: {key.monthly_limit.toLocaleString()}</p>
											<p>Last used: {key.last_used_at ? formatDate(key.last_used_at) : "Never"}</p>
										</div>
									</div>
								))
							) : (
								<EmptyState title="No API keys yet" description="Create a key to call the /api/v1 endpoints from your backend." />
							)}
						</div>
					</Panel>
				</div>

				<div className="space-y-6">
					<Panel id="usage" title="Usage overview" description="Monthly consumption and recent API traffic.">
						<div className="mb-5">
							<div className="flex items-center justify-between text-sm">
								<span className="font-semibold text-[#40566d]">Monthly request usage</span>
								<span className="font-bold text-[#102133]">{usagePercent}%</span>
							</div>
							<div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e7eef6]">
								<div className="h-full rounded-full bg-[#1e7f86]" style={{ width: `${usagePercent}%` }} />
							</div>
						</div>
						<div className="overflow-hidden rounded-[8px] border border-[#dbe7f3]">
							<table className="w-full text-left text-sm">
								<thead className="bg-[#f8fbff] text-xs uppercase text-[#52677d]">
									<tr>
										<th className="px-4 py-3">Endpoint</th>
										<th className="px-4 py-3">Status</th>
										<th className="px-4 py-3">Latency</th>
									</tr>
								</thead>
								<tbody>
									{data.usageEvents.length ? (
										data.usageEvents.map((event) => (
											<tr key={event.id} className="border-t border-[#e7eef6]">
												<td className="px-4 py-3 font-medium">{event.endpoint}</td>
												<td className="px-4 py-3">{event.status_code}</td>
												<td className="px-4 py-3">{event.latency_ms}ms</td>
											</tr>
										))
									) : (
										<tr>
											<td className="px-4 py-6 text-[#52677d]" colSpan={3}>
												No requests logged yet.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</Panel>

					<Panel id="support" title="Support chat history" description="Recent sessions with the PetAPI assistant.">
						<div className="grid gap-3 md:grid-cols-2">
							{data.chatSessions.length ? (
								data.chatSessions.map((session) => (
									<div key={session.id} className="rounded-[8px] border border-[#dbe7f3] bg-[#f8fbff] p-4">
										<p className="font-semibold capitalize">{session.topic}</p>
										<p className="mt-1 text-sm text-[#52677d]">Updated {formatDate(session.updated_at)}</p>
									</div>
								))
							) : (
								<EmptyState title="No support chats yet" description="Use Ask PetAPI from the landing page to start a support session." />
							)}
						</div>
					</Panel>
				</div>
			</section>
		</AppShell>
	);
}

function MetricCard({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) {
	return (
		<div className="rounded-[8px] border border-[#dbe7f3] bg-white p-5 shadow-sm">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="text-sm font-semibold text-[#52677d]">{label}</p>
					<p className="mt-2 text-2xl font-bold capitalize">{value}</p>
					<p className="mt-1 text-xs font-medium text-[#6b8196]">{detail}</p>
				</div>
				<span className="grid size-10 place-items-center rounded-[8px] bg-[#e8f6f7] text-[#1e7f86]">{icon}</span>
			</div>
		</div>
	);
}

function Panel({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
	return (
		<section id={id} className="rounded-[8px] border border-[#dbe7f3] bg-white p-5 shadow-sm scroll-mt-28">
			<div className="mb-5">
				<h2 className="text-xl font-bold">{title}</h2>
				<p className="mt-1 text-sm leading-6 text-[#52677d]">{description}</p>
			</div>
			{children}
		</section>
	);
}

function StatusBadge({ tone, children }: { tone: "success" | "neutral"; children: ReactNode }) {
	const classes = tone === "success" ? "bg-[#edfafa] text-[#1e7f86]" : "bg-[#edf3f8] text-[#52677d]";

	return <span className={`rounded-[8px] px-2 py-1 text-xs font-bold ${classes}`}>{children}</span>;
}

function EmptyState({ title, description }: { title: string; description: string }) {
	return (
		<div className="rounded-[8px] border border-dashed border-[#b7c8d9] bg-[#f8fbff] p-5 text-sm">
			<p className="font-bold text-[#102133]">{title}</p>
			<p className="mt-1 leading-6 text-[#52677d]">{description}</p>
		</div>
	);
}

function formatDate(value: string) {
	return new Date(value).toLocaleString();
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
