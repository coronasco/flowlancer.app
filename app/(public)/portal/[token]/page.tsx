"use client";

import { Button } from "@/components/ui/Button";
import { CheckCircle, Circle, PlayCircle, Star, Send, User, Clock, DollarSign, FileText, Folder } from "lucide-react";
import { useState, useEffect, use } from "react";
import { toast } from "sonner";

type Task = {
	id: string;
	title: string;
	description?: string;
	status: string;
	estimated_hours?: number;
	actual_hours?: number;
	created_at: string;
	order?: number;
	totalSeconds?: number;
};

type Project = {
	id: string;
	name: string;
	description?: string;
	status: string;
	created_at: string;
	freelancer_email: string;
	price_type: string;
	price: number;
	tasks: Task[];
	progress: number;
	totalHours: number;
	tasksCompleted: number;
	totalTasks: number;
	totalSeconds?: number;
};

type Comment = {
	id: string;
	project_id: string;
	task_id?: string;
	client_name: string;
	client_email?: string;
	comment: string;
	created_at: string;
};

type Feedback = {
	id: string;
	project_id: string;
	client_name: string;
	client_email?: string;
	rating: number;
	comment?: string;
	created_at: string;
};

type PortalData = {
	project: Project;
	comments: Comment[];
	feedback?: Feedback;
	canLeaveFeedback: boolean;
};

async function fetchPortalData(token: string): Promise<PortalData> {
	const response = await fetch(`/api/portal/${token}`, {
		method: 'GET',
		cache: 'no-cache'
	});
	
	if (!response.ok) {
		throw new Error('Failed to fetch portal data');
	}
	
	const result = await response.json();
	if (!result.ok) {
		throw new Error(result.error?.message || 'Failed to fetch portal data');
	}
	
	return result.data;
}

export default function PortalPage({ 
	params 
}: { 
	params: Promise<{ token: string }> 
}) {
	const { token } = use(params);
	const [portalData, setPortalData] = useState<PortalData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedTask, setSelectedTask] = useState<string | null>(null);
	const [showFeedback, setShowFeedback] = useState(false);

	// LIVE TIMER SYSTEM - EXACT SAME AS PROJECT PAGE - MOVE HERE!
	const [displaySeconds, setDisplaySeconds] = useState<number>(0);

	// Comment form state
	const [commentText, setCommentText] = useState("");
	const [clientName, setClientName] = useState("");
	const [clientEmail, setClientEmail] = useState("");
	const [submittingComment, setSubmittingComment] = useState(false);

	// Feedback form state
	const [feedbackRating, setFeedbackRating] = useState(5);
	const [feedbackComment, setFeedbackComment] = useState("");
	const [submittingFeedback, setSubmittingFeedback] = useState(false);

	const refreshData = async () => {
		try {
			const data = await fetchPortalData(token);
			setPortalData(data);
			// Update display seconds after refresh
			setDisplaySeconds(data.project.totalSeconds || 0);
		} catch (err) {
			console.error('Error refreshing data:', err);
		}
	};

	useEffect(() => {
		const loadData = async () => {
			try {
				const data = await fetchPortalData(token);
				setPortalData(data);
				setDisplaySeconds(data.project.totalSeconds || 0);
			} catch (err) {
				setError((err as Error).message);
			} finally {
				setLoading(false);
			}
		};

		loadData();

		// Refresh data every 15 seconds to keep time in sync
		const interval = setInterval(() => {
			if (!loading && portalData) {
				refreshData();
			}
		}, 15000);

		return () => clearInterval(interval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token, loading]);

	// Update displaySeconds when project data changes
	useEffect(() => {
		if (portalData && portalData.project) {
			setDisplaySeconds(portalData.project.totalSeconds || 0);
		}
	}, [portalData]);

	const submitComment = async () => {
		if (!commentText.trim() || !clientName.trim()) {
			toast.error("Please fill in all required fields");
			return;
		}

		setSubmittingComment(true);
		try {
			const response = await fetch(`/api/portal/${token}/comments`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					projectId: portalData!.project.id,
					taskId: selectedTask,
					clientName: clientName.trim(),
					clientEmail: clientEmail.trim() || undefined,
					comment: commentText.trim()
				})
			});

			const result = await response.json();
			if (!result.ok) {
				throw new Error(result.error?.message || 'Failed to submit comment');
			}

			await refreshData();
			setCommentText("");
			setSelectedTask(null);
			toast.success("Comment submitted successfully! The freelancer has been notified.");

		} catch (err) {
			toast.error((err as Error).message);
		} finally {
			setSubmittingComment(false);
		}
	};

	const submitFeedback = async () => {
		if (!clientName.trim()) {
			toast.error("Please enter your name");
			return;
		}

		setSubmittingFeedback(true);
		try {
			const response = await fetch(`/api/portal/${token}/feedback`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					projectId: portalData!.project.id,
					clientName: clientName.trim(),
					clientEmail: clientEmail.trim() || undefined,
					rating: feedbackRating,
					comment: feedbackComment.trim() || undefined
				})
			});

			const result = await response.json();
			if (!result.ok) {
				throw new Error(result.error?.message || 'Failed to submit feedback');
			}

			await refreshData();
			setShowFeedback(false);
			setFeedbackComment("");
			toast.success("Thank you for your feedback! It has been saved and will appear on the freelancer's profile.");

		} catch (err) {
			toast.error((err as Error).message);
		} finally {
			setSubmittingFeedback(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
					<p className="text-slate-600">Loading project portal...</p>
				</div>
			</div>
		);
	}

	if (error || !portalData) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-slate-900 mb-2">Portal Not Found</h1>
					<p className="text-slate-600 mb-4">{error || "The requested portal could not be found."}</p>
				</div>
			</div>
		);
	}

	const { project, comments, feedback, canLeaveFeedback } = portalData;

	// LIVE TIMER SYSTEM - EXACT SAME AS PROJECT PAGE
	// Note: displaySeconds is updated in the main useEffect when data loads

	const hourlyRate = project.price; // USE PROJECT.PRICE AS HOURLY RATE!
	const totalEarnings = hourlyRate > 0 ? (hourlyRate * (displaySeconds / 3600)) : 0;

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "done":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "in-progress":
				return <PlayCircle className="h-4 w-4 text-blue-500" />;
			default:
				return <Circle className="h-4 w-4 text-slate-400" />;
		}
	};

	const getTaskComments = (taskId: string) => {
		return comments.filter(c => c.task_id === taskId);
	};

	const getProjectComments = () => {
		return comments.filter(c => !c.task_id);
	};

	const formatDate = (dateString: string | null | undefined) => {
		if (!dateString) return 'Date unavailable';
		try {
			const date = new Date(dateString);
			if (isNaN(date.getTime())) return 'Date unavailable';
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});
		} catch {
			return 'Date unavailable';
		}
	};



	// Task Timer Component - EXACT SAME AS PROJECT PAGE
	const TaskTimerPortal = ({ task }: { task: Task }) => {
		const [taskDisplaySeconds, setTaskDisplaySeconds] = useState<number>(task.totalSeconds || 0);

		useEffect(() => {
			setTaskDisplaySeconds(task.totalSeconds || 0);
		}, [task.totalSeconds]);

		const taskEarned = hourlyRate > 0 ? (hourlyRate * (taskDisplaySeconds / 3600)) : 0;

		return (
			<div className="text-xs text-slate-500 flex items-center gap-2" aria-live="polite">
				<span className="tabular-nums font-medium">{formatTime(taskDisplaySeconds)}</span>
				<span className="text-slate-400">•</span>
				<span className="tabular-nums font-medium">{usd.format(taskEarned)}</span>
			</div>
		);
	};

	// Project Timer Card - EXACT SAME AS PROJECT PAGE
	const ProjectTimerCardPortal = () => {
		return (
			<div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-center gap-4">
				<div className="flex items-center gap-2">
					<span className="h-2 w-2 rounded-full bg-slate-300" aria-hidden />
					<span className="text-sm font-medium text-slate-900 tabular-nums">
						{formatTime(displaySeconds)}
					</span>
				</div>
				<div className="text-xs text-slate-500">•</div>
				<div className="flex items-center gap-2">
					<span className="text-xs text-slate-500">Earned</span>
					<span className="text-sm font-medium text-slate-900">{usd.format(totalEarnings)}</span>
				</div>
			</div>
		);
	};

	const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

	// Time formatting function EXACTLY like project page
	const formatTime = (seconds: number) => {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const sec = seconds % 60;
		const hh = String(h).padStart(2, "0");
		const mm = String(m).padStart(2, "0");
		const ss = String(sec).padStart(2, "0");
		return `${hh}:${mm}:${ss}`;
	};

	return (
		<div className="min-h-screen bg-white">
			{/* Header Section - Full Width with container */}
			<div className="border-b border-slate-100 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-slate-100 rounded-lg">
								<FileText className="h-6 w-6 text-slate-600" />
							</div>
							<div>
								<h1 className="text-3xl font-semibold text-slate-900">
									{project.name}
								</h1>
								<p className="text-slate-600 mt-1">Project Portal</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content with container */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
				{/* Stats Overview - EXACT SAME AS DASHBOARD */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<div className="bg-white border border-slate-100 rounded-lg p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-slate-600">Completed Tasks</p>
								<p className="text-2xl font-semibold text-slate-900">{project.tasksCompleted}</p>
							</div>
							<div className="p-3 bg-green-100 rounded-lg">
								<CheckCircle className="h-6 w-6 text-green-600" />
							</div>
						</div>
					</div>

					<div className="bg-white border border-slate-100 rounded-lg p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-slate-600">Total Tasks</p>
								<p className="text-2xl font-semibold text-slate-900">{project.totalTasks}</p>
							</div>
							<div className="p-3 bg-blue-100 rounded-lg">
								<Folder className="h-6 w-6 text-blue-600" />
							</div>
						</div>
					</div>

					<div className="bg-white border border-slate-100 rounded-lg p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-slate-600">Total Earnings</p>
								<p className="text-2xl font-semibold text-slate-900">{usd.format(totalEarnings)}</p>
							</div>
							<div className="p-3 bg-green-100 rounded-lg">
								<DollarSign className="h-6 w-6 text-green-600" />
							</div>
						</div>
					</div>

					<div className="bg-white border border-slate-100 rounded-lg p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-slate-600">Time Tracked</p>
								<p className="text-2xl font-semibold text-slate-900">{formatTime(displaySeconds)}</p>
							</div>
							<div className="p-3 bg-purple-100 rounded-lg">
								<Clock className="h-6 w-6 text-purple-600" />
							</div>
						</div>
					</div>
				</div>

				{/* Project Timer Card - EXACT SAME as ProjectTimerCard */}
				<div className="mb-8">
					<ProjectTimerCardPortal />
				</div>

				{/* Tasks & Comments */}
				<div className="grid lg:grid-cols-3 gap-8">
					{/* Left Column - Tasks */}
					<div className="lg:col-span-2 space-y-6">
						{/* Tasks List */}
						<div className="bg-white border border-slate-100 rounded-lg p-6">
							<h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
								<CheckCircle className="h-5 w-5" />
								Project Tasks
							</h3>
							{project.tasks.length > 0 ? (
								<div className="space-y-4">
									{project.tasks.map((task) => {
										const taskComments = getTaskComments(task.id);
										return (
											<div key={task.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
												<div className="flex items-center justify-between mb-2">
													<div className="flex items-center gap-3">
														{getStatusIcon(task.status)}
														<h4 className="font-medium text-slate-900">{task.title}</h4>
													</div>
													{/* Task Timer - EXACT SAME as TaskTimer component */}
													<TaskTimerPortal task={task} />
												</div>
												{task.description && (
													<p className="text-sm text-slate-600 mb-3 ml-7">{task.description}</p>
												)}
												
												{/* Task Comments */}
												{taskComments.length > 0 && (
													<div className="mt-3 pt-3 border-t border-slate-100">
														<h5 className="text-sm font-medium text-slate-700 mb-2">Comments:</h5>
														{taskComments.map((comment) => (
															<div key={comment.id} className="bg-blue-50 border border-slate-100 rounded p-3 mb-2">
																<div className="flex items-center gap-2 mb-1">
																	<User className="h-3 w-3 text-slate-500" />
																	<span className="text-sm font-medium text-slate-700">{comment.client_name}</span>
																	<span className="text-xs text-slate-500">{formatDate(comment.created_at)}</span>
																</div>
																<p className="text-sm text-slate-600">{comment.comment}</p>
															</div>
														))}
													</div>
												)}
											</div>
										);
									})}
								</div>
							) : (
								<p className="text-sm text-slate-600">No tasks yet.</p>
							)}
						</div>

						{/* Project Comments */}
						{getProjectComments().length > 0 && (
							<div className="bg-white border border-slate-100 rounded-lg p-6">
								<h3 className="font-semibold text-slate-900 mb-4">Project Comments</h3>
								<div className="space-y-4">
									{getProjectComments().map((comment) => (
										<div key={comment.id} className="bg-green-50 border border-slate-200 rounded-lg p-4">
											<div className="flex items-center gap-2 mb-2">
												<User className="h-4 w-4 text-slate-500" />
												<span className="font-medium text-slate-900">{comment.client_name}</span>
												<span className="text-xs text-slate-500">{formatDate(comment.created_at)}</span>
											</div>
											<p className="text-slate-700">{comment.comment}</p>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Add Comment */}
						<div className="bg-white border border-slate-100 rounded-lg p-6">
							<h3 className="font-semibold text-slate-900 mb-4">Leave a Comment</h3>
							<div className="space-y-4">
								<div className="grid md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-2">Your Name *</label>
										<input
											type="text"
											value={clientName}
											onChange={(e) => setClientName(e.target.value)}
											className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
											placeholder="Enter your name"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-2">Email (optional)</label>
										<input
											type="email"
											value={clientEmail}
											onChange={(e) => setClientEmail(e.target.value)}
											className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
											placeholder="your@email.com"
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 mb-2">Comment on specific task (optional)</label>
									<select
										value={selectedTask || ""}
										onChange={(e) => setSelectedTask(e.target.value || null)}
										className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
									>
										<option value="">General project comment</option>
										{project.tasks.map((task) => (
											<option key={task.id} value={task.id}>{task.title}</option>
										))}
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 mb-2">Comment *</label>
									<textarea
										value={commentText}
										onChange={(e) => setCommentText(e.target.value)}
										rows={4}
										className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
										placeholder="Share your feedback, suggestions, or questions..."
									/>
								</div>

								<Button
									onClick={submitComment}
									disabled={submittingComment || !commentText.trim() || !clientName.trim()}
									className="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors"
								>
									{submittingComment ? "Submitting..." : (
										<>
											<Send className="h-4 w-4 mr-2" />
											Submit Comment
										</>
									)}
								</Button>
							</div>
						</div>
					</div>

					{/* Right Column - Sidebar */}
					<div className="space-y-6">
						{/* Project Info */}
						<div className="bg-white border border-slate-100 rounded-lg p-6">
							<h3 className="font-semibold text-slate-900 mb-4">Project Information</h3>
							<div className="space-y-3">
								<div className="flex justify-between text-sm">
									<span className="text-slate-600">Status</span>
									<span className="font-medium text-slate-900 capitalize">{project.status}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-slate-600">Progress</span>
									<span className="font-medium text-slate-900">{project.progress}%</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-slate-600">Started</span>
									<span className="font-medium text-slate-900">{formatDate(project.created_at)}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-slate-600">Hourly Rate</span>
									<span className="font-medium text-slate-900">{usd.format(hourlyRate)}/hr</span>
								</div>
							</div>
						</div>

						{/* Feedback Section */}
						{canLeaveFeedback && project.status === 'completed' && (
							<div className="bg-white border border-slate-100 rounded-lg p-6">
								<h3 className="font-semibold text-slate-900 mb-4">Project Feedback</h3>
								{!showFeedback && (
									<Button 
										onClick={() => setShowFeedback(true)}
										className="w-full px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors"
									>
										<Star className="h-4 w-4 mr-2" />
										Leave Feedback
									</Button>
								)}

								{showFeedback && (
									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-2">Rating *</label>
											<div className="flex gap-1">
												{[1, 2, 3, 4, 5].map((rating) => (
													<button
														key={rating}
														onClick={() => setFeedbackRating(rating)}
														className={`p-1 rounded transition-colors ${rating <= feedbackRating ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'}`}
													>
														<Star className="h-5 w-5 fill-current" />
													</button>
												))}
											</div>
										</div>

										<div>
											<label className="block text-sm font-medium text-slate-700 mb-2">Comments (optional)</label>
											<textarea
												value={feedbackComment}
												onChange={(e) => setFeedbackComment(e.target.value)}
												rows={3}
												className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm"
												placeholder="Tell us about your experience..."
											/>
										</div>

										<div className="flex gap-2">
											<Button
												onClick={submitFeedback}
												disabled={submittingFeedback || !clientName.trim()}
												className="px-3 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors text-sm"
											>
												{submittingFeedback ? "Submitting..." : "Submit"}
											</Button>
											<Button
												onClick={() => setShowFeedback(false)}
												disabled={submittingFeedback}
												className="px-3 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors text-sm"
											>
												Cancel
											</Button>
										</div>
									</div>
								)}
							</div>
						)}
						
						{/* Existing Feedback */}
						{feedback && (
							<div className="bg-white border border-slate-100 rounded-lg p-6">
								<h3 className="font-semibold text-slate-900 mb-4">Your Feedback</h3>
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<span className="font-medium text-slate-900">{feedback.client_name}</span>
										<div className="flex items-center">
											{Array.from({ length: 5 }).map((_, i) => (
												<Star
													key={i}
													className={`h-3 w-3 ${
														i < feedback.rating
															? 'text-amber-400 fill-amber-400'
															: 'text-slate-300'
													}`}
												/>
											))}
										</div>
									</div>
									<p className="text-xs text-slate-500">{formatDate(feedback.created_at)}</p>
									{feedback.comment && (
										<p className="text-sm text-slate-700">{feedback.comment}</p>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}