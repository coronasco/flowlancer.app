// Usage: const { uploadAvatar, isUploading } = useAvatarUploadClient();
"use client";

import { useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import { toast } from "sonner";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/auth/firebase";

type UploadResult = {
	publicUrl: string;
	filePath: string;
};

export function useAvatarUploadClient() {
	const { user } = useSession();
	const [isUploading, setIsUploading] = useState(false);

	const uploadAvatar = async (file: File): Promise<UploadResult | null> => {
		if (!user?.email) {
			toast.error("You must be logged in to upload");
			return null;
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			toast.error("File too large. Max size is 5MB");
			return null;
		}

		// Validate file type
		const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
		if (!allowedTypes.includes(file.type)) {
			toast.error("Invalid file type. Only JPEG, PNG, and WebP are allowed");
			return null;
		}

		setIsUploading(true);

		try {
			// Use FormData to send file to our API
			const formData = new FormData();
			formData.append('file', file);
			formData.append('fileName', file.name);
			formData.append('contentType', file.type);

			const res = await fetch("/api/uploads/avatar-direct", {
				method: "POST",
				headers: {
					"x-user-email": user.email || "",
				},
				body: formData,
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error?.message || "Upload failed");
			}

			const result = await res.json();
			const { publicUrl, filePath } = result.data;
			
			// Update Firestore with new avatar URL
			await setDoc(
				doc(db, "customers", user.uid), 
				{ avatarUrl: publicUrl, updated_at: serverTimestamp() }, 
				{ merge: true }
			);

			toast.success("Avatar uploaded successfully");
			return { publicUrl, filePath };

		} catch (error) {
			console.error("Upload error:", error);
			toast.error(error instanceof Error ? error.message : "Upload failed");
			return null;
		} finally {
			setIsUploading(false);
		}
	};

	return {
		uploadAvatar,
		isUploading,
	};
}
