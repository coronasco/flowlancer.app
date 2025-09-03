import { withAuth } from "@/app/api/_helpers/route";
import { getFirebaseAdminApp } from "@/lib/auth/firebase-admin";

export const dynamic = "force-dynamic";

// POST /api/uploads/avatar-direct - Upload avatar directly to Firebase Storage
export const POST = withAuth(async (req, session) => {
	try {
		const formData = await req.formData();
		const file = formData.get("file") as File;
		const fileName = formData.get("fileName") as string;
		const contentType = formData.get("contentType") as string;

		if (!file || !fileName || !contentType) {
			throw new Error("Missing file, fileName, or contentType");
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			throw new Error("File too large. Max size is 5MB");
		}

		// Validate file type
		const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
		if (!allowedTypes.includes(contentType)) {
			throw new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed");
		}

		// Generate unique file path
		const timestamp = Date.now();
		const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
		const filePath = `avatars/${session.userId}/${timestamp}_${sanitizedFileName}`;

		// Try Firebase Storage first
		try {
			const adminApp = getFirebaseAdminApp();
			const { getStorage } = await import("firebase-admin/storage");
			const bucket = getStorage(adminApp).bucket();
			


			// Convert file to buffer
			const buffer = Buffer.from(await file.arrayBuffer());

			// Upload file to Firebase Storage
			const fileRef = bucket.file(filePath);
			await fileRef.save(buffer, {
				metadata: {
					contentType,
					metadata: {
						uploadedBy: session.userId,
						originalName: fileName,
					},
				},
			});

			// Make file publicly readable
			await fileRef.makePublic();

			// Generate public URL
			const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

			return {
				publicUrl,
				filePath,
			};
		} catch (firebaseError) {
			console.warn("Firebase Storage failed, falling back to Supabase:", firebaseError);
			
			// Fallback to Supabase Storage
			const { createClient } = await import("@supabase/supabase-js");
			const supabase = createClient(
				process.env.NEXT_PUBLIC_SUPABASE_URL!,
				process.env.SUPABASE_SERVICE_ROLE_KEY!
			);

			// Convert file to buffer
			const buffer = Buffer.from(await file.arrayBuffer());

			// Upload to Supabase Storage
			const { data, error } = await supabase.storage
				.from('avatars')
				.upload(filePath, buffer, {
					contentType,
					upsert: true,
				});

			if (error) {
				throw new Error(`Supabase upload failed: ${error.message}`);
			}

			// Get public URL
			const { data: urlData } = supabase.storage
				.from('avatars')
				.getPublicUrl(data.path);

			return {
				publicUrl: urlData.publicUrl,
				filePath: data.path,
			};
		}
	} catch (error) {
		console.error("Avatar upload error:", error);
		throw new Error((error as Error).message || "Failed to upload avatar");
	}
}, ["profile:write"]);
