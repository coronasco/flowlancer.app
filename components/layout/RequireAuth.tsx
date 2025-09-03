"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/contexts/SessionContext";

export function RequireAuth({ children }: { children: ReactNode }) {
	const { user, loading } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (!loading && !user) {
			router.replace("/login");
		}
	}, [loading, user, router]);

	if (loading) {
		return (
			<div className="min-h-dvh grid place-items-center">
				<div className="h-6 w-6 animate-pulse rounded-full bg-black/10" />
			</div>
		);
	}

	return <>{children}</>;
}
