import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, PawPrint } from "lucide-react";

type NavItem = {
	label: string;
	href: string;
	icon: ReactNode;
	active?: boolean;
};

type AppShellUser = {
	name: string | null;
	email: string;
	avatarUrl: string | null;
	roleLabel?: string;
};

export default function AppShell({
	title,
	description,
	eyebrow,
	navItems,
	user,
	actions,
	children,
}: {
	title: string;
	description: string;
	eyebrow: string;
	navItems: NavItem[];
	user: AppShellUser;
	actions?: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="min-h-screen bg-[#f7fbff] text-[#102133]">
			<aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-[#dbe7f3] bg-white lg:flex">
				<div className="border-b border-[#e7eef6] px-5 py-5">
					<Link className="flex items-center gap-3 font-semibold" href="/" aria-label="PetAPI Cloud home">
						<span className="grid size-10 place-items-center rounded-[8px] bg-[#1e7f86] text-white">
							<PawPrint className="size-5" aria-hidden="true" />
						</span>
						<span>PetAPI Cloud</span>
					</Link>
				</div>

				<nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Dashboard navigation">
					{navItems.map((item) => (
						<Link
							key={`${item.href}-${item.label}`}
							href={item.href}
							className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm font-semibold transition ${
								item.active
									? "bg-[#edfafa] text-[#1e7f86] ring-1 ring-[#b9e1e1]"
									: "text-[#40566d] hover:bg-[#f7fbff] hover:text-[#102133]"
							}`}
						>
							<span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-white/80 text-current ring-1 ring-[#e7eef6]">
								{item.icon}
							</span>
							<span>{item.label}</span>
						</Link>
					))}
				</nav>

				<div className="border-t border-[#e7eef6] p-4">
					<div className="rounded-[8px] border border-[#dbe7f3] bg-[#f8fbff] p-3">
						<div className="flex items-center gap-3">
							{user.avatarUrl ? (
								<span
									className="size-10 rounded-[8px] bg-cover bg-center"
									style={{ backgroundImage: `url(${user.avatarUrl})` }}
									aria-hidden="true"
								/>
							) : (
								<span className="grid size-10 place-items-center rounded-[8px] bg-[#102133] text-sm font-bold text-white">
									{getInitials(user.name ?? user.email)}
								</span>
							)}
							<div className="min-w-0">
								<p className="truncate text-sm font-bold">{user.name ?? "PetAPI user"}</p>
								<p className="truncate text-xs text-[#52677d]">{user.email}</p>
							</div>
						</div>
						{user.roleLabel ? (
							<p className="mt-3 inline-flex rounded-[8px] bg-white px-2 py-1 text-xs font-bold text-[#1e7f86] ring-1 ring-[#dbe7f3]">
								{user.roleLabel}
							</p>
						) : null}
					</div>
				</div>
			</aside>

			<div className="lg:pl-72">
				<header className="sticky top-0 z-30 border-b border-[#dbe7f3] bg-white/92 backdrop-blur">
					<div className="flex flex-col gap-4 px-5 py-4 sm:px-8 xl:flex-row xl:items-center xl:justify-between">
						<div className="min-w-0">
							<p className="text-xs font-bold uppercase tracking-[0.08em] text-[#1e7f86]">{eyebrow}</p>
							<h1 className="mt-1 truncate text-2xl font-bold sm:text-3xl">{title}</h1>
							<p className="mt-1 max-w-3xl text-sm leading-6 text-[#52677d]">{description}</p>
						</div>
						<div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
					</div>
					<nav className="flex gap-2 overflow-x-auto border-t border-[#edf3f8] px-5 py-2 sm:px-8 lg:hidden" aria-label="Mobile dashboard navigation">
						{navItems.map((item) => (
							<Link
								key={`mobile-${item.href}-${item.label}`}
								href={item.href}
								className={`inline-flex shrink-0 items-center gap-2 rounded-[8px] px-3 py-2 text-sm font-semibold ${
									item.active ? "bg-[#edfafa] text-[#1e7f86]" : "text-[#52677d]"
								}`}
							>
								{item.icon}
								{item.label}
							</Link>
						))}
					</nav>
				</header>

				<main className="px-5 py-6 sm:px-8">{children}</main>
			</div>
		</div>
	);
}

export function ShellActionLink({ href, children }: { href: string; children: ReactNode }) {
	return (
		<Link
			className="inline-flex items-center gap-2 rounded-[8px] border border-[#b7c8d9] bg-white px-3 py-2 text-sm font-bold text-[#40566d] transition hover:border-[#1e7f86] hover:text-[#1e7f86]"
			href={href}
		>
			{children}
			<ArrowUpRight className="size-4" aria-hidden="true" />
		</Link>
	);
}

function getInitials(value: string) {
	return value
		.split(/\s|@/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("") || "PA";
}
