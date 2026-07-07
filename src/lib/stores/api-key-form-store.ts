"use client";

import { create } from "zustand";

type ApiKeyFormState = {
	name: string;
	apiKey?: string;
	error?: string;
	isSaving: boolean;
	setName: (name: string) => void;
	setApiKey: (apiKey?: string) => void;
	setError: (error?: string) => void;
	setIsSaving: (isSaving: boolean) => void;
	resetResult: () => void;
};

export const useApiKeyFormStore = create<ApiKeyFormState>((set) => ({
	name: "Production key",
	apiKey: undefined,
	error: undefined,
	isSaving: false,
	setName: (name) => set({ name }),
	setApiKey: (apiKey) => set({ apiKey }),
	setError: (error) => set({ error }),
	setIsSaving: (isSaving) => set({ isSaving }),
	resetResult: () => set({ apiKey: undefined, error: undefined }),
}));
