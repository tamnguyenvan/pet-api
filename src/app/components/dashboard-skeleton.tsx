import { Loader2, PawPrint } from "lucide-react";

export default function DashboardSkeleton({ label = "Loading dashboard" }: { label?: string }) {
	const navRows = Array.from({ length: 4 }, (_, index) => index);
	const metrics = Array.from({ length: 4 }, (_, index) => index);
	const items = Array.from({ length: 5 }, (_, index) => index);

	return (
		<div className="min-h-screen bg-[#f7fbff] text-[#102133]">
			<aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-[#dbe7f3] bg-white lg:flex">
				<div className="border-b border-[#e7eef6] px-5 py-5">
					<div className="flex items-center gap-3 font-semibold">
						<span className="grid size-10 place-items-center rounded-[8px] bg-[#1e7f86] text-white">
							<PawPrint className="size-5" aria-hidden="true" />
						</span>
						<span>PetAPI Cloud</span>
					</div>
				</div>
				<div className="flex-1 space-y-2 px-3 py-5">
					{navRows.map((row) => (
						<div key={row} className="h-12 rounded-[8px] bg-[#edf3f8] loading-shimmer" />
					))}
				</div>
				<div className="border-t border-[#e7eef6] p-4">
					<div className="h-24 rounded-[8px] bg-[#edf3f8] loading-shimmer" />
				</div>
			</aside>
			<div className="lg:pl-72">
				<header className="sticky top-0 z-30 border-b border-[#dbe7f3] bg-white/92 backdrop-blur">
					<div className="flex flex-col gap-4 px-5 py-4 sm:px-8 xl:flex-row xl:items-center xl:justify-between">
						<div className="space-y-2">
							<div className="h-3 w-24 rounded-full bg-[#dbe7f3] loading-shimmer" />
							<div className="h-8 w-64 rounded-[8px] bg-[#dbe7f3] loading-shimmer" />
							<div className="h-4 w-[min(520px,75vw)] rounded-full bg-[#edf3f8] loading-shimmer" />
						</div>
						<div className="flex gap-2">
							<div className="h-9 w-20 rounded-[8px] bg-[#edf3f8] loading-shimmer" />
							<div className="h-9 w-24 rounded-[8px] bg-[#dbe7f3] loading-shimmer" />
						</div>
					</div>
				</header>
				<main className="space-y-6 px-5 py-6 sm:px-8">
					<section className="grid gap-4 xl:grid-cols-4">
						{metrics.map((metric) => (
							<div key={metric} className="h-32 rounded-[8px] border border-[#dbe7f3] bg-white p-5">
								<div className="h-4 w-24 rounded-full bg-[#edf3f8] loading-shimmer" />
								<div className="mt-4 h-8 w-32 rounded-[8px] bg-[#dbe7f3] loading-shimmer" />
								<div className="mt-3 h-3 w-28 rounded-full bg-[#edf3f8] loading-shimmer" />
							</div>
						))}
					</section>
					<section className="grid gap-6 xl:grid-cols-[320px_1fr]">
						<div className="rounded-[8px] border border-[#dbe7f3] bg-white p-3 shadow-sm">
							<div className="h-3 w-14 rounded-full bg-[#dbe7f3] loading-shimmer" />
							<div className="mt-3 space-y-2">
								{items.map((item) => (
									<div key={item} className="h-20 rounded-[8px] bg-[#edf3f8] loading-shimmer" />
								))}
							</div>
						</div>
						<div className="rounded-[8px] border border-[#dbe7f3] bg-white p-5 shadow-sm">
							<div className="flex items-center gap-2 text-sm font-semibold text-[#52677d]">
								<Loader2 className="size-4 animate-spin text-[#1e7f86]" aria-hidden="true" />
								<span>{label}</span>
							</div>
							<div className="mt-5 h-8 max-w-sm rounded-[8px] bg-[#dbe7f3] loading-shimmer" />
							<div className="mt-3 h-4 max-w-xl rounded-full bg-[#edf3f8] loading-shimmer" />
							<div className="mt-6 grid gap-3 md:grid-cols-2">
								<div className="h-40 rounded-[8px] bg-[#edf3f8] loading-shimmer" />
								<div className="h-40 rounded-[8px] bg-[#edf3f8] loading-shimmer" />
							</div>
						</div>
					</section>
				</main>
			</div>
		</div>
	);
}
