"use client";

import { useSession } from "@/contexts/SessionContext";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Users, 
  Shield, 
  Search,
  MoreVertical,
  Eye,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  Crown,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

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

export default function AdminUsersPage() {
	const { user } = useSession();
	const router = useRouter();
	const [isAdmin, setIsAdmin] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

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

	// Fetch users data
	const { data: usersData, isLoading } = useQuery({
		queryKey: ["admin-users"],
		queryFn: () => api<{ users: Record<string, unknown>[]; summary: Record<string, unknown> }>("/api/admin/users", undefined, user || undefined),
		enabled: !!user && isAdmin,
		refetchInterval: 60000, // Refresh every minute
	});

	const users = usersData?.users || [];
	const summary = usersData?.summary || {};

	// Filter users based on search and status
	const filteredUsers = users.filter((u: Record<string, unknown>) => {
		const matchesSearch = !searchTerm || 
			String(u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
			String(u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
			String(u.role || '').toLowerCase().includes(searchTerm.toLowerCase());
		
		const matchesStatus = statusFilter === "all" || u.status === statusFilter;
		
		return matchesSearch && matchesStatus;
	});

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
								<h1 className="text-2xl font-bold text-slate-900">Users Management</h1>
								<p className="text-slate-600">Monitor and manage platform users</p>
							</div>
						</div>
						<Badge variant="destructive">Admin Access</Badge>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="p-6 space-y-6">
				{/* Summary Stats */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
					<div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50">
						<div className="flex items-center gap-3 mb-2">
							<Users className="h-5 w-5 text-blue-600" />
							<span className="text-sm font-medium text-blue-700">Total Users</span>
						</div>
						<p className="text-2xl font-semibold text-blue-900">{String(summary.total || "---")}</p>
					</div>

					<div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200/50">
						<div className="flex items-center gap-3 mb-2">
							<TrendingUp className="h-5 w-5 text-green-600" />
							<span className="text-sm font-medium text-green-700">Active</span>
						</div>
						<p className="text-2xl font-semibold text-green-900">{String(summary.active || "---")}</p>
					</div>

					<div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50">
						<div className="flex items-center gap-3 mb-2">
							<Crown className="h-5 w-5 text-purple-600" />
							<span className="text-sm font-medium text-purple-700">Pro Users</span>
						</div>
						<p className="text-2xl font-semibold text-purple-900">{String(summary.proUsers || "---")}</p>
					</div>

					<div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border border-orange-200/50">
						<div className="flex items-center gap-3 mb-2">
							<DollarSign className="h-5 w-5 text-orange-600" />
							<span className="text-sm font-medium text-orange-700">Total Revenue</span>
						</div>
						<p className="text-lg font-semibold text-orange-900">${summary.totalRevenue?.toLocaleString() || "---"}</p>
					</div>

					<div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl border border-teal-200/50">
						<div className="flex items-center gap-3 mb-2">
							<Calendar className="h-5 w-5 text-teal-600" />
							<span className="text-sm font-medium text-teal-700">New This Month</span>
						</div>
						<p className="text-2xl font-semibold text-teal-900">{String(summary.newThisMonth || "---")}</p>
					</div>
				</div>

				{/* Filters */}
				<Card className="p-6">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
								<Input
									type="text"
									placeholder="Search users by email, name, or role..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>
						<div className="flex gap-2">
							<select
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value)}
								className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="all">All Status</option>
								<option value="active">Active</option>
								<option value="inactive">Inactive</option>
							</select>
						</div>
					</div>
				</Card>

				{/* Users Table */}
				<Card className="overflow-hidden">
					<div className="p-6 border-b border-slate-200">
						<h2 className="text-xl font-semibold text-slate-900">All Users ({filteredUsers.length})</h2>
					</div>

					{isLoading ? (
						<div className="p-8 text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
							<p className="text-slate-500">Loading users...</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-slate-50 border-b border-slate-200">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Plan</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Activity</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Revenue</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
										<th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-slate-200">
									{filteredUsers.map((user: Record<string, unknown>) => (
										<tr key={String(user.id)} className="hover:bg-slate-50">
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center gap-3">
													<div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-xs font-medium text-white">
														{String(user.email || '').charAt(0).toUpperCase()}
													</div>
													<div>
														<div className="text-sm font-medium text-slate-900 truncate max-w-[150px]" title={String(user.name || "Unnamed")}>
															{String(user.name || "Unnamed")}
														</div>
														<div className="text-sm text-slate-500 truncate max-w-[200px]" title={String(user.email || '')}>
															{String(user.email || '')}
														</div>
														<div className="text-xs text-slate-400 truncate max-w-[200px]" title={String(user.role || "No role set")}>
															{String(user.role || "No role set")}
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<Badge variant={String(user.plan) === 'pro' ? 'default' : 'outline'} className={String(user.plan) === 'pro' ? 'bg-purple-100 text-purple-800' : ''}>
													{String(user.plan) === 'pro' ? 'Pro' : 'Free'}
												</Badge>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm text-slate-900">{String(user.projects || 0)} projects</div>
												<div className="text-xs text-slate-500">{String(user.invoices || 0)} invoices</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm font-medium text-slate-900">${Number(user.totalRevenue || 0).toLocaleString()}</div>
												<div className="text-xs text-slate-500">lifetime value</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm text-slate-900">
													{new Date(String(user.createdAt || '')).toLocaleDateString()}
												</div>
												<div className="text-xs text-slate-500">
													Last: {new Date(String(user.lastActive || '')).toLocaleDateString()}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<Badge variant={String(user.status) === 'active' ? 'default' : 'outline'} 
													className={String(user.status) === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}>
													{String(user.status || '')}
												</Badge>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
												<div className="flex items-center justify-end gap-2">
													<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
														<Eye className="h-4 w-4" />
													</Button>
													<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
														<Mail className="h-4 w-4" />
													</Button>
													<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
														<MoreVertical className="h-4 w-4" />
													</Button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</Card>
			</div>
		</div>
	);
}
