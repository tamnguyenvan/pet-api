"use client";

import { create } from "zustand";

export type UserDashboardSection = "overview" | "api-keys" | "usage" | "support";
export type AdminDashboardSection = "overview" | "rag" | "documents" | "usage" | "reviews";

type DashboardUiState = {
	userSection: UserDashboardSection;
	adminSection: AdminDashboardSection;
	setUserSection: (section: UserDashboardSection) => void;
	setAdminSection: (section: AdminDashboardSection) => void;
};

export const useDashboardUiStore = create<DashboardUiState>((set) => ({
	userSection: "overview",
	adminSection: "overview",
	setUserSection: (section) => set({ userSection: section }),
	setAdminSection: (section) => set({ adminSection: section }),
}));
