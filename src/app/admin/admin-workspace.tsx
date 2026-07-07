"use client";

import type { ReactNode } from "react";
import { BarChart3, Bot, FileText, FolderUp, LifeBuoy, Users, KeyRound } from "lucide-react";
import AdminActions from "./admin-actions";
import { type AdminDashboardSection, useDashboardUiStore } from "@/lib/stores/dashboard-ui-store";
import type { AdminInvitation, KnowledgeFile } from "@/lib/stores/admin-actions-store";

type DocumentRecord = {
	id: string;
	title: string;
	slug: string;
	category: string;
	status: string;
	source: string;
	updated_at: string;
};

type UsageRecord = {
	id: string;
	endpoint: string;
	method: string;
	status_code: number;
	latency_ms: number;
	created_at: string;
};

type FeedbackRecord = {
	id: string;
	rating: string;
	notes: string | null;
	created_at: string;
};

type AdminDashboardData = {
	counts: {
		users: number;
		apiKeys: number;
		requests: number;
		documents: number;
		files: number;
		supportQuestions: number;
	};
	documents: DocumentRecord[];
	files: KnowledgeFile[];
	invitations: AdminInvitation[];
	recentUsage: UsageRecord[];
	feedback: FeedbackRecord[];
};

const sectionItems: Array<{
	id: AdminDashboardSection;
	label: string;
	description: string;
	icon: ReactNode;
}> = [
	{
		id: "overview",
		label: "Overview",
		description: "Operational health and quick context.",
		icon: <BarChart3 className="size-4" aria-hidden="true" />,
	},
	{
		id: "rag",
		label: "RAG controls",
		description: "Invite admins, add docs, upload files.",
		icon: <Bot className="size-4" aria-hidden="true" />,
	},
	{
		id: "documents",
		label: "Documents",
		description: "Indexed knowledge base content.",
		icon: <FileText className="size-4" aria-hidden="true" />,
	},
	{
		id: "usage",
		label: "Usage",
		description: "Recent API traffic across users.",
		icon: <BarChart3 className="size-4" aria-hidden="true" />,
	},
	{
		id: "reviews",
		label: "Reviews",
		description: "Assistant answer quality feedback.",
		icon: <LifeBuoy className="size-4" aria-hidden="true" />,
	},
];

export default function AdminWorkspace({
	data,
	canInviteAdmins,
}: {
	data: AdminDashboardData;
	canInviteAdmins: boolean;
}) {
	const { adminSection, setAdminSection } = useDashboardUiStore();

	return (
		<div className="space-y-6">
			<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
				<MetricCard icon={<Users className="size-5" aria-hidden="true" />} label="Users" value={data.counts.users.toLocaleString()} />
				<MetricCard icon={<KeyRound className="size-5" aria-hidden="true" />} label="API keys" value={data.counts.apiKeys.toLocaleString()} />
				<MetricCard icon={<BarChart3 className="size-5" aria-hidden="true" />} label="Requests" value={data.counts.requests.toLocaleString()} />
				<MetricCard icon={<FileText className="size-5" aria-hidden="true" />} label="Documents" value={data.counts.documents.toLocaleString()} />
				<MetricCard icon={<FolderUp className="size-5" aria-hidden="true" />} label="Files" value={data.counts.files.toLocaleString()} />
				<MetricCard icon={<Bot className="size-5" aria-hidden="true" />} label="Questions" value={data.counts.supportQuestions.toLocaleString()} />
			</section>

			<section className="grid gap-6 xl:grid-cols-[320px_1fr]">
				<div className="rounded-[8px] border border-[#dbe7f3] bg-white p-3 shadow-sm">
					<p className="px-2 pb-2 text-xs font-bold uppercase tracking-[0.08em] text-[#52677d]">Items</p>
					<div className="space-y-2">
						{sectionItems.map((item) => (
							<button
								key={item.id}
								type="button"
								className={`flex w-full items-start gap-3 rounded-[8px] p-3 text-left transition ${
									adminSection === item.id
										? "bg-[#edfafa] text-[#102133] ring-1 ring-[#b9e1e1]"
										: "text-[#40566d] hover:bg-[#f8fbff]"
								}`}
								onClick={() => setAdminSection(item.id)}
							>
								<span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-[8px] bg-white text-[#1e7f86] ring-1 ring-[#dbe7f3]">
									{item.icon}
								</span>
								<span>
									<span className="block text-sm font-bold">{item.label}</span>
									<span className="mt-1 block text-xs leading-5 text-[#52677d]">{item.description}</span>
								</span>
							</button>
						))}
					</div>
				</div>

				<div className="min-w-0">
					{adminSection === "overview" ? <OverviewPanel data={data} /> : null}
					{adminSection === "rag" ? (
						<AdminActions
							canInviteAdmins={canInviteAdmins}
							initialFiles={data.files}
							initialInvitations={data.invitations}
						/>
					) : null}
					{adminSection === "documents" ? <DocumentsPanel documents={data.documents} /> : null}
					{adminSection === "usage" ? <UsagePanel recentUsage={data.recentUsage} /> : null}
					{adminSection === "reviews" ? <ReviewsPanel feedback={data.feedback} /> : null}
				</div>
			</section>
		</div>
	);
}

function OverviewPanel({ data }: { data: AdminDashboardData }) {
	return (
		<Panel title="Operations overview" description="High-level state for the API platform and support knowledge base.">
			<div className="grid gap-4 lg:grid-cols-2">
				<div className="rounded-[8px] border border-[#dbe7f3] bg-[#f8fbff] p-5">
					<p className="text-sm font-semibold text-[#52677d]">Knowledge base</p>
					<p className="mt-2 text-3xl font-bold">{data.counts.documents.toLocaleString()}</p>
					<p className="mt-2 text-sm text-[#52677d]">{data.counts.files.toLocaleString()} uploaded source files available.</p>
				</div>
				<div className="rounded-[8px] border border-[#dbe7f3] bg-[#f8fbff] p-5">
					<p className="text-sm font-semibold text-[#52677d]">Support signal</p>
					<p className="mt-2 text-3xl font-bold">{data.counts.supportQuestions.toLocaleString()}</p>
					<p className="mt-2 text-sm text-[#52677d]">User questions are stored for answer quality review.</p>
				</div>
			</div>
		</Panel>
	);
}

function DocumentsPanel({ documents }: { documents: DocumentRecord[] }) {
	return (
		<Panel title="Knowledge base documents" description="Latest published docs used by the support assistant.">
			<div className="space-y-3">
				{documents.length ? (
					documents.map((document) => (
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
	);
}

function UsagePanel({ recentUsage }: { recentUsage: UsageRecord[] }) {
	return (
		<Panel title="Recent usage" description="Newest API events across users and API keys.">
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
						{recentUsage.length ? (
							recentUsage.map((event) => (
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
	);
}

function ReviewsPanel({ feedback }: { feedback: FeedbackRecord[] }) {
	return (
		<Panel title="Answer quality reviews" description="Feedback captured for assistant answers.">
			<div className="space-y-3">
				{feedback.length ? (
					feedback.map((item) => (
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

function Panel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
	return (
		<section className="rounded-[8px] border border-[#dbe7f3] bg-white p-5 shadow-sm">
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
