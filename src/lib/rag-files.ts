import type { AppAuthUser } from "./auth";
import { getAiProvider } from "./ai";
import { ragUploadsBucket } from "./env";
import { slugify } from "./crypto";
import { createSupportDocument } from "./rag";
import { getSupabaseAdmin } from "./supabase-admin";
import { ensureAppUser } from "./users";

export type RagFileRecord = {
	id: string;
	document_id: string | null;
	uploaded_by_user_id: string | null;
	original_file_name: string;
	storage_bucket: string;
	storage_path: string;
	mime_type: string;
	size_bytes: number;
	status: "uploaded" | "indexed" | "failed" | "deleted";
	error_message: string | null;
	created_at: string;
	updated_at: string;
};

export class RagFileForbiddenError extends Error {
	status = 403;
}

const maxUploadBytes = 6 * 1024 * 1024;
const extensionToContentType: Record<string, string> = {
	txt: "text/plain",
	md: "text/markdown",
	markdown: "text/markdown",
	json: "application/json",
	csv: "text/csv",
	pdf: "application/pdf",
};

const allowedExtensions = new Set(Object.keys(extensionToContentType));
const allowedContentTypes = new Set([...Object.values(extensionToContentType), "application/octet-stream", ""]);
const textExtensions = new Set(["txt", "md", "markdown", "json", "csv"]);

function getExtension(fileName: string) {
	return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function getSafeFileName(fileName: string) {
	const parts = fileName.split(".");
	const extension = parts.length > 1 ? `.${parts.pop()}` : "";
	const base = slugify(parts.join(".") || fileName) || "rag-upload";

	return `${base}${extension.toLowerCase()}`;
}

function getContentType(file: File, extension: string) {
	return (extensionToContentType[extension] ?? file.type) || "text/plain";
}

async function ensureRagUploadsBucket() {
	const supabase = getSupabaseAdmin();

	if (!supabase) {
		throw new Error("Supabase is not configured.");
	}

	const { data } = await supabase.storage.getBucket(ragUploadsBucket);

	if (data) {
		return;
	}

	const { error } = await supabase.storage.createBucket(ragUploadsBucket, {
		public: false,
		fileSizeLimit: maxUploadBytes,
	});

	if (error && !error.message.toLowerCase().includes("already exists")) {
		throw error;
	}
}

async function extractText(file: File, extension: string, contentType: string) {
	if (!textExtensions.has(extension)) {
		const provider = getAiProvider();

		if (!provider.isConfigured || !provider.extractFileText) {
			throw new Error("Gemini must be configured to extract text from PDF uploads.");
		}

		const extractedText = (await provider.extractFileText({
			fileName: file.name,
			mimeType: contentType,
			data: await file.arrayBuffer(),
		}))?.trim();

		if (!extractedText) {
			throw new Error("No readable text could be extracted from the uploaded file.");
		}

		return extractedText;
	}

	const rawText = (await file.text()).trim();

	if (!rawText) {
		throw new Error("The uploaded file is empty.");
	}

	if (extension !== "json") {
		return rawText;
	}

	try {
		return JSON.stringify(JSON.parse(rawText), null, 2);
	} catch {
		return rawText;
	}
}

function validateFile(file: File) {
	if (file.size > maxUploadBytes) {
		throw new Error("RAG uploads must be 6MB or smaller.");
	}

	const extension = getExtension(file.name);

	if (!allowedExtensions.has(extension)) {
		throw new Error("Unsupported file type. Upload .txt, .md, .markdown, .json, .csv, or .pdf files.");
	}

	if (!allowedContentTypes.has(file.type)) {
		throw new Error("Unsupported MIME type for RAG upload.");
	}

	return extension;
}

export async function listKnowledgeFiles(user: AppAuthUser) {
	const supabase = getSupabaseAdmin();
	const appUser = await ensureAppUser(user);

	if (!supabase || !appUser) {
		throw new Error("Supabase is not configured.");
	}

	let query = supabase
		.from("rag_files")
		.select(
			"id,document_id,uploaded_by_user_id,original_file_name,storage_bucket,storage_path,mime_type,size_bytes,status,error_message,created_at,updated_at",
		)
		.neq("status", "deleted")
		.order("created_at", { ascending: false });

	if (appUser.role !== "super_admin") {
		query = query.eq("uploaded_by_user_id", appUser.id);
	}

	const { data, error } = await query;

	if (error) {
		throw error;
	}

	return (data ?? []) as RagFileRecord[];
}

export async function uploadKnowledgeFile({
	user,
	file,
	title,
	category,
}: {
	user: AppAuthUser;
	file: File;
	title?: string;
	category?: string;
}) {
	const supabase = getSupabaseAdmin();
	const appUser = await ensureAppUser(user);

	if (!supabase || !appUser) {
		throw new Error("Supabase is not configured.");
	}

	const extension = validateFile(file);
	const contentType = getContentType(file, extension);
	const text = await extractText(file, extension, contentType);
	const safeFileName = getSafeFileName(file.name);
	const storagePath = `${appUser.id}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeFileName}`;

	await ensureRagUploadsBucket();

	const { error: uploadError } = await supabase.storage.from(ragUploadsBucket).upload(storagePath, file, {
		contentType,
		upsert: false,
	});

	if (uploadError) {
		throw uploadError;
	}

	const { data: fileRecord, error: fileError } = await supabase
		.from("rag_files")
		.insert({
			uploaded_by_user_id: appUser.id,
			original_file_name: file.name,
			storage_bucket: ragUploadsBucket,
			storage_path: storagePath,
			mime_type: contentType,
			size_bytes: file.size,
			status: "uploaded",
			metadata: {
				extension,
			},
		})
		.select(
			"id,document_id,uploaded_by_user_id,original_file_name,storage_bucket,storage_path,mime_type,size_bytes,status,error_message,created_at,updated_at",
		)
		.single();

	if (fileError) {
		await supabase.storage.from(ragUploadsBucket).remove([storagePath]);
		throw fileError;
	}

	try {
		const document = await createSupportDocument({
			title: title?.trim() || file.name,
			body: text,
			category: category?.trim() || "uploads",
			source: "upload",
			uploadedByUserId: appUser.id,
			metadata: {
				fileUploadId: fileRecord.id,
				fileName: file.name,
				mimeType: contentType,
				sizeBytes: file.size,
				storageBucket: ragUploadsBucket,
				storagePath,
			},
		});

		const { data: updatedFile, error: updateError } = await supabase
			.from("rag_files")
			.update({
				document_id: document.id,
				status: "indexed",
				error_message: null,
			})
			.eq("id", fileRecord.id)
			.select(
				"id,document_id,uploaded_by_user_id,original_file_name,storage_bucket,storage_path,mime_type,size_bytes,status,error_message,created_at,updated_at",
			)
			.single();

		if (updateError) {
			throw updateError;
		}

		return { file: updatedFile as RagFileRecord, document };
	} catch (error) {
		await supabase
			.from("rag_files")
			.update({
				status: "failed",
				error_message: error instanceof Error ? error.message : "Unable to index file.",
			})
			.eq("id", fileRecord.id);

		throw error;
	}
}

export async function deleteKnowledgeFile(user: AppAuthUser, fileId: string) {
	const supabase = getSupabaseAdmin();
	const appUser = await ensureAppUser(user);

	if (!supabase || !appUser) {
		throw new Error("Supabase is not configured.");
	}

	const { data: file, error } = await supabase
		.from("rag_files")
		.select("id,document_id,uploaded_by_user_id,storage_bucket,storage_path,status")
		.eq("id", fileId)
		.neq("status", "deleted")
		.maybeSingle();

	if (error) {
		throw error;
	}

	if (!file) {
		return { deleted: false };
	}

	if (appUser.role !== "super_admin" && file.uploaded_by_user_id !== appUser.id) {
		throw new RagFileForbiddenError("You can only delete files that you uploaded.");
	}

	const { error: removeError } = await supabase.storage.from(file.storage_bucket).remove([file.storage_path]);

	if (removeError) {
		throw removeError;
	}

	if (file.document_id) {
		const { error: documentError } = await supabase.from("support_documents").delete().eq("id", file.document_id);

		if (documentError) {
			throw documentError;
		}
	}

	const { error: updateError } = await supabase
		.from("rag_files")
		.update({
			document_id: null,
			status: "deleted",
		})
		.eq("id", file.id);

	if (updateError) {
		throw updateError;
	}

	return { deleted: true };
}
