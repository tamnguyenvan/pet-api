"use client";

import { FormEvent, useState } from "react";

export default function CreateApiKeyForm() {
	const [name, setName] = useState("Production key");
	const [apiKey, setApiKey] = useState<string>();
	const [error, setError] = useState<string>();
	const [isSaving, setIsSaving] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsSaving(true);
		setError(undefined);
		setApiKey(undefined);

		const response = await fetch("/api/dashboard/api-keys", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name }),
		});
		const payload = (await response.json()) as { apiKey?: string; error?: string };

		if (!response.ok || !payload.apiKey) {
			setError(payload.error ?? "Unable to create API key.");
		} else {
			setApiKey(payload.apiKey);
		}

		setIsSaving(false);
	}

	return (
		<form className="rounded-[8px] border border-[#dbe7f3] bg-white p-5" onSubmit={handleSubmit}>
			<h2 className="text-xl font-bold">Create API key</h2>
			<div className="mt-4 flex flex-col gap-3 sm:flex-row">
				<input
					className="min-w-0 flex-1 rounded-[8px] border border-[#b7c8d9] px-3 py-3 text-sm outline-none focus:border-[#1e7f86]"
					value={name}
					onChange={(event) => setName(event.target.value)}
					placeholder="Key name"
				/>
				<button className="rounded-[8px] bg-[#102133] px-5 py-3 text-sm font-bold text-white hover:bg-[#1e7f86]" disabled={isSaving}>
					{isSaving ? "Creating..." : "Create key"}
				</button>
			</div>
			{apiKey ? (
				<div className="mt-4 rounded-[8px] border border-[#b9e1e1] bg-[#edfafa] p-3">
					<p className="text-sm font-semibold text-[#1e7f86]">Copy now. This secret is shown once.</p>
					<code className="mt-2 block overflow-x-auto text-sm text-[#102133]">{apiKey}</code>
				</div>
			) : null}
			{error ? <p className="mt-3 text-sm font-semibold text-[#d84c40]">{error}</p> : null}
		</form>
	);
}
