"use client";

import Image from "next/image";
import { signInWithGoogle, signInWithGitHub, resolveRedirectResult } from "@/lib/auth/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Github, CheckCircle, Users, Zap, Shield } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";

function GoogleLogo({ className = "" }: { className?: string }) {
	return (
		<svg viewBox="0 0 48 48" className={className} aria-hidden>
			<path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
			<path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.2 18.9 14 24 14c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.2 4 9.6 8.4 6.3 14.7z"/>
			<path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.3l-6.2-5.1C29.2 35.5 26.8 36 24 36c-5.3 0-9.8-3.1-11.7-7.6l-6.6 5C8.9 39.6 15.9 44 24 44z"/>
			<path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.4-3.6 6.1-6.7 7.6l6.2 5.1C37 38.3 40 32.6 40 26c0-1.9-.2-3.7-.4-5.5z"/>
		</svg>
	);
}

function getErrorMessage(e: unknown): string {
	if (typeof e === "string") return e;
	if (e && typeof e === "object" && "message" in e) {
		const msg = (e as { message?: unknown }).message;
		return typeof msg === "string" ? msg : "Sign in failed";
	}
	return "Sign in failed";
}

export default function LoginPage() {
	const [tab, setTab] = useState<"signin" | "register">("signin");
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const { user } = useSession();

	useEffect(() => {
		resolveRedirectResult().then(() => {
			// noop; user context va declanșa redirect-ul dacă e setat
		});
	}, []);

	useEffect(() => {
		if (user) router.replace("/dashboard");
	}, [user, router]);

	const heading = tab === "signin" ? "Welcome back" : "Create your account";
	const sub =
		tab === "signin"
			? "Sign in to continue managing your freelance flow."
			: "Join Flowlancer and streamline projects, invoices and client updates.";

	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			<div className="border-b border-slate-100">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
						<div className="flex items-center gap-2 sm:gap-3">
							<Image src="/flowlancer_logo_dark.svg" alt="Flowlancer" width={28} height={28} className="sm:w-8 sm:h-8" priority />
							<span className="text-lg sm:text-xl font-semibold text-slate-900">Flowlancer</span>
						</div>
						<div className="text-xs sm:text-sm text-slate-600">
							<span className="hidden sm:inline">Professional freelance management platform</span>
							<span className="sm:hidden">Freelance management platform</span>
						</div>
					</div>
				</div>
			</div>

			<div className="grid lg:grid-cols-2 min-h-[calc(100vh-73px)] sm:min-h-[calc(100vh-89px)]">
				{/* Left side - Features */}
				<div className="hidden lg:flex flex-col justify-center px-8 xl:px-12 2xl:px-16 bg-slate-50">
					<div className="max-w-md xl:max-w-lg">
						<h1 className="text-3xl xl:text-4xl font-bold text-slate-900 mb-4 xl:mb-6">
							Streamline your freelance workflow
						</h1>
						<p className="text-base xl:text-lg text-slate-600 mb-6 xl:mb-8">
							Manage projects, track time, create invoices, and collaborate with clients all in one beautiful platform.
						</p>
						
						<div className="space-y-3 xl:space-y-4">
							<div className="flex items-center gap-3">
								<div className="p-1.5 xl:p-2 bg-green-100 rounded-lg flex-shrink-0">
									<CheckCircle className="h-4 w-4 xl:h-5 xl:w-5 text-green-600" />
								</div>
								<span className="text-sm xl:text-base text-slate-700">Project management with Kanban boards</span>
							</div>
							<div className="flex items-center gap-3">
								<div className="p-1.5 xl:p-2 bg-blue-100 rounded-lg flex-shrink-0">
									<Zap className="h-4 w-4 xl:h-5 xl:w-5 text-blue-600" />
								</div>
								<span className="text-sm xl:text-base text-slate-700">Time tracking and automated invoicing</span>
							</div>
							<div className="flex items-center gap-3">
								<div className="p-1.5 xl:p-2 bg-purple-100 rounded-lg flex-shrink-0">
									<Users className="h-4 w-4 xl:h-5 xl:w-5 text-purple-600" />
								</div>
								<span className="text-sm xl:text-base text-slate-700">Client portals and public profiles</span>
							</div>
							<div className="flex items-center gap-3">
								<div className="p-1.5 xl:p-2 bg-orange-100 rounded-lg flex-shrink-0">
									<Shield className="h-4 w-4 xl:h-5 xl:w-5 text-orange-600" />
								</div>
								<span className="text-sm xl:text-base text-slate-700">Secure and professional experience</span>
							</div>
						</div>
					</div>
				</div>

				{/* Right side - Auth Form */}
				<div className="flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 sm:py-12">
					<div className="max-w-sm sm:max-w-md mx-auto w-full">
						{/* Mobile Features Preview */}
						<div className="lg:hidden mb-8 p-4 bg-slate-50 rounded-lg">
							<h2 className="text-lg font-semibold text-slate-900 mb-3">Why Flowlancer?</h2>
							<div className="grid grid-cols-2 gap-3 text-xs">
								<div className="flex items-center gap-2">
									<CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
									<span className="text-slate-700">Project management</span>
								</div>
								<div className="flex items-center gap-2">
									<Zap className="h-3 w-3 text-blue-600 flex-shrink-0" />
									<span className="text-slate-700">Time tracking</span>
								</div>
								<div className="flex items-center gap-2">
									<Users className="h-3 w-3 text-purple-600 flex-shrink-0" />
									<span className="text-slate-700">Client portals</span>
								</div>
								<div className="flex items-center gap-2">
									<Shield className="h-3 w-3 text-orange-600 flex-shrink-0" />
									<span className="text-slate-700">Secure platform</span>
								</div>
							</div>
						</div>

						<div className="text-center mb-6 sm:mb-8">
							<h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-2">{heading}</h2>
							<p className="text-sm sm:text-base text-slate-600">{sub}</p>
						</div>

						{/* Tab switcher */}
						<div className="flex gap-1 rounded-lg bg-slate-100 p-1 mb-6 sm:mb-8">
							<button
								type="button"
								onClick={() => setTab("signin")}
								className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
									tab === "signin" 
										? "bg-white text-slate-900 shadow-sm" 
										: "text-slate-600 hover:text-slate-900"
								}`}
							>
								Sign in
							</button>
							<button
								type="button"
								onClick={() => setTab("register")}
								className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
									tab === "register" 
										? "bg-white text-slate-900 shadow-sm" 
										: "text-slate-600 hover:text-slate-900"
								}`}
							>
								Register
							</button>
						</div>

						{error && (
							<div className="mb-4 sm:mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-xs sm:text-sm text-red-600">{error}</p>
							</div>
						)}

						{/* Auth buttons */}
						<div className="space-y-3">
							<button
								onClick={async () => {
									try {
										await signInWithGoogle();
										router.replace("/dashboard");
									} catch (e: unknown) {
										setError(getErrorMessage(e));
									}
								}}
								className="w-full flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
							>
								<GoogleLogo className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
								<span className="font-medium text-slate-700 text-sm sm:text-base">
									<span className="hidden sm:inline">{tab === "signin" ? "Continue with Google" : "Sign up with Google"}</span>
									<span className="sm:hidden">{tab === "signin" ? "Google" : "Sign up with Google"}</span>
								</span>
							</button>
							
							<button
								onClick={async () => {
									try {
										await signInWithGitHub();
										router.replace("/dashboard");
									} catch (e: unknown) {
										setError(getErrorMessage(e));
									}
								}}
								className="w-full flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
							>
								<Github className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700 flex-shrink-0" />
								<span className="font-medium text-slate-700 text-sm sm:text-base">
									<span className="hidden sm:inline">{tab === "signin" ? "Continue with GitHub" : "Sign up with GitHub"}</span>
									<span className="sm:hidden">{tab === "signin" ? "GitHub" : "Sign up with GitHub"}</span>
								</span>
							</button>
						</div>

						<p className="mt-6 sm:mt-8 text-xs text-slate-500 text-center px-4">
							By continuing you agree to our{" "}
							<a href="#" className="text-slate-700 hover:text-slate-900 underline">Terms of Service</a>{" "}
							and{" "}
							<a href="#" className="text-slate-700 hover:text-slate-900 underline">Privacy Policy</a>.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
