import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, MapPin, Clock, Star, ExternalLink, Calendar, CheckCircle, Briefcase, MessageCircle, Github, Linkedin, Globe, Twitter, Dribbble } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

// Enable ISR with 2 minute revalidation
export const revalidate = 120;

type PublicProfile = {
	userId: string;
	name: string;
	email?: string;
	role?: string;
	location?: string;
	bio?: string;
	avatarUrl?: string;
	skills?: string[];
	experienceYears?: number;
	hourlyRateAiMin?: number;
	hourlyRateAiMax?: number;
	publicSlug: string;
	socialLinks?: {
		github?: string;
		linkedin?: string;
		website?: string;
		twitter?: string;
		dribbble?: string;
		behance?: string;
	};
	experience?: string[];
	isPublic?: boolean;
	visibilitySettings?: {
		bio?: boolean;
		skills?: boolean;
		experience?: boolean;
		socialLinks?: boolean;
		hourlyRate?: boolean;
		projects?: boolean;
		feedback?: boolean;
	};
};

type PublicProject = {
	id: string;
	userId: string;
	name: string;
	createdAt: number;
};

type Feedback = {
	id: string;
	project_id: string;
	client_name: string;
	client_email?: string;
	rating: number;
	comment?: string;
	created_at: string;
	project?: { name: string };
};

// Generate metadata for SEO
export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	
			try {
			// Fetch profile data for metadata
			const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
			const profileRes = await fetch(`${baseUrl}/api/public/profile/${slug}`, {
				next: { revalidate: 3600 }, // Cache for 1 hour
			});
			
					if (!profileRes.ok) {
			return {
				title: "Profile Not Found - Flowlancer",
				description: "The requested profile could not be found.",
				robots: { index: false, follow: false },
			};
		}
			
			const profileData = await profileRes.json();
					if (!profileData.ok || !profileData.data?.profile) {
			return {
				title: "Profile Not Found - Flowlancer",
				description: "The requested profile could not be found.",
				robots: { index: false, follow: false },
			};
		}
			
					const profile = profileData.data.profile;
		
		// Check if profile is public
		if (!profile.isPublic) {
			return {
				title: "Profile Not Found - Flowlancer",
				description: "The requested profile could not be found.",
				robots: { index: false, follow: false },
			};
		}
		
		const title = `${profile.name} - ${profile.role || 'Freelancer'} | Flowlancer`;
		const description = profile.bio && profile.visibilitySettings?.bio !== false
			? `${profile.bio.substring(0, 155)}...`
			: `${profile.name} is a ${profile.role || 'freelancer'} ${profile.location ? `based in ${profile.location}` : ''} available for hire on Flowlancer.`;
		
		return {
			title,
			description,
					keywords: [
			profile.name,
			profile.role || 'freelancer',
			...(profile.skills && profile.visibilitySettings?.skills !== false ? profile.skills : []),
			'Flowlancer',
			'hire',
			'freelance'
		].join(', '),
			authors: [{ name: profile.name }],
			openGraph: {
				title,
				description,
				type: 'profile',
				url: `/p/${slug}`,
				siteName: 'Flowlancer',
				images: profile.avatarUrl ? [
					{
						url: profile.avatarUrl,
						width: 400,
						height: 400,
						alt: `${profile.name}'s profile picture`,
					}
				] : [],
			},
			twitter: {
				card: 'summary',
				title,
				description,
				images: profile.avatarUrl ? [profile.avatarUrl] : [],
			},
			robots: {
				index: true,
				follow: true,
				googleBot: {
					index: true,
					follow: true,
				},
			},
		};
	} catch {
		return {
			title: "Profile Not Found - Flowlancer",
			description: "The requested profile could not be found.",
		};
	}
}

export default async function PublicProfilePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	
	// Fetch profile data
	let profile: PublicProfile;
	let projects: PublicProject[] = [];
	let feedback: Feedback[] = [];
	
	// Load profile first (critical path)
	try {
		const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
		const profileRes = await fetch(`${baseUrl}/api/public/profile/${slug}`, {
			next: { revalidate: 3600 },
		});
		
		if (!profileRes.ok) {
			notFound();
		}
		
		const profileData = await profileRes.json();
		if (!profileData.ok || !profileData.data?.profile) {
			notFound();
		}
		
		profile = profileData.data.profile;
		
		// Check if profile is public
		if (!profile.isPublic) {
			notFound();
		}
	} catch {
		notFound();
	}

	// Load projects and feedback (non-critical, errors shouldn't cause 404)
	try {
		const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
		const promises = [];
		
		if (profile.visibilitySettings?.projects !== false) {
			promises.push(
				fetch(`${baseUrl}/api/public/projects?email=${encodeURIComponent(profile.email || profile.userId)}`, {
					next: { revalidate: 3600 },
				})
			);
		} else {
			promises.push(Promise.resolve({ ok: false }));
		}
		
		if (profile.visibilitySettings?.feedback !== false) {
			promises.push(
				fetch(`${baseUrl}/api/public/feedback?email=${encodeURIComponent(profile.email || profile.userId)}`, {
					next: { revalidate: 3600 },
				})
			);
		} else {
			promises.push(Promise.resolve({ ok: false }));
		}
		
		const [projectsRes, feedbackRes] = await Promise.allSettled(promises);
		
		if (projectsRes.status === 'fulfilled' && projectsRes.value.ok && 'json' in projectsRes.value) {
			const projectsData = await projectsRes.value.json();
			if (projectsData.ok && projectsData.data?.projects) {
				projects = projectsData.data.projects;
			}
		}
		
		if (feedbackRes.status === 'fulfilled' && feedbackRes.value.ok && 'json' in feedbackRes.value) {
			const feedbackData = await feedbackRes.value.json();
			if (feedbackData.ok && feedbackData.data?.feedback) {
				feedback = feedbackData.data.feedback;
			}
		}
	} catch (error) {
		// Log error but don't fail the page
		console.error('Error loading projects/feedback:', error);
	}
	
	const avgRating = feedback.length > 0 
		? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length 
		: 0;
	
	const completedProjects = projects.length; // All projects are considered completed for public view
	
	// JSON-LD Structured Data for SEO
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Person",
		"name": profile.name,
		"jobTitle": profile.role,
		"description": profile.visibilitySettings?.bio !== false ? profile.bio : undefined,
		"image": profile.avatarUrl,
		"url": `/p/${profile.publicSlug}`,
		"address": profile.location ? {
			"@type": "Place",
			"name": profile.location
		} : undefined,
		"worksFor": {
			"@type": "Organization",
			"name": "Flowlancer",
			"url": "https://flowlancer.app"
		},
		"aggregateRating": feedback.length > 0 ? {
			"@type": "AggregateRating",
			"ratingValue": avgRating.toFixed(1),
			"reviewCount": feedback.length,
			"bestRating": 5,
			"worstRating": 1
		} : undefined,
		"review": feedback.map(f => ({
			"@type": "Review",
			"reviewRating": {
				"@type": "Rating",
				"ratingValue": f.rating,
				"bestRating": 5
			},
			"author": {
				"@type": "Person",
				"name": f.client_name
			},
			"reviewBody": f.comment,
			"datePublished": f.created_at
		})),
		"sameAs": profile.visibilitySettings?.socialLinks !== false ? [
			profile.socialLinks?.github,
			profile.socialLinks?.linkedin,
			profile.socialLinks?.website,
			profile.socialLinks?.twitter,
			profile.socialLinks?.dribbble,
			profile.socialLinks?.behance,
		].filter(Boolean) : undefined
	};
	
	const getSocialIcon = (platform: string) => {
		switch (platform) {
			case 'github': return Github;
			case 'linkedin': return Linkedin;
			case 'website': return Globe;
			case 'twitter': return Twitter;
			case 'dribbble': return Dribbble;
			case 'behance': return Globe; // Using Globe as fallback for Behance
			default: return ExternalLink;
		}
	};
	
	return (
		<>
			{/* JSON-LD for SEO */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 2) }}
			/>
			
			<div className="min-h-screen bg-white">
				{/* Header */}
				<div className="border-b border-slate-100 sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
					<div className="max-w-5xl mx-auto px-6 lg:px-8 py-6">
						<Link 
							href="/dashboard/profile" 
							className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 transition-colors group"
						>
							<ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
							Back to Flowlancer
						</Link>
					</div>
				</div>
				
				{/* Profile Content */}
				<div className="max-w-5xl mx-auto px-6 lg:px-8 py-16">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
						
						{/* Left Column - Profile Info */}
						<div className="lg:col-span-1">
							<Card className="p-10 border border-slate-100 bg-slate-50/30">
								<div className="text-center">
									<div className="relative inline-block mb-8">
										<Avatar className="h-28 w-28 mx-auto border-2 border-slate-200">
											<AvatarImage src={profile.avatarUrl} alt={profile.name} />
											<AvatarFallback className="text-xl font-medium bg-slate-100 text-slate-600">
												{profile.name.charAt(0).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										{feedback.length > 0 && (
											<div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
												<div className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
													<Star className="h-3 w-3 inline mr-1 fill-current" />
													{avgRating.toFixed(1)}
												</div>
											</div>
										)}
									</div>
									
									<h1 className="text-xl font-semibold text-slate-900 mb-1">
										{profile.name}
									</h1>
									
									{profile.role && (
										<p className="text-md text-slate-600 mb-8 font-normal">{profile.role}</p>
									)}
									
									<div className="space-y-4 mb-8">
										{profile.location && (
											<div className="flex items-center justify-center">
												<div className="flex items-center text-slate-500">
													<MapPin className="h-4 w-4 mr-2" />
													<span className="text-sm">{profile.location}</span>
												</div>
											</div>
										)}
										
										{/* Experience */}
										{profile.experienceYears && (
											<div className="flex items-center justify-center">
												<div className="flex items-center text-slate-500">
													<Clock className="h-4 w-4 mr-2" />
													<span className="text-sm">
														{profile.experienceYears} year{profile.experienceYears !== 1 ? 's' : ''} experience
													</span>
												</div>
											</div>
										)}
										
										{/* Hourly Rate */}
										{profile.visibilitySettings?.hourlyRate !== false && (profile.hourlyRateAiMin && profile.hourlyRateAiMax) && (
											<div className="flex justify-center">
												<div className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium">
													${profile.hourlyRateAiMin}-${profile.hourlyRateAiMax}/hr
												</div>
											</div>
										)}
									</div>
									
									{/* Social Links */}
									{profile.visibilitySettings?.socialLinks !== false && profile.socialLinks && (
										<div className="flex justify-center gap-3 mb-8">
											{Object.entries(profile.socialLinks).map(([platform, url]) => {
												if (!url) return null;
												const Icon = getSocialIcon(platform);
												return (
													<Link
														key={platform}
														href={url}
														target="_blank"
														rel="noopener noreferrer"
														className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-colors"
													>
														<Icon className="h-4 w-4" />
														<span className="sr-only">{platform}</span>
													</Link>
												);
											})}
										</div>
									)}
								</div>
								
								{/* Bio */}
								{profile.visibilitySettings?.bio !== false && profile.bio && (
									<div className="mt-10 pt-8 border-t border-slate-100">
										<h3 className="font-medium text-slate-900 mb-4">About</h3>
										<p className="text-slate-600 leading-relaxed text-sm">
											{profile.bio}
										</p>
									</div>
								)}
								
								{/* Experience */}
								{profile.visibilitySettings?.experience !== false && profile.experience && profile.experience.length > 0 && (
									<div className="mt-10 pt-8 border-t border-slate-100">
										<h3 className="font-medium text-slate-900 mb-4">Experience</h3>
										<div className="space-y-3">
											{profile.experience.map((exp, index) => (
												<div key={index} className="text-sm text-slate-600 leading-relaxed">
													• {exp}
												</div>
											))}
										</div>
									</div>
								)}
								
								{/* Skills */}
								{profile.visibilitySettings?.skills !== false && profile.skills && profile.skills.length > 0 && (
									<div className="mt-10 pt-8 border-t border-slate-100">
										<h3 className="font-medium text-slate-900 mb-4">Skills</h3>
										<div className="flex flex-wrap gap-2">
											{profile.skills.map((skill, index) => (
												<Badge key={index} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
													{skill}
												</Badge>
											))}
										</div>
									</div>
								)}

								{/* Professional Experience */}
								{profile.visibilitySettings?.experience !== false && profile.experience && profile.experience.length > 0 && (
									<div className="mt-10 pt-8 border-t border-slate-100">
										<h3 className="font-medium text-slate-900 mb-4">Professional Experience</h3>
										<div className="space-y-3">
											{profile.experience.map((exp, index) => (
												<div key={index} className="flex items-start gap-3">
													<div className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
													<p className="text-sm text-slate-600 leading-relaxed">{exp}</p>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Social Links */}
								{profile.visibilitySettings?.socialLinks !== false && profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
									<div className="mt-10 pt-8 border-t border-slate-100">
										<h3 className="font-medium text-slate-900 mb-4">Connect</h3>
										<div className="flex flex-wrap gap-3">
											{profile.socialLinks.github && (
												<a 
													href={profile.socialLinks.github}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm"
												>
													<Github className="w-4 h-4" />
													GitHub
												</a>
											)}
											{profile.socialLinks.linkedin && (
												<a 
													href={profile.socialLinks.linkedin}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm"
												>
													<Linkedin className="w-4 h-4" />
													LinkedIn
												</a>
											)}
											{profile.socialLinks.website && (
												<a 
													href={profile.socialLinks.website}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm"
												>
													<Globe className="w-4 h-4" />
													Website
												</a>
											)}
											{profile.socialLinks.twitter && (
												<a 
													href={profile.socialLinks.twitter}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm"
												>
													<Twitter className="w-4 h-4" />
													Twitter
												</a>
											)}
											{profile.socialLinks.dribbble && (
												<a 
													href={profile.socialLinks.dribbble}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm"
												>
													<Dribbble className="w-4 h-4" />
													Dribbble
												</a>
											)}
											{profile.socialLinks.behance && (
												<a 
													href={profile.socialLinks.behance}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm"
												>
													<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
														<path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.498 1.19.906.26 1.576.72 2.022 1.37.448.66.672 1.48.672 2.45 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.76-.62.16-1.25.24-1.91.24H0V4.51h6.938v-.007zM16.94 16.665c.44.428 1.073.643 1.894.643.59 0 1.1-.148 1.53-.447.424-.29.68-.61.78-.94h2.588c-.403 1.28-1.048 2.2-1.9 2.75-.85.56-1.884.83-3.08.83-.837 0-1.584-.13-2.272-.4-.673-.27-1.24-.65-1.72-1.14-.464-.49-.813-1.08-1.063-1.77-.25-.69-.37-1.45-.37-2.28 0-.85.125-1.61.373-2.28.25-.67.595-1.25 1.04-1.74.445-.49.98-.87 1.615-1.14.63-.27 1.315-.4 2.06-.4.906 0 1.685.2 2.37.6.684.4 1.23.94 1.65 1.64.42.7.63 1.5.63 2.39 0 .313-.03.62-.09.92H15.99c.085.82.34 1.49.95 1.87v.01-.01zM6.938 8.684c.475 0 .84-.113 1.118-.343.27-.23.41-.55.41-.96 0-.22-.036-.42-.11-.59-.07-.17-.185-.31-.34-.42-.16-.11-.36-.19-.59-.24-.23-.05-.49-.07-.78-.07H2.534v2.62H6.94-.002zm-.368 6.677c.29 0 .55-.04.77-.12.22-.08.41-.2.56-.35.15-.15.27-.34.35-.57.08-.23.12-.49.12-.78 0-.65-.2-1.13-.58-1.44-.38-.31-.88-.47-1.49-.47H2.534v3.74H6.57zm14.097-8.84c-.48-.33-1.05-.49-1.72-.49-.62 0-1.15.18-1.6.55-.44.37-.7.88-.78 1.53h4.26c-.1-.65-.37-1.15-.85-1.48l-.31-.11zm-3.85 6.64c-.48-.33-1.05-.49-1.72-.49-.62 0-1.15.18-1.6.55-.44.37-.7.88-.78 1.53h4.26c-.1-.65-.37-1.15-.85-1.48l-.31-.11z"/>
													</svg>
													Behance
												</a>
											)}
										</div>
									</div>
								)}
							</Card>
						</div>
						
						{/* Right Column - Projects & Reviews */}
						<div className="lg:col-span-2 space-y-12">
							
							{/* Stats */}
							<div className="grid grid-cols-2 gap-1 bg-slate-50 rounded-2xl p-1">
								<div className="text-center py-8 px-6 bg-white rounded-xl">
									<div className="text-4xl font-bold text-slate-900 mb-3">
										{completedProjects}
									</div>
									<div className="text-sm font-medium text-slate-600">Completed Projects</div>
								</div>
								<div className="text-center py-8 px-6 bg-white rounded-xl">
									<div className="text-4xl font-bold text-slate-900 mb-3">
										{feedback.length}
									</div>
									<div className="text-sm font-medium text-slate-600">Client Reviews</div>
								</div>
							</div>
							
							{/* Recent Projects */}
							{profile.visibilitySettings?.projects !== false && (
								<div>
								<h2 className="text-xl font-medium text-slate-900 mb-8">
									Recent Projects
								</h2>
								{projects.length > 0 ? (
									<div className="space-y-6">
										{projects.slice(0, 3).map((project) => (
											<div key={project.id} className="border border-slate-100 p-6 rounded-lg bg-slate-50/30 hover:bg-slate-50/50 transition-colors">
												<div className="flex justify-between items-start">
													<div className="flex-1">
														<h3 className="font-medium text-slate-900 mb-2">
															{project.name}
														</h3>
														<div className="flex items-center text-xs text-slate-500">
															<Calendar className="h-3 w-3 mr-2" />
															<span>
																{new Date(project.createdAt).toLocaleDateString()}
															</span>
														</div>
													</div>
													<div className="bg-slate-900 text-white px-3 py-1 rounded-md text-xs font-medium flex items-center">
														<CheckCircle className="h-3 w-3 mr-1" />
														Completed
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-12 border border-slate-100 rounded-lg bg-slate-50/30">
										<div className="text-slate-400 mb-4">
											<Briefcase className="h-8 w-8 mx-auto" />
										</div>
										<p className="text-slate-500">No public projects yet.</p>
										<p className="text-slate-400 text-sm mt-1">Projects will appear here once completed and made public.</p>
									</div>
								)}
								</div>
							)}
							
							{/* Client Reviews */}
							{profile.visibilitySettings?.feedback !== false && (
								<div>
								<h2 className="text-xl font-medium text-slate-900 mb-8">
									Client Reviews
								</h2>
								{feedback.length > 0 ? (
									<div className="space-y-6">
										{feedback.map((review, index) => (
											<div key={index} className="border border-slate-100 p-6 rounded-lg bg-slate-50/30">
												<div className="flex items-start justify-between mb-4">
													<div className="flex-1">
														<div className="font-medium text-slate-900 mb-2">
															{review.client_name}
														</div>
														<div className="flex items-center mb-3">
															{Array.from({ length: 5 }).map((_, i) => (
																<Star
																	key={i}
																	className={`h-3 w-3 mr-1 ${
																		i < review.rating
																			? 'text-amber-400 fill-amber-400'
																			: 'text-slate-300'
																	}`}
																/>
															))}
															<span className="ml-2 text-xs text-slate-600">
																{review.rating}/5
															</span>
														</div>
													</div>
													<div className="flex items-center text-xs text-slate-500">
														<Calendar className="h-3 w-3 mr-2" />
														<span>
															{new Date(review.created_at).toLocaleDateString()}
														</span>
													</div>
												</div>
												{review.comment && (
													<div className="bg-white border border-slate-100 rounded-lg p-4 mt-4">
														<p className="text-slate-700 leading-relaxed text-sm">
															{review.comment}
														</p>
													</div>
												)}
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-12 border border-slate-100 rounded-lg bg-slate-50/30">
										<div className="text-slate-400 mb-4">
											<MessageCircle className="h-8 w-8 mx-auto" />
										</div>
										<p className="text-slate-500">No reviews yet.</p>
										<p className="text-slate-400 text-sm mt-1">
											Complete projects to receive client feedback and build your reputation.
										</p>
									</div>
								)}
								</div>
							)}
							
							{/* Contact CTA */}
							<div className="text-center py-12 border border-slate-200 rounded-lg bg-slate-50/50">
								<div className="max-w-md mx-auto">
									<h3 className="text-xl font-medium text-slate-900 mb-3">
										Interested in working together?
									</h3>
									<p className="text-slate-600 mb-8 text-sm leading-relaxed">
										Connect with {profile.name} on Flowlancer to discuss your project and get started.
									</p>
									<Link 
										href="/login"
										className="inline-flex items-center px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
									>
										Contact on Flowlancer
										<ExternalLink className="h-4 w-4 ml-2" />
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}