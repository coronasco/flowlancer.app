// import { NextResponse } from "next/server";
import { withAuth, handleError } from "@/app/api/_helpers/route";
import { renameTask, deleteTask } from "@/server/modules/projects/repo";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
	try {
		const { taskId, title } = await req.json();
		const { id } = await ctx.params;
		return withAuth(async (_req, { userId }) => {
			const task = await renameTask(userId, id, taskId, title);
			return { task };
		}, ["tasks:write"])(req);
	} catch (e) {
		return handleError(e);
	}
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
	try {
		const { taskId } = await req.json();
		const { id } = await ctx.params;
		return withAuth(async (_req, { userId }) => {
			await deleteTask(userId, id, taskId);
			return { deleted: true };
		}, ["tasks:write"])(req);
	} catch (e) {
		return handleError(e);
	}
}
