"use client";

import type { ReactNode } from "react";
import { Activity, BarChart3, Bot, CircleGauge, KeyRound, LifeBuoy } from "lucide-react";
import CreateApiKeyForm from "./create-api-key-form";
import { type UserDashboardSection, useDashboardUiStore } from "@/lib/stores/dashboard-ui-store";

type ApiKeyRecord = {
	id: string;
	name: string;
	key_prefix: string;
	monthly_limit: number;
	is_active: boolean;
	last_used_at: string | null;
	created_at: string;
};

type UsageEventRecord = {
	id: string;
	endpoint: string;
	method: string;
	status_code: number;
	latency_ms: number;
	request_id: string;
	created_at: string;
};

type ChatSessionRecord = {
	id: string;
	topic: string;
	created_at: string;
	updated_at: string;
};

type SubscriptionRecord = {
	plan: string;
	status: string;
	monthly_request_limit: number;
	current_period_end: string | null;
} | null;

type DashboardData = {
	subscription: SubscriptionRecord;
	apiKeys: ApiKeyRecord[];
	usageEvents: UsageEventRecord[];
	requestsThisMonth: number;
	chatSessions: ChatSessionRecord[];
};

const sectionItems: Array<{
	id: UserDashboardSection;
	label: string;
	description: string;
	icon: ReactNode;
}> = [
	{
		id: "overview",
		label: "Overview",
		description: "Plan, quota, and account health.",
		icon: <CircleGauge className="size-4" aria-hidden="true" />,
	},
	{
		id: "api-keys",
		label: "API keys",
		description: "Create and inspect live keys.",
		icon: <KeyRound className="size-4" aria-hidden="true" />,
	},
	{
		id: "usage",
		label: "Usage",
		description: "Recent traffic and latency.",
		icon: <BarChart3 className="size-4" aria-hidden="true" />,
	},
	{
		id: "support",
		label: "Support",
		description: "Assistant chat sessions.",
		icon: <LifeBuoy className="size-4" aria-hidden="true" />,
	},
];

export default function DashboardWorkspace({
	data,
	requestLimit,
}: {
	data: DashboardData;
	requestLimit: number;
}) {
	const { userSection, setUserSection } = useDashboardUiStore();
	const subscription = data.subscription;
	const usagePercent = requestLimit > 0 ? Math.min(100, Math.round((data.requestsThisMonth / requestLimit) * 100)) : 0;

	return (
		<div className="space-y-6">
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

			<section className="grid gap-6 xl:grid-cols-[320px_1fr]">
				<div className="rounded-[8px] border border-[#dbe7f3] bg-white p-3 shadow-sm">
					<p className="px-2 pb-2 text-xs font-bold uppercase tracking-[0.08em] text-[#52677d]">Items</p>
					<div className="space-y-2">
						{sectionItems.map((item) => (
							<button
								key={item.id}
								type="button"
								className={`flex w-full items-start gap-3 rounded-[8px] p-3 text-left transition ${
									userSection === item.id
										? "bg-[#edfafa] text-[#102133] ring-1 ring-[#b9e1e1]"
										: "text-[#40566d] hover:bg-[#f8fbff]"
								}`}
								onClick={() => setUserSection(item.id)}
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
					{userSection === "overview" ? <OverviewPanel data={data} requestLimit={requestLimit} usagePercent={usagePercent} /> : null}
					{userSection === "api-keys" ? <ApiKeysPanel apiKeys={data.apiKeys} /> : null}
					{userSection === "usage" ? <UsagePanel usageEvents={data.usageEvents} usagePercent={usagePercent} /> : null}
					{userSection === "support" ? <SupportPanel chatSessions={data.chatSessions} /> : null}
				</div>
			</section>
		</div>
	);
}

function OverviewPanel({ data, requestLimit, usagePercent }: { data: DashboardData; requestLimit: number; usagePercent: number }) {
	return (
		<Panel title="Workspace overview" description="The current state of your PetAPI account and API usage.">
			<div className="grid gap-4 lg:grid-cols-2">
				<div className="rounded-[8px] border border-[#dbe7f3] bg-[#f8fbff] p-5">
					<p className="text-sm font-semibold text-[#52677d]">Monthly request usage</p>
					<p className="mt-2 text-3xl font-bold">{usagePercent}%</p>
					<div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e7eef6]">
						<div className="h-full rounded-full bg-[#1e7f86]" style={{ width: `${usagePercent}%` }} />
					</div>
					<p className="mt-3 text-sm text-[#52677d]">
						{data.requestsThisMonth.toLocaleString()} of {requestLimit.toLocaleString()} requests used.
					</p>
				</div>
				<div className="rounded-[8px] border border-[#dbe7f3] bg-[#f8fbff] p-5">
					<p className="text-sm font-semibold text-[#52677d]">Next steps</p>
					<ul className="mt-3 space-y-2 text-sm leading-6 text-[#40566d]">
						<li>Create environment-specific API keys.</li>
						<li>Keep production keys server-side.</li>
						<li>Use request IDs when contacting support.</li>
					</ul>
				</div>
			</div>
		</Panel>
	);
}

function ApiKeysPanel({ apiKeys }: { apiKeys: ApiKeyRecord[] }) {
	return (
		<div className="space-y-6">
			<CreateApiKeyForm />
			<Panel title="API keys" description="Keys are stored hashed. Copy new secrets immediately after creation.">
				<div className="space-y-3">
					{apiKeys.length ? (
						apiKeys.map((key) => (
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
	);
}

function UsagePanel({ usageEvents, usagePercent }: { usageEvents: UsageEventRecord[]; usagePercent: number }) {
	return (
		<Panel title="Usage overview" description="Monthly consumption and recent API traffic.">
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
						{usageEvents.length ? (
							usageEvents.map((event) => (
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
	);
}

function SupportPanel({ chatSessions }: { chatSessions: ChatSessionRecord[] }) {
	return (
		<Panel title="Support chat history" description="Recent sessions with the PetAPI assistant.">
			<div className="grid gap-3 md:grid-cols-2">
				{chatSessions.length ? (
					chatSessions.map((session) => (
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
