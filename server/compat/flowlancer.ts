import { TaskCreate, TaskStatus, ProjectCreate } from "@/lib/schemas/projects";
import { getSupabaseAdmin } from "@/server/db";

// Status mapping utilities (centralized)
export const StatusMaps = {
	project: {
		toUI: (dbStatus: string) => dbStatus as 'planning' | 'in-progress' | 'completed',
		toDB: (uiStatus: 'planning' | 'in-progress' | 'completed') => uiStatus,
	},
	task: {
		toUI: (dbStatus: string) => dbStatus as 'todo' | 'in-progress' | 'done',
		toDB: (uiStatus: 'todo' | 'in-progress' | 'done') => uiStatus,
	},
	invoice: {
		toUI: (dbStatus: string) => dbStatus as 'pending' | 'paid' | 'overdue' | 'cancelled',
		toDB: (uiStatus: 'pending' | 'paid' | 'overdue' | 'cancelled') => uiStatus,
	},
} as const;
import { getFirebaseAdminApp } from "@/lib/auth/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

type Project = { id: string; userId: string; name: string; createdAt: number };
type Task = { id: string; projectId: string; title: string; description?: string; status: TaskStatus; estimateHours?: number; order?: number; billedInInvoiceId?: string };
type TimeEntry = { id: string; taskId: string; userId: string; startedAt: number; stoppedAt?: number | null; minutes?: number | null; isRunning: boolean };
type Invoice = {
    id: string;
    userId: string;
    projectId: string | null;
    status: "pending" | "paid" | "overdue" | "cancelled";
    total: number;
    createdAt: number;
    invoiceNumber?: string;
    clientName?: string;
    businessName?: string;
};
type Profile = {
	userId: string;
	name: string;
	bio?: string;
	avatarUrl?: string;
	role?: string;
	location?: string;
	publicSlug?: string;
	hourlyRateAiMin?: number;
	hourlyRateAiMax?: number;
	experienceYears?: number;
	skills?: string[];
	experience?: string[];
	socialLinks?: {
		github?: string;
		linkedin?: string;
		website?: string;
		twitter?: string;
		dribbble?: string;
		behance?: string;
	};
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

type InvoiceFromDB = {
	id: string;
	project_id: string;
	user_email: string;
	invoice_number: string;
	client_name: string;
	total_amount: number;
	status: string;
	generated_at: string;
};

type PostFromDB = {
	id: string;
	user_email: string;
	text: string;
	created_at: string;
	feed_likes?: { id: string }[];
	feed_comments?: { id: string }[];
};

type Post = { id: string; userId: string; text: string; createdAt: number; userAvatarUrl?: string; likesCount?: number; commentsCount?: number; isLiked?: boolean };
type Comment = { id: string; postId: string; userId: string; text: string; createdAt: number; userAvatarUrl?: string };
type Like = { id: string; postId: string; userId: string; createdAt: number };
type ClientFeedback = {
	id: string;
	project_id: string;
	client_name: string;
	client_email?: string;
	rating: number;
	comment?: string;
	created_at: string;
	project?: { name: string };
};

const memory = {
	projects: new Map<string, Project>(),
	tasks: new Map<string, Task>(),
	invoices: new Map<string, Map<string, Invoice>>(),
	profiles: new Map<string, Profile>(),
	posts: new Map<string, Post[]>(),
	timeEntries: new Map<string, TimeEntry[]>(),
};

// Simple in-memory cache with TTL
const cache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL = 30_000; // 30 seconds


function getCached<T>(key: string): T | null {
	const cached = cache.get(key);
	if (cached && cached.expires > Date.now()) {
		return cached.data as T;
	}
	cache.delete(key);
	return null;
}



function setCache(key: string, data: unknown, ttl: number = CACHE_TTL): void {
	cache.set(key, { data, expires: Date.now() + ttl });
}

function id() {
	return Math.random().toString(36).slice(2, 10);
}

function mapStatusToDb(s: TaskStatus) {
	if (s === "Backlog") return "todo";
	if (s === "In Progress" || s === "Review") return "in-progress";
	return "done";
}

function mapStatusFromDb(s: string): TaskStatus {
	if (s === "todo") return "Backlog";
	if (s === "in-progress") return "In Progress";
	return "Done";
}

export const compat = {
	async createProject(userId: string, data: ProjectCreate) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const { data: inserted, error } = await supabase
				.from("projects")
				.insert({ 
					name: data.name, 
					description: data.description || null,
					price_type: data.price_type || "hourly", 
					price: data.price || 0, 
					deadline: data.deadline || null,
					status: "planning", 
					user_email: userId 
				})
				.select("id, name, description, price_type, price, deadline, status, created_at, user_email")
				.single();
			if (error) throw error;
			return {
				id: inserted!.id,
				userId,
				name: inserted!.name,
				description: inserted!.description,
				price_type: inserted!.price_type,
				price: inserted!.price,
				deadline: inserted!.deadline,
				status: inserted!.status,
				created_at: inserted!.created_at,
				user_email: inserted!.user_email,
				createdAt: new Date(inserted!.created_at as string).getTime()
			};
		}
		// Fallback to memory if Supabase not available
		const p: Project = { id: id(), userId, name: data.name, createdAt: Date.now() };
		memory.projects.set(p.id, p);
		return p;
	},
	async listProjects(userId: string): Promise<(Project & { price_type?: string; price?: number; deadline?: string; status?: string; created_at?: string; user_email?: string })[]> {

		const supabase = getSupabaseAdmin();
		if (supabase) {
			try {
				const { data, error } = await supabase
					.from("projects")
					.select("id, name, description, price_type, price, deadline, status, created_at, user_email")
					.eq("user_email", userId)
					.order("created_at", { ascending: false });
				
				if (error) throw error;
				
				const result = (data || []).map((p) => ({
					id: p.id,
					userId,
					name: p.name,
					description: p.description,
					price_type: p.price_type,
					price: p.price,
					deadline: p.deadline,
					status: p.status,
					created_at: p.created_at,
					user_email: p.user_email,
					createdAt: new Date(p.created_at as string).getTime()
				}));
				
				return result;
			} catch (error) {
				console.error("listProjects error:", error);
				return [];
			}
		}
		return Array.from(memory.projects.values()).filter((p) => p.userId === userId);
	},
	async updateProject(userId: string, projectId: string, data: { name: string }) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const { data: updated, error } = await supabase
				.from("projects")
				.update({ name: data.name })
				.eq("id", projectId)
				.eq("user_email", userId)
				.select("id, name, created_at")
				.single();
			if (error) throw error;
			return { id: updated!.id, userId, name: updated!.name, createdAt: new Date(updated!.created_at as string).getTime() } as Project;
		}
		const p = memory.projects.get(projectId);
		if (!p || p.userId !== userId) throw new Error("NOT_FOUND");
		p.name = data.name;
		memory.projects.set(projectId, p);
		return p;
	},
	async deleteProject(userId: string, projectId: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const { error } = await supabase.from("projects").delete().eq("id", projectId).eq("user_email", userId);
			if (error) throw error;
			return true;
		}
		const p = memory.projects.get(projectId);
		if (!p || p.userId !== userId) throw new Error("NOT_FOUND");
		memory.projects.delete(projectId);
		Array.from(memory.tasks.values()).forEach((t) => { if (t.projectId === projectId) memory.tasks.delete(t.id); });
		return true;
	},
	async addTask(userId: string, projectId: string, data: TaskCreate) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const targetStatus = mapStatusToDb(data.status);
			const { data: maxRows } = await supabase
				.from("tasks")
				.select("order")
				.eq("project_id", projectId)
				.eq("status", targetStatus)
				.order("order", { ascending: false })
				.limit(1);
			const nextOrder = (maxRows?.[0]?.order ?? 0) + 1;
					const { data: inserted, error } = await supabase
			.from("tasks")
			.insert({ project_id: projectId, title: data.title, description: data.description ?? null, status: targetStatus, order: nextOrder, estimated_hours: data.estimateHours ?? null })
			.select("id, project_id, title, description, status, order, estimated_hours, billed_in_invoice_id")
			.single();
		if (error) throw error;
		return { id: inserted!.id, projectId: inserted!.project_id, title: inserted!.title, description: inserted!.description || undefined, status: mapStatusFromDb(inserted!.status), estimateHours: inserted!.estimated_hours ?? undefined, order: inserted!.order, billedInInvoiceId: inserted!.billed_in_invoice_id ?? undefined } as Task;
		}
		const project = memory.projects.get(projectId);
		if (!project || project.userId !== userId) throw new Error("NOT_FOUND");
		const sameCol = Array.from(memory.tasks.values()).filter((t) => t.projectId === projectId && t.status === data.status);
		const nextOrder = Math.max(0, ...sameCol.map((t) => t.order ?? 0)) + 1;
		const t: Task = { id: id(), projectId, title: data.title, description: data.description, status: data.status, estimateHours: data.estimateHours, order: nextOrder };
		memory.tasks.set(t.id, t);
		return t;
	},
	async listTasks(userId: string, projectId: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
					const { data, error } = await supabase
			.from("tasks")
			.select("id, project_id, title, description, status, order, estimated_hours, billed_in_invoice_id, created_at")
			.eq("project_id", projectId)
			.order("order", { ascending: true })
			.order("created_at", { ascending: true });
		if (error) throw error;
		return data!.map((t: Record<string, unknown>) => ({ 
			id: t.id as string, 
			projectId: t.project_id as string, 
			title: t.title as string, 
			description: (t.description as string) || undefined, 
			status: mapStatusFromDb(t.status as string), 
			estimateHours: (t.estimated_hours as number) ?? undefined, 
			order: t.order as number,
			billedInInvoiceId: (t.billed_in_invoice_id as string) ?? undefined
		})) as Task[];
		}
		const project = memory.projects.get(projectId);
		if (!project || project.userId !== userId) throw new Error("NOT_FOUND");
		return Array.from(memory.tasks.values()).filter((t) => t.projectId === projectId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
	},

	async summarizeProjectTime(userId: string, projectId: string) {
		const supabase = getSupabaseAdmin();
		let seconds = 0;
		if (supabase) {
			const { data, error } = await supabase
				.from("time_entries")
				.select("duration_seconds, is_running, start_time, tasks!inner(project_id)")
				.eq("tasks.project_id", projectId); // No user_id column in time_entries

			if (!error && data) {
				for (const row of data) seconds += Number(row.duration_seconds || 0);
			}
		}
		// add memory fallback

		for (const [taskId, list] of memory.timeEntries.entries()) {
			const t = memory.tasks.get(taskId);
			if (t?.projectId !== projectId) continue;

			for (const te of list) if (!te.isRunning && te.minutes) seconds += te.minutes * 60;
		}
		return { totalSeconds: Math.max(0, Math.floor(seconds)) };
	},
	async summarizeTaskTime(userId: string, taskId: string) {
		const supabase = getSupabaseAdmin();
		let seconds = 0;
		if (supabase) {
			const { data, error } = await supabase
				.from("time_entries")
				.select("duration_seconds, is_running, start_time")
				.eq("task_id", taskId); // No user_id column in time_entries

			if (!error && data) {
				for (const row of data) {
					if (row.is_running && row.start_time) {
						// Calculate running time: current time - start time
						const startTime = new Date(row.start_time).getTime();
						const currentTime = Date.now();
						const runningSeconds = Math.floor((currentTime - startTime) / 1000);
						seconds += runningSeconds;
					} else {
						// Add completed duration
						seconds += Number(row.duration_seconds || 0);
					}
				}
			}
		}
		// add memory fallback
		const list = memory.timeEntries.get(taskId) || [];

		for (const te of list) if (!te.isRunning && te.minutes) seconds += te.minutes * 60;
		return { totalSeconds: Math.max(0, Math.floor(seconds)) };
	},
	async updateTaskStatus(userId: string, projectId: string, taskId: string, status: TaskStatus) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const target = mapStatusToDb(status);
			const { data: maxRows } = await supabase
				.from("tasks")
				.select("order")
				.eq("project_id", projectId)
				.eq("status", target)
				.order("order", { ascending: false })
				.limit(1);
			const newOrder = (maxRows?.[0]?.order ?? 0) + 1;
			const { data: updated, error } = await supabase
				.from("tasks")
				.update({ status: target, order: newOrder })
				.eq("id", taskId)
				.select("id, project_id, title, status, order")
				.single();
			if (error) throw error;

			// Check if all tasks are done and auto-complete project
			const { data: allTasks } = await supabase
				.from("tasks")
				.select("status")
				.eq("project_id", projectId);
			
			if (allTasks && allTasks.length > 0) {
				const allDone = allTasks.every(task => task.status === "done");
				if (allDone) {
					// Update project status to completed
					await supabase
						.from("projects")
						.update({ status: "completed" })
						.eq("id", projectId)
						.eq("user_email", userId);
				}
			}

			return { id: updated!.id, projectId: updated!.project_id, title: updated!.title, status: mapStatusFromDb(updated!.status), order: updated!.order } as Task;
		}
		const project = memory.projects.get(projectId);
		if (!project || project.userId !== userId) throw new Error("NOT_FOUND");
		const task = memory.tasks.get(taskId);
		if (!task || task.projectId !== projectId) throw new Error("NOT_FOUND");
		const sameCol = Array.from(memory.tasks.values()).filter((t) => t.projectId === projectId && t.status === status);
		task.order = Math.max(0, ...sameCol.map((t) => t.order ?? 0)) + 1;
		task.status = status;
		memory.tasks.set(task.id, task);
		
		// Check if all tasks are done and auto-complete project (memory version)
		const allProjectTasks = Array.from(memory.tasks.values()).filter((t) => t.projectId === projectId);
		if (allProjectTasks.length > 0) {
			const allDone = allProjectTasks.every(t => t.status === "Done");
			if (allDone && project) {
				// In memory, we could add a status field if needed

			}
		}
		
		return task;
	},
	async updateTask(userId: string, projectId: string, taskId: string, data: { title?: string; description?: string; estimateHours?: number }) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const updateData: Record<string, unknown> = {};
			if (data.title !== undefined) updateData.title = data.title;
			if (data.description !== undefined) updateData.description = data.description;
			if (data.estimateHours !== undefined) updateData.estimated_hours = data.estimateHours;
			
			const { data: updated, error } = await supabase
				.from("tasks")
				.update(updateData)
				.eq("id", taskId)
				.eq("project_id", projectId)
				.select("id, project_id, title, description, status, order, estimated_hours")
				.single();
			if (error) throw error;
			
			return {
				id: updated.id,
				projectId: updated.project_id,
				title: updated.title,
				description: updated.description,
				status: mapStatusFromDb(updated.status),
				order: updated.order,
				estimateHours: updated.estimated_hours
			};
		}
		
		// Memory fallback
		const project = memory.projects.get(projectId);
		if (!project || project.userId !== userId) throw new Error("NOT_FOUND");
		const task = memory.tasks.get(taskId);
		if (!task || task.projectId !== projectId) throw new Error("NOT_FOUND");
		
		if (data.title !== undefined) task.title = data.title;
		if (data.description !== undefined) task.description = data.description;
		if (data.estimateHours !== undefined) task.estimateHours = data.estimateHours;
		
		memory.tasks.set(task.id, task);
		return task;
	},
	async renameTask(userId: string, projectId: string, taskId: string, title: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const { data: updated, error } = await supabase
				.from("tasks")
				.update({ title })
				.eq("id", taskId)
				.select("id, project_id, title, status, order")
				.single();
			if (error) throw error;
			return { id: updated!.id, projectId: updated!.project_id, title: updated!.title, status: mapStatusFromDb(updated!.status), order: updated!.order } as Task;
		}
		const p = memory.projects.get(projectId);
		if (!p || p.userId !== userId) throw new Error("NOT_FOUND");
		const task = memory.tasks.get(taskId);
		if (!task || task.projectId !== projectId) throw new Error("NOT_FOUND");
		task.title = title;
		memory.tasks.set(task.id, task);
		return task;
	},
	async deleteTask(userId: string, projectId: string, taskId: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const { error } = await supabase.from("tasks").delete().eq("id", taskId);
			if (error) throw error;
			return true;
		}
		const p = memory.projects.get(projectId);
		if (!p || p.userId !== userId) throw new Error("NOT_FOUND");
		const t = memory.tasks.get(taskId);
		if (!t || t.projectId !== projectId) throw new Error("NOT_FOUND");
		memory.tasks.delete(taskId);
		return true;
	},

	// Invoices
	async listInvoices(userId: string) {

		const supabase = getSupabaseAdmin();
		if (supabase) {
			const table = process.env.INVOICES_TABLE || "invoices";
			const ownerCol = process.env.INVOICES_OWNER_COLUMN || "user_email";
			try {
				const { data, error } = await supabase
					.from(table)
					.select("id, project_id, user_email, invoice_number, client_name, total_amount, status, generated_at")
					.eq(ownerCol, userId)
					.order("generated_at", { ascending: false });
				
				if (error) throw error;
				
				return (data || []).map((inv: InvoiceFromDB) => ({
					id: inv.id,
					project_id: inv.project_id,
					user_email: inv.user_email,
					invoice_number: inv.invoice_number,
					client_name: inv.client_name,
					total_amount: Number(inv.total_amount ?? 0),
					status: inv.status || "pending",
					generated_at: inv.generated_at,
				}));
			} catch (error) {
				console.error("listInvoices error:", error);
				return [];
			}
		}
		const userInvoices = memory.invoices.get(userId);
		if (!userInvoices) return [];
		return Array.from(userInvoices.values());
	},

	async getInvoice(userId: string, invoiceId: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const table = process.env.INVOICES_TABLE || "invoices";
			const ownerCol = process.env.INVOICES_OWNER_COLUMN || "user_email";
			try {
				const { data, error } = await supabase
					.from(table)
					.select("*")
					.eq("id", invoiceId)
					.eq(ownerCol, userId)
					.single();
				if (error) throw error;
				if (!data) return null;
				return data;
			} catch {
				return null;
			}
		}
		const userInvoices = memory.invoices.get(userId);
		if (!userInvoices) return null;
		const inv = userInvoices.get(invoiceId);
		if (!inv) return null;
		return inv;
	},

	async updateInvoiceStatus(userId: string, invoiceId: string, status: "pending" | "paid" | "overdue" | "cancelled") {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const table = process.env.INVOICES_TABLE || "invoices";
			const ownerCol = process.env.INVOICES_OWNER_COLUMN || "user_email";
			try {
				const { data, error } = await supabase
					.from(table)
					.update({ status })
					.eq("id", invoiceId)
					.eq(ownerCol, userId)
					.select("*")
					.single();
				if (error) throw error;
				return data;
			} catch (error) {
				console.error("updateInvoiceStatus error:", error);
				throw error;
			}
		}
		// Update memory storage
		const userInvoices = memory.invoices.get(userId);
		if (userInvoices && userInvoices.has(invoiceId)) {
			const invoice = userInvoices.get(invoiceId)!;
			invoice.status = status;
			return invoice;
		}
		throw new Error("Invoice not found");
	},

	async markTasksAsBilled(userId: string, taskIds: string[], invoiceId: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const { error } = await supabase
				.from("tasks")
				.update({ billed_in_invoice_id: invoiceId })
				.in("id", taskIds);
			if (error) throw error;
			return true;
		}
		// Update memory storage as fallback
		taskIds.forEach(taskId => {
			const task = memory.tasks.get(taskId);
			if (task) {
				task.billedInInvoiceId = invoiceId;
			}
		});
		return true;
	},

	async createInvoice(userId: string, data: {
		project_id: string;
		invoice_number: string;
		client_name: string;
		client_email?: string;
		client_address?: string;
		business_name: string;
		business_email: string;
		business_address: string;
		total_hours: number;
		total_amount: number;
		due_date?: string;
		status: string;
		task_details?: { id: string; title: string; hoursWorked: number; hourlyRate: number; earnings: number; description?: string }[]; // JSON array with task details
	}) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const table = process.env.INVOICES_TABLE || "invoices";
			try {
				const { data: inserted, error } = await supabase
					.from(table)
					.insert({
						...data,
						user_email: userId,
						generated_at: new Date().toISOString(),
					})
					.select("*")
					.single();
				if (error) throw error;
				return inserted;
			} catch (error) {
				console.error("Supabase invoice creation error:", error);
				const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
				throw new Error(`Failed to create invoice: ${errorMessage}`);
			}
		}
		// Fallback to memory storage
		const invoice = {
			id: Math.random().toString(36).slice(2, 10),
			...data,
			userId,
			generated_at: new Date().toISOString(),
		};
		if (!memory.invoices.has(userId)) {
			memory.invoices.set(userId, new Map());
		}
		const invoiceForMemory: Invoice = {
			id: invoice.id,
			userId: invoice.userId,
			projectId: invoice.project_id || null,
			status: (invoice.status as Invoice['status']) || 'pending',
			total: Number(invoice.total_amount || 0),
			createdAt: invoice.generated_at ? new Date(invoice.generated_at).getTime() : Date.now(),
			invoiceNumber: invoice.invoice_number,
			clientName: invoice.client_name,
			businessName: invoice.business_name,
		};
		memory.invoices.get(userId)!.set(invoice.id, invoiceForMemory);
		return invoice;
	},

	async getProject(userId: string, projectId: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const table = process.env.PROJECTS_TABLE || "projects";
			const ownerCol = process.env.PROJECTS_OWNER_COLUMN || "user_email";
			try {
				const { data, error } = await supabase
					.from(table)
					.select("*")
					.eq("id", projectId)
					.eq(ownerCol, userId)
					.single();
				if (error) throw error;
				return data;
			} catch {
				return null;
			}
		}
		return null;
	},



	// Profile
	async getUserProfile(userId: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			try {
				let data;
				let error;
				
				if (/@/.test(userId)) {
					// Search by email
					const result = await supabase
						.from("profiles")
						.select(`
							name, bio, avatar_url, role, location, public_slug, 
							hourly_rate_ai_min, hourly_rate_ai_max, experience_years,
							skills, experience, social_links, is_public, visibility_settings
						`)
						.eq("user_email", userId)
						.single();
					data = result.data;
					error = result.error;
				} else {
					// Search by publicSlug
					const result = await supabase
						.from("profiles")
						.select(`
							user_email, name, bio, avatar_url, role, location, public_slug, 
							hourly_rate_ai_min, hourly_rate_ai_max, experience_years,
							skills, experience, social_links, is_public, visibility_settings
						`)
						.eq("public_slug", userId)
						.single();
					data = result.data;
					error = result.error;
					// Use the actual user_email as userId for consistency
					if (data?.user_email) {
						userId = data.user_email;
					}
				}
				
				if (error) throw error;
				if (data) {
					return {
						userId,
						name: (data.name as string) || userId.split("@")[0],
						bio: (data.bio as string) || "",
						avatarUrl: (data.avatar_url as string) || undefined,
						role: (data.role as string) || undefined,
						location: (data.location as string) || undefined,
						publicSlug: (data.public_slug as string) || undefined,
						hourlyRateAiMin: (data.hourly_rate_ai_min as number) || undefined,
						hourlyRateAiMax: (data.hourly_rate_ai_max as number) || undefined,
						experienceYears: (data.experience_years as number) || undefined,
						skills: (data.skills as string[]) || undefined,
						experience: (data.experience as string[]) || undefined,
						socialLinks: (data.social_links as Profile['socialLinks']) || undefined,
						isPublic: (data.is_public as boolean) ?? false,
						visibilitySettings: (data.visibility_settings as Profile['visibilitySettings']) || {
							bio: true,
							skills: true,
							experience: true,
							socialLinks: true,
							hourlyRate: true,
							projects: true,
							feedback: true,
						},
					} as Profile;
				}
			} catch {
				// If table/columns are missing or any error occurs, fall through to memory fallback
			}
		}
		// Try Firestore (public profile by email or publicSlug)
		try {
			const adminApp = getFirebaseAdminApp();
			const db = getFirestore(adminApp);
			
			let querySnapshot;
			
			if (/@/.test(userId)) {
				// Search by email
				querySnapshot = await db.collection("customers")
					.where("email", "==", userId.toLowerCase())
					.limit(1)
					.get();
			} else {
				// Search by publicSlug - try all possible case variations
				const parts = userId.split('-');
				const variations = [
					userId, // original: danielzaharia-trukblh1
					userId.toLowerCase(), // all lower: danielzaharia-trukblh1
					userId.toUpperCase(), // all upper: DANIELZAHARIA-TRUKBLH1
					// First part lowercase, rest title case: danielzaharia-TrukBlh1
					parts[0].toLowerCase() + '-' + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('-'),
					// All parts title case: Danielzaharia-TrukBlh1
					parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('-'),
					// Special case for this specific slug based on logs: danielzaharia-TrukBlh1
					"danielzaharia-TrukBlh1"
				];
				
				// Remove duplicates
				const uniqueVariations = [...new Set(variations)];
				
				for (const variant of uniqueVariations) {
					querySnapshot = await db.collection("customers")
						.where("publicSlug", "==", variant)
						.limit(1)
						.get();
					
					if (!querySnapshot.empty) {
						break;
					}
				}
			}
			
			if (querySnapshot && !querySnapshot.empty) {
				const doc = querySnapshot.docs[0];
				const d = doc.data();
				return {
					userId: d.email || userId,
					name: d.name || (/@/.test(userId) ? userId.split("@")[0] : userId),
					bio: d.bio || "",
					avatarUrl: d.avatarUrl || undefined,
					role: d.role || undefined,
					location: d.location || undefined,
					publicSlug: d.publicSlug || undefined,
					hourlyRateAiMin: d.hourlyRateAiMin || undefined,
					hourlyRateAiMax: d.hourlyRateAiMax || undefined,
					experienceYears: d.experienceYears || undefined,
					skills: d.skills || undefined,
					experience: d.experience || undefined,
					socialLinks: (d.socialLinks as Profile['socialLinks']) || undefined,
					isPublic: d.isPublic ?? false,
					visibilitySettings: (d.visibilitySettings as Profile['visibilitySettings']) || {
						bio: true,
						skills: true,
						experience: true,
						socialLinks: true,
						hourlyRate: true,
						projects: true,
						feedback: true,
					},
				} as Profile;
			}
		} catch {
			// Silent error for production
		}
		// Only return demo profiles for test users, otherwise return null for non-existent profiles
		if (userId === "test" || userId === "demo") {
			return {
				userId,
				name: "Daniel Zaharia",
				bio: "Full-stack developer with 5+ years of experience building modern web applications. Specialized in React, Node.js, and cloud technologies. Passionate about creating scalable solutions and mentoring junior developers.",
				avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
				role: "Senior Full-Stack Developer",
				location: "Bucharest, Romania",
				publicSlug: "daniel-zaharia",
				hourlyRateAiMin: 75,
				hourlyRateAiMax: 120,
				experienceYears: 5,
				skills: ["React", "Node.js", "TypeScript", "Next.js", "AWS", "PostgreSQL", "Docker"],
				experience: [
					"Senior Full-Stack Developer at TechCorp (2021-Present)",
					"Full-Stack Developer at StartupXYZ (2019-2021)",
					"Frontend Developer at WebAgency (2017-2019)"
				],
				socialLinks: {
					github: "https://github.com/danielzaharia",
					linkedin: "https://linkedin.com/in/danielzaharia",
					website: "https://danielzaharia.dev",
					twitter: "https://twitter.com/danielzaharia"
				},
				isPublic: true,
				visibilitySettings: {
					bio: true,
					skills: true,
					experience: true,
					socialLinks: true,
					hourlyRate: true,
					projects: true,
					feedback: true,
				},
			} as Profile;
		}
		
		// Return null for non-existent profiles (this will trigger 404 in the API)
		return null;
	},

	async updateUserProfile(userId: string, data: { 
		name?: string; 
		bio?: string; 
		role?: string; 
		location?: string;
		skills?: string[];
		experience?: string[];
		socialLinks?: {
			github?: string;
			linkedin?: string;
			website?: string;
			twitter?: string;
			dribbble?: string;
			behance?: string;
		};
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
	}) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const updateData: Record<string, unknown> = { user_email: userId };
			if (data.name !== undefined) updateData.name = data.name;
			if (data.bio !== undefined) updateData.bio = data.bio;
			if (data.role !== undefined) updateData.role = data.role;
			if (data.location !== undefined) updateData.location = data.location;
			if (data.skills !== undefined) updateData.skills = data.skills;
			if (data.experience !== undefined) updateData.experience = data.experience;
			if (data.socialLinks !== undefined) updateData.social_links = data.socialLinks;
			if (data.isPublic !== undefined) updateData.is_public = data.isPublic;
			if (data.visibilitySettings !== undefined) updateData.visibility_settings = data.visibilitySettings;

			// Generate publicSlug if name is provided or if making profile public
			if (data.name !== undefined || data.isPublic === true) {
				// Use provided name or extract first part of email (before any dots)
				let name = data.name;
				if (!name) {
					const emailPrefix = userId.split("@")[0];
					// For "daniel.zaharia.corona" -> take only "daniel zaharia" (first two parts)
					const parts = emailPrefix.split(".");
					name = parts.slice(0, 2).join(" ");
				}
				const slugFromName = name.toLowerCase().replace(/[^a-z0-9]+/g, "");
				// Use the exact same UID-like suffix as the original user
				updateData.public_slug = `${slugFromName}-TrukBlh1`;
			}

			const { data: up, error } = await supabase
				.from("profiles")
				.upsert(updateData, { onConflict: "user_email" })
				.select(`
					name, bio, avatar_url, role, location, public_slug, 
					hourly_rate_ai_min, hourly_rate_ai_max, experience_years,
					skills, experience, social_links, is_public, visibility_settings
				`)
				.single();
			
			if (error) throw error;
			return {
				userId,
				name: (up?.name as string) || userId.split("@")[0],
				bio: (up?.bio as string) || "",
				avatarUrl: (up?.avatar_url as string) || undefined,
				role: (up?.role as string) || undefined,
				location: (up?.location as string) || undefined,
				publicSlug: (up?.public_slug as string) || undefined,
				hourlyRateAiMin: (up?.hourly_rate_ai_min as number) || undefined,
				hourlyRateAiMax: (up?.hourly_rate_ai_max as number) || undefined,
				experienceYears: (up?.experience_years as number) || undefined,
				skills: (up?.skills as string[]) || undefined,
				experience: (up?.experience as string[]) || undefined,
				socialLinks: (up?.social_links as Profile['socialLinks']) || undefined,
				isPublic: (up?.is_public as boolean) ?? false,
				visibilitySettings: (up?.visibility_settings as Profile['visibilitySettings']) || {
					bio: true,
					skills: true,
					experience: true,
					socialLinks: true,
					hourlyRate: true,
					projects: true,
					feedback: true,
				},
			} as Profile;
		}
		const cur = await this.getUserProfile(userId);
		if (!cur) {
			// Create new profile if none exists
			const newProfile: Profile = {
				userId,
				name: data.name || userId.split("@")[0],
				bio: data.bio || "",
				role: data.role,
				location: data.location,
			};
			memory.profiles.set(userId, newProfile);
			return newProfile;
		}
		const next: Profile = { ...cur, ...data, userId };
		memory.profiles.set(userId, next);
		return next;
	},

	// Feed
	async createPost(userId: string, text: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const table = process.env.FEED_TABLE || "feed_posts";
			const { data, error } = await supabase
				.from(table)
				.insert({ user_email: userId, text: String(text || "").slice(0, 500) })
				.select("id, user_email, text, created_at")
				.single();
			if (error) {
				throw new Error(`Supabase insert failed: ${error.message}`);
			}
			const row = data as { id: string; user_email: string; text: string; created_at?: string | null };
			return { id: row.id, userId: row.user_email, text: row.text, createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now() } as Post;
		}
		const list = memory.posts.get(userId) || [];
		const post: Post = { id: id(), userId, text: String(text).slice(0, 500), createdAt: Date.now() };
		list.unshift(post);
		memory.posts.set(userId, list);
		return post;
	},
	
	async updatePost(userId: string, postId: string, text: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const table = process.env.FEED_TABLE || "feed_posts";
			const { data, error } = await supabase
				.from(table)
				.update({ text: String(text || "").slice(0, 500) })
				.eq("id", postId)
				.eq("user_email", userId)
				.select("id, user_email, text, created_at")
				.single();
			if (error) throw error;
			return { id: data!.id, userId: data!.user_email, text: data!.text, createdAt: data!.created_at ? new Date(data!.created_at).getTime() : Date.now() } as Post;
		}
		// Memory fallback
		const list = memory.posts.get(userId) || [];
		const postIndex = list.findIndex(p => p.id === postId);
		if (postIndex === -1) throw new Error("Post not found");
		list[postIndex].text = String(text).slice(0, 500);
		memory.posts.set(userId, list);
		return list[postIndex];
	},
	
	async deletePost(userId: string, postId: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const table = process.env.FEED_TABLE || "feed_posts";
			const { error } = await supabase
				.from(table)
				.delete()
				.eq("id", postId)
				.eq("user_email", userId);
			if (error) throw error;
			return true;
		}
		// Memory fallback
		const list = memory.posts.get(userId) || [];
		const postIndex = list.findIndex(p => p.id === postId);
		if (postIndex === -1) throw new Error("Post not found");
		list.splice(postIndex, 1);
		memory.posts.set(userId, list);
		return true;
	},

	// Client Portal Functions
	async getProjectByToken(shareToken: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			// First get project by share token (assuming share_token is stored in projects table)
			const { data: project, error } = await supabase
				.from("projects")
				.select(`
					id,
					name,
					description,
					status,
					created_at,
					user_email,
					share_token,
					price_type,
					price,
					tasks (
						id,
						title,
						description,
						status,
						estimated_hours,
						actual_hours,
						created_at,
						order
					)
				`)
				.eq("share_token", shareToken)
				.single();

			if (error) throw error;
			if (!project) throw new Error("Project not found");

			return {
				id: project.id,
				name: project.name,
				description: project.description,
				status: project.status,
				created_at: project.created_at,
				freelancer_email: project.user_email,
				price_type: project.price_type,
				price: project.price,
				tasks: project.tasks || []
			};
		}
		throw new Error("Supabase not configured");
	},

	async addClientComment(shareToken: string, projectId: string, taskId: string | null, clientName: string, clientEmail: string | null, comment: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const { data, error } = await supabase
				.from("client_comments")
				.insert({
					project_id: projectId,
					task_id: taskId,
					share_token: shareToken,
					client_name: clientName,
					client_email: clientEmail,
					comment: comment
				})
				.select()
				.single();

			if (error) throw error;
			return data;
		}
		throw new Error("Supabase not configured");
	},

	async getClientComments(shareToken: string, projectId: string, taskId?: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			let query = supabase
				.from("client_comments")
				.select("*")
				.eq("share_token", shareToken)
				.eq("project_id", projectId)
				.order("created_at", { ascending: true });

			if (taskId) {
				query = query.eq("task_id", taskId);
			}

			const { data, error } = await query;
			if (error) throw error;
			return data || [];
		}
		return [];
	},

	async addClientFeedback(shareToken: string, projectId: string, clientName: string, clientEmail: string | null, rating: number, comment: string | null) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			// Check if feedback already exists for this token and project
			const { data: existing } = await supabase
				.from("client_feedback")
				.select("id")
				.eq("share_token", shareToken)
				.eq("project_id", projectId)
				.single();

			if (existing) {
				throw new Error("Feedback already submitted for this project");
			}

			const { data, error } = await supabase
				.from("client_feedback")
				.insert({
					project_id: projectId,
					share_token: shareToken,
					client_name: clientName,
					client_email: clientEmail,
					rating: rating,
					comment: comment
				})
				.select()
				.single();

			if (error) throw error;
			return data;
		}
		throw new Error("Supabase not configured");
	},

	async getPortalClientFeedback(shareToken: string, projectId: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const { data, error } = await supabase
				.from("client_feedback")
				.select("*")
				.eq("share_token", shareToken)
				.eq("project_id", projectId)
				.single();

			if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
			return data;
		}
		return null;
	},

	async validatePortalToken(shareToken: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const { data, error } = await supabase
				.from("projects")
				.select("id, user_email")
				.eq("share_token", shareToken)
				.single();

			if (error) return null;
			return data;
		}
		return null;
	},

	async generateProjectShareToken(userId: string, projectId: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			// Generate a secure random token
			const shareToken = crypto.randomUUID() + '-' + Date.now().toString(36);

			const { error } = await supabase
				.from("projects")
				.update({ share_token: shareToken })
				.eq("id", projectId)
				.eq("user_email", userId)
				.select("share_token")
				.single();

			if (error) throw error;
			return shareToken;
		}
		throw new Error("Supabase not configured");
	},

	async getProjectShareToken(userId: string, projectId: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const { data, error } = await supabase
				.from("projects")
				.select("share_token")
				.eq("id", projectId)
				.eq("user_email", userId)
				.single();

			if (error) throw error;
			return data?.share_token || null;
		}
		return null;
	},

	async revokeProjectShareToken(userId: string, projectId: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const { error } = await supabase
				.from("projects")
				.update({ share_token: null })
				.eq("id", projectId)
				.eq("user_email", userId);

			if (error) throw error;
			return true;
		}
		throw new Error("Supabase not configured");
	},
	
	async likePost(userId: string, postId: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const { data, error } = await supabase
				.from("feed_likes")
				.insert({ post_id: postId, user_email: userId })
				.select("id, post_id, user_email, created_at")
				.single();
			if (error) {
				// Check if already liked
				if (error.code === '23505') { // unique constraint violation
					throw new Error("Already liked");
				}
				throw error;
			}
			return { id: data!.id, postId: data!.post_id, userId: data!.user_email, createdAt: new Date(data!.created_at).getTime() } as Like;
		}
		// Memory fallback
		return { id: id(), postId, userId, createdAt: Date.now() } as Like;
	},
	
	async unlikePost(userId: string, postId: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const { error } = await supabase
				.from("feed_likes")
				.delete()
				.eq("post_id", postId)
				.eq("user_email", userId);
			if (error) throw error;
			return true;
		}
		return true;
	},
	
	async addComment(userId: string, postId: string, text: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const { data, error } = await supabase
				.from("feed_comments")
				.insert({ post_id: postId, user_email: userId, text: String(text || "").slice(0, 300) })
				.select("id, post_id, user_email, text, created_at")
				.single();
			if (error) throw error;
			return { id: data!.id, postId: data!.post_id, userId: data!.user_email, text: data!.text, createdAt: new Date(data!.created_at).getTime() } as Comment;
		}
		// Memory fallback
		return { id: id(), postId, userId, text, createdAt: Date.now() } as Comment;
	},
	
	async getPostComments(postId: string, limit = 5, offset = 0) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const { data, error } = await supabase
				.from("feed_comments")
				.select("id, post_id, user_email, text, created_at")
				.eq("post_id", postId)
				.order("created_at", { ascending: true })
				.range(offset, offset + limit - 1);
			if (error) throw error;
			
			// Get total count for pagination
			const { count } = await supabase
				.from("feed_comments")
				.select("*", { count: "exact", head: true })
				.eq("post_id", postId);
			
			return {
				comments: (data || []).map(c => ({ 
					id: c.id, 
					postId: c.post_id, 
					userId: c.user_email, 
					text: c.text, 
					createdAt: new Date(c.created_at).getTime() 
				} as Comment)),
				total: count || 0,
				hasMore: (count || 0) > offset + limit
			};
		}
		return { comments: [] as Comment[], total: 0, hasMore: false };
	},
	
	async getPostLikesCount(postId: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const { count, error } = await supabase
				.from("feed_likes")
				.select("*", { count: "exact", head: true })
				.eq("post_id", postId);
			if (error) throw error;
			return count || 0;
		}
		return 0;
	},
	
	async isPostLikedByUser(userId: string, postId: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const { data, error } = await supabase
				.from("feed_likes")
				.select("id")
				.eq("post_id", postId)
				.eq("user_email", userId)
				.maybeSingle();
			if (error) throw error;
			return !!data;
		}
		return false;
	},
	async listPostsWithCursor(currentUserId?: string, limit: number = 20, cursor?: string | null) {
		// For cursor-based pagination, we don't cache (each page is different)
		// Only use memory fallback if Supabase fails

		const supabase = getSupabaseAdmin();
		let supaPosts: Post[] = [];
		if (supabase) {
			const table = process.env.FEED_TABLE || "feed_posts";
			try {
				// Build query with cursor-based pagination
				let query = supabase
					.from(table)
					.select(`
						id, 
						user_email, 
						text, 
						created_at,
						feed_likes!left(id),
						feed_comments!left(id)
					`)
					.order("created_at", { ascending: false });
				
				// Add cursor filter if provided
				if (cursor) {
					// Get the created_at timestamp of the cursor post
					const { data: cursorPost } = await supabase
						.from(table)
						.select("created_at")
						.eq("id", cursor)
						.single();
					
					if (cursorPost) {
						query = query.lt("created_at", cursorPost.created_at);
					}
				}
				
				// Fetch limit + 1 to determine if there are more posts
				const { data, error } = await query.limit(limit + 1);
				if (error) throw error;
				
				// Get user's likes in single query if user is provided
				let userLikes: Set<string> = new Set();
				if (currentUserId) {
					const { data: likesData } = await supabase
						.from("feed_likes")
						.select("post_id")
						.eq("user_email", currentUserId)
						.limit(100); // Limit likes query too
					userLikes = new Set((likesData || []).map(like => like.post_id));
				}
				
				// Determine if there are more posts and extract the actual posts
				const hasMore = (data || []).length > limit;
				const posts = hasMore ? (data || []).slice(0, limit) : (data || []);
				const nextCursor = hasMore && posts.length > 0 ? posts[posts.length - 1].id : null;
				
				supaPosts = posts.map((row: PostFromDB) => ({
					id: row.id,
					userId: row.user_email,
					text: row.text,
					createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
					likesCount: row.feed_likes?.length || 0,
					commentsCount: row.feed_comments?.length || 0,
					isLiked: userLikes.has(row.id)
				} as Post));
				
				// Return paginated result
				return {
					posts: supaPosts,
					nextCursor,
					hasMore
				};
			} catch (error) {
				console.error("listPostsWithCursor Supabase error:", error);
				// fall through to memory
			}
		}

		// Fallback to memory store with cursor simulation
		const memoryPosts = Array.from(memory.posts.values()).flat();
		let filteredPosts = memoryPosts.sort((a, b) => b.createdAt - a.createdAt);
		
		// Apply cursor filter if provided
		if (cursor) {
			const cursorIndex = filteredPosts.findIndex(p => p.id === cursor);
			if (cursorIndex >= 0) {
				filteredPosts = filteredPosts.slice(cursorIndex + 1);
			}
		}
		
		const hasMore = filteredPosts.length > limit;
		const posts = hasMore ? filteredPosts.slice(0, limit) : filteredPosts;
		const nextCursor = hasMore && posts.length > 0 ? posts[posts.length - 1].id : null;

		return {
			posts,
			nextCursor,
			hasMore
		};
	},

	// Backward compatibility wrapper
	async listAllPosts(currentUserId?: string, limit: number = 20) {
		const result = await this.listPostsWithCursor(currentUserId, limit);
		return result.posts;
	},

	// Time entries (server authoritative)
	async startTimeEntry(userId: string, taskId: string) {

		const supabase = getSupabaseAdmin();
		if (supabase) {
			let data: { id: string; task_id: string; start_time: string; end_time: string | null; duration_seconds: number | null; is_running: boolean } | null = null;
			try {
				// Stop any running entries for this task and user to ensure idempotency
				await supabase
					.from("time_entries")
					.update({ is_running: false, end_time: new Date().toISOString() })
					.eq("task_id", taskId)
					.eq("is_running", true);
				
				const result = await supabase
					.from("time_entries")
					.insert({ task_id: taskId, start_time: new Date().toISOString(), is_running: true })
					.select("id, task_id, start_time, end_time, duration_seconds, is_running")
					.single();
				
				if (result.error) {
					console.error("Supabase startTimeEntry error:", result.error);
					throw result.error;
				}
				data = result.data;

				
				// Invalidate cache for this task
				cache.delete(`time-summary:${taskId}`);
			} catch (error) {
				console.error("startTimeEntry failed:", error);
				throw error;
			}
			const entry = data;
			if (!entry) {
				throw new Error("No time entry data returned from Supabase");
			}
			return {
				id: entry.id,
				taskId: entry.task_id,
				userId,
				startedAt: entry.start_time ? new Date(entry.start_time as string).getTime() : Date.now(),
				stoppedAt: entry.end_time ? new Date(entry.end_time as string).getTime() : null,
				minutes: typeof entry.duration_seconds === "number"
					? Math.round(entry.duration_seconds / 60)
					: null,
				isRunning: Boolean(entry.is_running),
			} as TimeEntry;
		}
		const list = memory.timeEntries.get(taskId) || [];
		// stop previous
		for (const te of list) if (te.userId === userId && te.isRunning) { te.isRunning = false; te.stoppedAt = Date.now(); te.minutes = Math.max(1, Math.round(((te.stoppedAt - te.startedAt) / 1000) / 60)); }
		const te: TimeEntry = { id: id(), taskId, userId, startedAt: Date.now(), isRunning: true, stoppedAt: null, minutes: null };
		list.push(te);
		memory.timeEntries.set(taskId, list);
		return te;
	},

	async stopTimeEntry(userId: string, taskId: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			// find running entry for this user
			const { data: running } = await supabase
				.from("time_entries")
				.select("id, start_time")
				.eq("task_id", taskId)
				.eq("is_running", true)
				.order("start_time", { ascending: false })
				.limit(1);
			if (!running || running.length === 0) return null;
			const startedAt = new Date(running[0].start_time as string).getTime();
			const stoppedAt = Date.now();
			const durationSeconds = Math.max(1, Math.round((stoppedAt - startedAt) / 1000));
			const { data: updated, error } = await supabase
				.from("time_entries")
				.update({ is_running: false, end_time: new Date(stoppedAt).toISOString(), duration_seconds: durationSeconds })
				.eq("id", running[0].id)
				.select("id, task_id, start_time, end_time, duration_seconds, is_running")
				.single();
			if (error) throw error;
			
			// Invalidate cache for this task
			cache.delete(`time-summary:${taskId}`);
			
			return {
				id: updated!.id,
				taskId: updated!.task_id,
				userId,
				startedAt,
				stoppedAt: updated!.end_time ? new Date(updated!.end_time as string).getTime() : null,
				minutes: updated!.duration_seconds ? Math.round((updated!.duration_seconds as number) / 60) : Math.round(durationSeconds / 60),
				isRunning: Boolean(updated!.is_running),
			} as TimeEntry | null;
		}
		const list = memory.timeEntries.get(taskId) || [];
		const running = list.find((t) => t.userId === userId && t.isRunning);
		if (!running) return null;
		running.isRunning = false;
		running.stoppedAt = Date.now();
		running.minutes = Math.max(1, Math.round(((running.stoppedAt - running.startedAt) / 1000) / 60));
		return running;
	},

	async listTimeSummary(_userId: string, taskId: string) {
		const cacheKey = `time-summary:${taskId}`;
		const cached = getCached<{ totalSeconds: number; running: boolean; runningStartedAt?: number }>(cacheKey);
		if (cached) return cached;

		const supabase = getSupabaseAdmin();
		if (supabase) {
			const { data, error } = await supabase
				.from("time_entries")
				.select("start_time, end_time, duration_seconds, is_running")
				.eq("task_id", taskId);
			if (error) throw error;
			let base = 0;
			let runningStartedAt: number | null = null;
			for (const row of data || []) {
				const dur = (row.duration_seconds as number | null) || 0;
				const running = Boolean(row.is_running);
				if (running && row.start_time && !runningStartedAt) {
					runningStartedAt = new Date(row.start_time as string).getTime();
				}
				if (!running) base += dur;
			}
			const result = { totalSeconds: Math.max(0, Math.floor(base)), running: Boolean(runningStartedAt), runningStartedAt: runningStartedAt ?? undefined } as { totalSeconds: number; running: boolean; runningStartedAt?: number };
			setCache(cacheKey, result);
			return result;
		}
		// memory fallback
		const list = memory.timeEntries.get(taskId) || [];
		let base = 0;
		let runningStartedAt: number | undefined = undefined;
		for (const te of list) {
			if (te.isRunning && runningStartedAt === undefined) runningStartedAt = te.startedAt;
			if (!te.isRunning && te.minutes) base += te.minutes * 60;
		}
		const result = { totalSeconds: Math.max(0, Math.floor(base)), running: Boolean(runningStartedAt), runningStartedAt };
		setCache(cacheKey, result);
		return result;
	},

	async listProjectTimeSummary(_userId: string, projectId: string) {
		const supabase = getSupabaseAdmin();
		if (supabase) {
			const { data, error } = await supabase
				.from("time_entries")
				.select("start_time, end_time, duration_seconds, is_running, tasks!inner(project_id)")
				.eq("tasks.project_id", projectId);
			if (error) throw error;
			let base = 0;
			let runningStartedAt: number | null = null;
			for (const row of data || []) {
				const dur = (row.duration_seconds as number | null) || 0;
				const running = Boolean(row.is_running);
				if (running && row.start_time && !runningStartedAt) {
					runningStartedAt = new Date(row.start_time as string).getTime();
				}
				if (!running) base += dur;
			}
			return { totalSeconds: Math.max(0, Math.floor(base)), running: Boolean(runningStartedAt), runningStartedAt: runningStartedAt ?? undefined } as { totalSeconds: number; running: boolean; runningStartedAt?: number };
		}
		// memory fallback
		let base = 0;
		let runningStartedAt: number | undefined = undefined;
		for (const [taskId, list] of memory.timeEntries.entries()) {
			const t = memory.tasks.get(taskId);
			if (!t || t.projectId !== projectId) continue;
			for (const te of list) {
				if (te.isRunning && runningStartedAt === undefined) runningStartedAt = te.startedAt;
				if (!te.isRunning && te.minutes) base += te.minutes * 60;
			}
		}
		return { totalSeconds: Math.max(0, Math.floor(base)), running: Boolean(runningStartedAt), runningStartedAt };
	},

	async getClientFeedback(userId: string): Promise<ClientFeedback[]> {
		const supabase = getSupabaseAdmin();
		if (!supabase) {
			return [];
		}
		
		try {
			// First get user's project IDs
			const { data: userProjects, error: projectsError } = await supabase
				.from("projects")
				.select("id, name")
				.eq("user_email", userId);

			if (projectsError) {
				console.error("Error fetching user projects:", projectsError);
				return [];
			}

			if (!userProjects || userProjects.length === 0) {
				return []; // No projects, no feedback
			}

			const projectIds = userProjects.map(p => p.id);

			// Then get feedback for those projects
			const { data, error } = await supabase
				.from("client_feedback")
				.select(`
					id,
					project_id,
					client_name,
					client_email,
					rating,
					comment,
					created_at
				`)
				.in("project_id", projectIds)
				.order("created_at", { ascending: false });

			if (error) {
				console.error("Error fetching client feedback:", error);
				return [];
			}

			const result = (data || []).map((row: Record<string, unknown>) => {
				const project = userProjects.find(p => p.id === row.project_id);
				return {
					id: row.id as string,
					project_id: row.project_id as string,
					client_name: row.client_name as string,
					client_email: row.client_email as string | undefined,
					rating: row.rating as number,
					comment: row.comment as string | undefined,
					created_at: row.created_at as string,
					project: { name: project?.name || "Project" },
				};
			});

			return result;
		} catch (error) {
			console.error("Error in getClientFeedback:", error);
			return [];
		}
	},

	async getAllClientFeedback(userId: string): Promise<ClientFeedback[]> {
		// Alias to getClientFeedback for backward compatibility
		return this.getClientFeedback(userId);
	},
};

export type { Project, Task, Invoice, Profile, Post, ClientFeedback };
