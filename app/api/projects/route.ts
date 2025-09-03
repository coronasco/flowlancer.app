// import { NextResponse } from "next/server";
import { withAuth, withRateLimit } from "@/app/api/_helpers/route";
import { createProject, listProjects } from "@/server/modules/projects/repo";

export const GET = withAuth(async (_req: Request, { userId }) => {
	const projects = await listProjects(userId);
	return { projects };
}, ["projects:read"]);

export const POST = withAuth(async (req, { userId }) => {
	const body = await req.json();
	return withRateLimit(`createProject:${userId}`, async () => {
		const project = await createProject(userId, body);
		return { project };
	})();
}, ["projects:write"]);
