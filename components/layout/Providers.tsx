"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { SessionProvider } from "@/contexts/SessionContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";

interface ProvidersProps {
	children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
	const [queryClient] = useState(() => {
		const client = new QueryClient({
			defaultOptions: {
				queries: {
					staleTime: 30_000, // 30 seconds
					gcTime: 300_000, // 5 minutes (was cacheTime in v4)
					refetchOnWindowFocus: false,
				},
			},
		});

		// Performance logging (dev only)
		if (process.env.NODE_ENV === 'development') {
			client.getQueryCache().subscribe((event) => {
				if (event?.type === 'updated' && event.action?.type === 'success') {
					const queryKey = event.query.queryKey.join(' > ');
					const duration = (event.action as { meta?: { fetchTime?: number } }).meta?.fetchTime || 0;
					if (duration > 300) {
						console.info(`🐌 Slow query (${duration}ms): ${queryKey}`);
					}
				}
			});
		}

		return client;
	});

	return (
		<ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
			<QueryClientProvider client={queryClient}>
				<SessionProvider>
					<OnboardingProvider>
						{children}
					</OnboardingProvider>
					<Toaster
						richColors
						position="top-right"
						offset={64}
						closeButton
						toastOptions={{ duration: 2500, style: { zIndex: 999999 } }}
					/>
				</SessionProvider>
			</QueryClientProvider>
		</ThemeProvider>
	);
}
