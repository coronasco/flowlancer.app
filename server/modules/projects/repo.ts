import { compat } from "@/server/compat/flowlancer";
import { ProjectCreate, ProjectCreateSchema, TaskCreate, TaskCreateSchema, TaskStatusSchema } from "@/lib/schemas/projects";
import { AppError } from "@/lib/errors";

export async function createProject(userId: string, data: ProjectCreate) {
	const parsed = ProjectCreateSchema.safeParse(data);
	if (!parsed.success) throw new AppError("BAD_REQUEST", "Invalid data", 400);
	return compat.createProject(userId, parsed.data);
}

export async function listProjects(userId: string) {
	return compat.listProjects(userId);
}

export async function updateProject(userId: string, projectId: string, data: { name?: string }) {
	if (!data || (!data.name || data.name.trim().length === 0)) throw new AppError("BAD_REQUEST", "Invalid data", 400);
	return compat.updateProject(userId, projectId, { name: data.name!.trim() });
}

export async function deleteProject(userId: string, projectId: string) {
	return compat.deleteProject(userId, projectId);
}

export async function addTask(userId: string, projectId: string, data: TaskCreate) {
	const parsed = TaskCreateSchema.safeParse(data);
	if (!parsed.success) throw new AppError("BAD_REQUEST", "Invalid data", 400);
	return compat.addTask(userId, projectId, parsed.data);
}

export async function listTasks(userId: string, projectId: string) {
	return compat.listTasks(userId, projectId);
}

export async function updateTaskStatus(userId: string, projectId: string, taskId: string, status: unknown) {
	const parsed = TaskStatusSchema.safeParse(status);
	if (!parsed.success) throw new AppError("BAD_REQUEST", "Invalid status", 400);
	return compat.updateTaskStatus(userId, projectId, taskId, parsed.data);
}

export async function updateTask(userId: string, projectId: string, taskId: string, data: { title?: string; description?: string; estimateHours?: number }) {
	if (!data || (!data.title && !data.description && data.estimateHours === undefined)) {
		throw new AppError("BAD_REQUEST", "Invalid data", 400);
	}
	return compat.updateTask(userId, projectId, taskId, data);
}

export async function renameTask(userId: string, projectId: string, taskId: string, title: string) {
	if (!title || title.trim().length === 0) throw new AppError("BAD_REQUEST", "Invalid title", 400);
	return compat.renameTask(userId, projectId, taskId, title.trim());
}

export async function deleteTask(userId: string, projectId: string, taskId: string) {
	return compat.deleteTask(userId, projectId, taskId);
}
