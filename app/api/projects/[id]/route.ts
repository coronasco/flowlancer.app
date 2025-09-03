// import { NextResponse } from "next/server";
import { withAuth, handleError } from "@/app/api/_helpers/route";
import { listProjects, updateProject, deleteProject } from "@/server/modules/projects/repo";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await ctx.params;
		return withAuth(async (_req, { userId }) => {
			const projects = await listProjects(userId);
			const project = projects.find((p) => p.id === id) ?? null;
			return { project };
		}, ["projects:read"])(req);
	} catch (e) {
		return handleError(e);
	}
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
	try {
		const body = await req.json();
		const { id } = await ctx.params;
		return withAuth(async (_req, { userId }) => {
			const project = await updateProject(userId, id, body);
			return { project };
		}, ["projects:write"])(req);
	} catch (e) {
		return handleError(e);
	}
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await ctx.params;
		return withAuth(async (_req, { userId }) => {
			await deleteProject(userId, id);
			return { deleted: true };
		}, ["projects:write"])(req);
	} catch (e) {
		return handleError(e);
	}
}
