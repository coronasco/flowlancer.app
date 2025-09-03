// import { NextResponse } from "next/server";
import { withAuth, handleError, withRateLimit } from "@/app/api/_helpers/route";
import { updateTaskStatus } from "@/server/modules/projects/repo";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
	try {
		const { taskId, status } = await req.json();
		const { id } = await ctx.params;
		return withAuth(async (_req, { userId }) => {
			return withRateLimit(`moveTask:${userId}:${id}`, async () => {
				const task = await updateTaskStatus(userId, id, taskId, status);
				return { task };
			})();
		}, ["tasks:write"])(req);
	} catch (e) {
		return handleError(e);
	}
}
