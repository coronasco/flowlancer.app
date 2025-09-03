// Usage: const { uploadAvatar, isUploading } = useAvatarUpload();
"use client";

import { useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import { toast } from "sonner";

type UploadResult = {
	publicUrl: string;
	filePath: string;
};

export function useAvatarUpload() {
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
			// Get signed upload URL
			const response = await fetch("/api/uploads/avatar", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-user-email": user.email,
				},
				body: JSON.stringify({
					fileName: file.name,
					contentType: file.type,
				}),
			});

			const result = await response.json();
			if (!result.ok) {
				throw new Error(result.error?.message || "Failed to get upload URL");
			}

			const { uploadUrl, publicUrl, filePath } = result.data;

			// Upload file to signed URL
			const uploadResponse = await fetch(uploadUrl, {
				method: "PUT",
				headers: {
					"Content-Type": file.type,
				},
				body: file,
			});

			if (!uploadResponse.ok) {
				throw new Error(`Failed to upload file: ${uploadResponse.status} ${uploadResponse.statusText}`);
			}

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
