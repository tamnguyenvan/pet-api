import Link from "next/link";
import { requireAuthUser } from "@/lib/auth";
import { getUserDashboardData } from "@/lib/dashboard-data";
import CreateApiKeyForm from "./create-api-key-form";

export const runtime = "edge";
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

	return (
		<main className="min-h-screen bg-[#f7fbff] px-5 py-8 text-[#102133] sm:px-8">
			<DashboardHeader isAdmin={isAdmin} />
			<section className="mx-auto mt-8 grid max-w-7xl gap-4 md:grid-cols-4">
				<Metric label="Plan" value={subscription?.plan ?? "free"} />
				<Metric label="Requests this month" value={`${data.requestsThisMonth.toLocaleString()} / ${requestLimit.toLocaleString()}`} />
				<Metric label="API keys" value={String(data.apiKeys.length)} />
				<Metric label="Support chats" value={String(data.chatSessions.length)} />
			</section>

			<section className="mx-auto mt-8 grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
				<div className="space-y-6">
					<CreateApiKeyForm />
					<section className="rounded-[8px] border border-[#dbe7f3] bg-white p-5">
						<h2 className="text-xl font-bold">API keys</h2>
						<div className="mt-4 space-y-3">
							{data.apiKeys.length ? (
								data.apiKeys.map((key) => (
									<div key={key.id} className="rounded-[8px] border border-[#dbe7f3] bg-[#f8fbff] p-4">
										<div className="flex items-center justify-between gap-3">
											<p className="font-bold">{key.name}</p>
											<span className="rounded-[8px] bg-[#edfafa] px-2 py-1 text-xs font-bold text-[#1e7f86]">
												{key.is_active ? "Active" : "Disabled"}
											</span>
										</div>
										<code className="mt-2 block text-sm text-[#52677d]">{key.key_prefix}</code>
										<p className="mt-2 text-sm text-[#52677d]">Monthly limit: {key.monthly_limit.toLocaleString()}</p>
									</div>
								))
							) : (
								<p className="text-sm text-[#52677d]">No API keys yet. Create one to call `/api/v1/*` endpoints.</p>
							)}
						</div>
					</section>
				</div>

				<div className="space-y-6">
					<section className="rounded-[8px] border border-[#dbe7f3] bg-white p-5">
						<h2 className="text-xl font-bold">Recent requests</h2>
						<div className="mt-4 overflow-x-auto">
							<table className="w-full text-left text-sm">
								<thead className="text-[#52677d]">
									<tr>
										<th className="py-2">Endpoint</th>
										<th className="py-2">Status</th>
										<th className="py-2">Latency</th>
									</tr>
								</thead>
								<tbody>
									{data.usageEvents.map((event) => (
										<tr key={event.id} className="border-t border-[#dbe7f3]">
											<td className="py-3 font-medium">{event.endpoint}</td>
											<td className="py-3">{event.status_code}</td>
											<td className="py-3">{event.latency_ms}ms</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</section>
					<section className="rounded-[8px] border border-[#dbe7f3] bg-white p-5">
						<h2 className="text-xl font-bold">Support chat history</h2>
						<div className="mt-4 space-y-3">
							{data.chatSessions.length ? (
								data.chatSessions.map((session) => (
									<div key={session.id} className="rounded-[8px] border border-[#dbe7f3] bg-[#f8fbff] p-4">
										<p className="font-semibold">{session.topic}</p>
										<p className="mt-1 text-sm text-[#52677d]">Updated {new Date(session.updated_at).toLocaleString()}</p>
									</div>
								))
							) : (
								<p className="text-sm text-[#52677d]">No support chats yet.</p>
							)}
						</div>
					</section>
				</div>
			</section>
		</main>
	);
}

function DashboardHeader({ isAdmin }: { isAdmin: boolean }) {
	return (
		<header className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<p className="text-sm font-bold uppercase text-[#1e7f86]">User dashboard</p>
				<h1 className="mt-2 text-4xl font-bold">API keys, usage, billing, and support history</h1>
			</div>
			<nav className="flex gap-3 text-sm font-bold">
				<Link className="rounded-[8px] border border-[#b7c8d9] px-4 py-2 hover:border-[#1e7f86]" href="/">
					Home
				</Link>
				{isAdmin ? (
					<Link className="rounded-[8px] bg-[#102133] px-4 py-2 text-white hover:bg-[#1e7f86]" href="/admin">
						Admin
					</Link>
				) : null}
			</nav>
		</header>
	);
}

function Metric({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-[8px] border border-[#dbe7f3] bg-white p-5">
			<p className="text-sm font-semibold text-[#52677d]">{label}</p>
			<p className="mt-2 text-2xl font-bold capitalize">{value}</p>
		</div>
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
