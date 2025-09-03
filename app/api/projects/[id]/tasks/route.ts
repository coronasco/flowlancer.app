// import { NextResponse } from "next/server";
import { withAuth, handleError, withRateLimit } from "@/app/api/_helpers/route";
import { addTask, listTasks, updateTask } from "@/server/modules/projects/repo";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await ctx.params;
		return withAuth(async (_req, { userId }) => {
			const tasks = await listTasks(userId, id);
			return { tasks };
		}, ["tasks:read"])(req);
	} catch (e) {
		return handleError(e);
	}
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
	try {
		const body = await req.json();
		const { id } = await ctx.params;
		return withAuth(async (_req, { userId }) => {
			return withRateLimit(`addTask:${userId}:${id}`, async () => {
				const task = await addTask(userId, id, body);
				return { task };
			})();
		}, ["tasks:write"])(req);
	} catch (e) {
		return handleError(e);
	}
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
	try {
		const { taskId, title, description, estimateHours } = await req.json();
		const { id } = await ctx.params;
		
		return withAuth(async (_req, { userId }) => {
			const task = await updateTask(userId, id, taskId, {
				title,
				description,
				estimateHours
			});
			return { task };
		}, ["tasks:write"])(req);
	} catch (e) {
		return handleError(e);
	}
}
