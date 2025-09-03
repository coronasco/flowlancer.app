import { withAuth } from "@/app/api/_helpers/route";
import { compat } from "@/server/compat/flowlancer";

export const dynamic = "force-dynamic";

// GET /api/profile/feedback - Get client feedback for user's projects
export const GET = withAuth(async (_req, session) => {
	try {
		const feedback = await compat.getAllClientFeedback(session.userId);
		return { feedback };
	} catch (error) {
		console.error("Error in feedback API:", error);
		throw error;
	}
});
