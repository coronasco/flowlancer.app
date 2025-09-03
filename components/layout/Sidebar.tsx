"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, FolderKanban, Receipt, Newspaper, Settings, Shield, BarChart3, Users, Activity } from "lucide-react";
import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSession } from "@/contexts/SessionContext";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";

const mainNavItems = [
	{ href: "/dashboard", label: "Home", Icon: Home },
	{ href: "/dashboard/profile", label: "Profile", Icon: User },
	{ href: "/dashboard/projects", label: "Projects", Icon: FolderKanban },
	{ href: "/dashboard/invoices", label: "Invoices", Icon: Receipt },
	{ href: "/dashboard/feed", label: "Feed", Icon: Newspaper },
];

const adminNavItems = [
	{ href: "/dashboard/admin", label: "Admin Panel", Icon: Shield },
	{ href: "/dashboard/admin/analytics", label: "Analytics", Icon: BarChart3 },
	{ href: "/dashboard/admin/users", label: "Users", Icon: Users },
	{ href: "/dashboard/admin/activity", label: "Activity", Icon: Activity },
];

export function Sidebar() {
	const pathname = usePathname();
	const { user } = useSession();
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
						setIsAdmin(userData.isAdmin === true);
					}
				} catch (error) {
					console.error("Error checking admin status:", error);
					setIsAdmin(false);
				}
			}
		};

		checkAdminStatus();
	}, [user]);

	return (
		<UISidebar collapsible="icon" className="border-r border-slate-200/60 bg-gradient-to-b from-slate-50 to-white no-print">
			<SidebarHeader className="h-[60px] border-b border-slate-200/60 flex justify-center">
				<Link href="/dashboard" className="brand-ring focus:outline-none" aria-label="Flowlancer home">
					<div className="flex items-center gap-2">
						<Image src="/flowlancer_logo_dark.svg" alt="Flowlancer" width={36} height={36} priority />
						<span className="text-base font-semibold tracking-tight text-slate-900 group-data-[collapsible=icon]:hidden">Flowlancer</span>
					</div>
				</Link>
			</SidebarHeader>
			<SidebarContent className="gap-6">
				{/* Main Navigation */}
				<SidebarGroup>
					<SidebarGroupLabel className="text-xs font-medium text-slate-500 uppercase tracking-wider group-data-[collapsible=icon]:hidden">
						Main
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu className="gap-1">
							{mainNavItems.map(({ href, label, Icon }) => {
								const isDashboard = href === "/dashboard";
								const isActive = isDashboard ? pathname === "/dashboard" : pathname.startsWith(href);
								return (
									<SidebarMenuItem key={href}>
										<SidebarMenuButton asChild isActive={isActive} className="hover:bg-slate-100/80 data-[active=true]:bg-slate-900 data-[active=true]:text-white">
											<Link href={href} aria-label={label} title={label} className="flex items-center gap-3">
												<Icon className="h-4 w-4" />
												<span className="truncate group-data-[collapsible=icon]:hidden font-medium">{label}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Admin Navigation - doar dacă user este admin */}
				{isAdmin && (
					<SidebarGroup>
						<SidebarGroupLabel className="text-xs font-medium text-red-500 uppercase tracking-wider group-data-[collapsible=icon]:hidden flex items-center gap-2">
							
							Admin
							
						</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu className="gap-1">
															{adminNavItems.map(({ href, label, Icon }) => {
								// For exact admin route, use exact match; for sub-routes, use startsWith
								const isActive = href === "/dashboard/admin" 
									? pathname === href 
									: pathname.startsWith(href);
								return (
										<SidebarMenuItem key={href}>
											<SidebarMenuButton asChild isActive={isActive} className="hover:bg-red-50 data-[active=true]:bg-red-600 data-[active=true]:text-white">
												<Link href={href} aria-label={label} title={label} className="flex items-center gap-3">
													<Icon className="h-4 w-4" />
													<span className="truncate group-data-[collapsible=icon]:hidden font-medium">{label}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}
			</SidebarContent>
			<SidebarFooter className="pb-4 border-t border-slate-200/60">
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/settings")} className="hover:bg-slate-100/80 data-[active=true]:bg-slate-900 data-[active=true]:text-white">
							<Link href="/dashboard/settings" aria-label="Settings" title="Settings" className="flex items-center gap-3">
								<Settings className="h-4 w-4" />
								<span className="truncate group-data-[collapsible=icon]:hidden font-medium">Settings</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
				
				{/* User info și upgrade card */}
				<div className="group-data-[collapsible=icon]:hidden mx-2 mt-3 space-y-3">
					{/* User info */}
					{user?.email && (
						<div className="p-3 rounded-xl bg-slate-100/50 border border-slate-200/50 flex items-center justify-between">
							<p className="text-xs font-medium text-slate-900 truncate">Free Plan</p>
							<div className="flex items-center gap-1">
								{isAdmin && (
									<Badge variant="destructive" className="text-xs px-1.5 py-0.5">Admin</Badge>
								)}
							</div>
						</div>
					)}
					
					{/* Upgrade card */}
					<div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50">
						<p className="text-sm font-semibold text-emerald-900">Upgrade to Pro</p>
						<p className="text-xs text-emerald-700 mt-1">Unlimited projects, AI features & priority support.</p>
						<Link href="/dashboard" className="mt-3 flex h-8 px-3 items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors">
							Upgrade Now
						</Link>
					</div>
				</div>
			</SidebarFooter>
			<SidebarRail />
		</UISidebar>
	);
}
