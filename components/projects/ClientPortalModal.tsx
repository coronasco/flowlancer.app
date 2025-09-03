// Usage: <ClientPortalModal projectId={project.id} />
"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ExternalLink, Copy, Trash2, Plus, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/contexts/SessionContext";

type ClientPortalModalProps = {
	projectId: string;
};

export function ClientPortalModal({ projectId }: ClientPortalModalProps) {
	const { user } = useSession();
	const [isOpen, setIsOpen] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [isRevoking, setIsRevoking] = useState(false);
	const [shareToken, setShareToken] = useState<string | null>(null);
	const [portalUrl, setPortalUrl] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const loadShareToken = useCallback(async () => {
		if (!user) return;
		
		setLoading(true);
		try {
			const token = await user.getIdToken();
			const response = await fetch(`/api/projects/${projectId}/portal-links`, {
				headers: { 
					"Authorization": `Bearer ${token}`
				}
			});
			
			if (!response.ok) {
				throw new Error("Failed to load share token");
			}
			
			const result = await response.json();
			if (result.ok) {
				setShareToken(result.data.shareToken);
				setPortalUrl(result.data.portalUrl);
			}
		} catch (error) {
			console.error("Error loading share token:", error);
		} finally {
			setLoading(false);
		}
	}, [user, projectId]);

	// Load existing share token on modal open
	useEffect(() => {
		if (isOpen && user) {
			loadShareToken();
		}
	}, [isOpen, user, projectId, loadShareToken]);

	const generateLink = async () => {
		if (!user) return;
		
		setIsGenerating(true);
		try {
			const token = await user.getIdToken();
			const response = await fetch(`/api/projects/${projectId}/portal-links`, {
				method: "POST",
				headers: { 
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`
				}
			});
			
			if (!response.ok) {
				throw new Error("Failed to generate link");
			}
			
			const result = await response.json();
			if (result.ok) {
				setShareToken(result.data.shareToken);
				setPortalUrl(result.data.portalUrl);
				toast.success("Portal link generated successfully");
			}
		} catch (error) {
			console.error("Error generating link:", error);
			toast.error("Failed to generate portal link");
		} finally {
			setIsGenerating(false);
		}
	};

	const copyToClipboard = () => {
		if (portalUrl) {
			navigator.clipboard.writeText(portalUrl);
			toast.success("Link copied to clipboard");
		}
	};

	const revokeLink = async () => {
		if (!user || !shareToken) return;
		
		setIsRevoking(true);
		try {
			const token = await user.getIdToken();
			const response = await fetch(`/api/projects/${projectId}/portal-links`, {
				method: "DELETE",
				headers: { 
					"Authorization": `Bearer ${token}`
				}
			});
			
			if (!response.ok) {
				throw new Error("Failed to revoke link");
			}
			
			const result = await response.json();
			if (result.ok) {
				setShareToken(null);
				setPortalUrl(null);
				toast.success("Portal link revoked successfully");
			}
		} catch (error) {
			console.error("Error revoking link:", error);
			toast.error("Failed to revoke link");
		} finally {
			setIsRevoking(false);
		}
	};

	const openPortal = () => {
		if (portalUrl) {
			window.open(portalUrl, "_blank");
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<ExternalLink className="h-4 w-4 mr-2" />
					Client Portal
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Client Portal</DialogTitle>
				</DialogHeader>
				
				<div className="space-y-6">
					<p className="text-sm text-gray-600">
						Share a secure portal link with your client to track project progress, leave comments, and provide feedback.
					</p>
					
					{loading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-6 w-6 animate-spin text-gray-600" />
							<span className="ml-2 text-gray-600">Loading...</span>
						</div>
					) : shareToken ? (
						/* Existing Portal Link */
						<Card className="p-4">
							<div className="space-y-4">
								<div className="flex items-center gap-2">
									<Badge className="bg-green-100 text-green-800">Active</Badge>
									<span className="text-sm text-gray-500">Portal link is active</span>
								</div>
								
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Portal URL
									</label>
									<div className="font-mono text-sm text-gray-600 bg-gray-50 p-3 rounded border">
										{portalUrl}
									</div>
								</div>
								
								<div className="flex items-center gap-3">
									<Button
										onClick={openPortal}
										className="flex items-center gap-2"
									>
										<Eye className="h-4 w-4" />
										Open Portal
									</Button>
									<Button
										variant="outline"
										onClick={copyToClipboard}
										className="flex items-center gap-2"
									>
										<Copy className="h-4 w-4" />
										Copy Link
									</Button>
									<Button
										variant="outline"
										onClick={revokeLink}
										disabled={isRevoking}
										className="flex items-center gap-2 text-red-600 hover:text-red-800"
									>
										{isRevoking ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<Trash2 className="h-4 w-4" />
										)}
										{isRevoking ? "Revoking..." : "Revoke Link"}
									</Button>
								</div>
							</div>
						</Card>
					) : (
						/* Generate New Link */
						<Card className="p-4">
							<div className="text-center space-y-4">
								<div>
									<ExternalLink className="h-12 w-12 mx-auto mb-4 text-gray-400" />
									<h3 className="font-medium text-gray-900 mb-2">No Portal Link Generated</h3>
									<p className="text-sm text-gray-600">
										Create a secure portal link for your client to track project progress, 
										comment on tasks, and provide feedback once the project is completed.
									</p>
								</div>
								
								<Button 
									onClick={generateLink} 
									disabled={isGenerating}
									className="flex items-center gap-2"
								>
									{isGenerating ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Generating...
										</>
									) : (
										<>
											<Plus className="h-4 w-4" />
											Generate Portal Link
										</>
									)}
								</Button>
							</div>
						</Card>
					)}
					
					{/* Portal Features */}
					<div className="bg-blue-50 p-4 rounded-lg">
						<h4 className="font-medium text-blue-900 mb-2">What clients can do:</h4>
						<ul className="text-sm text-blue-800 space-y-1">
							<li>• View real-time project progress and task status</li>
							<li>• Leave comments on specific tasks or the project</li>
							<li>• Provide feedback and ratings when project is completed</li>
							<li>• Track time spent on each task</li>
							<li>• Monitor project milestones and completion</li>
						</ul>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
