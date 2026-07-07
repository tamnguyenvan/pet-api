"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

type FaqItem = {
	question: string;
	answer: string;
};

export default function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
	const [openIndex, setOpenIndex] = useState(0);

	return (
		<div className="space-y-4">
			{faqs.map((faq, index) => {
				const isOpen = openIndex === index;
				const panelId = `faq-panel-${index}`;

				return (
					<article
						key={faq.question}
						className="rounded-[8px] border border-[#dbe7f3] bg-white p-5 shadow-sm transition duration-300 hover:border-[#b7c8d9] hover:shadow-[0_18px_45px_rgba(16,33,51,0.08)]"
					>
						<button
							type="button"
							className="flex w-full items-center justify-between gap-4 text-left"
							aria-expanded={isOpen}
							aria-controls={panelId}
							onClick={() => setOpenIndex(isOpen ? -1 : index)}
						>
							<span className="flex min-w-0 items-center gap-3">
								<span className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-[#e8f6f7] text-[#1e7f86]">
									<HelpCircle className="size-4" aria-hidden="true" />
								</span>
								<span className="text-lg font-bold text-[#102133]">{faq.question}</span>
							</span>
							<ChevronDown
								className={`size-5 shrink-0 text-[#52677d] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
								aria-hidden="true"
							/>
						</button>
						<div
							id={panelId}
							className={`grid transition-all duration-300 ease-out ${
								isOpen ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
							}`}
						>
							<div className="overflow-hidden">
								<p className="border-t border-[#e7eef6] pt-4 leading-7 text-[#52677d]">{faq.answer}</p>
							</div>
						</div>
					</article>
				);
			})}
		</div>
	);
}
