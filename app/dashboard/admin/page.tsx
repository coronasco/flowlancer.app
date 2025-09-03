"use client";

import { useSession } from "@/contexts/SessionContext";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Users, 
  Activity, 
  BarChart3, 
  Shield, 
  TrendingUp,
  Clock,
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

type Ok<T> = { ok: true; data: T };
type Err = { ok: false; error: { message?: string } };
type ApiEnvelope<T> = Ok<T> | Err;

async function api<T>(url: string, init?: RequestInit, user?: { getIdToken: () => Promise<string> }): Promise<T> {
	const headers: Record<string, string> = { "Content-Type": "application/json" };
	if (init?.headers) {
		Object.assign(headers, init.headers);
	}
	
	// Add Firebase auth token if user is available
	if (user && typeof user.getIdToken === 'function') {
		try {
			const token = await user.getIdToken();
			headers["Authorization"] = `Bearer ${token}`;
		} catch (error) {
			console.error("Failed to get Firebase token:", error);
		}
	}
	
	const res = await fetch(url, { ...init, headers });
	const json = (await res.json()) as ApiEnvelope<T>;
	if (!("ok" in json) || json.ok === false) {
		const msg = json && "error" in json ? json.error?.message : undefined;
		throw new Error(msg || "Request failed");
	}
	return json.data;
}

export default function AdminDashboard() {
	const { user } = useSession();
	const router = useRouter();
	const [isAdmin, setIsAdmin] = useState(false);

	// Check if user is admin from Firebase profile
	useEffect(() => {
		const checkAdminStatus = async () => {
			if (user?.uid) {
				try {
					const { getFirestore, doc, getDoc } = await import("firebase/firestore");
					const db = getFirestore();
					const userDoc = await getDoc(doc(db, "customers", user.uid));
					
					if (userDoc.exists()) {
						const userData = userDoc.data();
						const adminStatus = userData.isAdmin === true;
						setIsAdmin(adminStatus);
						if (!adminStatus) {
							router.push("/dashboard");
						}
					} else {
						router.push("/dashboard");
					}
				} catch (error) {
					console.error("Error checking admin status:", error);
					router.push("/dashboard");
				}
			}
		};

		checkAdminStatus();
	}, [user, router]);

	// Fetch real admin data
	const { data: stats } = useQuery({
		queryKey: ["admin-stats"],
		queryFn: () => api<Record<string, unknown>>("/api/admin/stats", undefined, user || undefined),
		enabled: !!user && isAdmin,
		refetchInterval: 30000, // Refresh every 30 seconds
		staleTime: 0, // Force fresh data
		gcTime: 0, // Don't cache
	});

	const { data: activityData } = useQuery({
		queryKey: ["admin-activity"],
		queryFn: () => api<Record<string, unknown>[]>("/api/admin/activity", undefined, user || undefined),
		enabled: !!user && isAdmin,
		refetchInterval: 10000, // Refresh every 10 seconds
	});

	// Format activity data with relative time
	const recentActivity = Array.isArray(activityData) ? activityData.map((activity: Record<string, unknown>) => ({
		...activity,
		time: formatRelativeTime(String(activity.timestamp || ''))
	})) : [];

	// Helper function to format relative time
	function formatRelativeTime(timestamp: string): string {
		const now = new Date();
		const time = new Date(timestamp);
		const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
		
		if (diffInMinutes < 1) return "Just now";
		if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
		
		const diffInHours = Math.floor(diffInMinutes / 60);
		if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
		
		const diffInDays = Math.floor(diffInHours / 24);
		return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
	}

	// Protection - doar admin poate vedea această pagină
	if (!user || !isAdmin) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<div className="text-center">
					<Shield className="h-16 w-16 text-slate-400 mx-auto mb-4" />
					<h1 className="text-2xl font-semibold text-slate-900 mb-2">Access Denied</h1>
					<p className="text-slate-600">You don&apos;t have permission to access this page.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			<div className="border-b border-slate-100 bg-white sticky top-0 z-40">
				<div className="py-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-red-100 rounded-lg">
								<Shield className="h-6 w-6 text-red-600" />
							</div>
							<div>
								<h1 className="text-3xl font-semibold text-slate-900">Admin Dashboard</h1>
								<p className="text-slate-600 mt-1">Monitor platform activity and user engagement</p>
							</div>
						</div>
						<Badge variant="destructive" className="px-3 py-1">
							Admin Access
						</Badge>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="py-8">
				{/* Stats Overview */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50">
						<div className="flex items-center justify-between mb-4">
							<div className="p-2 bg-blue-600 rounded-lg">
								<Users className="h-5 w-5 text-white" />
							</div>
							<TrendingUp className="h-4 w-4 text-blue-600" />
						</div>
						<div className="space-y-1">
							<p className="text-2xl font-semibold text-blue-900">{Number((stats as Record<string, unknown>)?.totalUsers || 0).toLocaleString() || "---"}</p>
							<p className="text-sm font-medium text-blue-700">Total Users</p>
							<p className="text-xs text-blue-600">{String((stats as Record<string, unknown>)?.activeUsers || "---")} active this month</p>
						</div>
					</div>

					<div className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-200/50">
						<div className="flex items-center justify-between mb-4">
							<div className="p-2 bg-green-600 rounded-lg">
								<BarChart3 className="h-5 w-5 text-white" />
							</div>
							<TrendingUp className="h-4 w-4 text-green-600" />
						</div>
						<div className="space-y-1">
							<p className="text-2xl font-semibold text-green-900">{Number((stats as Record<string, unknown>)?.totalProjects || 0).toLocaleString() || "---"}</p>
							<p className="text-sm font-medium text-green-700">Total Projects</p>
							<p className="text-xs text-green-600">{String((stats as Record<string, unknown>)?.activeProjects || "---")} currently active</p>
						</div>
					</div>

					<div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200/50">
						<div className="flex items-center justify-between mb-4">
							<div className="p-2 bg-purple-600 rounded-lg">
								<FileText className="h-5 w-5 text-white" />
							</div>
							<CheckCircle className="h-4 w-4 text-purple-600" />
						</div>
						<div className="space-y-1">
							<p className="text-2xl font-semibold text-purple-900">{Number((stats as Record<string, unknown>)?.totalInvoices || 0).toLocaleString() || "---"}</p>
							<p className="text-sm font-medium text-purple-700">Total Invoices</p>
							<p className="text-xs text-purple-600">
								{Number((stats as Record<string, unknown>)?.paidInvoices || 0)} paid {(stats as Record<string, unknown>)?.totalInvoices && (stats as Record<string, unknown>)?.paidInvoices ? `(${Math.round((Number((stats as Record<string, unknown>).paidInvoices) / Number((stats as Record<string, unknown>).totalInvoices)) * 100)}%)` : ""}
							</p>
						</div>
					</div>

					<div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl border border-orange-200/50">
						<div className="flex items-center justify-between mb-4">
							<div className="p-2 bg-orange-600 rounded-lg">
								<DollarSign className="h-5 w-5 text-white" />
							</div>
							<TrendingUp className="h-4 w-4 text-orange-600" />
						</div>
						<div className="space-y-1">
							<p className="text-2xl font-semibold text-orange-900">${Number((stats as Record<string, unknown>)?.totalRevenue || 0).toLocaleString() || "---"}</p>
							<p className="text-sm font-medium text-orange-700">Total Revenue</p>
							<p className="text-xs text-orange-600">+{String((stats as Record<string, unknown>)?.monthlyGrowth || "---")}% this month</p>
						</div>
					</div>
				</div>

				{/* Charts & Activity */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Recent Activity */}
					<div className="lg:col-span-2">
						<div className="bg-white border border-slate-200 rounded-2xl p-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-semibold text-slate-900">Recent Activity</h2>
								<Badge variant="outline" className="text-xs">
									Live Updates
								</Badge>
							</div>
							
							<div className="space-y-4">
								{recentActivity.length > 0 ? recentActivity.map((activity: Record<string, unknown>) => (
									<div key={String(activity.id)} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
										<div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
											<Activity className="h-4 w-4 text-slate-600" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-slate-900">
												<span className="font-normal text-slate-600">{String(activity.userEmail || '')}</span> {String(activity.actionLabel || '')}
											</p>
											<p className="text-sm text-slate-500 truncate">{String(activity.target || '')}</p>
										</div>
										<div className="flex items-center gap-2 text-xs text-slate-500">
											<Clock className="h-3 w-3" />
											{String(activity.time || '')}
										</div>
									</div>
								)) : (
									<div className="text-center py-8 text-slate-500">
										<Activity className="h-8 w-8 mx-auto mb-2 text-slate-300" />
										<p>Loading activity...</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Quick Actions */}
					<div className="space-y-6">
						<div className="bg-white border border-slate-200 rounded-2xl p-6">
							<h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
							<div className="space-y-3">
								<button className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
									<Users className="h-4 w-4 text-slate-600" />
									<span className="text-sm font-medium text-slate-900">View All Users</span>
								</button>
								<button className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
									<BarChart3 className="h-4 w-4 text-slate-600" />
									<span className="text-sm font-medium text-slate-900">Analytics Report</span>
								</button>
								<button className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
									<Activity className="h-4 w-4 text-slate-600" />
									<span className="text-sm font-medium text-slate-900">Activity Logs</span>
								</button>
								<button className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
									<AlertTriangle className="h-4 w-4 text-slate-600" />
									<span className="text-sm font-medium text-slate-900">System Health</span>
								</button>
							</div>
						</div>

						{/* System Status */}
						<div className="bg-white border border-slate-200 rounded-2xl p-6">
							<h3 className="text-lg font-semibold text-slate-900 mb-4">System Status</h3>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-sm text-slate-600">API Response Time</span>
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 bg-green-500 rounded-full"></div>
										<span className="text-xs font-medium text-green-600">Fast (47ms)</span>
									</div>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-slate-600">Database</span>
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 bg-green-500 rounded-full"></div>
										<span className="text-xs font-medium text-green-600">Healthy</span>
									</div>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-slate-600">Storage</span>
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
										<span className="text-xs font-medium text-yellow-600">78% Used</span>
									</div>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-slate-600">Background Jobs</span>
									<div className="flex items-center gap-2">
										<div className="w-2 h-2 bg-green-500 rounded-full"></div>
										<span className="text-xs font-medium text-green-600">Running (3)</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
