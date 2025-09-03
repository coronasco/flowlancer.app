// Usage: <AvatarUpload currentAvatar={avatarUrl} onUpload={(url) => updateProfile(url)} />
"use client";

import { useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/Button";
import { useAvatarUploadClient } from "@/hooks/useAvatarUploadClient";
import { cn } from "@/lib/utils";

type AvatarUploadProps = {
	currentAvatar?: string;
	name?: string;
	onUpload: (publicUrl: string) => void;
	size?: "sm" | "md" | "lg";
	className?: string;
};

export function AvatarUpload({ 
	currentAvatar, 
	name = "User", 
	onUpload, 
	size = "lg",
	className 
}: AvatarUploadProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { uploadAvatar, isUploading } = useAvatarUploadClient();

	const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const result = await uploadAvatar(file);
		if (result) {
			onUpload(result.publicUrl);
		}

		// Clear input so same file can be selected again
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const sizeClasses = {
		sm: "h-16 w-16",
		md: "h-24 w-24", 
		lg: "h-32 w-32"
	};

	const buttonSizes = {
		sm: "h-6 w-6",
		md: "h-8 w-8",
		lg: "h-10 w-10"
	};

	return (
		<div className={cn("relative inline-block", className)}>
			<Avatar className={cn(sizeClasses[size], "ring-2 ring-white shadow-lg")}>
				<AvatarImage src={currentAvatar} alt={name} />
				<AvatarFallback className="text-lg font-medium">
					{name.charAt(0).toUpperCase()}
				</AvatarFallback>
			</Avatar>

			{/* Upload button overlay */}
			<Button
				onClick={handleUploadClick}
				disabled={isUploading}
				size="sm"
				className={cn(
					"absolute -bottom-1 -right-1 rounded-full p-0 shadow-lg border-2 border-white",
					buttonSizes[size]
				)}
				aria-label="Upload avatar"
			>
				{isUploading ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<Camera className="h-4 w-4" />
				)}
			</Button>

			{/* Hidden file input */}
			<input
				ref={fileInputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp"
				onChange={handleFileSelect}
				className="hidden"
				disabled={isUploading}
			/>
		</div>
	);
}
