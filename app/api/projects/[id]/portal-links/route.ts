import { NextRequest } from "next/server";
import { withAuth, handleError } from "@/app/api/_helpers/route";
import { compat } from "@/server/compat/flowlancer";

// GET /api/projects/[id]/portal-links - Get current share token
export async function GET(
	request: NextRequest,
	context: { params: Promise<{ id: string }> }
) {
	const { id: projectId } = await context.params;
	
	return withAuth(async (req, { userId }) => {
		try {
			const shareToken = await compat.getProjectShareToken(userId, projectId);
			
			// Get the base URL from the request for local development
			const requestUrl = new URL(request.url);
			const baseUrl = process.env.NODE_ENV === 'development' 
				? `${requestUrl.protocol}//${requestUrl.host}`
				: (process.env.NEXT_PUBLIC_APP_URL || `${requestUrl.protocol}//${requestUrl.host}`);
			
			return {
				shareToken,
				portalUrl: shareToken ? `${baseUrl}/portal/${shareToken}` : null
			};
		} catch (error) {
			return handleError(error);
		}
	})(request);
}

// POST /api/projects/[id]/portal-links - Generate new share token
export async function POST(
	request: NextRequest,
	context: { params: Promise<{ id: string }> }
) {
	const { id: projectId } = await context.params;
	
	return withAuth(async (req, { userId }) => {
		try {
			const shareToken = await compat.generateProjectShareToken(userId, projectId);
			
			// Get the base URL from the request for local development
			const requestUrl = new URL(request.url);
			const baseUrl = process.env.NODE_ENV === 'development' 
				? `${requestUrl.protocol}//${requestUrl.host}`
				: (process.env.NEXT_PUBLIC_APP_URL || `${requestUrl.protocol}//${requestUrl.host}`);
				
			const portalUrl = `${baseUrl}/portal/${shareToken}`;
			
			return {
				shareToken,
				portalUrl
			};
		} catch (error) {
			return handleError(error);
		}
	})(request);
}

// DELETE /api/projects/[id]/portal-links - Revoke share token
export async function DELETE(
	request: NextRequest,
	context: { params: Promise<{ id: string }> }
) {
	const { id: projectId } = await context.params;
	
	return withAuth(async (req, { userId }) => {
		try {
			await compat.revokeProjectShareToken(userId, projectId);
			
			return { success: true };
		} catch (error) {
			return handleError(error);
		}
	})(request);
}