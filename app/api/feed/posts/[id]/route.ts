import { withAuth } from "@/app/api/_helpers/route";
import { compat } from "@/server/compat/flowlancer";
import { z } from "zod";

export const dynamic = "force-dynamic";

const UpdatePostSchema = z.object({
	text: z.string().min(1).max(500),
});

// PATCH /api/feed/posts/[id] - Update a post
export const PATCH = withAuth(async (req, { userId }) => {
	try {
		const url = new URL(req.url);
		const id = url.pathname.split('/')[4]; // Extract post ID from URL
		const body = await req.json();
		const { text } = UpdatePostSchema.parse(body);
		
		const post = await compat.updatePost(userId, id, text);
		return { post };
	} catch (e) {
		throw e;
	}
});

// DELETE /api/feed/posts/[id] - Delete a post
export const DELETE = withAuth(async (req, { userId }) => {
	try {
		const url = new URL(req.url);
		const id = url.pathname.split('/')[4]; // Extract post ID from URL
		
		await compat.deletePost(userId, id);
		return { success: true };
	} catch (e) {
		throw e;
	}
});
