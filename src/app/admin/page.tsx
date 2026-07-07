import Link from "next/link";
import { requireAdminUser } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/dashboard-data";
import AdminActions from "./admin-actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
	const authResult = await requireAdminUser();

	if (authResult.setupRequired || !authResult.user) {
		return <SetupRequired />;
	}

	const data = await getAdminDashboardData(authResult.user);

	return (
		<main className="min-h-screen bg-[#f7fbff] px-5 py-8 text-[#102133] sm:px-8">
			<header className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-sm font-bold uppercase text-[#1e7f86]">Admin dashboard</p>
					<h1 className="mt-2 text-4xl font-bold">Users, subscriptions, usage, docs, files, and RAG quality</h1>
				</div>
				<nav className="flex gap-3 text-sm font-bold">
					<Link className="rounded-[8px] border border-[#b7c8d9] px-4 py-2 hover:border-[#1e7f86]" href="/dashboard">
						User dashboard
					</Link>
					<Link className="rounded-[8px] bg-[#102133] px-4 py-2 text-white hover:bg-[#1e7f86]" href="/">
						Home
					</Link>
				</nav>
			</header>

			<section className="mx-auto mt-8 grid max-w-7xl gap-4 md:grid-cols-6">
				<Metric label="Users" value={data.counts.users.toLocaleString()} />
				<Metric label="API keys" value={data.counts.apiKeys.toLocaleString()} />
				<Metric label="Requests" value={data.counts.requests.toLocaleString()} />
				<Metric label="Documents" value={data.counts.documents.toLocaleString()} />
				<Metric label="Files" value={data.counts.files.toLocaleString()} />
				<Metric label="Questions" value={data.counts.supportQuestions.toLocaleString()} />
			</section>

			<section className="mx-auto mt-8 grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
				<div className="space-y-6">
					<AdminActions
						canInviteAdmins={authResult.user.isSuperAdmin}
						initialFiles={data.files}
						initialInvitations={data.invitations}
					/>
					<section className="rounded-[8px] border border-[#dbe7f3] bg-white p-5">
						<h2 className="text-xl font-bold">Recent usage</h2>
						<div className="mt-4 space-y-3">
							{data.recentUsage.map((event) => (
								<div key={event.id} className="rounded-[8px] border border-[#dbe7f3] bg-[#f8fbff] p-4 text-sm">
									<p className="font-bold">{event.method} {event.endpoint}</p>
									<p className="mt-1 text-[#52677d]">{event.status_code} in {event.latency_ms}ms</p>
								</div>
							))}
						</div>
					</section>
				</div>

				<div className="space-y-6">
					<section className="rounded-[8px] border border-[#dbe7f3] bg-white p-5">
						<h2 className="text-xl font-bold">Knowledge base documents</h2>
						<div className="mt-4 space-y-3">
							{data.documents.map((document) => (
								<div key={document.id} className="rounded-[8px] border border-[#dbe7f3] bg-[#f8fbff] p-4">
									<div className="flex items-center justify-between gap-3">
										<p className="font-bold">{document.title}</p>
										<span className="rounded-[8px] bg-[#edfafa] px-2 py-1 text-xs font-bold text-[#1e7f86]">
											{document.status}
										</span>
									</div>
									<p className="mt-1 text-sm text-[#52677d]">{document.category} · {document.source}</p>
								</div>
							))}
						</div>
					</section>
					<section className="rounded-[8px] border border-[#dbe7f3] bg-white p-5">
						<h2 className="text-xl font-bold">Answer quality reviews</h2>
						<div className="mt-4 space-y-3">
							{data.feedback.length ? (
								data.feedback.map((item) => (
									<div key={item.id} className="rounded-[8px] border border-[#dbe7f3] bg-[#f8fbff] p-4 text-sm">
										<p className="font-bold capitalize">{item.rating}</p>
										<p className="mt-1 text-[#52677d]">{item.notes ?? "No notes"}</p>
									</div>
								))
							) : (
								<p className="text-sm text-[#52677d]">No answer reviews yet.</p>
							)}
						</div>
					</section>
				</div>
			</section>
		</main>
	);
}

function Metric({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-[8px] border border-[#dbe7f3] bg-white p-5">
			<p className="text-sm font-semibold text-[#52677d]">{label}</p>
			<p className="mt-2 text-2xl font-bold">{value}</p>
		</div>
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
