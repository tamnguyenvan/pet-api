import { Loader2, PawPrint } from "lucide-react";

export default function PageLoading({ label = "Loading PetAPI Cloud" }: { label?: string }) {
	return (
		<main className="min-h-screen bg-[#f7fbff] text-[#102133]">
			<div className="border-b border-[#dbe7f3] bg-white/92 backdrop-blur">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
					<div className="flex items-center gap-3 font-semibold">
						<span className="grid size-10 place-items-center rounded-[8px] bg-[#1e7f86] text-white">
							<PawPrint className="size-5" aria-hidden="true" />
						</span>
						<span>PetAPI Cloud</span>
					</div>
					<div className="hidden gap-3 sm:flex">
						<span className="h-9 w-20 rounded-[8px] bg-[#edf3f8]" />
						<span className="h-9 w-24 rounded-[8px] bg-[#dbe7f3]" />
					</div>
				</div>
			</div>
			<section className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
				<div className="space-y-5">
					<div className="h-8 w-56 rounded-[8px] bg-[#dbe7f3] loading-shimmer" />
					<div className="h-14 max-w-2xl rounded-[8px] bg-[#dbe7f3] loading-shimmer" />
					<div className="h-14 max-w-xl rounded-[8px] bg-[#e7eef6] loading-shimmer" />
					<div className="h-28 max-w-2xl rounded-[8px] bg-[#edf3f8] loading-shimmer" />
					<div className="flex items-center gap-3 pt-2 text-sm font-semibold text-[#52677d]">
						<Loader2 className="size-4 animate-spin text-[#1e7f86]" aria-hidden="true" />
						<span>{label}</span>
					</div>
				</div>
				<div className="rounded-[8px] border border-[#dbe7f3] bg-white p-4 shadow-[0_24px_70px_rgba(16,33,51,0.10)]">
					<div className="h-72 rounded-[8px] bg-[#102133] loading-shimmer" />
					<div className="mt-4 grid grid-cols-3 gap-3">
						<span className="h-24 rounded-[8px] bg-[#dbe7f3] loading-shimmer" />
						<span className="h-24 rounded-[8px] bg-[#e7eef6] loading-shimmer" />
						<span className="h-24 rounded-[8px] bg-[#dbe7f3] loading-shimmer" />
					</div>
				</div>
			</section>
		</main>
	);
}
