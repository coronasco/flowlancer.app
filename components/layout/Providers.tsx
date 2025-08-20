"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export function Providers({ children }: { children: ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
			<QueryClientProvider client={queryClient}>
				{children}
				<Toaster richColors position="top-center" />
			</QueryClientProvider>
		</ThemeProvider>
	);
}
