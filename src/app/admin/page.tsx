import {
	BarChart3,
	Bot,
	FileText,
	FolderUp,
	Home,
	KeyRound,
	LayoutDashboard,
	LifeBuoy,
	Users,
} from "lucide-react";
import type { ReactNode } from "react";
import AppShell, { ShellActionLink } from "../components/app-shell";
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
	const roleLabel = authResult.user.isSuperAdmin ? "super admin" : "admin";
	const navItems = [
		{ label: "Overview", href: "/admin", active: true, icon: <LayoutDashboard className="size-4" aria-hidden="true" /> },
		{ label: "RAG controls", href: "#rag-controls", icon: <Bot className="size-4" aria-hidden="true" /> },
		{ label: "Documents", href: "#documents", icon: <FileText className="size-4" aria-hidden="true" /> },
		{ label: "Usage", href: "#usage", icon: <BarChart3 className="size-4" aria-hidden="true" /> },
		{ label: "Reviews", href: "#reviews", icon: <LifeBuoy className="size-4" aria-hidden="true" /> },
		{ label: "User dashboard", href: "/dashboard", icon: <KeyRound className="size-4" aria-hidden="true" /> },
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
			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
				<MetricCard icon={<Users className="size-5" aria-hidden="true" />} label="Users" value={data.counts.users.toLocaleString()} />
				<MetricCard icon={<KeyRound className="size-5" aria-hidden="true" />} label="API keys" value={data.counts.apiKeys.toLocaleString()} />
				<MetricCard icon={<BarChart3 className="size-5" aria-hidden="true" />} label="Requests" value={data.counts.requests.toLocaleString()} />
				<MetricCard icon={<FileText className="size-5" aria-hidden="true" />} label="Documents" value={data.counts.documents.toLocaleString()} />
				<MetricCard icon={<FolderUp className="size-5" aria-hidden="true" />} label="Files" value={data.counts.files.toLocaleString()} />
				<MetricCard icon={<Bot className="size-5" aria-hidden="true" />} label="Questions" value={data.counts.supportQuestions.toLocaleString()} />
			</section>

			<section className="mt-6 grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
				<div id="rag-controls" className="space-y-6 scroll-mt-28">
					<AdminActions
						canInviteAdmins={authResult.user.isSuperAdmin}
						initialFiles={data.files}
						initialInvitations={data.invitations}
					/>
				</div>

				<div className="space-y-6">
					<Panel id="documents" title="Knowledge base documents" description="Latest published docs used by the support assistant.">
						<div className="space-y-3">
							{data.documents.length ? (
								data.documents.map((document) => (
									<div key={document.id} className="rounded-[8px] border border-[#dbe7f3] bg-[#f8fbff] p-4">
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0">
												<p className="truncate font-bold">{document.title}</p>
												<p className="mt-1 text-sm text-[#52677d]">{document.category} / {document.source}</p>
											</div>
											<StatusBadge tone="success">{document.status}</StatusBadge>
										</div>
										<p className="mt-3 text-xs font-medium text-[#6b8196]">Updated {formatDate(document.updated_at)}</p>
									</div>
								))
							) : (
								<EmptyState title="No documents indexed" description="Add documentation or upload files from the RAG controls panel." />
							)}
						</div>
					</Panel>

					<Panel id="usage" title="Recent usage" description="Newest API events across users and API keys.">
						<div className="overflow-hidden rounded-[8px] border border-[#dbe7f3]">
							<table className="w-full text-left text-sm">
								<thead className="bg-[#f8fbff] text-xs uppercase text-[#52677d]">
									<tr>
										<th className="px-4 py-3">Request</th>
										<th className="px-4 py-3">Status</th>
										<th className="px-4 py-3">Latency</th>
									</tr>
								</thead>
								<tbody>
									{data.recentUsage.length ? (
										data.recentUsage.map((event) => (
											<tr key={event.id} className="border-t border-[#e7eef6]">
												<td className="px-4 py-3 font-medium">{event.method} {event.endpoint}</td>
												<td className="px-4 py-3">{event.status_code}</td>
												<td className="px-4 py-3">{event.latency_ms}ms</td>
											</tr>
										))
									) : (
										<tr>
											<td className="px-4 py-6 text-[#52677d]" colSpan={3}>
												No API traffic yet.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</Panel>

					<Panel id="reviews" title="Answer quality reviews" description="Feedback captured for assistant answers.">
						<div className="space-y-3">
							{data.feedback.length ? (
								data.feedback.map((item) => (
									<div key={item.id} className="rounded-[8px] border border-[#dbe7f3] bg-[#f8fbff] p-4 text-sm">
										<div className="flex items-center justify-between gap-3">
											<p className="font-bold capitalize">{item.rating}</p>
											<StatusBadge tone={item.rating === "positive" ? "success" : "neutral"}>{formatDate(item.created_at)}</StatusBadge>
										</div>
										<p className="mt-2 leading-6 text-[#52677d]">{item.notes ?? "No notes"}</p>
									</div>
								))
							) : (
								<EmptyState title="No answer reviews yet" description="Feedback will appear here when assistant answers are reviewed." />
							)}
						</div>
					</Panel>
				</div>
			</section>
		</AppShell>
	);
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
	return (
		<div className="rounded-[8px] border border-[#dbe7f3] bg-white p-5 shadow-sm">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="text-sm font-semibold text-[#52677d]">{label}</p>
					<p className="mt-2 text-2xl font-bold">{value}</p>
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
