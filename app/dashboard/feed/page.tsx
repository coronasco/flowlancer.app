"use client";

import { Button } from "@/components/ui/Button";
import { useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useSession } from "@/contexts/SessionContext";

import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  TrendingUp, 
  Users,
  DollarSign, 
  Clock,
  Star,
  MessageCircle,
  Heart,
  MoreHorizontal,
  Pencil,
  Trash2
} from "lucide-react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

type Ok<T> = { ok: true; data: T };
type Err = { ok: false; error: { message?: string } };
type ApiEnvelope<T> = Ok<T> | Err;

type Post = { id: string; userId: string; text: string; createdAt: number; userAvatarUrl?: string; likesCount?: number; commentsCount?: number; isLiked?: boolean };
type Comment = { id: string; postId: string; userId: string; text: string; createdAt: number; userAvatarUrl?: string };

async function api<T>(url: string, init?: RequestInit, user?: { getIdToken: () => Promise<string> }): Promise<T> {
	const headers: Record<string, string> = { "Content-Type": "application/json" };
	if (init?.headers) {
		Object.assign(headers, init.headers);
	}
	
	// Add Firebase auth token if user is available
	if (user) {
		try {
			const token = await user.getIdToken();
			headers["Authorization"] = `Bearer ${token}`;
		} catch (error) {
			console.error("Failed to get Firebase token:", error);
		}
	}
	
	const res = await fetch(url, { ...init, headers });
	const json = (await res.json()) as ApiEnvelope<T>;
	if (!("ok" in json) || json.ok === false) {
		const msg = json && "error" in json ? json.error?.message : undefined;
		throw new Error(msg || "Request failed");
	}
	return json.data;
}

export default function FeedPage() {
	const { user } = useSession();
	const qc = useQueryClient();
	const [text, setText] = useState("");
	const [avatarUrl, setAvatarUrl] = useState<string>("");
	const [name, setName] = useState("");
	
	// Posts loaded with infinite pagination for performance
	const { 
		data: postsData, 
		isLoading: loadingPosts, 
		fetchNextPage, 
		hasNextPage, 
		isFetchingNextPage 
	} = useInfiniteQuery({
		queryKey: ["posts", "infinite"],
		queryFn: ({ pageParam = null }) => api<{ items: Post[]; nextCursor?: string; hasMore: boolean }>(
			`/api/feed/posts?limit=10${pageParam ? `&cursor=${pageParam}` : ''}`, 
			undefined, 
			user || undefined
		),
		getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
		initialPageParam: null as string | null,
		enabled: !!user,
		staleTime: 30_000, // Cache for 30 seconds
	});
	
	// Flatten all pages into a single posts array
	const posts = postsData?.pages.flatMap(page => page.items) || [];

	const isLoading = loadingPosts;


	// Load user profile data from Firestore
	useEffect(() => {
		if (!user) return;
		const loadProfile = async () => {
			try {
				const { getFirestore, doc, getDoc } = await import("firebase/firestore");
				const db = getFirestore();
				const docSnap = await getDoc(doc(db, "customers", user.uid));
				if (docSnap.exists()) {
					const data = docSnap.data();
					setName(data.name || "");
					setAvatarUrl(data.avatarUrl || user.photoURL || "");
				}
			} catch (error) {
				console.error("Error loading profile:", error);
			}
		};
		loadProfile();
	}, [user]);

	const { mutate: post } = useMutation({
		mutationFn: () => api<{ post: { id: string } }>("/api/feed/posts", { method: "POST", body: JSON.stringify({ text }) }, user || undefined),
		onSuccess: () => { 
			toast.success("Posted"); 
			setText(""); 
			// Invalidate infinite posts query to refresh feed
			qc.invalidateQueries({ queryKey: ["posts", "infinite"] }); 
		},
		onError: (e: unknown) => toast.error((e as Error).message || "Failed"),
	});

	const { mutate: likePost } = useMutation({
		mutationFn: (postId: string) => api(`/api/feed/posts/${postId}/likes`, { method: "POST" }, user || undefined),
		onMutate: async (postId: string) => {
			// Cancel any outgoing refetches for infinite query
			await qc.cancelQueries({ queryKey: ["posts", "infinite"] });
			
			// Snapshot the previous infinite query data
			const previousData = qc.getQueryData(["posts", "infinite"]);
			
			// Optimistically update the infinite query data
			qc.setQueryData(["posts", "infinite"], (old: { pages?: Array<{ items: Array<Record<string, unknown>> }> } | undefined) => {
				if (!old?.pages) return old;
				
				return {
					...old,
					pages: old.pages.map((page: { items: Array<Record<string, unknown>> }) => ({
						...page,
						items: page.items.map((post: Record<string, unknown>) => 
							post.id === postId 
								? { ...post, isLiked: true, likesCount: Number(post.likesCount || 0) + 1 }
								: post
						)
					}))
				};
			});
			
			return { previousData };
		},
		onError: (err, postId, context) => {
			// If the mutation fails, use the context to roll back
			if (context?.previousData) {
				qc.setQueryData(["posts", "infinite"], context.previousData);
			}
			toast.error((err as Error).message || "Failed to like");
		},
		onSettled: () => {
			qc.invalidateQueries({ queryKey: ["posts", "infinite"] });
		},
	});

	const { mutate: unlikePost } = useMutation({
		mutationFn: (postId: string) => api(`/api/feed/posts/${postId}/likes`, { method: "DELETE" }, user || undefined),
		onMutate: async (postId: string) => {
			// Cancel any outgoing refetches for infinite query
			await qc.cancelQueries({ queryKey: ["posts", "infinite"] });
			
			// Snapshot the previous infinite query data
			const previousData = qc.getQueryData(["posts", "infinite"]);
			
					// Optimistically update the infinite query data
		qc.setQueryData(["posts", "infinite"], (old: { pages?: Array<{ items: Array<Record<string, unknown>> }> } | undefined) => {
			if (!old?.pages) return old;
			
			return {
				...old,
				pages: old.pages.map((page: { items: Array<Record<string, unknown>> }) => ({
					...page,
					items: page.items.map((post: Record<string, unknown>) =>
						post.id === postId 
							? { ...post, isLiked: false, likesCount: Math.max(0, Number(post.likesCount || 0) - 1) }
							: post
					)
				}))
			};
		});
			
			return { previousData };
		},
		onError: (err, postId, context) => {
			// If the mutation fails, use the context to roll back
			if (context?.previousData) {
				qc.setQueryData(["posts", "infinite"], context.previousData);
			}
			toast.error((err as Error).message || "Failed to unlike");
		},
		onSettled: () => {
			qc.invalidateQueries({ queryKey: ["posts", "infinite"] });
		},
	});

	const { mutate: addComment } = useMutation({
		mutationFn: ({ postId, text }: { postId: string; text: string }) => 
			api<{ comment: Comment }>(`/api/feed/posts/${postId}/comments`, { method: "POST", body: JSON.stringify({ text }) }, user || undefined),
		onSuccess: (_, { postId }) => { 
			// Invalidate both posts and comments for real-time updates
			qc.invalidateQueries({ queryKey: ["posts", "infinite"] }); 
			qc.invalidateQueries({ queryKey: ["comments", postId] }); 
		},
		onError: (e: unknown) => toast.error((e as Error).message || "Failed to comment"),
	});

	const { mutate: editPost } = useMutation({
		mutationFn: ({ postId, text }: { postId: string; text: string }) => 
			api(`/api/feed/posts/${postId}`, { method: "PATCH", body: JSON.stringify({ text }) }, user || undefined),
		onSuccess: () => { 
			qc.invalidateQueries({ queryKey: ["posts", "infinite"] });
			toast.success("Post updated");
		},
		onError: (e: unknown) => toast.error((e as Error).message || "Failed to update post"),
	});

	const { mutate: deletePost } = useMutation({
		mutationFn: (postId: string) => 
			api(`/api/feed/posts/${postId}`, { method: "DELETE" }, user || undefined),
		onSuccess: () => { 
			qc.invalidateQueries({ queryKey: ["posts", "infinite"] });
			toast.success("Post deleted");
		},
		onError: (e: unknown) => toast.error((e as Error).message || "Failed to delete post"),
	});



	return (
		<div className="min-h-screen bg-white">
			{/* Header Section - Full Width */}
			<div className="border-b border-slate-100 bg-white">
				<div className="py-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-semibold text-slate-900">Community Feed</h1>
							<p className="text-slate-600 mt-1">Connect with fellow freelancers and share your journey</p>
						</div>

					</div>
				</div>
			</div>

			{/* Main Content - 2 Columns */}
			<div className="py-8">
				<div className="grid lg:grid-cols-3 gap-8">
					{/* Left Column - Feed */}
					<div className="lg:col-span-2 space-y-6">
						{/* Post Composer */}
						<div className="bg-white border border-slate-100 rounded-lg p-6">
							<div className="flex items-start gap-4">
								<Avatar className="h-10 w-10">
									{avatarUrl && <AvatarImage src={avatarUrl} alt={name || "User"} />}
									<AvatarFallback className="bg-slate-100 text-slate-600">
										{name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<textarea 
										value={text} 
										onChange={(e) => setText(e.target.value)} 
										placeholder="Share an update, milestone, ask for advice, or add useful links..." 
										className="w-full min-h-[120px] p-4 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
										maxLength={500}
									/>
									<div className="flex items-center justify-between mt-4">
										<div className="flex items-center gap-2 text-xs text-slate-500">
											<span>Share your wins, challenges, insights, or helpful resources</span>
											<span className={`ml-2 ${text.length > 450 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
												{text.length}/500
											</span>
										</div>
										<Button 
											onClick={() => text.trim() && post()} 
											disabled={!text.trim() || text.length > 500}
											className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:bg-slate-400"
										>
											<Plus className="h-4 w-4 mr-2" />
											Post
										</Button>
									</div>
								</div>
							</div>
						</div>

						{/* Posts */}
						{isLoading ? (
							<div className="space-y-6">
								{Array.from({ length: 3 }).map((_, i) => (
									<div key={i} className="bg-white border border-slate-100 rounded-lg p-6">
										<div className="flex items-start gap-4">
											<Skeleton className="h-10 w-10 rounded-full" />
											<div className="flex-1 space-y-3">
												<div className="flex items-center gap-2">
													<Skeleton className="h-4 w-24" />
													<Skeleton className="h-3 w-16" />
												</div>
												<Skeleton className="h-4 w-full" />
												<Skeleton className="h-4 w-4/5" />
												<Skeleton className="h-4 w-3/5" />
												<div className="flex items-center gap-4 pt-3 mt-4 border-t border-slate-100">
													<Skeleton className="h-4 w-12" />
													<Skeleton className="h-4 w-16" />
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						) : posts.length === 0 ? (
							<div className="bg-white border border-slate-100 rounded-lg p-12 text-center">
								<div className="text-slate-400 mb-4">
									<MessageCircle className="h-12 w-12 mx-auto" />
								</div>
								<h3 className="text-lg font-medium text-slate-900 mb-2">No posts yet</h3>
								<p className="text-slate-500 text-sm">Be the first to share an update with the community!</p>
							</div>
						) : (
							<>
								<ErrorBoundary 
									onReset={() => qc.invalidateQueries({ queryKey: ["posts", "infinite"] })}
								>
									<div className="space-y-4">
										{posts.map((p) => (
											<PostCard 
												key={p.id}
												post={p}
												currentUser={user}
												onLike={() => p.isLiked ? unlikePost(p.id) : likePost(p.id)}
												onComment={(text: string) => addComment({ postId: p.id, text })}
												onEdit={(newText: string) => editPost({ postId: p.id, text: newText })}
												onDelete={() => deletePost(p.id)}
											/>
										))}
									</div>
								</ErrorBoundary>
								{hasNextPage && (
									<div className="text-center">
										<Button 
											onClick={() => fetchNextPage()}
											variant="outline"
											disabled={isFetchingNextPage}
										>
											{isFetchingNextPage ? "Loading..." : "Load more posts"}
										</Button>
									</div>
								)}
							</>
						)}
					</div>

					{/* Right Column - Sidebar */}
					<div className="space-y-6">


						{/* Trending Topics - Real Data */}
						<TrendingTopics posts={posts} />

						{/* Community Insights */}
						<CommunityInsights posts={posts} />

						{/* Freelancer Tips */}
						<FreelancerTips />
					</div>
				</div>
			</div>
		</div>
	);
}

function CommentButton({ postId, commentsCount, onComment, isExpanded }: { postId: string; commentsCount: number; onComment: (text: string) => void; isExpanded?: boolean }) {
	const [showComments, setShowComments] = useState(isExpanded || false);
	const [commentText, setCommentText] = useState("");
	const [userAvatars, setUserAvatars] = useState<Map<string, string>>(new Map());
	const [userNames, setUserNames] = useState<Map<string, string>>(new Map());
	const { user } = useSession();
	const qc = useQueryClient();

	// Query for all comments loaded so far
	const { data: commentsData, isLoading: loadingComments, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<{ comments: Comment[]; total: number; hasMore: boolean }>({
		queryKey: ["comments", postId],
		queryFn: ({ pageParam = 0 }) => api<{ comments: Comment[]; total: number; hasMore: boolean }>(
			`/api/feed/posts/${postId}/comments?limit=5&offset=${pageParam}`, 
			undefined, 
			user || undefined
		),
		getNextPageParam: (lastPage, pages) => {
			if (lastPage.hasMore) {
				return pages.length * 5; // Calculate next offset
			}
			return undefined;
		},
		initialPageParam: 0,
		enabled: showComments && !!user,
		staleTime: 30000,
	});

	const allComments = useMemo(() => 
		commentsData?.pages.flatMap(page => page.comments) || [], 
		[commentsData?.pages]
	);

	// Load avatars for comment users
	const uniqueUserEmails = useMemo(() => 
		[...new Set(allComments.map(c => c.userId))], 
		[allComments]
	);

	useEffect(() => {
		const loadCommentUserData = async () => {
			if (uniqueUserEmails.length > 0 && user) {
				try {
					const { getFirestore, query, collection, where, getDocs } = await import("firebase/firestore");
					const db = getFirestore();
					
					const newAvatars = new Map(userAvatars);
					const newNames = new Map(userNames);
					
					for (const userEmail of uniqueUserEmails) {
						if (!newAvatars.has(userEmail) && userEmail) {
							const usersQuery = query(collection(db, "customers"), where("email", "==", userEmail));
							const querySnapshot = await getDocs(usersQuery);
							
							if (!querySnapshot.empty) {
								const userData = querySnapshot.docs[0].data();
								if (userData.avatarUrl) {
									newAvatars.set(userEmail, userData.avatarUrl);
								}
								if (userData.name) {
									newNames.set(userEmail, userData.name);
								}
							}
						}
					}
					
					setUserAvatars(newAvatars);
					setUserNames(newNames);
				} catch (error) {
					console.error("Error loading comment user data:", error);
				}
			}
		};
		loadCommentUserData();
	}, [uniqueUserEmails, user, userAvatars, userNames]);

	return (
		<div className="flex flex-col">
			{!isExpanded && (
				<button 
					onClick={() => setShowComments(!showComments)}
					className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-500 transition-colors"
				>
					<MessageCircle className="h-4 w-4" />
					<span>{commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}</span>
				</button>
			)}
			
			{(showComments || isExpanded) && (
				<div className="mt-3 space-y-3">
					{/* Comment Input */}
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<input
								type="text"
								placeholder="Add a comment..."
								value={commentText}
								onChange={(e) => setCommentText(e.target.value)}
								className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
								maxLength={300}
								onKeyDown={(e) => {
									if (e.key === 'Enter' && commentText.trim() && commentText.length <= 300) {
										onComment(commentText.trim());
										setCommentText("");
										// Invalidate comments to show new one
										qc.invalidateQueries({ queryKey: ["comments", postId] });
									}
								}}
							/>
							<button
								onClick={() => {
									if (commentText.trim() && commentText.length <= 300) {
										onComment(commentText.trim());
										setCommentText("");
										// Invalidate comments to show new one
										qc.invalidateQueries({ queryKey: ["comments", postId] });
									}
								}}
								disabled={!commentText.trim() || commentText.length > 300}
								className="px-3 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 disabled:opacity-50 transition-colors"
							>
								Post
							</button>
						</div>
						{commentText.length > 0 && (
							<div className="flex justify-end px-1">
								<span className={`text-xs ${commentText.length > 270 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
									{commentText.length}/300
								</span>
							</div>
						)}
					</div>

					{/* Comments List */}
					{loadingComments ? (
						<div className="space-y-3">
							{Array.from({ length: 2 }).map((_, i) => (
								<div key={i} className="flex items-start gap-3 py-2">
									<Skeleton className="h-7 w-7 rounded-full" />
									<div className="flex-1 space-y-2">
										<div className="flex items-center gap-2">
											<Skeleton className="h-3 w-16" />
											<Skeleton className="h-3 w-12" />
										</div>
										<Skeleton className="h-3 w-full" />
										<Skeleton className="h-3 w-3/4" />
									</div>
								</div>
							))}
						</div>
					) : allComments.length > 0 ? (
						<div className="space-y-2">
							{allComments.map((comment) => {
								const userName = userNames.get(comment.userId) || "";
								const displayName = userName || comment.userId?.split("@")[0] || "user";
								const initial = (displayName[0] || "U").toUpperCase();
								const avatarUrl = userAvatars.get(comment.userId) || "";
								return (
									<div key={comment.id} className="flex items-start gap-2 py-2">
										<Avatar className="h-7 w-7">
											{avatarUrl ? (
												<AvatarImage src={avatarUrl} alt={displayName} />
											) : null}
											<AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-medium">
												{initial}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<span className="text-sm font-medium text-slate-900">{displayName}</span>
												<span className="text-xs text-slate-500">
													{new Date(comment.createdAt).toLocaleDateString('en-US', {
														day: 'numeric',
														month: 'short',
														hour: '2-digit',
														minute: '2-digit'
													})}
												</span>
											</div>
											<p className="text-sm text-slate-700 leading-relaxed">{comment.text}</p>
										</div>
									</div>
								);
							})}
							
							{/* Load More Button */}
							{hasNextPage && (
								<div className="pt-2 border-t border-slate-100">
									<button
										onClick={() => fetchNextPage()}
										disabled={isFetchingNextPage}
										className="text-sm text-slate-600 hover:text-slate-900 font-medium disabled:opacity-50 transition-colors"
									>
										{isFetchingNextPage ? "Loading..." : "Load more comments..."}
									</button>
								</div>
							)}
						</div>
					) : (
						<p className="text-sm text-slate-500 italic">No comments yet.</p>
					)}
				</div>
			)}
		</div>
	);
}

function PostCard({ 
	post, 
	currentUser, 
	onLike, 
	onComment, 
	onEdit, 
	onDelete 
}: { 
	post: Post; 
	currentUser: { email?: string | null; getIdToken?: () => Promise<string> } | null; 
	onLike: () => void; 
	onComment: (text: string) => void;
	onEdit: (text: string) => void;
	onDelete: () => void;
}) {
	const [showDropdown, setShowDropdown] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editText, setEditText] = useState(post.text);
	const [showComments, setShowComments] = useState(false);
	const [userAvatar, setUserAvatar] = useState<string>("");
	const [userName, setUserName] = useState<string>("");

	const displayName = userName || post.userId?.split("@")[0] || "user";
	const initial = (displayName[0] || "U").toUpperCase();
	const isOwner = currentUser?.email === post.userId;

	// Load user data from Firestore
	useEffect(() => {
		const loadUserData = async () => {
			if (post.userId && currentUser) {
				try {
					const { getFirestore, query, collection, where, getDocs } = await import("firebase/firestore");
					const db = getFirestore();
					
					// Find user by email
					const usersQuery = query(collection(db, "customers"), where("email", "==", post.userId));
					const querySnapshot = await getDocs(usersQuery);
					
					if (!querySnapshot.empty) {
						const userDoc = querySnapshot.docs[0];
						const userData = userDoc.data();
						if (userData.avatarUrl) {
							setUserAvatar(userData.avatarUrl);
						}
						if (userData.name) {
							setUserName(userData.name);
						}
					}
				} catch (error) {
					console.error("Error loading user data:", error);
				}
			}
		};
		loadUserData();
	}, [post.userId, currentUser]);

	const handleEdit = () => {
		onEdit(editText);
		setIsEditing(false);
		setShowDropdown(false);
	};

	const handleDelete = () => {
		if (confirm('Are you sure you want to delete this post?')) {
			onDelete();
		}
		setShowDropdown(false);
	};

	return (
		<div className="border border-slate-100 p-6 rounded-lg bg-white hover:shadow-md transition-all duration-200">
			{/* Header */}
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center gap-3">
					<Avatar className="h-10 w-10">
						{userAvatar ? (
							<AvatarImage src={userAvatar} alt={displayName} />
						) : null}
						<AvatarFallback className="bg-slate-100 text-slate-600 font-medium">
							{initial}
						</AvatarFallback>
					</Avatar>
					<div>
						<h4 className="font-medium text-slate-900">{displayName}</h4>
						<p className="text-xs text-slate-500">
							{new Date(post.createdAt).toLocaleDateString('en-US', {
								day: 'numeric',
								month: 'short',
								hour: '2-digit',
								minute: '2-digit'
							})}
						</p>
					</div>
				</div>

				{/* Owner Actions Dropdown */}
				{isOwner && (
					<div className="relative">
						<button 
							onClick={() => setShowDropdown(!showDropdown)}
							className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
						>
							<MoreHorizontal className="h-4 w-4 text-slate-400" />
						</button>
						
						{showDropdown && (
							<div className="absolute right-0 top-8 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
								<button
									onClick={() => {
										setIsEditing(true);
										setShowDropdown(false);
									}}
									className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 rounded-t-lg"
								>
									<Pencil className="h-3 w-3" />
									Edit
								</button>
								<hr className="border-slate-100" />
								<button
									onClick={handleDelete}
									className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
								>
									<Trash2 className="h-3 w-3" />
									Delete
								</button>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Content */}
			<div className="mb-4">
				{isEditing ? (
					<div className="space-y-3">
						<textarea
							value={editText}
							onChange={(e) => setEditText(e.target.value)}
							className="w-full p-3 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
							rows={3}
							placeholder="Share your thoughts, insights, or helpful links..."
							maxLength={500}
						/>
						<div className="flex items-center justify-between">
							<span className={`text-xs ${editText.length > 450 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
								{editText.length}/500
							</span>
							<div className="flex items-center gap-2">
								<button
									onClick={() => {
										setIsEditing(false);
										setEditText(post.text);
									}}
									className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={handleEdit}
									disabled={!editText.trim() || editText.length > 500}
									className="px-3 py-1.5 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors"
								>
									Save
								</button>
							</div>
						</div>
					</div>
				) : (
					<div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
						{post.text.split(/(\bhttps?:\/\/[^\s]+|\bwww\.[^\s]+|\b[\w.-]+\.(?:com|org|net|edu|gov|io|co|uk|de|fr|it|es|ca|au|jp|cn|ru|br|in|mx|nl|se|no|dk|fi|pl|cz|at|ch|be|pt|gr|tr|il|za|eg|ma|ae|sa|kr|tw|th|vn|ph|sg|my|id|hk|nz)\b[^\s]*)/gi).map((part, index) => {
							// Check if it's a URL
							const isUrl = part.match(/^https?:\/\//i) || part.match(/^www\./i) || part.match(/^[\w.-]+\.(?:com|org|net|edu|gov|io|co|uk|de|fr|it|es|ca|au|jp|cn|ru|br|in|mx|nl|se|no|dk|fi|pl|cz|at|ch|be|pt|gr|tr|il|za|eg|ma|ae|sa|kr|tw|th|vn|ph|sg|my|id|hk|nz)\b/i);
							
							if (isUrl) {
								let href = part;
								if (!part.match(/^https?:\/\//i)) {
									href = `https://${part}`;
								}
								
								return (
									<a 
										key={index}
										href={href} 
										target="_blank" 
										rel="noopener noreferrer"
										className="text-blue-600 hover:text-blue-800 underline break-all"
									>
										{part}
									</a>
								);
							}
							
							return part;
						})}
					</div>
				)}
			</div>

			{/* Actions */}
			<div className="flex items-center justify-between pt-3 border-t border-slate-100">
				<div className="flex items-center gap-4">
					<button 
						onClick={onLike}
						className={`flex items-center gap-1.5 text-sm transition-colors ${
							post.isLiked 
								? 'text-red-500' 
								: 'text-slate-500 hover:text-red-500'
						}`}
					>
						<Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
						<span>{post.likesCount || 0}</span>
					</button>
					
					<button 
						onClick={() => setShowComments(!showComments)}
						className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-500 transition-colors"
					>
						<MessageCircle className="h-4 w-4" />
						<span>{post.commentsCount || 0}</span>
					</button>
				</div>
			</div>

			{/* Comments Section */}
			{showComments && (
				<div className="mt-4 pt-4 border-t border-slate-100">
					<CommentButton 
						postId={post.id} 
						commentsCount={post.commentsCount || 0} 
						onComment={onComment}
						isExpanded={true}
					/>
				</div>
			)}
		</div>
	);
}

// Extract hashtags from posts
function extractHashtags(posts: Post[]): { tag: string; count: number }[] {
	const hashtagCounts = new Map<string, number>();
	
	posts.forEach(post => {
		const hashtags = post.text.match(/#[\w]+/g) || [];
		hashtags.forEach(tag => {
			const normalizedTag = tag.toLowerCase();
			hashtagCounts.set(normalizedTag, (hashtagCounts.get(normalizedTag) || 0) + 1);
		});
	});
	
	return Array.from(hashtagCounts.entries())
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 5);
}

function TrendingTopics({ posts }: { posts: Post[] }) {
	const hashtags = extractHashtags(posts);
	
	// Add some default trending topics for freelancers if no hashtags found
	const defaultTopics = [
		{ tag: "#RemoteWork", count: Math.floor(Math.random() * 50) + 20 },
		{ tag: "#WebDev", count: Math.floor(Math.random() * 40) + 15 },
		{ tag: "#FreelanceTips", count: Math.floor(Math.random() * 35) + 10 },
		{ tag: "#ClientWork", count: Math.floor(Math.random() * 30) + 8 },
		{ tag: "#Productivity", count: Math.floor(Math.random() * 25) + 5 }
	];
	
	const topics = hashtags.length > 0 ? hashtags : defaultTopics;
	
	return (
		<div className="bg-white border border-slate-100 rounded-lg p-6">
			<h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
				<TrendingUp className="h-4 w-4" />
				Trending Topics
			</h3>
			<div className="space-y-3">
				{topics.map((topic, index) => (
					<div key={topic.tag} className="flex items-center justify-between py-2 hover:bg-slate-50 rounded-lg px-2 cursor-pointer transition-colors">
						<div className="flex items-center gap-2">
							<div className="text-xs font-medium text-slate-400">#{index + 1}</div>
							<div>
								<div className="text-sm font-medium text-slate-900">{topic.tag}</div>
								<div className="text-xs text-slate-500">{topic.count} posts</div>
							</div>
						</div>
						<div className="text-xs text-slate-400">↗</div>
					</div>
				))}
			</div>
		</div>
	);
}

function CommunityInsights({ posts }: { posts: Post[] }) {
	const totalPosts = posts.length;
	const totalLikes = posts.reduce((sum, post) => sum + (post.likesCount || 0), 0);
	const totalComments = posts.reduce((sum, post) => sum + (post.commentsCount || 0), 0);
	const activeUsers = new Set(posts.map(p => p.userId)).size;
	
	const postsThisWeek = posts.filter(post => 
		Date.now() - post.createdAt < 7 * 24 * 60 * 60 * 1000
	).length;
	
	return (
		<div className="bg-white border border-slate-100 rounded-lg p-6">
			<h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
				<Users className="h-4 w-4" />
				Community Stats
			</h3>
			<div className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div className="text-center p-3 bg-blue-50 rounded-lg">
						<div className="text-lg font-bold text-blue-600">{totalPosts}</div>
						<div className="text-xs text-blue-600">Total Posts</div>
					</div>
					<div className="text-center p-3 bg-green-50 rounded-lg">
						<div className="text-lg font-bold text-green-600">{activeUsers}</div>
						<div className="text-xs text-green-600">Active Users</div>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div className="text-center p-3 bg-red-50 rounded-lg">
						<div className="text-lg font-bold text-red-600">{totalLikes}</div>
						<div className="text-xs text-red-600">Total Likes</div>
					</div>
					<div className="text-center p-3 bg-purple-50 rounded-lg">
						<div className="text-lg font-bold text-purple-600">{totalComments}</div>
						<div className="text-xs text-purple-600">Comments</div>
					</div>
				</div>
				<div className="text-center pt-2 border-t border-slate-100">
					<div className="text-sm text-slate-600">
						<span className="font-medium text-amber-600">{postsThisWeek}</span> posts this week
					</div>
				</div>
			</div>
		</div>
	);
}

function FreelancerTips() {
	const tips = [
		{
			icon: DollarSign,
			title: "Set Clear Rates",
			description: "Always discuss pricing upfront to avoid conflicts later.",
			color: "green"
		},
		{
			icon: Clock,
			title: "Track Your Time",
			description: "Use time tracking tools to optimize productivity and billing.",
			color: "blue"
		},
		{
			icon: Users,
			title: "Build Relationships",
			description: "Focus on long-term client relationships over one-time projects.",
			color: "purple"
		},
		{
			icon: Star,
			title: "Ask for Reviews",
			description: "Always request feedback and testimonials from satisfied clients.",
			color: "amber"
		}
	];
	
	return (
		<div className="bg-white border border-slate-100 rounded-lg p-6">
			<h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
				<Star className="h-4 w-4" />
				Freelancer Tips
			</h3>
			<div className="space-y-4">
				{tips.map((tip, index) => {
					const Icon = tip.icon;
					const colorClasses = {
						green: "bg-green-100 text-green-600",
						blue: "bg-blue-100 text-blue-600", 
						purple: "bg-purple-100 text-purple-600",
						amber: "bg-amber-100 text-amber-600"
					}[tip.color];
					
					return (
						<div key={index} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
							<div className={`p-2 rounded-lg flex-shrink-0 ${colorClasses}`}>
								<Icon className="h-4 w-4" />
							</div>
							<div className="min-w-0">
								<div className="text-sm font-medium text-slate-900">{tip.title}</div>
								<div className="text-xs text-slate-500 leading-relaxed">{tip.description}</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}