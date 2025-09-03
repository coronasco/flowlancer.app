import { withAuth } from "@/app/api/_helpers/route";
import { compat } from "@/server/compat/flowlancer";
import { z } from "zod";

export const dynamic = "force-dynamic";

const AddCommentSchema = z.object({
	text: z.string().min(1).max(300),
});

// GET /api/feed/posts/[id]/comments - Get comments for a post with pagination
export const GET = withAuth(async (req) => {
	try {
		const url = new URL(req.url);
		const id = url.pathname.split('/')[4]; // Extract post ID from URL
		const limit = parseInt(url.searchParams.get("limit") || "5");
		const offset = parseInt(url.searchParams.get("offset") || "0");
		
		const result = await compat.getPostComments(id, limit, offset);
		return result;
	} catch (e) {
		throw e;
	}
});

// POST /api/feed/posts/[id]/comments - Add a comment to a post
export const POST = withAuth(async (req, { userId }) => {
	try {
		const url = new URL(req.url);
		const id = url.pathname.split('/')[4]; // Extract post ID from URL
		const body = await req.json();
		const { text } = AddCommentSchema.parse(body);
		
		const comment = await compat.addComment(userId, id, text);
		return { comment };
	} catch (e) {
		throw e;
	}
});
