import { withAuth } from "@/app/api/_helpers/route";
import { getFirebaseAdminApp } from "@/lib/auth/firebase-admin";

export const dynamic = "force-dynamic";

// POST /api/uploads/avatar - Generate signed upload URL for avatar
export const POST = withAuth(async (req, session) => {
	const { fileName, contentType } = await req.json();
	
	// Validate file type
	const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
	if (!allowedTypes.includes(contentType)) {
		throw new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
	}
	
	// Validate file name
	if (!fileName || typeof fileName !== "string") {
		throw new Error("Invalid file name");
	}
	
	// Generate unique file path
	const timestamp = Date.now();
	const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
	const filePath = `avatars/${session.userId}/${timestamp}_${sanitizedFileName}`;
	
	try {
		// Get Firebase Admin storage
		const adminApp = getFirebaseAdminApp();
		const { getStorage } = await import("firebase-admin/storage");
		const bucket = getStorage(adminApp).bucket();
		
		// Generate signed upload URL (valid for 15 minutes)
		const file = bucket.file(filePath);
		const [signedUrl] = await file.getSignedUrl({
			version: "v4",
			action: "write",
			expires: Date.now() + 15 * 60 * 1000, // 15 minutes
			contentType,
		});
		
		// Generate the public download URL (will be available after upload)
		const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
		
		return {
			uploadUrl: signedUrl,
			publicUrl,
			filePath,
		};
	} catch (error) {
		console.error("Error generating signed URL:", error);
		throw new Error("Failed to generate upload URL");
	}
}, ["profile:write"]);
