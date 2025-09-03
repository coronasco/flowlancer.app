import { withRateLimit, withAuth } from "@/app/api/_helpers/route";
import { compat } from "@/server/compat/flowlancer";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

// POST /api/feed/posts - Create a new post (rate-limited)
export const POST = withAuth(async (req, session) => {
    const { text } = await req.json();
    return withRateLimit(`feed:create:${session.userId}`, async () => {
        const post = await compat.createPost(session.userId, text);
        logger.info({ where: "feed.create", userId: session.userId, postId: post.id }, "Feed post created");
        return { post };
    })();
}, ["feed:write"]);

// GET /api/feed/posts - List posts with cursor-based pagination
export const GET = withAuth(async (req, { userId }) => {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const cursor = searchParams.get('cursor'); // Post ID to start after
    
    // Limit to max 50 posts for performance
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    
    const result = await compat.listPostsWithCursor(userId, safeLimit, cursor);
    return {
        items: result.posts,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore
    };
}, ["feed:read"]);


