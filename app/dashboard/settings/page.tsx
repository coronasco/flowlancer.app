"use client";

import { Button } from "@/components/ui/Button";
import { useSession } from "@/contexts/SessionContext";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Shield, 
  CreditCard, 
  Trash2,
  Eye,
  EyeOff,
  Save,
  Settings as SettingsIcon
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
	const { user } = useSession();
	const [avatarUrl, setAvatarUrl] = useState<string>("");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [loading, setSaving] = useState(false);

	// Privacy settings
	const [profilePublic, setProfilePublic] = useState(true);
	const [showProjects, setShowProjects] = useState(true);
	const [showExperience, setShowExperience] = useState(true);
	const [showSkills, setShowSkills] = useState(true);
	const [showRate, setShowRate] = useState(false);

	// Load user profile data from Firestore
	useEffect(() => {
		if (!user) return;
		const loadProfile = async () => {
			try {
				const { getFirestore, doc, getDoc } = await import("firebase/firestore");
				const db = getFirestore();
				const docSnap = await getDoc(doc(db, "customers", user.uid));
				if (docSnap.exists()) {
					const data = docSnap.data();
					setName(data.name || "");
					setEmail(data.email || user.email || "");
					setAvatarUrl(data.avatarUrl || user.photoURL || "");
					
					// Privacy settings
					setProfilePublic(data.profilePublic !== false);
					setShowProjects(data.showProjects !== false);
					setShowExperience(data.showExperience !== false);
					setShowSkills(data.showSkills !== false);
					setShowRate(data.showRate === true);
				}
			} catch (error) {
				console.error("Error loading profile:", error);
			}
		};
		loadProfile();
	}, [user]);

	const handleSaveAccount = async () => {
		if (!user) return;
		setSaving(true);
		try {
			const { getFirestore, doc, updateDoc } = await import("firebase/firestore");
			const db = getFirestore();
			await updateDoc(doc(db, "customers", user.uid), {
				name,
				email,
				updatedAt: new Date()
			});
			toast.success("Account settings saved!");
		} catch (error) {
			console.error("Error saving account:", error);
			toast.error("Failed to save account settings");
		}
		setSaving(false);
	};

	const handleSavePrivacy = async () => {
		if (!user) return;
		setSaving(true);
		try {
			const { getFirestore, doc, updateDoc } = await import("firebase/firestore");
			const db = getFirestore();
			await updateDoc(doc(db, "customers", user.uid), {
				profilePublic,
				showProjects,
				showExperience,
				showSkills,
				showRate,
				updatedAt: new Date()
			});
			toast.success("Privacy settings saved!");
		} catch (error) {
			console.error("Error saving privacy:", error);
			toast.error("Failed to save privacy settings");
		}
		setSaving(false);
	};

	return (
		<div className="min-h-screen bg-white">
			{/* Header Section */}
			<div className="border-b border-slate-100 bg-white sticky top-0 z-40">
				<div className="py-6">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-slate-100 rounded-lg">
							<SettingsIcon className="h-6 w-6 text-slate-600" />
						</div>
						<div>
							<h1 className="text-3xl font-semibold text-slate-900">Settings</h1>
							<p className="text-slate-600 mt-1">Manage your account, privacy, and preferences</p>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="py-8">
				<div className="max-w-4xl mx-auto space-y-8">
					{/* Account Settings */}
					<div className="bg-white border border-slate-100 rounded-lg p-6">
						<div className="flex items-center gap-3 mb-6">
							<User className="h-5 w-5 text-slate-600" />
							<h2 className="text-xl font-semibold text-slate-900">Account</h2>
						</div>
						
						<div className="grid md:grid-cols-2 gap-6">
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-2">
										Full Name
									</label>
									<input
										type="text"
										value={name}
										onChange={(e) => setName(e.target.value)}
										className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
										placeholder="Enter your full name"
									/>
								</div>
								
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-2">
										Email Address
									</label>
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
										placeholder="Enter your email"
									/>
								</div>
							</div>
							
							<div className="flex items-center justify-center">
								<div className="text-center">
									<Avatar className="h-20 w-20 mx-auto mb-4">
										{avatarUrl && <AvatarImage src={avatarUrl} alt={name || "User"} />}
										<AvatarFallback className="bg-slate-100 text-slate-600 text-xl">
											{name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
										</AvatarFallback>
									</Avatar>
									<p className="text-sm text-slate-600">Profile Picture</p>
								</div>
							</div>
						</div>
						
						<div className="mt-6">
							<Button 
								onClick={handleSaveAccount}
								disabled={loading}
								className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
							>
								<Save className="h-4 w-4 mr-2" />
								Save Account
							</Button>
						</div>
					</div>

					{/* Privacy Settings */}
					<div className="bg-white border border-slate-100 rounded-lg p-6">
						<div className="flex items-center gap-3 mb-6">
							<Shield className="h-5 w-5 text-slate-600" />
							<h2 className="text-xl font-semibold text-slate-900">Privacy</h2>
						</div>
						
						<div className="space-y-4">
							<div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
								<div className="flex items-center gap-3">
									{profilePublic ? <Eye className="h-5 w-5 text-green-600" /> : <EyeOff className="h-5 w-5 text-slate-400" />}
									<div>
										<p className="font-medium text-slate-900">Public Profile</p>
										<p className="text-sm text-slate-600">Make your profile visible to others</p>
									</div>
								</div>
								<button
									onClick={() => setProfilePublic(!profilePublic)}
									className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
										profilePublic ? 'bg-slate-900' : 'bg-slate-200'
									}`}
								>
									<span
										className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
											profilePublic ? 'translate-x-6' : 'translate-x-1'
										}`}
									/>
								</button>
							</div>
							
							<div className="grid md:grid-cols-2 gap-4">
								<div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
									<span className="text-sm text-slate-700">Show Projects</span>
									<button
										onClick={() => setShowProjects(!showProjects)}
										className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
											showProjects ? 'bg-slate-700' : 'bg-slate-200'
										}`}
									>
										<span
											className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
												showProjects ? 'translate-x-5' : 'translate-x-1'
											}`}
										/>
									</button>
								</div>
								
								<div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
									<span className="text-sm text-slate-700">Show Experience</span>
									<button
										onClick={() => setShowExperience(!showExperience)}
										className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
											showExperience ? 'bg-slate-700' : 'bg-slate-200'
										}`}
									>
										<span
											className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
												showExperience ? 'translate-x-5' : 'translate-x-1'
											}`}
										/>
									</button>
								</div>
								
								<div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
									<span className="text-sm text-slate-700">Show Skills</span>
									<button
										onClick={() => setShowSkills(!showSkills)}
										className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
											showSkills ? 'bg-slate-700' : 'bg-slate-200'
										}`}
									>
										<span
											className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
												showSkills ? 'translate-x-5' : 'translate-x-1'
											}`}
										/>
									</button>
								</div>
								
								<div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
									<span className="text-sm text-slate-700">Show Hourly Rate</span>
									<button
										onClick={() => setShowRate(!showRate)}
										className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
											showRate ? 'bg-slate-700' : 'bg-slate-200'
										}`}
									>
										<span
											className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
												showRate ? 'translate-x-5' : 'translate-x-1'
											}`}
										/>
									</button>
								</div>
							</div>
						</div>
						
						<div className="mt-6">
							<Button 
								onClick={handleSavePrivacy}
								disabled={loading}
								className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
							>
								<Save className="h-4 w-4 mr-2" />
								Save Privacy
							</Button>
						</div>
					</div>

					{/* Billing & Danger Zone Placeholder */}
					<div className="bg-white border border-slate-100 rounded-lg p-6">
						<div className="flex items-center gap-3 mb-6">
							<CreditCard className="h-5 w-5 text-slate-600" />
							<h2 className="text-xl font-semibold text-slate-900">Billing</h2>
						</div>
						
						<div className="text-center py-8">
							<CreditCard className="h-12 w-12 mx-auto text-slate-400 mb-4" />
							<h3 className="font-medium text-slate-900 mb-2">Stripe Integration</h3>
							<p className="text-slate-600 text-sm mb-4">
								Connect your Stripe account to manage payments and subscriptions
							</p>
							<Button className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
								Connect Stripe (Coming Soon)
							</Button>
						</div>
					</div>

					{/* Danger Zone */}
					<div className="bg-white border border-red-200 rounded-lg p-6">
						<div className="flex items-center gap-3 mb-6">
							<Trash2 className="h-5 w-5 text-red-600" />
							<h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
						</div>
						
						<div className="border border-red-200 rounded-lg p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium text-red-900">Delete Account</p>
									<p className="text-sm text-red-600">
										This action cannot be undone. All your data will be permanently deleted.
									</p>
								</div>
								<Button 
									onClick={() => toast.error("Delete account functionality will be implemented soon")}
									className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
								>
									Delete Account
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}