"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/contexts/SessionContext";

type DashboardData = {
	projects: Array<Record<string, unknown>>;
	invoices: Array<Record<string, unknown>>;
	profile: Record<string, unknown>;
	clientFeedback: Array<Record<string, unknown>>;
	stats: {
		activeProjects: number;
		completedProjects: number;
		totalEarnings: number;
		totalHours: number;
		outstandingInvoices: number;
		averageRating: number;
	};
};

type DashboardContextType = {
	data: DashboardData | undefined;
	isLoading: boolean;
	isError: boolean;
	refetch: () => void;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

async function api<T>(url: string, user?: { getIdToken: () => Promise<string> }): Promise<T> {
	const headers: Record<string, string> = { "Content-Type": "application/json" };
	
	if (user && typeof user.getIdToken === 'function') {
		try {
			const token = await user.getIdToken();
			headers["Authorization"] = `Bearer ${token}`;
		} catch (error) {
			console.error("Failed to get Firebase token:", error);
		}
	}
	
	const res = await fetch(url, { headers });
	const json = await res.json();
	if (!json.ok) {
		throw new Error(json.error?.message || "Request failed");
	}
	return json.data;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
	const { user, loading } = useSession();
	
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["dashboard-summary", user?.uid],
		queryFn: () => api<DashboardData>("/api/dashboard/summary", user || undefined),
		enabled: !!user && !loading,
		staleTime: 30_000, // Cache for 30 seconds
		gcTime: 300_000, // Keep in cache for 5 minutes
		refetchOnWindowFocus: false,
	});

	return (
		<DashboardContext.Provider value={{ data, isLoading, isError, refetch: refetch as () => void }}>
			{children}
		</DashboardContext.Provider>
	);
}

export function useDashboardData() {
	const context = useContext(DashboardContext);
	if (!context) {
		throw new Error("useDashboardData must be used within DashboardProvider");
	}
	return context;
}
