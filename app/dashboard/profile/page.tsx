"use client";

import { Button } from "@/components/ui/Button";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "@/contexts/SessionContext";
import { useDashboardData } from "@/lib/dashboard-context";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { db } from "@/lib/auth/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { OnboardingCoachmark } from "@/components/onboarding/OnboardingCoachmark";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { 
	Calendar, 
	DollarSign, 
	Timer, 
	Target, 
	CheckCircle2, 
	ExternalLink,
	Folder
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
	if (user) {
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

export default function ProfilePage() {
	const { user } = useSession();
	const { } = useOnboarding();
	const email = user?.email || undefined;
	// Use optimized dashboard context
	const { data: dashboardData, isLoading } = useDashboardData();
	const projects = dashboardData?.projects || [];
	const feedback = dashboardData?.clientFeedback || [];
	const isLoadingFeedback = isLoading;

	const [name, setName] = useState("");
	const [role, setRole] = useState("");
	const [location, setLocation] = useState("");
	const [bio, setBio] = useState("");
	const [skills, setSkills] = useState<string[]>([]);
	const [newSkill, setNewSkill] = useState("");
	const [experienceYears, setExperienceYears] = useState<number>(0);
	const [avatarUrl, setAvatarUrl] = useState<string>("");
	const [openAI, setOpenAI] = useState(false);
	const [rateResult, setRateResult] = useState<{ rateUsd: number; reasoning: string } | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);

	const [manualRate, setManualRate] = useState<number | "">("");
	const [savingRate, setSavingRate] = useState(false);
	const [aiSavedMin, setAiSavedMin] = useState<number | null>(null);
	const [aiSavedMax, setAiSavedMax] = useState<number | null>(null);
	const [aiSavedReason, setAiSavedReason] = useState<string>("");
	const [isEditingRate, setIsEditingRate] = useState(false);
	const [tempRate, setTempRate] = useState<number | "">("");
	const [isPublic, setIsPublic] = useState<boolean>(false);
	const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
	const [realPublicSlug, setRealPublicSlug] = useState<string>("");
	const [socialLinks, setSocialLinks] = useState<{
		github?: string;
		linkedin?: string;
		website?: string;
		twitter?: string;
		dribbble?: string;
		behance?: string;
	}>({});
	const [experience, setExperience] = useState<string[]>([]);
	const [newExperience, setNewExperience] = useState("");

	useEffect(() => {
		if (!user) return;
		const ref = doc(db, "customers", user.uid);
		getDoc(ref)
			.then((snap) => {
				const d = snap.data() as {
					name?: string;
					role?: string;
					location?: string;
					bio?: string;
					skills?: string[];
					experienceYears?: number;
					isPremium?: boolean;
					hourlyRateManual?: number;
					hourlyRateAiMin?: number;
					hourlyRateAiMax?: number;
					hourlyRateAiReasoning?: string;
					avatarUrl?: string;
					isPublic?: boolean;
				} | undefined;
				setName(d?.name ?? (user.email ? user.email.split("@")[0] : ""));
				setRole(d?.role ?? "");
				setLocation(d?.location ?? "");
				setBio(d?.bio ?? "");
				setSkills(Array.isArray(d?.skills) ? d.skills : []);
				setExperienceYears(typeof d?.experienceYears === "number" ? d.experienceYears : 0);
				setAvatarUrl(d?.avatarUrl ?? "");

				setManualRate(typeof d?.hourlyRateManual === "number" ? d.hourlyRateManual : "");
				if (typeof d?.hourlyRateAiMin === "number") setAiSavedMin(d.hourlyRateAiMin);
				if (typeof d?.hourlyRateAiMax === "number") setAiSavedMax(d.hourlyRateAiMax);
				if (typeof d?.hourlyRateAiReasoning === "string") setAiSavedReason(d.hourlyRateAiReasoning);
				setIsPublic(Boolean(d?.isPublic));
				setSocialLinks((d as Record<string, unknown>)?.socialLinks as Record<string, string> || {});
				setExperience(Array.isArray((d as Record<string, unknown>)?.experience) ? (d as Record<string, unknown>).experience as string[] : []);
			})
			.catch(() => {});
	}, [user]);

	// Load real profile data from API to get the correct publicSlug
	useEffect(() => {
		if (!user) return;
		
		const loadRealProfile = async () => {
			try {
				const profile = await api<{ profile: Record<string, unknown> }>("/api/profile", {}, user);
				if (profile.profile?.publicSlug && typeof profile.profile.publicSlug === 'string') {
					setRealPublicSlug(profile.profile.publicSlug);
				}
				// Also sync isPublic from API
				if (profile.profile?.isPublic !== undefined && typeof profile.profile.isPublic === 'boolean') {
					setIsPublic(profile.profile.isPublic);
				}
				// Sync social links and experience
				if (profile.profile?.socialLinks && typeof profile.profile.socialLinks === 'object') {
					setSocialLinks(profile.profile.socialLinks as Record<string, string>);
				}
				if (profile.profile?.experience && Array.isArray(profile.profile.experience)) {
					setExperience(profile.profile.experience as string[]);
				}
			} catch (error) {
				console.error("Error loading real profile:", error);
			}
		};
		
		loadRealProfile();
	}, [user]);

	const handleAvatarUpload = (publicUrl: string) => {
		// Update local state (Firestore is updated by the upload hook)
		setAvatarUrl(publicUrl);
	};

	const handleToggleVisibility = async () => {
		if (!user) return;
		
		setIsUpdatingVisibility(true);
		try {
			const newVisibility = !isPublic;
			
			// Update via API (which syncs to both Supabase and Firestore)
			const response = await api<{ profile: Record<string, unknown> }>("/api/profile", {
				method: "PATCH",
				body: JSON.stringify({ isPublic: newVisibility }),
			}, user);
			
			// Update local state
			setIsPublic(newVisibility);
			
			// Update publicSlug if returned
			if (response.profile?.publicSlug && typeof response.profile.publicSlug === 'string') {
				setRealPublicSlug(response.profile.publicSlug);
			}
			
			// Show success message
			toast.success(newVisibility 
				? "Profile is now public and discoverable" 
				: "Profile is now private"
			);
		} catch (error) {
			console.error("Error updating profile visibility:", error);
			toast.error("Failed to update profile visibility");
		} finally {
			setIsUpdatingVisibility(false);
		}
	};

	const handleSaveSocialLinks = async () => {
		if (!user) return;
		
		try {
			// Filter out empty strings
			const filteredSocialLinks = Object.fromEntries(
				Object.entries(socialLinks).filter(([, value]) => value && value.trim() !== "")
			);
			
					await api<{ profile: Record<string, unknown> }>("/api/profile", {
			method: "PATCH",
			body: JSON.stringify({ socialLinks: filteredSocialLinks }),
		}, user);
			
			// Also save directly to Firebase for immediate sync
			if (user) {
				await setDoc(doc(db, "customers", user.uid), { 
					socialLinks: filteredSocialLinks,
					updated_at: serverTimestamp() 
				}, { merge: true });
			}
			
			toast.success("Social links saved successfully!");
		} catch (error) {
			console.error("Error saving social links:", error);
			toast.error("Failed to save social links");
		}
	};

	const handleSaveExperience = async () => {
		if (!user) return;
		
		try {
					await api<{ profile: Record<string, unknown> }>("/api/profile", {
			method: "PATCH",
			body: JSON.stringify({ experience }),
		}, user);
			
			// Also save directly to Firebase for immediate sync
			if (user) {
				await setDoc(doc(db, "customers", user.uid), { 
					experience,
					updated_at: serverTimestamp() 
				}, { merge: true });
			}
			
			toast.success("Experience saved successfully!");
		} catch (error) {
			console.error("Error saving experience:", error);
			toast.error("Failed to save experience");
		}
	};

	const addExperience = () => {
		if (newExperience.trim() && experience.length < 10) {
			setExperience([...experience, newExperience.trim()]);
			setNewExperience("");
		}
	};

	const removeExperience = (index: number) => {
		setExperience(experience.filter((_, i) => i !== index));
	};



	const { mutate: saveProfile, isPending } = useMutation({
		mutationFn: async () => {
			if (!user) throw new Error("Not authenticated");
			const ref = doc(db, "customers", user.uid);
			await setDoc(
				ref,
				{
					email: user.email ?? null,
					name: name.trim() || null,
					role: role.trim() || null,
					location: location.trim() || null,
					bio: bio.trim() || null,
					skills,
					experienceYears,
					avatarUrl: avatarUrl || null,
					publicSlug,
					updated_at: serverTimestamp(),
				},
				{ merge: true }
			);
		},
		onSuccess: () => { toast.success("Profile saved"); },
		onError: (e: unknown) => toast.error((e as Error).message || "Failed to save"),
	});


	const usd0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
	// Use real publicSlug from API, fallback to generated one matching server logic
	let fallbackName = name && name.trim().length > 0 ? name : "user";
	if (!name && email) {
		const emailPrefix = email.split("@")[0];
		const parts = emailPrefix.split(".");
		fallbackName = parts.slice(0, 2).join(" ");
	}
	const slugFromName = fallbackName.toLowerCase().replace(/[^a-z0-9]+/g, "");
	const fallbackSlug = `${slugFromName}-TrukBlh1`;
	const publicSlug = realPublicSlug || fallbackSlug;

	return (
		<div className="min-h-screen bg-white">
			{/* Header Section - Full Width */}
			<div className="border-b border-slate-100 bg-white">
				<div className="py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-semibold text-slate-900">Profile</h1>
							<p className="text-slate-600 mt-1">Manage your professional information</p>
						</div>
						{email && (
							<div className="flex items-center gap-3">
								{/* Profile Visibility Toggle */}
								<Button
									onClick={handleToggleVisibility}
									disabled={isUpdatingVisibility}
									variant={isPublic ? "default" : "outline"}
									size="sm"
									className="inline-flex items-center gap-2"
								>
									{isUpdatingVisibility ? (
										<div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
									) : (
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											{isPublic ? (
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
											) : (
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
											)}
										</svg>
									)}
									{isPublic ? "Public" : "Private"}
								</Button>

								{/* View Public Profile Button */}
								<OnboardingCoachmark
									step={3}
									title="Make Your Profile Discoverable"
									description="Your public profile helps potential clients find and learn about you. Once you're happy with your profile, share this link to showcase your work."
									actionText="Continue"
									trigger={
										<Link 
											href={`/p/${publicSlug}`} 
											className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
												isPublic 
													? "text-slate-700 bg-slate-100 hover:bg-slate-200" 
													: "text-slate-400 bg-slate-50 cursor-not-allowed"
											}`}
											onClick={!isPublic ? (e) => {
												e.preventDefault();
												toast.info("Make your profile public first to view it");
											} : undefined}
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
											</svg>
											View Public Profile
										</Link>
									}
								/>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Main Profile Content */}
			<div className="py-8">
				<div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
					{/* Profile Summary - Left Side */}
					<div className="xl:col-span-2">
						<div className="sticky top-20 space-y-6">
							{/* Profile Card */}
							<div className="bg-white rounded-lg p-8 border border-slate-100">
							<div className="flex flex-col items-center text-center">
								<OnboardingCoachmark
									step={1}
									title="Set Up Your Profile"
									description="Upload a professional photo and add your name, role, and location to create a compelling profile that clients will love."
									actionText="Continue"
									trigger={
										<AvatarUpload 
											currentAvatar={avatarUrl || user?.photoURL || undefined}
											name={name || "User"}
											onUpload={handleAvatarUpload}
											size="lg"
										/>
									}
								/>
								
								<div className="mt-4 space-y-2">
									<h2 className="text-xl font-semibold text-zinc-900">{name || "Add your name"}</h2>
									<p className="text-zinc-600">{role || "Add your role"}</p>
									{location && (
										<div className="flex items-center justify-center gap-1.5">
											<svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
											</svg>
											<span className="text-sm text-zinc-500">{location}</span>
										</div>
									)}
								</div>

								{/* Hourly Rate Badge */}
								<div className="mt-6 w-full">
									{(aiSavedMin !== null && aiSavedMax !== null) || (typeof manualRate === "number" && manualRate > 0) ? (
										<div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
											<div className="flex items-center justify-between mb-2">
												<span className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Hourly Rate</span>
												<div className="flex items-center gap-1">
													<Button 
														onClick={() => {
															setIsEditingRate(true);
															setTempRate(typeof manualRate === "number" && manualRate > 0 ? manualRate : "");
														}}
														variant="ghost"
														size="sm"
														className="h-auto p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
														</svg>
													</Button>
													<OnboardingCoachmark
														step={2}
														title="Configure Your Hourly Rate"
														description="Set your pricing with AI assistance. Our smart calculator analyzes your skills, experience, and market rates to suggest competitive pricing."
														actionText="Continue"
														trigger={
															<Button 
																onClick={() => setOpenAI(true)}
																variant="ghost"
																size="sm"
																className="h-auto p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
															>
																<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
																</svg>
															</Button>
														}
													/>
												</div>
											</div>
											{isEditingRate ? (
												<div className="space-y-2">
													<div className="flex gap-2">
														<input 
															type="number" 
															min={1} 
															value={tempRate} 
															onChange={(e) => setTempRate(e.target.value === "" ? "" : Number(e.target.value))} 
															placeholder="Enter rate" 
															className="flex-1 px-3 py-2 text-sm bg-white border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200" 
														/>
														<Button 
															disabled={savingRate || tempRate === ""} 
															onClick={async () => {
																try {
																	if (!user) throw new Error("Not authenticated");
																	setSavingRate(true);
																	await setDoc(doc(db, "customers", user.uid), { hourlyRateManual: typeof tempRate === "number" ? tempRate : null, updated_at: serverTimestamp() }, { merge: true });
																	setManualRate(tempRate);
																	setIsEditingRate(false);
																	toast.success("Hourly rate saved");
																} catch (e) {
																	toast.error((e as Error).message || "Failed to save rate");
																} finally {
																	setSavingRate(false);
																}
															}}
															size="sm"
															className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200"
														>
															{savingRate ? "..." : "Save"}
														</Button>
													</div>
													<Button 
														onClick={() => {
															setIsEditingRate(false);
															setTempRate("");
														}}
														variant="ghost"
														size="sm"
														className="w-full py-1 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
													>
														Cancel
													</Button>
												</div>
											) : (
												<>
													{typeof manualRate === "number" && manualRate > 0 ? (
														<p className="text-lg font-semibold text-emerald-900">{usd0.format(manualRate)}/hr</p>
													) : (
														<p className="text-lg font-semibold text-emerald-900">{usd0.format(aiSavedMin!)}–{usd0.format(aiSavedMax!)}/hr</p>
													)}
													{aiSavedMin !== null && aiSavedMax !== null && (
														<p className="text-xs text-emerald-600 mt-1">
															{typeof manualRate === "number" && manualRate > 0 ? "Manual rate" : "AI recommendation"}
														</p>
													)}
												</>
											)}
										</div>
									) : (
										<div className="bg-zinc-100 border border-zinc-200 rounded-xl p-4">
											<div className="flex items-center justify-between mb-2">
												<span className="text-xs font-medium text-zinc-600 uppercase tracking-wide">Hourly Rate</span>
												<div className="flex items-center gap-1">
													<Button 
														onClick={() => {
															setIsEditingRate(true);
															setTempRate("");
														}}
														variant="ghost"
														size="sm"
														className="h-auto p-1 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200"
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
														</svg>
													</Button>
													<Button 
														onClick={() => setOpenAI(true)}
														variant="ghost"
														size="sm"
														className="h-auto p-1 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200"
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
														</svg>
													</Button>
												</div>
											</div>
											{isEditingRate ? (
												<div className="space-y-2">
													<div className="flex gap-2">
														<input 
															type="number" 
															min={1} 
															value={tempRate} 
															onChange={(e) => setTempRate(e.target.value === "" ? "" : Number(e.target.value))} 
															placeholder="Enter your rate" 
															className="flex-1 px-3 py-2 text-sm bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all duration-200" 
														/>
														<Button 
															disabled={savingRate || tempRate === ""} 
															onClick={async () => {
																try {
																	if (!user) throw new Error("Not authenticated");
																	setSavingRate(true);
																	await setDoc(doc(db, "customers", user.uid), { hourlyRateManual: typeof tempRate === "number" ? tempRate : null, updated_at: serverTimestamp() }, { merge: true });
																	setManualRate(tempRate);
																	setIsEditingRate(false);
																	toast.success("Hourly rate saved");
																} catch (e) {
																	toast.error((e as Error).message || "Failed to save rate");
																} finally {
																	setSavingRate(false);
																}
															}}
															size="sm"
															className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg transition-all duration-200"
														>
															{savingRate ? "..." : "Save"}
														</Button>
													</div>
													<Button 
														onClick={() => {
															setIsEditingRate(false);
															setTempRate("");
														}}
														variant="ghost"
														size="sm"
														className="w-full py-1 text-xs text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200"
													>
														Cancel
													</Button>
												</div>
											) : (
												<p className="text-sm text-zinc-500">Add your hourly rate to display professional pricing</p>
											)}
										</div>
									)}
								</div>
								
								{skills.length > 0 && (
									<div className="mt-6 w-full">
										<p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Skills</p>
										<div className="flex flex-wrap gap-2 justify-center">
											{skills.slice(0, 6).map((s, i) => (
												<Badge key={`${s}-${i}`} variant="secondary" className="text-xs capitalize bg-zinc-200/60 text-zinc-700 border-0 px-2.5 py-1">
													{s}
												</Badge>
											))}
											{skills.length > 6 && (
												<Badge variant="secondary" className="text-xs bg-zinc-200/60 text-zinc-500 border-0 px-2.5 py-1">
													+{skills.length - 6} more
												</Badge>
											)}
										</div>
									</div>
								)}
								
								{bio && (
									<div className="mt-6 w-full">
										<p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">About</p>
										<p className="text-sm text-zinc-600 leading-relaxed">{bio}</p>
									</div>
								)}
							</div>
						</div>


					</div>
				</div>

					{/* Edit Form - Right Side */}
					<div className="xl:col-span-3 space-y-8">
						{/* Personal Information */}
						<div className="bg-white rounded-lg border border-slate-100 p-8">
						<div className="mb-8">
							<h3 className="text-lg font-medium text-zinc-900 mb-2">Personal Information</h3>
							<p className="text-sm text-zinc-500">Update your basic details and professional information</p>
						</div>
						
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
							<div className="space-y-3">
								<label className="block text-sm font-medium text-zinc-700">Full Name</label>
								<input 
									value={name} 
									onChange={(e) => setName(e.target.value)} 
									className="w-full px-4 py-3 text-sm bg-zinc-50 border-0 rounded-xl focus:ring-2 focus:ring-zinc-900/10 focus:bg-white transition-all duration-200" 
									placeholder="Enter your full name"
								/>
							</div>
							
							<div className="space-y-3">
								<label className="block text-sm font-medium text-zinc-700">Professional Role</label>
								<input 
									value={role} 
									onChange={(e) => setRole(e.target.value)} 
									className="w-full px-4 py-3 text-sm bg-zinc-50 border-0 rounded-xl focus:ring-2 focus:ring-zinc-900/10 focus:bg-white transition-all duration-200" 
									placeholder="e.g. Senior Developer"
								/>
							</div>
							
							<div className="space-y-3">
								<label className="block text-sm font-medium text-zinc-700">Location</label>
								<input 
									value={location} 
									onChange={(e) => setLocation(e.target.value)} 
									className="w-full px-4 py-3 text-sm bg-zinc-50 border-0 rounded-xl focus:ring-2 focus:ring-zinc-900/10 focus:bg-white transition-all duration-200" 
									placeholder="e.g. New York, NY"
								/>
							</div>
							
							<div className="space-y-3">
								<label className="block text-sm font-medium text-zinc-700">Years of Experience</label>
								<input 
									type="number" 
									min={0} 
									value={experienceYears} 
									onChange={(e) => setExperienceYears(Number(e.target.value || 0))} 
									className="w-full px-4 py-3 text-sm bg-zinc-50 border-0 rounded-xl focus:ring-2 focus:ring-zinc-900/10 focus:bg-white transition-all duration-200" 
									placeholder="0"
								/>
							</div>
							
							<div className="sm:col-span-2 space-y-3">
								<label className="block text-sm font-medium text-zinc-700">Bio</label>
								<textarea 
									value={bio} 
									onChange={(e) => setBio(e.target.value)} 
									rows={4}
									className="w-full px-4 py-3 text-sm bg-zinc-50 border-0 rounded-xl focus:ring-2 focus:ring-zinc-900/10 focus:bg-white transition-all duration-200 resize-none" 
									placeholder="Tell us about yourself and your experience..."
								/>
							</div>
						</div>
					</div>

						{/* Skills Section */}
						<div className="bg-white rounded-lg border border-slate-100 p-8">
						<div className="mb-6">
							<h3 className="text-lg font-medium text-zinc-900 mb-2">Skills & Expertise</h3>
							<p className="text-sm text-zinc-500">Add skills relevant to your profession</p>
						</div>
						
						<div className="space-y-4">
							<div className="flex gap-3">
								<input 
									value={newSkill} 
									onChange={(e) => setNewSkill(e.target.value)} 
									placeholder="Add a skill (e.g. React, Python)" 
									className="flex-1 px-4 py-3 text-sm bg-zinc-50 border-0 rounded-xl focus:ring-2 focus:ring-zinc-900/10 focus:bg-white transition-all duration-200" 
								/>
								<button 
									type="button" 
									className="px-6 py-3 text-sm font-medium text-zinc-700 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-all duration-200" 
									onClick={() => { 
										const s = newSkill.trim().toLowerCase(); 
										if (s.length < 2) { toast.error("Skill too short"); return; } 
										if (skills.includes(s)) { toast.error("Skill already added"); return; } 
										if (skills.length >= 10) { toast.error("Max 10 skills"); return; } 
										setSkills([...skills, s]); 
										setNewSkill(""); 
									}}
								>
									Add
								</button>
							</div>
							{skills.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{skills.map((s, idx) => (
										<Badge key={`${s}-${idx}`} variant="secondary" className="inline-flex items-center gap-2 px-3 py-2 text-sm capitalize bg-zinc-100 text-zinc-700 border-0 rounded-lg">
											{s}
											<button 
												type="button" 
												aria-label="Remove skill"
												className="text-zinc-400 hover:text-red-500 transition-colors duration-200" 
												onClick={() => setSkills(skills.filter((x) => x !== s))}
											>
												<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</Badge>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Social Links Section */}
					<div className="bg-white rounded-lg border border-slate-100 p-8">
						<div className="mb-6">
							<div className="flex items-center gap-3 mb-2">
								<div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
									<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
									</svg>
								</div>
								<h3 className="text-lg font-medium text-zinc-900">Social Links</h3>
							</div>
							<p className="text-sm text-zinc-500">Connect your professional profiles</p>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{Object.entries({
								github: { 
									label: "GitHub", 
									placeholder: "https://github.com/username",
									icon: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
									color: "text-gray-700"
								},
								linkedin: { 
									label: "LinkedIn", 
									placeholder: "https://linkedin.com/in/username",
									icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
									color: "text-blue-600"
								},
								website: { 
									label: "Website", 
									placeholder: "https://yourwebsite.com",
									icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
									color: "text-green-600"
								},
								twitter: { 
									label: "Twitter", 
									placeholder: "https://twitter.com/username",
									icon: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z",
									color: "text-sky-500"
								},
								dribbble: { 
									label: "Dribbble", 
									placeholder: "https://dribbble.com/username",
									icon: "M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm9.568 5.302c.896 1.41 1.432 3.082 1.432 4.898 0 .254-.01.504-.03.752-.734-.16-1.612-.27-2.638-.27-3.226 0-6.194.906-8.566 2.378a11.917 11.917 0 01-.354-.75c-.17-.375-.353-.745-.544-1.108 2.7-1.165 4.956-2.988 6.7-5.9zm-1.568-1.302c-1.744 2.912-4 4.735-6.7 5.9-.545-1.08-1.155-2.127-1.82-3.134C13.16 5.592 15.132 4.9 17.18 4.9c1.026 0 1.904.11 2.82.1zM12 2c1.83 0 3.54.52 5 1.384-2.048 0-4.02.692-5.7 1.866-.665-1.007-1.275-2.054-1.82-3.134A9.958 9.958 0 0112 2zM2.432 5.302c.896-1.41 2.17-2.518 3.668-3.184C6.665 3.125 7.275 4.172 7.94 5.18c-2.048 0-4.02-.692-5.7-1.866a9.958 9.958 0 00-.808-.012zm-.432 6.698c0-1.816.536-3.488 1.432-4.898.808.012 1.652.012 2.46 0 1.68 1.174 3.652 1.866 5.7 1.866.665 1.007 1.275 2.054 1.82 3.134-.17.375-.353.745-.544 1.108-2.372-1.472-5.34-2.378-8.566-2.378-1.026 0-1.904-.11-2.638.27A11.856 11.856 0 012 12z",
									color: "text-pink-500"
								},
								behance: { 
									label: "Behance", 
									placeholder: "https://behance.net/username",
									icon: "M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.498 1.19.906.26 1.576.72 2.022 1.37.448.66.672 1.48.672 2.45 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.76-.62.16-1.25.24-1.91.24H0V4.51h6.938v-.007zM16.94 16.665c.44.428 1.073.643 1.894.643.59 0 1.1-.148 1.53-.447.424-.29.68-.61.78-.94h2.588c-.403 1.28-1.048 2.2-1.9 2.75-.85.56-1.884.83-3.08.83-.837 0-1.584-.13-2.272-.4-.673-.27-1.24-.65-1.72-1.14-.464-.49-.813-1.08-1.063-1.77-.25-.69-.37-1.45-.37-2.28 0-.85.125-1.61.373-2.28.25-.67.595-1.25 1.04-1.74.445-.49.98-.87 1.615-1.14.63-.27 1.315-.4 2.06-.4.906 0 1.685.2 2.37.6.684.4 1.23.94 1.65 1.64.42.7.63 1.5.63 2.39 0 .313-.03.62-.09.92H15.99c.085.82.34 1.49.95 1.87v.01-.01zM6.938 8.684c.475 0 .84-.113 1.118-.343.27-.23.41-.55.41-.96 0-.22-.036-.42-.11-.59-.07-.17-.185-.31-.34-.42-.16-.11-.36-.19-.59-.24-.23-.05-.49-.07-.78-.07H2.534v2.62H6.94-.002zm-.368 6.677c.29 0 .55-.04.77-.12.22-.08.41-.2.56-.35.15-.15.27-.34.35-.57.08-.23.12-.49.12-.78 0-.65-.2-1.13-.58-1.44-.38-.31-.88-.47-1.49-.47H2.534v3.74H6.57zm14.097-8.84c-.48-.33-1.05-.49-1.72-.49-.62 0-1.15.18-1.6.55-.44.37-.7.88-.78 1.53h4.26c-.1-.65-.37-1.15-.85-1.48l-.31-.11zm-3.85 6.64c-.48-.33-1.05-.49-1.72-.49-.62 0-1.15.18-1.6.55-.44.37-.7.88-.78 1.53h4.26c-.1-.65-.37-1.15-.85-1.48l-.31-.11z",
									color: "text-blue-500"
								},
							}).map(([key, config]) => (
								<div key={key} className="group">
									<div className="relative">
										<div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
											<div className={`w-5 h-5 ${config.color} flex-shrink-0`}>
												<svg viewBox="0 0 24 24" fill="currentColor">
													<path d={config.icon} />
												</svg>
											</div>
										</div>
										<input
											type="url"
											value={socialLinks[key as keyof typeof socialLinks] || ""}
											onChange={(e) => setSocialLinks(prev => ({ ...prev, [key]: e.target.value }))}
											placeholder={config.placeholder}
											className="w-full pl-12 pr-4 py-3 text-sm bg-zinc-50 border-0 rounded-xl focus:ring-2 focus:ring-zinc-900/10 focus:bg-white transition-all duration-200"
										/>
										<label className="absolute -top-2 left-10 px-2 text-xs font-medium text-zinc-600 bg-white">
											{config.label}
										</label>
									</div>
								</div>
							))}
						</div>
						
						<div className="mt-6 pt-6 border-t border-slate-100">
							<Button 
								onClick={handleSaveSocialLinks} 
								className="w-full"
							>
								Save Social Links
							</Button>
						</div>
					</div>

					{/* Experience Section */}
					<div className="bg-white rounded-lg border border-slate-100 p-8">
						<div className="mb-6">
							<div className="flex items-center gap-3 mb-2">
								<div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
									<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
									</svg>
								</div>
								<h3 className="text-lg font-medium text-zinc-900">Professional Experience</h3>
							</div>
							<p className="text-sm text-zinc-500">Add key experiences or achievements</p>
						</div>
						
						<div className="space-y-4">
							<div className="flex gap-3">
								<input
									value={newExperience}
									onChange={(e) => setNewExperience(e.target.value)}
									placeholder="Add an experience or achievement"
									className="flex-1 px-4 py-3 text-sm bg-zinc-50 border-0 rounded-xl focus:ring-2 focus:ring-zinc-900/10 focus:bg-white transition-all duration-200"
									onKeyPress={(e) => e.key === "Enter" && newExperience.trim() && addExperience()}
								/>
								<button
									type="button"
									onClick={addExperience}
									disabled={!newExperience.trim() || experience.length >= 10}
									className="px-6 py-3 text-sm font-medium text-zinc-700 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-all duration-200 disabled:opacity-50"
								>
									Add
								</button>
							</div>
							
							{experience.length > 0 && (
								<div className="space-y-2">
									{experience.map((exp, idx) => (
										<div key={idx} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg">
											<span className="flex-1 text-sm text-zinc-700">{exp}</span>
											<button
												type="button"
												aria-label="Remove experience"
												className="text-zinc-400 hover:text-red-500 transition-colors duration-200"
												onClick={() => removeExperience(idx)}
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</div>
									))}
								</div>
							)}
							
							<div className="pt-4">
								<Button onClick={handleSaveExperience} className="w-full">
									Save Experience
								</Button>
							</div>
						</div>
					</div>


						{/* Save Section */}
						<div className="flex justify-end">
							<Button 
								onClick={() => saveProfile()} 
								disabled={isPending || !name.trim()} 
								className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
							>
								{isPending ? (
									<span className="inline-flex items-center gap-2">
										<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
										Saving...
									</span>
								) : (
									"Save Changes"
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Projects & Feedback Section */}
			<div className="pb-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Projects */}
					<div className="bg-white rounded-lg border border-slate-100 p-8">
					<div className="flex items-center gap-4 mb-8">
						<div className="w-12 h-12 bg-violet-500 rounded-2xl flex items-center justify-center">
							<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
							</svg>
						</div>
						<div>
							<h3 className="text-lg font-medium text-zinc-900">Recent Projects</h3>
							<p className="text-sm text-zinc-600">Your latest work</p>
						</div>
					</div>
					
					<div className="space-y-4">
						{isLoading ? (
							Array.from({ length: 4 }).map((_, i) => (
								<div key={i} className="border border-slate-200 rounded-lg p-4">
									<div className="flex items-center gap-3 mb-3">
										<Skeleton className="h-3 w-3 rounded-full" />
										<Skeleton className="h-4 w-32" />
									</div>
									<Skeleton className="h-3 w-full mb-2" />
									<div className="flex gap-4">
										<Skeleton className="h-3 w-16" />
										<Skeleton className="h-3 w-20" />
									</div>
								</div>
							))
						) : projects.length > 0 ? (
							projects.slice(0, 4).map((project) => (
								<Link key={project.id} href={`/dashboard/projects/${project.id}`} className="group block">
									<div className="border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-violet-300 transition-all duration-200">
										<div className="flex items-start justify-between mb-3">
											<div className="flex items-center gap-3">
												<div className={`w-3 h-3 rounded-full ${
													project.status === 'completed' ? 'bg-green-500' : 
													project.status === 'in-progress' ? 'bg-blue-500' : 'bg-slate-400'
												}`} />
												<h4 className="font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">
													{project.name}
												</h4>
											</div>
											<ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
										</div>
										
										{project.description && (
											<p className="text-sm text-slate-600 line-clamp-2 mb-3">
												{project.description}
											</p>
										)}

										<div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
											<div className="flex items-center gap-1">
												<Target className="h-3 w-3" />
												<span className="capitalize">
													{project.status === 'completed' ? 'Completed' : 
													 project.status === 'in-progress' ? 'In Progress' : 'Planning'}
												</span>
											</div>
											{project.price && (
												<div className="flex items-center gap-1">
													<DollarSign className="h-3 w-3" />
													<span>
														${project.price}{project.price_type === 'hourly' ? '/hr' : ''}
													</span>
												</div>
											)}
											{project.deadline && (
												<div className="flex items-center gap-1">
													<Calendar className="h-3 w-3" />
													<span>{new Date(project.deadline).toLocaleDateString()}</span>
												</div>
											)}
										</div>

										<div className="flex items-center justify-between">
											<div className="flex items-center gap-4 text-xs">
												{project.tasks_count !== undefined && (
													<div className="flex items-center gap-1 text-slate-500">
														<CheckCircle2 className="h-3 w-3" />
														<span>{project.completed_tasks || 0}/{project.tasks_count} tasks</span>
													</div>
												)}
												{project.total_hours !== undefined && project.total_hours > 0 && (
													<div className="flex items-center gap-1 text-slate-500">
														<Timer className="h-3 w-3" />
														<span>
															{project.total_hours >= 1 
																? `${Math.floor(project.total_hours)}h ${Math.round((project.total_hours % 1) * 60)}m`.replace(' 0m', '')
																: project.total_hours >= (1/60)
																? `${Math.round(project.total_hours * 60)}m`
																: `${Math.round(project.total_hours * 3600)}s`
															}
														</span>
													</div>
												)}
											</div>
											<div className="text-xs text-slate-400">
												{new Date(project.created_at).toLocaleDateString()}
											</div>
										</div>
									</div>
								</Link>
							))
						) : (
							<div className="text-center py-12">
								<div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
									<Folder className="w-8 h-8 text-violet-500" />
								</div>
								<p className="text-sm text-slate-600 font-medium">No projects yet</p>
								<p className="text-xs text-slate-500 mt-1">Create your first project to get started</p>
								<Link href="/dashboard/projects">
									<Button className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm">
										Create Project
									</Button>
								</Link>
							</div>
						)}
						
						{projects.length > 4 && (
							<div className="pt-4 border-t border-slate-200">
								<Link href="/dashboard/projects" className="flex items-center justify-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors">
									<span>View all projects</span>
									<ExternalLink className="h-4 w-4" />
								</Link>
							</div>
						)}
					</div>
				</div>

					{/* Client Feedback */}
					<div className="bg-white rounded-lg border border-slate-100 p-8">
					<div className="flex items-center gap-4 mb-8">
						<div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center">
							<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
							</svg>
						</div>
						<div>
							<h3 className="text-lg font-medium text-zinc-900">Client Feedback</h3>
							<p className="text-sm text-zinc-600">Reviews and testimonials</p>
						</div>
					</div>

					<div className="space-y-4">
						{isLoadingFeedback ? (
							Array.from({ length: 3 }).map((_, i) => (
								<div key={i} className="p-4 bg-white/60 rounded-lg border border-amber-200/30">
									<div className="flex items-start justify-between mb-2">
										<div className="space-y-1">
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-3 w-32" />
										</div>
										<div className="flex items-center gap-1">
											{Array.from({ length: 5 }).map((_, starIndex) => (
												<Skeleton key={starIndex} className="w-3 h-3 rounded-sm" />
											))}
										</div>
									</div>
									<Skeleton className="h-4 w-full mb-2" />
									<Skeleton className="h-3 w-16" />
								</div>
							))
						) : feedback.length > 0 ? (
							feedback.slice(0, 4).map((item) => {
								const timeAgo = new Date(item.created_at).toLocaleDateString('en-US', {
									month: 'short',
									day: 'numeric',
									year: new Date().getFullYear() !== new Date(item.created_at).getFullYear() ? 'numeric' : undefined
								});
								
								return (
									<div key={item.id} className="p-4 bg-white/60 rounded-lg border border-amber-200/30">
										<div className="flex items-start justify-between mb-2">
											<div>
												<p className="text-sm font-medium text-amber-900">{item.client_name}</p>
												<p className="text-xs text-amber-600">{item.project?.name || "Project"}</p>
											</div>
											<div className="flex items-center gap-1">
												{Array.from({ length: 5 }).map((_, starIndex) => (
													<svg 
														key={starIndex} 
														className={`w-3 h-3 ${starIndex < item.rating ? 'text-amber-400' : 'text-amber-200'}`} 
														fill="currentColor" 
														viewBox="0 0 20 20"
													>
														<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
													</svg>
												))}
											</div>
										</div>
										{item.comment && (
											<p className="text-sm text-amber-800 leading-relaxed mb-2">{item.comment}</p>
										)}
										<p className="text-xs text-amber-600">{timeAgo}</p>
									</div>
								);
							})
						) : (
							<div className="text-center py-12">
								<div className="w-16 h-16 bg-white/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
									<svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
									</svg>
								</div>
								<p className="text-sm text-zinc-600 font-medium">No client feedback yet</p>
								<p className="text-xs text-zinc-500 mt-2 leading-relaxed max-w-sm mx-auto">
									Complete projects and share tracking links with clients to receive reviews at project completion.
								</p>
							</div>
						)}
					</div>
					</div>
				</div>
			</div>

			{/* AI Dialog */}
			<Dialog open={openAI} onOpenChange={setOpenAI}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle className="text-xl font-semibold text-zinc-900">AI Hourly Rate Calculator</DialogTitle>
					</DialogHeader>
					<div className="space-y-6 text-sm">
						<div className="p-4 bg-zinc-50 rounded-xl">
							<p className="text-zinc-700">We analyze your role, experience, skills, bio and location to estimate a competitive hourly rate. Complete all profile fields for the most accurate result.</p>
						</div>
						
						{!role || !bio.trim() || skills.length === 0 || !location || experienceYears <= 0 ? (
							<div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
								<p className="text-amber-800 font-medium mb-2">Missing Information</p>
								<p className="text-amber-700">Please complete all fields: role, experience years, bio, at least 1 skill, and location.</p>
							</div>
						) : (
							<>
								<Button 
									disabled={isGenerating}
									onClick={async () => {
										try {
											setIsGenerating(true);
											setRateResult(null);
											const json = await api<{ basic: number; standard: number; rush: number; reasoning: string }>("/api/profile/ai/hourly-rate", { 
												method: "POST", 
												body: JSON.stringify({ role, skills, experienceYears, location }) 
											}, user || undefined);
											setAiSavedMin(json.basic);
											setAiSavedMax(json.rush);
											setAiSavedReason(json.reasoning || "");
											setRateResult({ rateUsd: json.standard, reasoning: json.reasoning });
										} catch (e) {
											toast.error((e as Error).message || "Failed");
										} finally {
											setIsGenerating(false);
										}
									}}
									className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl transition-all duration-200"
								>
									{isGenerating ? (
										<span className="inline-flex items-center gap-2">
											<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
											Generating your rate...
										</span>
									) : (
										"Calculate My Rate"
									)}
								</Button>
								
								{isGenerating && (
									<div className="p-4 bg-zinc-50 rounded-xl">
										<p className="text-zinc-700 mb-3">Analyzing your professional profile...</p>
										<div className="space-y-2">
											<Skeleton className="h-3 w-3/4" />
											<Skeleton className="h-3 w-1/2" />
											<Skeleton className="h-3 w-2/3" />
										</div>
									</div>
								)}
								
								{!isGenerating && rateResult && aiSavedMin && aiSavedMax && (
									<div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
										<div className="flex items-center gap-2 mb-4">
											<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
												<svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
												</svg>
											</div>
											<h4 className="font-semibold text-zinc-900">Choose Your Rate</h4>
										</div>
										
										<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
											<div 
												onClick={async () => {
													try {
														if (!user) throw new Error("Not authenticated");
														setSavingRate(true);
														await setDoc(doc(db, "customers", user.uid), { 
															hourlyRateManual: aiSavedMin,
															hourlyRateAiMin: aiSavedMin, 
															hourlyRateAiMax: aiSavedMax, 
															hourlyRateAiReasoning: aiSavedReason, 
															updated_at: serverTimestamp() 
														}, { merge: true });
														setManualRate(aiSavedMin);
														toast.success("Basic rate saved successfully!");
														setOpenAI(false);
													} catch (e) {
														toast.error((e as Error).message || "Failed to save rate");
													} finally {
														setSavingRate(false);
													}
												}}
												className="cursor-pointer p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
											>
												<div className="text-center">
													<div className="text-xs text-gray-500 mb-1">Basic</div>
													<div className="text-lg font-bold text-gray-900">${aiSavedMin}/hr</div>
													<div className="text-xs text-gray-500 mt-1">New to freelancing</div>
												</div>
											</div>
											
											<div 
												onClick={async () => {
													try {
														if (!user) throw new Error("Not authenticated");
														setSavingRate(true);
														const standardRate = Math.round((aiSavedMin + aiSavedMax) / 2);
														await setDoc(doc(db, "customers", user.uid), { 
															hourlyRateManual: standardRate,
															hourlyRateAiMin: aiSavedMin, 
															hourlyRateAiMax: aiSavedMax, 
															hourlyRateAiReasoning: aiSavedReason, 
															updated_at: serverTimestamp() 
														}, { merge: true });
														setManualRate(standardRate);
														toast.success("Standard rate saved successfully!");
														setOpenAI(false);
													} catch (e) {
														toast.error((e as Error).message || "Failed to save rate");
													} finally {
														setSavingRate(false);
													}
												}}
												className="cursor-pointer p-4 bg-blue-600 text-white rounded-lg border-2 border-blue-600 hover:bg-blue-700 transition-all duration-200 hover:shadow-md"
											>
												<div className="text-center">
													<div className="text-xs text-blue-100 mb-1">Standard</div>
													<div className="text-lg font-bold">${Math.round((aiSavedMin + aiSavedMax) / 2)}/hr</div>
													<div className="text-xs text-blue-100 mt-1">Experienced freelancer</div>
												</div>
											</div>
											
											<div 
												onClick={async () => {
													try {
														if (!user) throw new Error("Not authenticated");
														setSavingRate(true);
														await setDoc(doc(db, "customers", user.uid), { 
															hourlyRateManual: aiSavedMax,
															hourlyRateAiMin: aiSavedMin, 
															hourlyRateAiMax: aiSavedMax, 
															hourlyRateAiReasoning: aiSavedReason, 
															updated_at: serverTimestamp() 
														}, { merge: true });
														setManualRate(aiSavedMax);
														toast.success("Expert rate saved successfully!");
														setOpenAI(false);
													} catch (e) {
														toast.error((e as Error).message || "Failed to save rate");
													} finally {
														setSavingRate(false);
													}
												}}
												className="cursor-pointer p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
											>
												<div className="text-center">
													<div className="text-xs text-gray-500 mb-1">Expert</div>
													<div className="text-lg font-bold text-gray-900">${aiSavedMax}/hr</div>
													<div className="text-xs text-gray-500 mt-1">Senior expert</div>
												</div>
											</div>
										</div>
										
										<div className="text-sm text-gray-600 leading-relaxed mb-4">
											<strong>AI Reasoning:</strong> {aiSavedReason}
										</div>
										
										{savingRate && (
											<div className="text-center py-2">
												<div className="inline-flex items-center gap-2 text-blue-600">
													<div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
													Saving rate...
												</div>
											</div>
										)}
									</div>
								)}
							</>
						)}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setOpenAI(false)} className="rounded-xl">Close</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
