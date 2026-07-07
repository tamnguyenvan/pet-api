"use client";

import { FormEvent, useEffect } from "react";
import { FileUp, Loader2, RefreshCw, Send, ShieldPlus, Trash2, UploadCloud } from "lucide-react";
import {
	type AdminInvitation,
	type KnowledgeFile,
	useAdminActionsStore,
} from "@/lib/stores/admin-actions-store";

type ApiPayload = {
	error?: string;
	files?: KnowledgeFile[];
	invitations?: AdminInvitation[];
	documents?: number;
	chunks?: number;
	embeddedChunks?: number;
	failedEmbeddings?: number;
	embeddingsEnabled?: boolean;
	provider?: string;
	embeddingModel?: string;
	embeddingDimensions?: number;
	mode?: "invited" | "promoted";
};

export default function AdminActions({
	canInviteAdmins,
	initialFiles,
	initialInvitations,
}: {
	canInviteAdmins: boolean;
	initialFiles: KnowledgeFile[];
	initialInvitations: AdminInvitation[];
}) {
	const {
		title,
		category,
		body,
		fileTitle,
		fileCategory,
		selectedFile,
		fileInputKey,
		inviteEmail,
		files,
		invitations,
		message,
		isSaving,
		hydrate,
		setTitle,
		setCategory,
		setBody,
		setFileTitle,
		setFileCategory,
		setSelectedFile,
		setInviteEmail,
		setFiles,
		setInvitations,
		setMessage,
		setIsSaving,
		resetUploadForm,
		resetInviteForm,
	} = useAdminActionsStore();

	useEffect(() => {
		hydrate(initialFiles, initialInvitations);
	}, [hydrate, initialFiles, initialInvitations]);

	async function loadFiles() {
		const response = await fetch("/api/admin/uploads");
		const payload = (await response.json()) as ApiPayload;

		if (response.ok) {
			setFiles(payload.files ?? []);
		}
	}

	async function loadInvitations() {
		if (!canInviteAdmins) {
			return;
		}

		const response = await fetch("/api/admin/invitations");
		const payload = (await response.json()) as ApiPayload;

		if (response.ok) {
			setInvitations(payload.invitations ?? []);
		}
	}

	async function saveDocument(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsSaving(true);
		setMessage(undefined);

		try {
			const response = await fetch("/api/admin/documents", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ title, category, body }),
			});
			const payload = (await response.json()) as ApiPayload;
			setMessage(response.ok ? "Document saved and indexed for RAG." : payload.error ?? "Unable to save document.");
		} finally {
			setIsSaving(false);
		}
	}

	async function uploadFile(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!selectedFile) {
			setMessage("Choose a file to upload.");
			return;
		}

		setIsSaving(true);
		setMessage(undefined);

		const formData = new FormData();
		formData.set("file", selectedFile);
		formData.set("title", fileTitle);
		formData.set("category", fileCategory);

		try {
			const response = await fetch("/api/admin/uploads", {
				method: "POST",
				body: formData,
			});
			const payload = (await response.json()) as ApiPayload;

			if (response.ok) {
				setMessage("File uploaded, converted into a RAG document, and indexed.");
				resetUploadForm();
				await loadFiles();
			} else {
				setMessage(payload.error ?? "Unable to upload file.");
			}
		} finally {
			setIsSaving(false);
		}
	}

	async function inviteAdmin(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsSaving(true);
		setMessage(undefined);

		try {
			const response = await fetch("/api/admin/invitations", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email: inviteEmail }),
			});
			const payload = (await response.json()) as ApiPayload;

			if (response.ok) {
				setMessage(payload.mode === "promoted" ? "Existing user promoted to admin." : "Admin invitation sent.");
				resetInviteForm();
				await loadInvitations();
			} else {
				setMessage(payload.error ?? "Unable to invite admin.");
			}
		} finally {
			setIsSaving(false);
		}
	}

	async function reindexAll() {
		setIsSaving(true);
		setMessage(undefined);

		try {
			const response = await fetch("/api/admin/rag/reindex", { method: "POST" });
			const payload = (await response.json()) as ApiPayload;

			setMessage(
				response.ok
					? `Re-indexed ${payload.documents ?? 0} documents into ${payload.chunks ?? 0} chunks. Embedded ${payload.embeddedChunks ?? 0} with ${payload.provider ?? "AI"} ${payload.embeddingModel ?? ""}${payload.embeddingDimensions ? ` (${payload.embeddingDimensions}d)` : ""}. Failed embeddings: ${payload.failedEmbeddings ?? 0}.`
					: payload.error ?? "Unable to re-index documents.",
			);
		} finally {
			setIsSaving(false);
		}
	}

	async function deleteFile(fileId: string) {
		setIsSaving(true);
		setMessage(undefined);

		try {
			const response = await fetch(`/api/admin/uploads/${fileId}`, { method: "DELETE" });
			const payload = (await response.json()) as ApiPayload;

			if (response.ok) {
				setMessage("Uploaded file and linked RAG document deleted.");
				await loadFiles();
			} else {
				setMessage(payload.error ?? "Unable to delete file.");
			}
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<>
			{canInviteAdmins ? (
				<section className="rounded-[8px] border border-[#dbe7f3] bg-white p-5 shadow-sm">
					<div className="flex items-start gap-3">
						<span className="grid size-10 place-items-center rounded-[8px] bg-[#e8f6f7] text-[#1e7f86]">
							<ShieldPlus className="size-5" aria-hidden="true" />
						</span>
						<div>
							<h2 className="text-xl font-bold">Invite admin</h2>
							<p className="mt-1 text-sm leading-6 text-[#52677d]">Super admins can invite admins. Invited admins can manage RAG docs and uploads, but cannot invite admins.</p>
						</div>
					</div>
					<form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={inviteAdmin}>
						<input
							className="min-w-0 flex-1 rounded-[8px] border border-[#b7c8d9] px-3 py-3 text-sm outline-none focus:border-[#1e7f86]"
							value={inviteEmail}
							onChange={(event) => setInviteEmail(event.target.value)}
							placeholder="admin@example.com"
							type="email"
						/>
						<button className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#102133] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1e7f86] disabled:cursor-not-allowed disabled:opacity-70" disabled={isSaving}>
							<Send className="size-4" aria-hidden="true" />
							Send invite
						</button>
					</form>
					<div className="mt-4 space-y-2">
						{invitations.length ? (
							invitations.map((invitation) => (
								<div key={invitation.id} className="rounded-[8px] border border-[#dbe7f3] bg-[#f8fbff] p-3 text-sm">
									<div className="flex items-center justify-between gap-3">
										<p className="font-bold">{invitation.email}</p>
										<span className="rounded-[8px] bg-[#edfafa] px-2 py-1 text-xs font-bold text-[#1e7f86]">{invitation.status}</span>
									</div>
									<p className="mt-1 text-[#52677d]">Role: {invitation.role.replace("_", " ")}</p>
								</div>
							))
						) : (
							<p className="text-sm text-[#52677d]">No admin invitations yet.</p>
						)}
					</div>
				</section>
			) : null}

			<section className="rounded-[8px] border border-[#dbe7f3] bg-white p-5 shadow-sm">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-3">
						<span className="grid size-10 place-items-center rounded-[8px] bg-[#e8f6f7] text-[#1e7f86]">
							<FileUp className="size-5" aria-hidden="true" />
						</span>
						<div>
							<h2 className="text-xl font-bold">Knowledge base controls</h2>
							<p className="mt-1 text-sm leading-6 text-[#52677d]">Add docs, upload text and PDF files, and regenerate chunks/embeddings for RAG.</p>
						</div>
					</div>
					<button className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-[#b7c8d9] bg-white px-4 py-2 text-sm font-bold transition hover:border-[#1e7f86] disabled:cursor-not-allowed disabled:opacity-70" onClick={reindexAll} disabled={isSaving}>
						{isSaving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="size-4" aria-hidden="true" />}
						Re-index all
					</button>
				</div>
				<form className="mt-5 space-y-3" onSubmit={saveDocument}>
					<input
						className="w-full rounded-[8px] border border-[#b7c8d9] px-3 py-3 text-sm outline-none focus:border-[#1e7f86]"
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						placeholder="Document title"
					/>
					<input
						className="w-full rounded-[8px] border border-[#b7c8d9] px-3 py-3 text-sm outline-none focus:border-[#1e7f86]"
						value={category}
						onChange={(event) => setCategory(event.target.value)}
						placeholder="Category"
					/>
					<textarea
						className="min-h-36 w-full rounded-[8px] border border-[#b7c8d9] px-3 py-3 text-sm outline-none focus:border-[#1e7f86]"
						value={body}
						onChange={(event) => setBody(event.target.value)}
						placeholder="Document body"
					/>
					<button className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#102133] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1e7f86] disabled:cursor-not-allowed disabled:opacity-70" disabled={isSaving}>
						{isSaving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <FileUp className="size-4" aria-hidden="true" />}
						{isSaving ? "Saving..." : "Save document"}
					</button>
				</form>
				<form className="mt-6 space-y-3 border-t border-[#dbe7f3] pt-5" onSubmit={uploadFile}>
					<h3 className="font-bold">Upload RAG file</h3>
					<input
						className="w-full rounded-[8px] border border-[#b7c8d9] px-3 py-3 text-sm outline-none focus:border-[#1e7f86]"
						value={fileTitle}
						onChange={(event) => setFileTitle(event.target.value)}
						placeholder="Optional document title"
					/>
					<input
						className="w-full rounded-[8px] border border-[#b7c8d9] px-3 py-3 text-sm outline-none focus:border-[#1e7f86]"
						value={fileCategory}
						onChange={(event) => setFileCategory(event.target.value)}
						placeholder="Category"
					/>
					<input
						key={fileInputKey}
						accept=".txt,.md,.markdown,.json,.csv,.pdf,text/plain,text/markdown,application/json,text/csv,application/pdf"
						className="w-full rounded-[8px] border border-[#b7c8d9] px-3 py-3 text-sm outline-none focus:border-[#1e7f86]"
						onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
						type="file"
					/>
					<button className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#102133] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1e7f86] disabled:cursor-not-allowed disabled:opacity-70" disabled={isSaving}>
						<UploadCloud className="size-4" aria-hidden="true" />
						Upload and index
					</button>
				</form>
				{message ? <p className="mt-4 rounded-[8px] bg-[#f7fbff] p-3 text-sm font-semibold text-[#40566d]">{message}</p> : null}
			</section>

			<section className="rounded-[8px] border border-[#dbe7f3] bg-white p-5 shadow-sm">
				<div className="flex items-start gap-3">
					<span className="grid size-10 place-items-center rounded-[8px] bg-[#e8f6f7] text-[#1e7f86]">
						<UploadCloud className="size-5" aria-hidden="true" />
					</span>
					<div>
						<h2 className="text-xl font-bold">Uploaded file manager</h2>
						<p className="mt-1 text-sm leading-6 text-[#52677d]">Manage uploaded source files and linked RAG documents.</p>
					</div>
				</div>
				<div className="mt-4 space-y-3">
					{files.length ? (
						files.map((file) => (
							<div key={file.id} className="rounded-[8px] border border-[#dbe7f3] bg-[#f8fbff] p-4 text-sm">
								<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
									<div className="min-w-0">
										<p className="break-words font-bold">{file.original_file_name}</p>
										<p className="mt-1 text-[#52677d]">
											{formatBytes(file.size_bytes)} / {file.mime_type} / {file.status}
										</p>
										{file.error_message ? <p className="mt-2 text-[#9b2c2c]">{file.error_message}</p> : null}
									</div>
									<button className="inline-flex items-center justify-center gap-2 rounded-[8px] border border-[#b7c8d9] bg-white px-3 py-2 font-bold transition hover:border-[#9b2c2c] hover:text-[#9b2c2c] disabled:cursor-not-allowed disabled:opacity-70" disabled={isSaving} onClick={() => void deleteFile(file.id)}>
										<Trash2 className="size-4" aria-hidden="true" />
										Delete
									</button>
								</div>
							</div>
						))
					) : (
						<p className="text-sm text-[#52677d]">No uploaded files yet.</p>
					)}
				</div>
			</section>
		</>
	);
}

function formatBytes(value: number) {
	if (value < 1024) {
		return `${value} B`;
	}

	if (value < 1024 * 1024) {
		return `${(value / 1024).toFixed(1)} KB`;
	}

	return `${(value / 1024 / 1024).toFixed(1)} MB`;
}
