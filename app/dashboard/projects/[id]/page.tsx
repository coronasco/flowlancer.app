"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/contexts/SessionContext";

import { toast } from "sonner";
import { Pencil, Trash2, Check, X, ChevronLeft, ChevronRight, Play, Square, Plus } from "lucide-react";

import { ClientPortalModal } from "@/components/projects/ClientPortalModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { db } from "@/lib/auth/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useTimerStore, useTimerCleanup } from "@/hooks/useTimerStore";

const columns = ["Backlog", "In Progress", "Done"] as const;
type Column = typeof columns[number];

type Task = { id: string; title: string; status: Column; description?: string; estimateHours?: number; billedInInvoiceId?: string };

type Ok<T> = { ok: true; data: T };
type Err = { ok: false; error: { message?: string } };
type ApiEnvelope<T> = Ok<T> | Err;

type Project = { 
	id: string; 
	name: string; 
	description?: string;
	price_type?: 'hourly' | 'fixed';
	price?: number;
	deadline?: string;
	status?: 'planning' | 'in-progress' | 'completed';
	created_at?: string;
	user_email?: string;
};

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

export default function ProjectPage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const { user } = useSession();
	const qc = useQueryClient();
	const [draggingId, setDraggingId] = useState<string | null>(null);
	const [overColumn, setOverColumn] = useState<Column | null>(null);
	const [isEditingProject, setIsEditingProject] = useState(false);
	const [projectName, setProjectName] = useState("");
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [editTaskData, setEditTaskData] = useState({
		title: "",
		description: "",
		estimateHours: "" as number | "",
		tags: [] as string[]
	});
	const [openActionsId, setOpenActionsId] = useState<string | null>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

	// Timer cleanup on unmount
	useTimerCleanup();

	const [creatingInvoice, setCreatingInvoice] = useState(false);
	const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
	const [invoiceData, setInvoiceData] = useState({
		clientName: "",
		clientEmail: "",
		clientAddress: "",
		dueDate: "",
	});
	
	const [userProfile, setUserProfile] = useState<{
		name?: string;
		businessName?: string;
		businessEmail?: string;
		businessAddress?: string;
		address?: string;
	} | null>(null);

	// Load user profile when modal opens
	useEffect(() => {
		if (openInvoiceModal && user?.uid && !userProfile) {
			const loadUserProfile = async () => {
				try {
					const profileDoc = await getDoc(doc(db, "customers", user.uid));
					if (profileDoc.exists()) {
						setUserProfile(profileDoc.data());
					}
				} catch (error) {
					console.error("Failed to load user profile:", error);
				}
			};
			loadUserProfile();
		}
	}, [openInvoiceModal, user?.uid, userProfile]);
	const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

	// Project
	const { data: project } = useQuery<Project | null>({
		queryKey: ["project", id, user?.uid],
		queryFn: async () => {
			const d = await api<{ project: Project | null }>(`/api/projects/${id}`, undefined, user || undefined);
			return d.project;
		},
		enabled: !!id && !!user,
	});

	// Use project.price as hourly rate - SAME AS PORTAL!
	const hourlyRate = project?.price || 0;

	// Sync project name into local state after query resolves
	useEffect(() => {
		setProjectName(project?.name ?? "");
	}, [project]);

	// Tasks
	const { data: tasks = [] } = useQuery<Task[]>({
		queryKey: ["tasks", id, user?.uid],
		queryFn: () => api<{ tasks: Task[] }>(`/api/projects/${id}/tasks`, undefined, user || undefined).then((d) => d.tasks),
		enabled: !!id && !!user,
	});

	const { mutate: createTask } = useMutation({
		mutationFn: (payload: { title: string; description?: string; status?: Column; estimateHours?: number }) =>
			api<{ task: Task }>(`/api/projects/${id}/tasks`, { method: "POST", body: JSON.stringify({
				title: payload.title,
				description: payload.description,
				status: payload.status || "Backlog",
				estimateHours: payload.estimateHours,
			}) }, user || undefined).then((d) => d.task),
		onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks", id, user?.uid] }); toast.success("Task added"); },
		onError: (e: unknown) => toast.error((e as Error).message || "Failed to add"),
	});

	const { mutate: moveTask } = useMutation({
		mutationFn: ({ taskId, status }: { taskId: string; status: Column }) => api<{ task: Task }>(`/api/projects/${id}/tasks/status`, { method: "PATCH", body: JSON.stringify({ taskId, status }) }, user || undefined).then((d) => d.task),
		onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks", id, user?.uid] }); toast.success("Task moved"); },
		onError: (e: unknown) => toast.error((e as Error).message || "Failed to move"),
	});

	const { mutate: updateTask } = useMutation({
		mutationFn: (taskData: { taskId: string; title: string; description?: string; estimateHours?: number }) => 
			api<{ task: Task }>(`/api/projects/${id}/tasks`, { method: "PATCH", body: JSON.stringify(taskData) }, user || undefined),
		onSuccess: () => { 
			qc.invalidateQueries({ queryKey: ["tasks", id, user?.uid] }); 
			toast.success("Task updated"); 
			setEditingTask(null); 
		},
		onError: (e: unknown) => toast.error((e as Error).message || "Failed to update task"),
	});

	const { mutate: deleteTaskMut } = useMutation({
		mutationFn: (taskId: string) => api(`/api/projects/${id}/tasks/title`, { method: "DELETE", body: JSON.stringify({ taskId }) }, user || undefined),
		onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks", id, user?.uid] }); toast.success("Task deleted"); },
		onError: (e: unknown) => toast.error((e as Error).message || "Failed to delete"),
	});

	const { mutate: updateProjectMut } = useMutation({
		mutationFn: (name: string) => api<{ project: Project }>(`/api/projects/${id}`, { 
			method: "PATCH", 
			body: JSON.stringify({ name }) 
		}, user || undefined),
		onSuccess: (response) => { 
			qc.invalidateQueries({ queryKey: ["project", id, user?.uid] }); 
			toast.success("Project updated"); 
			setIsEditingProject(false); 
			if (response && response.project) {
				setProjectName(response.project.name);
			}
		},
		onError: (e: unknown) => toast.error((e as Error).message || "Failed to update"),
	});

	const { mutate: deleteProjectMut } = useMutation({
		mutationFn: () => api(`/api/projects/${id}`, { method: "DELETE" }, user || undefined),
		onSuccess: () => { toast.success("Project deleted"); router.replace("/dashboard/projects"); },
		onError: (e: unknown) => toast.error((e as Error).message || "Failed to delete"),
	});

	// Timer logic is now handled in TaskActionButtons component

	const counts = useMemo(() => {
		const m = new Map<Column, number>();
		columns.forEach((c) => m.set(c, 0));
		tasks.forEach((t) => m.set(t.status, (m.get(t.status) || 0) + 1));
		return m;
	}, [tasks]);

	// Timer store is used in components below

	// Cleanup on unmount is handled by TimerProvider

	function moveLeft(status: Column): Column { const idx = columns.indexOf(status); return idx > 0 ? columns[idx - 1] : status; }
	function moveRight(status: Column): Column { const idx = columns.indexOf(status); return idx < columns.length - 1 ? columns[idx + 1] : status; }

	function extractTags(desc?: string): string[] {
		if (!desc) return [];
		const firstLine = desc.split("\n", 1)[0] || "";
		const m = firstLine.match(/^tags:\s*([^\n]+)/i);
		if (m) return m[1].split(",").map((s) => s.trim()).filter(Boolean).slice(0, 6);
		return [];
	}

	return (
		<>
		<div className="min-h-screen bg-white">
			{/* Header Section - Full Width */}
			<div className="border-b border-slate-100 bg-white">
				<div className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
					{/* Back Navigation */}
					<Link href="/dashboard/projects" className="inline-flex items-center text-xs sm:text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4 sm:mb-6">
						<ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
						Back to projects
					</Link>
					
					{/* Main Header Content */}
					<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
						{/* Left: Project Title & Actions */}
						<div className="flex items-center gap-4">
							{isEditingProject ? (
								<div className="flex-1">
									<div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
										<div className="space-y-3">
											<div>
												<label className="block text-sm font-medium text-slate-700 mb-2">Project Name</label>
												<input 
													value={projectName} 
													onChange={(e) => setProjectName(e.target.value)} 
													className="w-full px-3 py-2 text-lg font-semibold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all duration-200"
													autoFocus
													placeholder="Enter project name"
												/>
											</div>
											<div className="flex items-center gap-2">
												<button 
													onClick={() => projectName.trim() && updateProjectMut(projectName.trim())}
													disabled={!projectName.trim()}
													className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed rounded-lg transition-all duration-200 shadow-sm"
												>
													<Check className="h-4 w-4" />
													Save Changes
												</button>
												<button 
													onClick={() => { setIsEditingProject(false); setProjectName(project?.name ?? ""); }}
													className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm"
												>
													<X className="h-4 w-4" />
													Cancel
												</button>
											</div>
										</div>
									</div>
								</div>
							) : (
								<div className="flex flex-col sm:flex-row sm:items-start justify-between w-full">
									<div className="flex-1 mb-3 sm:mb-0">
										<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2">{project?.name ?? "Project"}</h1>
										{project?.description && (
											<p className="text-slate-600 text-sm sm:text-base">{project.description}</p>
										)}
									</div>
									<div className="flex items-center gap-2 sm:ml-4">
										<button 
											onClick={() => setIsEditingProject(true)}
											className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm"
											title="Edit Project"
										>
											<Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
											<span className="hidden sm:inline">Edit</span>
										</button>
																			{!showDeleteConfirm ? (
										<button
											onClick={() => setShowDeleteConfirm(true)}
											className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 hover:border-red-400 transition-all duration-200 shadow-sm"
											title="Delete Project"
										>
											<Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
											<span className="hidden sm:inline">Delete</span>
										</button>
									) : (
										<div className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-lg">
											<span className="text-red-800">Are you sure?</span>
											<button
												onClick={() => {
													deleteProjectMut();
													setShowDeleteConfirm(false);
												}}
												className="px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
											>
												Yes
											</button>
											<button
												onClick={() => setShowDeleteConfirm(false)}
												className="px-2 py-1 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-300 rounded transition-colors"
											>
												No
											</button>
										</div>
									)}
									</div>
								</div>
							)}
						</div>

						{/* Right: Timer, Actions */}
						<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 sm:divide-x sm:divide-slate-200 w-full lg:w-auto">
							{/* Timer Section */}
							<div className="sm:pr-4 lg:pr-6 w-full sm:w-auto">
								<ProjectTimerCard projectId={id} user={user || undefined} hourlyRate={hourlyRate} />
							</div>

							{/* Actions Section */}
							<div className="sm:pl-4 lg:pl-6 flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
								<ClientPortalModal projectId={id} />
								
								<div className="hidden sm:block h-6 w-px bg-slate-200"></div>
								
								<AddTaskInline onAdd={(payload) => createTask(payload)} />
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="py-6 sm:py-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-start">
					{columns.map((col) => (
						<div 
							key={col} 
							className={`bg-slate-50/50 border border-slate-100 rounded-lg p-4 transition-all ${overColumn === col ? "ring-2 ring-slate-900 bg-slate-50" : ""}`}
							onDragEnter={() => setOverColumn(col)}
							onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
							onDragLeave={() => setOverColumn((prev) => (prev === col ? null : prev))}
							onDrop={(e) => { e.preventDefault(); const droppedId = draggingId || e.dataTransfer.getData("text/plain"); setOverColumn(null); setDraggingId(null); if (droppedId) moveTask({ taskId: droppedId, status: col }); }}
						>
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-sm font-medium text-slate-900">{col}</h3>
								<div className="flex items-center gap-2">
									<span className="bg-slate-900 text-white px-2 py-1 rounded-md text-xs font-medium">
										{counts.get(col) || 0}
									</span>
									{col === "Done" && (
										<button
											onClick={() => setOpenInvoiceModal(true)}
											className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-md text-xs font-medium transition-colors"
											title="Generate Invoice"
										>
											Invoice
										</button>
									)}
								</div>
							</div>
							<div className="space-y-3">
								{tasks.filter((t) => t.status === col).map((t) => (
									<div 
										key={t.id} 
										className={`bg-white border border-slate-100 rounded-lg p-4 transition-all group relative cursor-move ${draggingId === t.id ? "opacity-50" : "hover:shadow-md hover:border-slate-200"}`} 
										draggable 
										onDragStart={(ev) => { setDraggingId(t.id); ev.dataTransfer.setData("text/plain", t.id); ev.dataTransfer.effectAllowed = "move"; }} 
										onDragEnd={() => setDraggingId(null)}
									>
										<div className="space-y-3">
											{/* Tags from extractTags function */}
											{extractTags(t.description).length > 0 && (
												<div className="flex flex-wrap gap-1">
													{extractTags(t.description).map((tag) => (
														<span key={tag} className="px-2 py-1 rounded-md text-xs bg-slate-100 text-slate-600 font-medium">
															{tag}
														</span>
													))}
												</div>
											)}
											
											<div className="relative">
													<div className="pr-12">
														<div className="flex items-center gap-2 mb-1">
															<h4 className="text-sm font-medium text-slate-900 leading-5">{t.title}</h4>
															{t.billedInInvoiceId && (
																<span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
																	<span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
																	Billed
																</span>
															)}
														</div>
													</div>
													
													{/* Hover Actions */}
													<div className="absolute top-0 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
														<button 
															onClick={() => setOpenActionsId((prev) => prev === t.id ? null : t.id)}
															className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
															title="More actions"
														>
															<Pencil className="h-3 w-3" />
														</button>
														<button 
															onClick={() => moveTask({ taskId: t.id, status: moveLeft(col) })}
															className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
															title="Move left"
														>
															<ChevronLeft className="h-3 w-3" />
														</button>
														<button 
															onClick={() => moveTask({ taskId: t.id, status: moveRight(col) })}
															className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
															title="Move right"
														>
															<ChevronRight className="h-3 w-3" />
														</button>
													</div>
													
													{/* Actions Menu */}
													{openActionsId === t.id && (
														<div className="absolute top-6 right-0 flex gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-lg z-10">
															<button 
																onClick={() => { 
																	setEditingTask(t);
																	const tags = extractTags(t.description);
																	const description = t.description ? t.description.replace(/^tags:[^\n]*\n?/i, '').trim() : '';
																	setEditTaskData({
																		title: t.title,
																		description,
																		estimateHours: t.estimateHours || "",
																		tags
																	});
																	setOpenActionsId(null); 
																}}
																className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
																title="Edit task"
															>
																<Pencil className="h-3 w-3" />
															</button>
															{taskToDelete !== t.id ? (
																<button 
																	onClick={() => setTaskToDelete(t.id)}
																	className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
																	title="Delete task"
																>
																	<Trash2 className="h-3 w-3" />
																</button>
															) : (
																<div className="flex items-center gap-1">
																	<span className="text-xs text-red-700 whitespace-nowrap">Sure?</span>
																	<button 
																		onClick={() => {
																			deleteTaskMut(t.id);
																			setTaskToDelete(null);
																			setOpenActionsId(null);
																		}}
																		className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
																	>
																		Yes
																	</button>
																	<button 
																		onClick={() => setTaskToDelete(null)}
																		className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition-colors"
																	>
																		No
																	</button>
																</div>
															)}
														</div>
													)}
												</div>
												
												{/* Description */}
												{t.description && (
													<p className="text-xs text-slate-600 leading-relaxed">
														{t.description.replace(/^tags:[^\n]+\n?/i, "").trim()}
													</p>
												)}
												
												{/* Bottom Section */}
												<div className="pt-3 border-t border-slate-100">
													<div className="flex items-center justify-between">
														<TaskActionButtons taskId={t.id} />
														<TaskTimer taskId={t.id} user={user || undefined} hourlyRate={hourlyRate} usd2={usd2} />
													</div>
												</div>
											</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
		


		{/* Create Invoice Modal */}
		<Dialog open={openInvoiceModal} onOpenChange={setOpenInvoiceModal}>
			<DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create Invoice from Project</DialogTitle>
				</DialogHeader>

					{/* Done Tasks Preview */}
					<div className="mb-6 p-4 bg-slate-50 rounded-lg">
						<h4 className="font-medium text-slate-900 mb-3">Tasks to be included in invoice:</h4>
						{(() => {
							const doneTasks = tasks.filter(task => task.status === "Done");
							const unbilledDoneTasks = doneTasks.filter(task => !task.billedInInvoiceId);
							const billedDoneTasks = doneTasks.filter(task => task.billedInInvoiceId);
							
							if (unbilledDoneTasks.length === 0 && billedDoneTasks.length === 0) {
								return (
									<div className="text-sm text-slate-500 italic">
										No completed tasks found. You need to move tasks to &quot;Done&quot; column before creating an invoice.
									</div>
								);
							}

							return (
								<div className="space-y-4">
									{/* Unbilled Tasks */}
									{unbilledDoneTasks.length > 0 && (
										<div>
											<div className="text-sm font-medium text-slate-700 mb-2">Tasks to be billed:</div>
											<div className="space-y-2">
												{unbilledDoneTasks.map((task) => (
													<div key={task.id} className="flex items-center justify-between py-2 px-3 bg-white rounded border border-green-200">
														<div>
															<div className="font-medium text-sm text-slate-900">{task.title}</div>
															{task.description && (
																<div className="text-xs text-slate-600 mt-1">{task.description}</div>
															)}
														</div>
														<div className="text-sm text-slate-600">
															{task.estimateHours ? `${task.estimateHours}h estimated` : 'No estimate'}
														</div>
													</div>
												))}
												<div className="text-sm text-slate-600 mt-2">
													Total: {unbilledDoneTasks.length} task(s) &bull; 
													Estimated hours: {unbilledDoneTasks.reduce((sum, task) => sum + (task.estimateHours || 0), 0)}h
												</div>
											</div>
										</div>
									)}

									{/* Already Billed Tasks */}
									{billedDoneTasks.length > 0 && (
										<div>
											<div className="text-sm font-medium text-slate-700 mb-2">Already billed tasks (excluded):</div>
											<div className="space-y-2">
												{billedDoneTasks.map((task) => (
													<div key={task.id} className="flex items-center justify-between py-2 px-3 bg-slate-100 rounded border border-slate-200 opacity-60">
														<div>
															<div className="font-medium text-sm text-slate-500">{task.title}</div>
															{task.description && (
																<div className="text-xs text-slate-400 mt-1">{task.description}</div>
															)}
														</div>
														<div className="text-xs text-slate-400">
															Already billed
														</div>
													</div>
												))}
											</div>
										</div>
									)}

									{unbilledDoneTasks.length === 0 && billedDoneTasks.length > 0 && (
										<div className="text-sm text-amber-600 italic bg-amber-50 p-3 rounded border border-amber-200">
											All completed tasks have already been billed. Complete more tasks to create a new invoice.
										</div>
									)}
								</div>
							);
						})()}
					</div>

					<form onSubmit={async (e) => {
						e.preventDefault();
						try {
							setCreatingInvoice(true);
							
							// Check if there are unbilled Done tasks
							const doneTasks = tasks.filter(task => task.status === "Done");
							const unbilledDoneTasks = doneTasks.filter(task => !task.billedInInvoiceId);
							if (unbilledDoneTasks.length === 0) {
								if (doneTasks.length === 0) {
									toast.error("No completed tasks to invoice. Please move tasks to 'Done' column first.");
								} else {
									toast.error("All completed tasks have already been billed. Please complete more tasks to create a new invoice.");
								}
								return;
							}

							const headers: Record<string, string> = { "Content-Type": "application/json" };
							if (user) {
								try {
									const token = await user.getIdToken();
									headers["Authorization"] = `Bearer ${token}`;
								} catch (error) {
									console.error("Failed to get Firebase token:", error);
								}
							}

							const payload = {
								projectId: id,
								hourlyRate: project?.price || 0, // Use project price as hourly rate
								...invoiceData,
								// Business data from user profile
								businessName: userProfile?.name || userProfile?.businessName || "Your Business",
								businessEmail: user?.email || userProfile?.businessEmail || "",
								businessAddress: userProfile?.businessAddress || userProfile?.address || "",
							};

							const res = await fetch(`/api/invoices/from-project`, { 
								method: "POST", 
								headers, 
								body: JSON.stringify(payload) 
							});
							const json = await res.json();
							
							if (!json.ok) throw new Error(json.error?.message || "Failed to create invoice");
							
							toast.success("Invoice created successfully!");
							setOpenInvoiceModal(false);
							
							// Invalidate queries to refresh data
							qc.invalidateQueries({ queryKey: ["invoices"] });
							qc.invalidateQueries({ queryKey: ["tasks", id, user?.uid] });
							
							if (json.data?.invoice?.id) {
								window.location.href = `/dashboard/invoices/${json.data.invoice.id}`;
							}
						} catch (e) {
							toast.error((e as Error).message || "Failed to create invoice");
						} finally {
							setCreatingInvoice(false);
						}
					}}>
						<div className="grid md:grid-cols-2 gap-6">
							{/* Left Column - Client Info */}
							<div className="space-y-4">
								{/* Client Information */}
							<div>
								<h4 className="font-medium text-slate-900 mb-3">Client Information</h4>
								<div className="grid md:grid-cols-2 gap-3">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">Client Name *</label>
										<input
											type="text"
											required
											value={invoiceData.clientName}
											onChange={(e) => setInvoiceData({...invoiceData, clientName: e.target.value})}
											className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
											placeholder="Enter client name"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">Client Email *</label>
										<input
											type="email"
											required
											value={invoiceData.clientEmail}
											onChange={(e) => setInvoiceData({...invoiceData, clientEmail: e.target.value})}
											className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
											placeholder="client@example.com"
										/>
									</div>
								</div>
							</div>

							{/* Business Information Preview */}
							<div>
								<h4 className="font-medium text-slate-900 mb-3">Your Business Information</h4>
								<div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
									{userProfile ? (
										<div className="space-y-3 text-sm">
											<div>
												<span className="font-medium text-slate-700">Business Name:</span>
												<div className="text-slate-900">{userProfile?.name || userProfile?.businessName || "Not set"}</div>
											</div>
											<div>
												<span className="font-medium text-slate-700">Email:</span>
												<div className="text-slate-900">{user?.email || userProfile?.businessEmail || "Not set"}</div>
											</div>
											<div>
												<span className="font-medium text-slate-700">Address:</span>
												<div className="text-slate-900">{userProfile?.businessAddress || userProfile?.address || "Not set"}</div>
											</div>
										</div>
									) : (
										<div className="text-sm text-slate-500">Loading business information...</div>
									)}
									<div className="mt-3 pt-3 border-t border-slate-200">
										<p className="text-xs text-slate-500">
											This information is automatically taken from your profile. 
											<br />
											<a href="/dashboard/profile" className="text-blue-600 hover:text-blue-700">Update in Profile →</a>
										</p>
									</div>
								</div>
							</div>

							{/* Invoice Details */}
							<div>
								<h4 className="font-medium text-slate-900 mb-3">Invoice Details</h4>
								<div className="grid md:grid-cols-2 gap-3">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">Hourly Rate * (from project)</label>
										<input
											type="number"
											step="0.01"
											min="0"
											required
											value={project?.price || 0}
											disabled
											className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 text-sm cursor-not-allowed"
											placeholder="0.00"
										/>
										<p className="text-xs text-slate-500 mt-1">This rate is taken from the project settings and cannot be changed here.</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
										<input
											type="date"
											value={invoiceData.dueDate}
											onChange={(e) => setInvoiceData({...invoiceData, dueDate: e.target.value})}
											className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
										/>
									</div>
								</div>
							</div>
							</div>
						</div>

						<div className="flex items-center justify-end gap-3 mt-6">
							<button
								type="button"
								onClick={() => setOpenInvoiceModal(false)}
								className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={creatingInvoice}
								className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 text-sm"
							>
								{creatingInvoice ? "Creating..." : "Create Invoice"}
							</button>
						</div>
					</form>
			</DialogContent>
		</Dialog>
		
		{/* Edit Task Modal */}
		<Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
			<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Task</DialogTitle>
				</DialogHeader>
					
					<div className="space-y-4">
						<div className="space-y-1">
							<label className="text-sm font-medium text-slate-700">Title</label>
							<input 
								value={editTaskData.title} 
								onChange={(e) => setEditTaskData(prev => ({ ...prev, title: e.target.value }))} 
								className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm" 
								placeholder="Enter task title"
							/>
						</div>
						
						<div className="space-y-1">
							<label className="text-sm font-medium text-slate-700">Description</label>
							<textarea 
								value={editTaskData.description} 
								onChange={(e) => setEditTaskData(prev => ({ ...prev, description: e.target.value }))} 
								className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm min-h-20" 
								placeholder="Enter task description (optional)"
							/>
						</div>
						
						<div className="space-y-1">
							<label className="text-sm font-medium text-slate-700">Tags</label>
							<div className="flex flex-wrap gap-2">
								{["Internal", "Marketing", "Urgent"].map((tag) => {
									const active = editTaskData.tags.includes(tag.toLowerCase());
									return (
										<button 
											key={tag} 
											type="button" 
											onClick={() => setEditTaskData(prev => ({
												...prev,
												tags: active 
													? prev.tags.filter((t: string) => t !== tag.toLowerCase())
													: [...prev.tags, tag.toLowerCase()]
											}))} 
											className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
												active 
													? "bg-slate-900 text-white border-slate-900" 
													: "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
											}`}
										>
											{tag}
										</button>
									);
								})}
							</div>
						</div>
						
						<div className="space-y-1">
							<label className="text-sm font-medium text-slate-700">Estimate (hours)</label>
							<input 
								type="number" 
								min={0} 
								step={0.5}
								value={editTaskData.estimateHours} 
								onChange={(e) => setEditTaskData(prev => ({ ...prev, estimateHours: e.target.value === "" ? "" : Number(e.target.value) }))} 
								className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm" 
								placeholder="0"
							/>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="mt-6 flex justify-end gap-3">
						<button
							onClick={() => setEditingTask(null)}
							className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm"
						>
							Cancel
						</button>
						<button 
							onClick={() => {
								const tagsLine = editTaskData.tags.length > 0 ? `tags:${editTaskData.tags.join(",")}\n` : "";
								const fullDescription = tagsLine + (editTaskData.description.trim() || "");
								
								if (editingTask) {
									updateTask({
										taskId: editingTask.id,
										title: editTaskData.title.trim(),
										description: fullDescription || undefined,
										estimateHours: typeof editTaskData.estimateHours === "number" ? editTaskData.estimateHours : undefined
									});
								}
							}}
							disabled={!editTaskData.title.trim()}
							className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors text-sm"
						>
							Update Task
						</button>
					</div>
			</DialogContent>
		</Dialog>
		</>
	);
}

function ProjectTimerCard({ projectId, user, hourlyRate }: { projectId: string; user?: { getIdToken: () => Promise<string>; uid: string }; hourlyRate: number }) {
	const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

	// Get timer state from Zustand store
	const runningTaskId = useTimerStore((state) => state.runningTaskId);
	const currentSeconds = useTimerStore((state) => state.currentSeconds);

	// Get project time data (without polling)
	const { data } = useQuery<{ totalSeconds: number; running: boolean; runningStartedAt?: number }>({
		queryKey: ["project-time", projectId, user?.uid],
		queryFn: () => api<{ summary: { totalSeconds: number; running: boolean; runningStartedAt?: number } }>(`/api/time-entries?projectId=${projectId}`, undefined, user || undefined).then((d) => d.summary),
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 30_000,
		enabled: !!projectId && !!user,
	});

	// Calculate display seconds based on local timer or server data
	const baseSeconds = data?.totalSeconds || 0;
	const displaySeconds = runningTaskId ? (baseSeconds + currentSeconds) : baseSeconds;
	const isRunning = runningTaskId !== null;

	function fmt(s: number) {
		const h = Math.floor(s / 3600);
		const m = Math.floor((s % 3600) / 60);
		const sec = s % 60;
		return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
	}
	const earned = hourlyRate > 0 ? (hourlyRate * (displaySeconds / 3600)) : 0;
	return (
		<div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-center gap-4">
			<div className="flex items-center gap-3">
				{isRunning ? (
					<div className="flex items-center gap-2">
						<span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" aria-hidden />
						<span className="text-xs font-medium text-red-600 uppercase tracking-wider">REC</span>
					</div>
				) : (
					<span className="h-2 w-2 rounded-full bg-slate-300" aria-hidden />
				)}
				<span className="text-sm font-medium text-slate-900 tabular-nums" aria-live="polite" title={isRunning ? "Timer running" : "Paused"}>
					{fmt(displaySeconds)}
				</span>
			</div>
			<div className="text-xs text-slate-500">•</div>
			<div className="flex items-center gap-2">
				<span className="text-xs text-slate-500">Earned</span>
				<span className="text-sm font-medium text-slate-900">{usd2.format(earned)}</span>
			</div>
		</div>
	);
}

function TaskTimer({ taskId, user, hourlyRate, usd2 }: { taskId: string; user?: { getIdToken: () => Promise<string>; uid: string }; hourlyRate: number; usd2: Intl.NumberFormat }) {
	// Get timer state from Zustand store
	const runningTaskId = useTimerStore((state) => state.runningTaskId);
	const currentSeconds = useTimerStore((state) => state.currentSeconds);

	// Get task time data (without polling)
	const { data } = useQuery<{ totalSeconds: number; running: boolean; runningStartedAt?: number }>({
		queryKey: ["time-summary", taskId, user?.uid],
		queryFn: () => api<{ summary: { totalSeconds: number; running: boolean; runningStartedAt?: number } }>(`/api/time-entries?taskId=${taskId}`, undefined, user || undefined).then((d) => d.summary),
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		staleTime: 30_000,
		enabled: !!taskId && !!user,
	});

	// Calculate display seconds based on local timer or server data
	const baseSeconds = data?.totalSeconds || 0;
	const displaySeconds = runningTaskId === taskId ? (baseSeconds + currentSeconds) : baseSeconds;
	const isTaskRunning = runningTaskId === taskId;

	function fmt(s: number) {
		const h = Math.floor(s / 3600);
		const m = Math.floor((s % 3600) / 60);
		const sec = s % 60;
		const hh = String(h).padStart(2, "0");
		const mm = String(m).padStart(2, "0");
		const ss = String(sec).padStart(2, "0");
		return `${hh}:${mm}:${ss}`;
	}
	const earned = hourlyRate > 0 ? (hourlyRate * (displaySeconds / 3600)) : 0;
	return (
		<div className="text-xs text-slate-500 flex items-center gap-2" aria-live="polite">
			{isTaskRunning ? (
				<div className="flex items-center gap-2" title="Timer running">
					<div className="flex items-center gap-1">
						<span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" aria-hidden />
						<span className="text-xs font-medium text-red-600 uppercase tracking-wider">REC</span>
					</div>
					<span className="tabular-nums font-medium text-slate-700">{fmt(displaySeconds)}</span>
				</div>
			) : (
				<span className="tabular-nums font-medium">{fmt(displaySeconds)}</span>
			)}
			<span className="text-slate-400">•</span>
			<span className="tabular-nums font-medium">{usd2.format(earned)}</span>
		</div>
	);
}

function AddTaskInline({ onAdd }: { onAdd: (data: { title: string; description?: string; status?: Column; estimateHours?: number }) => void }) {
	const [open, setOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<"manual" | "ai">("manual");
	
	// Manual task states
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [status, setStatus] = useState<Column>("Backlog");
	const [estimate, setEstimate] = useState<number | "">("");
	const availableTags: string[] = ["Internal", "Marketing", "Urgent"];
	const [tags, setTags] = useState<string[]>([]);
	
	// AI task states
	const [aiDescription, setAiDescription] = useState("");
	const [generatedTasks, setGeneratedTasks] = useState<Array<{title: string; description: string; estimateHours: number}>>([]);
	const [isGenerating, setIsGenerating] = useState(false);
	const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
	
	// Generate AI tasks function
	const generateAITasks = async () => {
		if (!aiDescription.trim()) return;
		setIsGenerating(true);
		try {
			const response = await fetch('/api/tasks/ai/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ description: aiDescription })
			});
			const result = await response.json();
			if (result.ok) {
				setGeneratedTasks(result.data.tasks);
				setSelectedTasks(new Set(result.data.tasks.map((_: unknown, i: number) => i))); // Select all by default
			} else {
				throw new Error(result.error?.message || 'Failed to generate tasks');
			}
		} catch (error) {
			console.error('Error generating tasks:', error);
			// Fallback to mock data for now
			const mockTasks = [
				{ title: "Research and analysis", description: "Conduct initial research based on requirements", estimateHours: 2 },
				{ title: "Implementation", description: "Build the main functionality", estimateHours: 8 },
				{ title: "Testing and refinement", description: "Test the implementation and make improvements", estimateHours: 3 }
			];
			setGeneratedTasks(mockTasks);
			setSelectedTasks(new Set([0, 1, 2]));
		} finally {
			setIsGenerating(false);
		}
	};
	
	return (
		<>
						<button
				onClick={() => setOpen(true)}
				className="px-3 sm:px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2"
			>
				<Plus className="h-3 w-3 sm:h-4 sm:w-4" />
				<span className="hidden sm:inline">Add Task</span>
				<span className="sm:hidden">Add</span>
			</button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Add Task</DialogTitle>
					</DialogHeader>
						
						{/* Tabs */}
						<div className="flex mb-6 bg-slate-100 p-1 rounded-lg">
							<button
								onClick={() => setActiveTab("manual")}
								className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
									activeTab === "manual" 
										? "bg-white text-slate-900 shadow-sm" 
										: "text-slate-600 hover:text-slate-900"
								}`}
							>
								Manual
							</button>
							<button
								onClick={() => setActiveTab("ai")}
								className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
									activeTab === "ai" 
										? "bg-white text-slate-900 shadow-sm" 
										: "text-slate-600 hover:text-slate-900"
								}`}
							>
								AI Generated
							</button>
						</div>
						{/* Manual Tab Content */}
						{activeTab === "manual" && (
							<div className="space-y-4">
								<div className="space-y-1">
									<label className="text-sm font-medium text-slate-700">Title</label>
									<input 
										value={title} 
										onChange={(e) => setTitle(e.target.value)} 
										className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm" 
										placeholder="Enter task title"
									/>
								</div>
								<div className="space-y-1">
									<label className="text-sm font-medium text-slate-700">Description</label>
									<textarea 
										value={description} 
										onChange={(e) => setDescription(e.target.value)} 
										className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm min-h-20" 
										placeholder="Enter task description (optional)"
									/>
								</div>
								<div className="space-y-1">
									<label className="text-sm font-medium text-slate-700">Tags</label>
									<div className="flex flex-wrap gap-2">
										{availableTags.map((tag) => {
											const active = tags.includes(tag.toLowerCase());
											return (
												<button 
													key={tag} 
													type="button" 
													onClick={() => setTags((prev) => prev.includes(tag.toLowerCase()) ? prev.filter((t) => t !== tag.toLowerCase()) : [...prev, tag.toLowerCase()])} 
													className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
														active 
															? "bg-slate-900 text-white border-slate-900" 
															: "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
													}`}
												>
													{tag}
												</button>
											);
										})}
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-1">
										<label className="text-sm font-medium text-slate-700">Status</label>
										<select 
											value={status} 
											onChange={(e) => setStatus(e.target.value as Column)} 
											className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
										>
											{columns.map((c) => (<option key={c} value={c}>{c}</option>))}
										</select>
									</div>
									<div className="space-y-1">
										<label className="text-sm font-medium text-slate-700">Estimate (hours)</label>
										<input 
											type="number" 
											min={0} 
											value={estimate} 
											onChange={(e) => setEstimate(e.target.value === "" ? "" : Number(e.target.value))} 
											className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm" 
											placeholder="0"
										/>
									</div>
								</div>
							</div>
						)}

						{/* AI Tab Content */}
						{activeTab === "ai" && (
							<div className="space-y-4">
								<div className="space-y-1">
									<label className="text-sm font-medium text-slate-700">Project Description</label>
									<textarea 
										value={aiDescription} 
										onChange={(e) => setAiDescription(e.target.value)} 
										className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm min-h-24" 
										placeholder="Describe what you want to accomplish. AI will generate relevant tasks for you..."
									/>
								</div>
								
								<button
									onClick={generateAITasks}
									disabled={!aiDescription.trim() || isGenerating}
									className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors"
								>
									{isGenerating ? "Generating Tasks..." : "Generate Tasks with AI"}
								</button>

								{/* Generated Tasks */}
								{generatedTasks.length > 0 && (
									<div className="space-y-3">
										<h4 className="text-sm font-medium text-slate-700">Generated Tasks (select which ones to add):</h4>
										<div className="space-y-2 max-h-60 overflow-y-auto">
											{generatedTasks.map((task, index) => (
												<div key={index} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
													<input
														type="checkbox"
														checked={selectedTasks.has(index)}
														onChange={(e) => {
															const newSelected = new Set(selectedTasks);
															if (e.target.checked) {
																newSelected.add(index);
															} else {
																newSelected.delete(index);
															}
															setSelectedTasks(newSelected);
														}}
														className="mt-1"
													/>
													<div className="flex-1">
														<h5 className="font-medium text-slate-900 text-sm">{task.title}</h5>
														<p className="text-xs text-slate-600 mt-1">{task.description}</p>
														<span className="inline-block mt-2 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
															{task.estimateHours}h estimated
														</span>
													</div>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						)}
						{/* Action Buttons */}
						<div className="mt-6 flex justify-end gap-3">
							<button
								onClick={() => setOpen(false)}
								className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm"
							>
								Cancel
							</button>
							
							{activeTab === "manual" ? (
								<button 
									onClick={() => { 
										const tline = tags.length > 0 ? `tags:${tags.join(",")}\n` : ""; 
										const payload = { 
											title: title.trim(), 
											description: (tline + (description.trim() || "")) || undefined, 
											status, 
											estimateHours: typeof estimate === "number" ? estimate : undefined 
										}; 
										if (!payload.title) return; 
										onAdd(payload); 
										setOpen(false); 
										setTitle(""); 
										setDescription(""); 
										setStatus("Backlog"); 
										setEstimate(""); 
										setTags([]); 
									}}
									disabled={!title.trim()}
									className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors text-sm"
								>
									Add Task
								</button>
							) : (
								<button 
									onClick={() => {
										const tasksToAdd = generatedTasks.filter((_, index) => selectedTasks.has(index));
										tasksToAdd.forEach(task => {
											onAdd({
												title: task.title,
												description: task.description,
												status: "Backlog",
												estimateHours: task.estimateHours
											});
										});
										setOpen(false);
										setAiDescription("");
										setGeneratedTasks([]);
										setSelectedTasks(new Set());
									}}
									disabled={selectedTasks.size === 0}
									className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors text-sm"
								>
									Add Selected Tasks ({selectedTasks.size})
								</button>
							)}
						</div>
				</DialogContent>
			</Dialog>
		</>
	);
}

function TaskActionButtons({ taskId }: { taskId: string }) {
    // Get timer state and actions from Zustand store
    const runningTaskId = useTimerStore((state) => state.runningTaskId);
    const startLocal = useTimerStore((state) => state.startLocal);
    const stopLocal = useTimerStore((state) => state.stopLocal);
    const running = runningTaskId === taskId;
    const { user } = useSession();
    const qc = useQueryClient();

    // Get mutations from parent context (these will be passed down)
    // For now, we'll handle the mutations directly in the component
    const handleStart = async () => {
        try {
            const data = await api<{ timeEntry: { startedAt: number } }>("/api/time-entries", {
                method: "POST",
                body: JSON.stringify({ action: "start", taskId }),
            }, user || undefined);
            
            if (data?.timeEntry?.startedAt) {
                startLocal(taskId, data.timeEntry.startedAt);
                toast.success("Timer started");
            } else {
                toast.error("Failed to start timer");
            }
        } catch (error) {
            console.error("Timer start error:", error);
            toast.error("Failed to start timer");
        }
    };

    const handleStop = async () => {
        try {
            await api("/api/time-entries", {
                method: "POST",
                body: JSON.stringify({ action: "stop", taskId }),
            }, user || undefined);
            
            // Stop local timer
            stopLocal();
            
            // Invalidate queries to refresh time data from server
            qc.invalidateQueries({ queryKey: ["time-summary", taskId, user?.uid] });
            // Need to get projectId - we can get it from the parent component
            // For now, invalidate all project-time queries
            qc.invalidateQueries({ queryKey: ["project-time"] });
            
            toast.success("Timer stopped");
        } catch (error) {
            console.error("Timer stop error:", error);
            toast.error("Failed to stop timer");
        }
    };
    return (
        <div className="flex items-center gap-1">
            <button
				onClick={handleStart}
				disabled={running}
				className="p-1 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-40 disabled:hover:text-slate-400 disabled:hover:bg-transparent"
				aria-label="Start timer"
				title={running ? "Timer already running" : "Start timer"}
			>
				<Play className="h-3 w-3" />
			</button>
            <button
				onClick={handleStop}
				disabled={!running}
				className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-40 disabled:hover:text-slate-400 disabled:hover:bg-transparent"
				aria-label="Stop timer"
				title={!running ? "Timer not running" : "Stop timer"}
			>
				<Square className="h-3 w-3" />
			</button>
        </div>
    );
}

// Create Invoice Modal Component (to be added to the main component)
// This should be added before the last closing brace of the main component
