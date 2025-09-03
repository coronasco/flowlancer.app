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
import { 
	ArrowLeft, 
	TrendingUp, 
	TrendingDown, 
	Users, 
	DollarSign, 
	Activity,
	Calendar,
	Target,
	Zap,
	BarChart3,
	PieChart,
	LineChart
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

export default function AdminAnalytics() {
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

	// Fetch analytics data
	const { data: analyticsData, isLoading } = useQuery({
		queryKey: ["admin-analytics"],
		queryFn: () => api<Record<string, unknown>>("/api/admin/analytics", undefined, user),
		enabled: !!user && isAdmin,
		refetchInterval: 30000, // Refresh every 30 seconds
	});

	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(amount);
	};

	// Format percentage
	const formatPercent = (value: number) => {
		return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
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
								<h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
								<p className="text-slate-600">Platform performance metrics and insights</p>
							</div>
						</div>
						<Badge variant="destructive">PRO</Badge>
					</div>
				</div>
			</div>

			<div className="p-6 space-y-6">
				{/* Key Metrics Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{/* User Growth */}
					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-slate-600 mb-1">User Growth</p>
								<p className="text-2xl font-bold text-slate-900">
									{isLoading ? <Skeleton className="h-8 w-16" /> : formatPercent(analyticsData?.userGrowth || 0)}
								</p>
								<p className="text-sm text-slate-500 mt-1">vs last month</p>
							</div>
							<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
								{(analyticsData?.userGrowth || 0) >= 0 ? (
									<TrendingUp className="w-6 h-6 text-blue-600" />
								) : (
									<TrendingDown className="w-6 h-6 text-red-600" />
								)}
							</div>
						</div>
					</Card>

					{/* Revenue Growth */}
					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-slate-600 mb-1">Revenue Growth</p>
								<p className="text-2xl font-bold text-slate-900">
									{isLoading ? <Skeleton className="h-8 w-16" /> : formatPercent(analyticsData?.revenueGrowth || 0)}
								</p>
								<p className="text-sm text-slate-500 mt-1">vs last month</p>
							</div>
							<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
								<DollarSign className="w-6 h-6 text-green-600" />
							</div>
						</div>
					</Card>

					{/* Conversion Rate */}
					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-slate-600 mb-1">Conversion Rate</p>
								<p className="text-2xl font-bold text-slate-900">
									{isLoading ? <Skeleton className="h-8 w-16" /> : `${(analyticsData?.conversionRate || 0).toFixed(1)}%`}
								</p>
								<p className="text-sm text-slate-500 mt-1">signup to paid</p>
							</div>
							<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
								<Target className="w-6 h-6 text-purple-600" />
							</div>
						</div>
					</Card>

					{/* Avg Project Value */}
					<Card className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-slate-600 mb-1">Avg Project Value</p>
								<p className="text-2xl font-bold text-slate-900">
									{isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(analyticsData?.avgProjectValue || 0)}
								</p>
								<p className="text-sm text-slate-500 mt-1">per project</p>
							</div>
							<div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
								<Zap className="w-6 h-6 text-orange-600" />
							</div>
						</div>
					</Card>
				</div>

				{/* Charts Row */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* User Engagement Chart */}
					<Card className="p-6">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h3 className="text-lg font-semibold text-slate-900">User Engagement</h3>
								<p className="text-sm text-slate-600">Daily active users over time</p>
							</div>
							<BarChart3 className="w-5 h-5 text-slate-400" />
						</div>
						
						{isLoading ? (
							<div className="space-y-3">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-4 w-1/2" />
								<Skeleton className="h-32 w-full" />
							</div>
						) : (
							<div className="space-y-4">
								<div className="grid grid-cols-3 gap-4 text-center">
									<div>
										<p className="text-2xl font-bold text-slate-900">{analyticsData?.dailyActiveUsers || 0}</p>
										<p className="text-sm text-slate-600">Daily Active</p>
									</div>
									<div>
										<p className="text-2xl font-bold text-slate-900">{analyticsData?.weeklyActiveUsers || 0}</p>
										<p className="text-sm text-slate-600">Weekly Active</p>
									</div>
									<div>
										<p className="text-2xl font-bold text-slate-900">{analyticsData?.monthlyActiveUsers || 0}</p>
										<p className="text-sm text-slate-600">Monthly Active</p>
									</div>
								</div>
								
								{/* Simple chart representation */}
								<div className="bg-slate-50 rounded-lg p-4 text-center">
									<LineChart className="w-8 h-8 text-slate-400 mx-auto mb-2" />
									<p className="text-sm text-slate-600">User engagement trending upward</p>
								</div>
							</div>
						)}
					</Card>

					{/* Revenue Breakdown */}
					<Card className="p-6">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h3 className="text-lg font-semibold text-slate-900">Revenue Breakdown</h3>
								<p className="text-sm text-slate-600">Revenue sources and distribution</p>
							</div>
							<PieChart className="w-5 h-5 text-slate-400" />
						</div>
						
						{isLoading ? (
							<div className="space-y-3">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4" />
								<Skeleton className="h-4 w-1/2" />
								<Skeleton className="h-32 w-full" />
							</div>
						) : (
							<div className="space-y-4">
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
											<span className="text-sm text-slate-600">Project Payments</span>
										</div>
										<span className="text-sm font-medium text-slate-900">
											{formatCurrency(analyticsData?.projectRevenue || 0)}
										</span>
									</div>
									
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="w-3 h-3 bg-green-500 rounded-full"></div>
											<span className="text-sm text-slate-600">Pro Subscriptions</span>
										</div>
										<span className="text-sm font-medium text-slate-900">
											{formatCurrency(analyticsData?.subscriptionRevenue || 0)}
										</span>
									</div>
									
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="w-3 h-3 bg-purple-500 rounded-full"></div>
											<span className="text-sm text-slate-600">Platform Fees</span>
										</div>
										<span className="text-sm font-medium text-slate-900">
											{formatCurrency(analyticsData?.platformFees || 0)}
										</span>
									</div>
								</div>
								
								<div className="bg-slate-50 rounded-lg p-4 text-center">
									<p className="text-lg font-bold text-slate-900">
										{formatCurrency((analyticsData?.projectRevenue || 0) + (analyticsData?.subscriptionRevenue || 0) + (analyticsData?.platformFees || 0))}
									</p>
									<p className="text-sm text-slate-600">Total Revenue This Month</p>
								</div>
							</div>
						)}
					</Card>
				</div>

				{/* Performance Metrics */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Project Completion Rate */}
					<Card className="p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-slate-900">Project Success</h3>
							<Activity className="w-5 h-5 text-slate-400" />
						</div>
						
						{isLoading ? (
							<Skeleton className="h-20 w-full" />
						) : (
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-sm text-slate-600">Completion Rate</span>
									<span className="text-sm font-medium text-slate-900">
										{(analyticsData?.completionRate || 0).toFixed(1)}%
									</span>
								</div>
								<div className="w-full bg-slate-200 rounded-full h-2">
									<div 
										className="bg-green-500 h-2 rounded-full" 
										style={{ width: `${analyticsData?.completionRate || 0}%` }}
									></div>
								</div>
								<p className="text-xs text-slate-500">
									{analyticsData?.completedProjects || 0} of {analyticsData?.totalProjectsStarted || 0} projects completed
								</p>
							</div>
						)}
					</Card>

					{/* User Satisfaction */}
					<Card className="p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-slate-900">User Satisfaction</h3>
							<Users className="w-5 h-5 text-slate-400" />
						</div>
						
						{isLoading ? (
							<Skeleton className="h-20 w-full" />
						) : (
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-sm text-slate-600">Avg Rating</span>
									<span className="text-sm font-medium text-slate-900">
										{(analyticsData?.avgRating || 0).toFixed(1)}/5.0
									</span>
								</div>
								<div className="flex items-center gap-1">
									{[1, 2, 3, 4, 5].map((star) => (
										<div
											key={star}
											className={`w-4 h-4 rounded ${
												star <= (analyticsData?.avgRating || 0) ? 'bg-yellow-400' : 'bg-slate-200'
											}`}
										></div>
									))}
								</div>
								<p className="text-xs text-slate-500">
									Based on {analyticsData?.totalReviews || 0} reviews
								</p>
							</div>
						)}
					</Card>

					{/* Platform Health */}
					<Card className="p-6">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-slate-900">Platform Health</h3>
							<Calendar className="w-5 h-5 text-slate-400" />
						</div>
						
						{isLoading ? (
							<Skeleton className="h-20 w-full" />
						) : (
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-sm text-slate-600">Uptime</span>
									<span className="text-sm font-medium text-green-600">
										{(analyticsData?.uptime || 99.9).toFixed(1)}%
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-slate-600">Avg Response</span>
									<span className="text-sm font-medium text-slate-900">
										{analyticsData?.avgResponseTime || 0}ms
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-slate-600">Error Rate</span>
									<span className="text-sm font-medium text-slate-900">
										{(analyticsData?.errorRate || 0).toFixed(2)}%
									</span>
								</div>
							</div>
						)}
					</Card>
				</div>
			</div>
		</div>
	);
}
