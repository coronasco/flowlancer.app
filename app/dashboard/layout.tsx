import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { DashboardProvider } from "@/lib/dashboard-context";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<RequireAuth>
			<DashboardProvider>
				<SidebarProvider>
					<div className="min-h-dvh w-full flex">
						<Sidebar />
						<SidebarInset>
							<Header />
							<main className="flex-1 px-4 sm:px-6 md:px-8 py-6 md:py-8">
								<div className="relative h-screen">
									<div className="absolute inset-0">
										<div className="fixed top-0 -z-10 h-full w-full bg-white [&>div]:absolute [&>div]:bottom-auto [&>div]:left-auto [&>div]:right-0 [&>div]:top-0 [&>div]:h-[1000px] [&>div]:w-[1000px] [&>div]:-translate-x-[30%] [&>div]:translate-y-[20%] [&>div]:rounded-full [&>div]:bg-lime-50 [&>div]:opacity-50 [&>div]:blur-[80px]">
											<div></div>
										</div>
									</div>
									<div className="relative z-10 ">
										{children}
									</div>
								</div>
							</main>
						</SidebarInset>
					</div>
				</SidebarProvider>
			</DashboardProvider>
		</RequireAuth>
	);
}