import { withAuth } from "@/app/api/_helpers/route";
import { compat } from "@/server/compat/flowlancer";

export const dynamic = "force-dynamic";

// POST /api/feed/posts/[id]/likes - Like a post
export const POST = withAuth(async (req, { userId }) => {
	try {
		const url = new URL(req.url);
		const id = url.pathname.split('/')[4]; // Extract post ID from URL
		await compat.likePost(userId, id);
		return { success: true };
	} catch (e) {
		if ((e as Error).message === "Already liked") {
			throw new Error("Post already liked");
		}
		throw e;
	}
});

// DELETE /api/feed/posts/[id]/likes - Unlike a post
export const DELETE = withAuth(async (req, { userId }) => {
	try {
		const url = new URL(req.url);
		const id = url.pathname.split('/')[4]; // Extract post ID from URL
		await compat.unlikePost(userId, id);
		return { success: true };
	} catch (e) {
		throw e;
	}
});
