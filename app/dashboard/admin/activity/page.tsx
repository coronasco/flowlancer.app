"use client";

import { useSession } from "@/contexts/SessionContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/Input";
import { 
	ArrowLeft, 
	Search,
	Clock,
	User,
	FileText,
	DollarSign,
	Settings,
	Activity as ActivityIcon,
	CheckCircle,
	Eye
} from "lucide-react";

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

export default function AdminActivity() {
	const { user } = useSession();
	const router = useRouter();
	const [isAdmin, setIsAdmin] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [actionFilter, setActionFilter] = useState("all");
	const [timeFilter, setTimeFilter] = useState("24h");

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

	// Fetch activity data
	const { data: activityData, isLoading, refetch } = useQuery({
		queryKey: ["admin-activity-detailed", timeFilter],
		queryFn: () => api<Record<string, unknown>>(`/api/admin/activity?timeFilter=${timeFilter}`, undefined, user || undefined),
		enabled: !!user && isAdmin,
		refetchInterval: 10000, // Refresh every 10 seconds
	});

	const activities = Array.isArray(activityData) ? activityData : [];

	// Filter activities based on search and action type
	const filteredActivities = activities.filter((activity: Record<string, unknown>) => {
		const matchesSearch = !searchTerm || 
			String(activity.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
			String(activity.actionLabel || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
			String(activity.target || '').toLowerCase().includes(searchTerm.toLowerCase());
		
		const matchesAction = actionFilter === "all" || activity.action === actionFilter;
		
		return matchesSearch && matchesAction;
	});

	// Format relative time
	const formatRelativeTime = (timestamp: string): string => {
		const now = new Date();
		const time = new Date(timestamp);
		const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
		
		if (diffInMinutes < 1) return "Just now";
		if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
		if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
		return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
	};

	// Get action icon
	const getActionIcon = (action: string) => {
		switch (action) {
			case "user_registered":
				return <User className="w-4 h-4" />;
			case "project_created":
				return <FileText className="w-4 h-4" />;
			case "invoice_generated":
				return <DollarSign className="w-4 h-4" />;
			case "payment_received":
				return <CheckCircle className="w-4 h-4" />;
			case "task_completed":
				return <CheckCircle className="w-4 h-4" />;
			case "profile_updated":
				return <Settings className="w-4 h-4" />;
			case "timer_started":
				return <Clock className="w-4 h-4" />;
			case "project_completed":
				return <CheckCircle className="w-4 h-4" />;
			default:
				return <ActivityIcon className="w-4 h-4" />;
		}
	};

	// Get action color
	const getActionColor = (action: string) => {
		switch (action) {
			case "user_registered":
				return "bg-blue-100 text-blue-600";
			case "project_created":
				return "bg-green-100 text-green-600";
			case "invoice_generated":
				return "bg-yellow-100 text-yellow-600";
			case "payment_received":
				return "bg-green-100 text-green-600";
			case "task_completed":
				return "bg-blue-100 text-blue-600";
			case "profile_updated":
				return "bg-purple-100 text-purple-600";
			case "timer_started":
				return "bg-orange-100 text-orange-600";
			case "project_completed":
				return "bg-green-100 text-green-600";
			default:
				return "bg-slate-100 text-slate-600";
		}
	};

	if (!user || !isAdmin) {
		return (
			<div className="min-h-screen bg-slate-50 flex items-center justify-center">
				<div className="text-center">
					<div className="text-2xl font-bold text-slate-900 mb-2">Access Denied</div>
					<div className="text-slate-600 mb-4">You don&apos;t have permission to access this page.</div>
					<Button onClick={() => router.push("/dashboard")}>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Dashboard
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50">
			{/* Header */}
			<div className="bg-white border-b border-slate-200">
				<div className="px-6 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Link href="/dashboard/admin">
								<Button variant="outline" size="sm">
									<ArrowLeft className="w-4 h-4 mr-2" />
									Back to Admin
								</Button>
							</Link>
							<div>
								<h1 className="text-2xl font-bold text-slate-900">Activity Monitor</h1>
								<p className="text-slate-600">Real-time user actions and system events</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<Badge variant="destructive">LIVE</Badge>
							<Button onClick={() => refetch()} size="sm">
								<ActivityIcon className="w-4 h-4 mr-2" />
								Refresh
							</Button>
						</div>
					</div>
				</div>
			</div>

			<div className="p-6 space-y-6">
				{/* Filters */}
				<Card className="p-6">
					<div className="flex flex-col lg:flex-row gap-4">
						{/* Search */}
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
								<Input
									placeholder="Search by user, action, or target..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>

						{/* Action Filter */}
						<div className="w-full lg:w-48">
							<select
								value={actionFilter}
								onChange={(e) => setActionFilter(e.target.value)}
								className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="all">All Actions</option>
								<option value="user_registered">User Registered</option>
								<option value="project_created">Project Created</option>
								<option value="invoice_generated">Invoice Generated</option>
								<option value="payment_received">Payment Received</option>
								<option value="task_completed">Task Completed</option>
								<option value="profile_updated">Profile Updated</option>
								<option value="timer_started">Timer Started</option>
								<option value="project_completed">Project Completed</option>
							</select>
						</div>

						{/* Time Filter */}
						<div className="w-full lg:w-32">
							<select
								value={timeFilter}
								onChange={(e) => setTimeFilter(e.target.value)}
								className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="1h">Last Hour</option>
								<option value="24h">Last 24h</option>
								<option value="7d">Last 7 days</option>
								<option value="30d">Last 30 days</option>
							</select>
						</div>
					</div>

					{/* Quick Stats */}
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
						<div className="text-center">
							<p className="text-2xl font-bold text-slate-900">{filteredActivities.length}</p>
							<p className="text-sm text-slate-600">Total Events</p>
						</div>
						<div className="text-center">
							<p className="text-2xl font-bold text-slate-900">
								{new Set(filteredActivities.map((a: Record<string, unknown>) => String(a.userEmail || ''))).size}
							</p>
							<p className="text-sm text-slate-600">Unique Users</p>
						</div>
						<div className="text-center">
							<p className="text-2xl font-bold text-slate-900">
								{filteredActivities.filter((a: Record<string, unknown>) => a.action === "payment_received").length}
							</p>
							<p className="text-sm text-slate-600">Payments</p>
						</div>
						<div className="text-center">
							<p className="text-2xl font-bold text-slate-900">
								{filteredActivities.filter((a: Record<string, unknown>) => a.action === "user_registered").length}
							</p>
							<p className="text-sm text-slate-600">New Users</p>
						</div>
					</div>
				</Card>

				{/* Activity Feed */}
				<Card className="p-6">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-lg font-semibold text-slate-900">Activity Feed</h3>
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
							<span className="text-sm text-slate-600">Live updates</span>
						</div>
					</div>

					{isLoading ? (
						<div className="space-y-4">
							{[...Array(10)].map((_, i) => (
								<div key={i} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg">
									<Skeleton className="w-8 h-8 rounded-full" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-4 w-3/4" />
										<Skeleton className="h-3 w-1/2" />
									</div>
									<Skeleton className="h-3 w-16" />
								</div>
							))}
						</div>
					) : filteredActivities.length === 0 ? (
						<div className="text-center py-12">
							<ActivityIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
							<p className="text-slate-600">No activities found for the selected filters.</p>
						</div>
					) : (
						<div className="space-y-3">
							{filteredActivities.map((activity: Record<string, unknown>) => (
								<div key={String(activity.id)} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
									{/* Action Icon */}
									<div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActionColor(String(activity.action))}`}>
										{getActionIcon(String(activity.action))}
									</div>

									{/* Activity Details */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<p className="text-sm font-medium text-slate-900 truncate">
												{String(activity.actionLabel || '')}
											</p>
											{Boolean((activity.metadata as Record<string, unknown>)?.amount) && (
												<Badge variant="outline" className="text-xs">
													${String((activity.metadata as Record<string, unknown>)?.amount || '')}
												</Badge>
											)}
										</div>
										<div className="flex items-center gap-2 text-xs text-slate-600">
											<span>{String(activity.userEmail || '')}</span>
											<span>•</span>
											<span>{String(activity.target || '')}</span>
											{Boolean((activity.metadata as Record<string, unknown>)?.status) && (
												<>
													<span>•</span>
													<span className="capitalize">{String((activity.metadata as Record<string, unknown>)?.status || '')}</span>
												</>
											)}
										</div>
									</div>

									{/* Timestamp */}
									<div className="text-xs text-slate-500 whitespace-nowrap">
										{formatRelativeTime(String(activity.timestamp || ''))}
									</div>

									{/* View Details */}
									<Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100">
										<Eye className="w-3 h-3" />
									</Button>
								</div>
							))}
						</div>
					)}
				</Card>
			</div>
		</div>
	);
}
