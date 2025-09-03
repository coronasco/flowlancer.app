"use client";

import { Bell, ChevronDown, LogOut } from "lucide-react";
import { useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { signOutFirebase } from "@/lib/auth/firebase";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";
import { toast } from "sonner";

export function Header() {
	const { user } = useSession();
	const { isCompleted } = useOnboarding();
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const displayName = user?.displayName || user?.email || "User";
	const nameTrimmed = displayName.length > 16 ? displayName.slice(0, 16) + "…" : displayName;

	return (
		<header className="sticky top-0 z-30 h-[60px] w-full border-b border-black/5 bg-[oklch(0.99_0.01_90)/0.7] backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center no-print">
			<div className="px-4 sm:px-6 md:px-8 h-16 flex w-full items-center justify-between gap-2 relative">
				<div className="flex items-center gap-4">
					<SidebarTrigger className="h-9 w-9" />
					{!isCompleted && <OnboardingStepper />}
				</div>
				<div>
					<div className="flex items-center gap-2">
						<button
						aria-label="Notifications"
						className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-black/5 focus:bg-black/5 focus:outline-none brand-ring"
					>
						<Bell className="h-5 w-5 text-foreground/70" />
						<span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-[color:var(--brand-active)] ring-2 ring-white" />
					</button>
					<button onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white pl-1 pr-2 h-10 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] focus:outline-none brand-ring">
						<Avatar className="size-8">
							{user?.photoURL ? (
								<AvatarImage src={user.photoURL} alt={nameTrimmed} />
							) : (
								<AvatarFallback>{(nameTrimmed[0] || "U").toUpperCase()}</AvatarFallback>
							)}
						</Avatar>
						<span className="hidden sm:inline text-sm font-medium max-w-[10rem] truncate">{nameTrimmed}</span>
						<ChevronDown className="h-4 w-4 text-foreground/50" />
					</button>
					</div>
					{open && (
						<div className="absolute right-4 top-14 w-56 rounded-xl border border-black/10 bg-white shadow-[var(--shadow-lg)] p-2 z-50">
							<div className="px-2 py-1.5">
								<p className="text-sm font-medium truncate">{displayName}</p>
								{user?.email && <p className="text-xs text-foreground/60 truncate">{user.email}</p>}
							</div>
							<div className="h-px bg-black/10 my-1" />
							<button
								onClick={async () => {
									await signOutFirebase();
									toast.success("Signed out");
									router.replace("/login");
								}}
								className="w-full inline-flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-black/5 text-sm"
							>
								<LogOut className="h-4 w-4" />
								Sign out
							</button>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
