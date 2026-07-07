"use client";

import { create } from "zustand";

export type KnowledgeFile = {
	id: string;
	original_file_name: string;
	mime_type: string;
	size_bytes: number;
	status: "uploaded" | "indexed" | "failed" | "deleted";
	error_message: string | null;
	created_at: string;
};

export type AdminInvitation = {
	id: string;
	email: string;
	role: "admin" | "super_admin" | "user";
	status: "pending" | "accepted" | "revoked" | "expired";
	expires_at: string | null;
	accepted_at: string | null;
	created_at: string;
};

type AdminActionsState = {
	title: string;
	category: string;
	body: string;
	fileTitle: string;
	fileCategory: string;
	selectedFile: File | null;
	fileInputKey: number;
	inviteEmail: string;
	files: KnowledgeFile[];
	invitations: AdminInvitation[];
	message?: string;
	isSaving: boolean;
	hydrate: (files: KnowledgeFile[], invitations: AdminInvitation[]) => void;
	setTitle: (title: string) => void;
	setCategory: (category: string) => void;
	setBody: (body: string) => void;
	setFileTitle: (fileTitle: string) => void;
	setFileCategory: (fileCategory: string) => void;
	setSelectedFile: (selectedFile: File | null) => void;
	clearSelectedFile: () => void;
	setInviteEmail: (inviteEmail: string) => void;
	setFiles: (files: KnowledgeFile[]) => void;
	setInvitations: (invitations: AdminInvitation[]) => void;
	setMessage: (message?: string) => void;
	setIsSaving: (isSaving: boolean) => void;
	resetUploadForm: () => void;
	resetInviteForm: () => void;
};

export const useAdminActionsStore = create<AdminActionsState>((set) => ({
	title: "Getting started with PetAPI Cloud",
	category: "docs",
	body: "Add documentation content that the support assistant should retrieve during RAG.",
	fileTitle: "",
	fileCategory: "uploads",
	selectedFile: null,
	fileInputKey: 0,
	inviteEmail: "",
	files: [],
	invitations: [],
	message: undefined,
	isSaving: false,
	hydrate: (files, invitations) => set({ files, invitations }),
	setTitle: (title) => set({ title }),
	setCategory: (category) => set({ category }),
	setBody: (body) => set({ body }),
	setFileTitle: (fileTitle) => set({ fileTitle }),
	setFileCategory: (fileCategory) => set({ fileCategory }),
	setSelectedFile: (selectedFile) => set({ selectedFile }),
	clearSelectedFile: () => set({ selectedFile: null, fileInputKey: Date.now() }),
	setInviteEmail: (inviteEmail) => set({ inviteEmail }),
	setFiles: (files) => set({ files }),
	setInvitations: (invitations) => set({ invitations }),
	setMessage: (message) => set({ message }),
	setIsSaving: (isSaving) => set({ isSaving }),
	resetUploadForm: () => set((state) => ({ selectedFile: null, fileTitle: "", fileInputKey: state.fileInputKey + 1 })),
	resetInviteForm: () => set({ inviteEmail: "" }),
}));
