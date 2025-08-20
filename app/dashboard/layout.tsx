import { ReactNode } from "react";
import { Providers } from "@/components/layout/Providers";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<Providers>
			<div className="min-h-dvh w-full grid grid-rows-[auto_1fr] md:grid-cols-[16rem_1fr] md:grid-rows-[1fr]">
				<Sidebar />
				<div className="flex flex-col min-w-0">
					<Header />
					<main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0">{children}</main>
				</div>
			</div>
		</Providers>
	);
}
