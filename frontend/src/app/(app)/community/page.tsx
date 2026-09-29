"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  TextArea,
  Spinner,
  Chip,
} from "@/components/ui";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  MessageSquare,
  Send,
  Pencil,
  Trash2,
  Lock,
  Heart,
  Bookmark,
  Share2,
  Check,
  Image as ImageIcon,
  X,
  Film,
} from "lucide-react";
import { tweetsApi } from "@/lib/api/tweets";
import { likesApi } from "@/lib/api/likes";
import { commentsApi } from "@/lib/api/comments";
import { useAuth } from "@/contexts/AuthContext";
import type { Tweet, User } from "@/lib/types";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";

// Recursively counts all top-level comments and all nested sub-comments
function countAllComments(items: any[]): number {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((total: number, item: any) => {
    const nestedCount =
      item.replies && Array.isArray(item.replies)
        ? countAllComments(item.replies)
        : 0;
    return total + 1 + nestedCount;
  }, 0);
}

function CommentItem({ comment, currentUser, replyingTo, setReplyingTo, replyMutation }: any) {
  const { data: likesData } = useQuery({
    queryKey: ["comment-likes", comment._id],
    queryFn: () => likesApi.getCommentLikes(comment._id),
  });

  const isLiked = likesData?.data?.docs?.some((like: any) => like.likedBy === currentUser?._id || like.owner?._id === currentUser?._id) ?? false;
  const likeCount = likesData?.data?.likeCount ?? 0;

  const queryClient = useQueryClient();
  const likeMutation = useMutation({
    mutationFn: () => likesApi.toggleCommentLike(comment._id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["comment-likes", comment._id] });
      const previousLikes = queryClient.getQueryData(["comment-likes", comment._id]);
      queryClient.setQueryData(["comment-likes", comment._id], (old: any) => {
        if (!old) return old;
        const wasLiked = old.data?.docs?.some((like: any) => like.likedBy === currentUser?._id || like.owner?._id === currentUser?._id);
        const newDocs = wasLiked
          ? (old.data?.docs || []).filter((l: any) => l.likedBy !== currentUser?._id && l.owner?._id !== currentUser?._id)
          : [...(old.data?.docs || []), { likedBy: currentUser?._id }];
        return { ...old, data: { ...old.data, likeCount: wasLiked ? Math.max(0, (old.data?.likeCount || 1) - 1) : (old.data?.likeCount || 0) + 1, docs: newDocs } };
      });
      return { previousLikes };
    },
    onError: (err: any, variables: any, context: any) => {
      if (context?.previousLikes) queryClient.setQueryData(["comment-likes", comment._id], context.previousLikes);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["comment-likes", comment._id] }),
  });

  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState(false);
  const replies = comment.replies || [];
  const hasReplies = replies.length > 0;
  const isReplying = replyingTo === comment._id;
  const showThread = hasReplies || isReplying;

  // Show up to 2 sub-comments by default; if more, provide "see more..."
  const maxInitialReplies = 2;
  const visibleReplies = expandedReplies
    ? replies
    : replies.slice(0, maxInitialReplies);
  const hiddenRepliesCount = Math.max(0, replies.length - maxInitialReplies);

  return (
    <div className="relative">
      {/* Continuous vertical connecting line from parent avatar down through sub-comments */}
      {showThread && (
        <div className="absolute left-[15px] top-8 bottom-3 w-[2px] bg-zinc-700/60 dark:bg-zinc-700/60 rounded-full pointer-events-none" />
      )}

      {/* Main Comment Row */}
      <div className="relative flex gap-3 items-start">
        <UserAvatar
          user={comment.owner}
          className="w-8 h-8 rounded-full shrink-0 relative z-10 ring-2 ring-[var(--color-surface)]"
          animate="always"
        />

        <div className="flex-1 min-w-0 pb-1">
          {/* Comment Bubble */}
          <div className="bg-[var(--color-surface-2)] p-3 rounded-2xl rounded-tl-sm border border-[var(--color-border)]/70 shadow-sm">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <span className="font-semibold text-xs text-[var(--color-text-primary)]">
                {comment.owner?.fullName || "User"}
              </span>
              <span className="text-[10px] text-[var(--color-text-tertiary)] shrink-0">
                {formatTime(comment.createdAt)}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap leading-relaxed">
              {comment.content}
            </p>
          </div>

          {/* Action bar: Likes, Reply, and Sub-comments Count */}
          <div className="flex items-center gap-4 mt-1.5 ml-2 text-xs font-medium text-[var(--color-text-tertiary)]">
            <button
              onClick={() => likeMutation.mutate()}
              className={`flex items-center gap-1 transition-colors ${
                isLiked ? "text-red-400" : "hover:text-red-400"
              }`}
            >
              <Heart size={12} className={isLiked ? "fill-current" : ""} />
              <span>{likeCount}</span>
            </button>
            <button
              onClick={() => setReplyingTo(isReplying ? null : comment._id)}
              className="hover:text-[var(--color-accent)] transition-colors cursor-pointer"
            >
              Reply
            </button>
            {replies.length > 0 && (
              <span className="text-[11px] text-[var(--color-text-tertiary)] font-normal flex items-center gap-1">
                • {replies.length} {replies.length === 1 ? "reply" : "replies"}
              </span>
            )}
          </div>

          {/* Reply Input Box */}
          {isReplying && (
            <div className="flex gap-2 mt-3 mb-2">
              <UserAvatar
                user={currentUser}
                className="w-6 h-6 rounded-full shrink-0 mt-1"
                animate="always"
              />
              <div className="flex-1 flex flex-col gap-2">
                <TextArea
                  value={replyContent}
                  onValueChange={setReplyContent}
                  placeholder="Write a reply..."
                  minRows={1}
                  maxRows={4}
                  classNames={{
                    inputWrapper:
                      "min-h-[32px] bg-[var(--color-surface)] border border-[var(--color-border)] focus-within:border-[var(--color-accent)] rounded-xl px-3 py-1.5",
                    input: "text-xs",
                  }}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    radius="full"
                    variant="light"
                    onPress={() => setReplyingTo(null)}
                    className="text-[10px] h-6 px-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    radius="full"
                    isLoading={replyMutation.isPending}
                    isDisabled={!replyContent.trim()}
                    onPress={() => {
                      replyMutation.mutate({
                        commentId: comment._id,
                        content: replyContent,
                      });
                      setReplyContent("");
                    }}
                    className="bg-[var(--color-accent)] text-[#09090B] font-semibold text-[10px] h-6 px-3"
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub-comments (Replies) Tree with Connecting Lines */}
      {hasReplies && (
        <div className="relative ml-[15px] pl-6 pt-2 space-y-3">
          {visibleReplies.map((reply: any) => (
            <ReplyItem
              key={reply._id}
              reply={reply}
              currentUser={currentUser}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyMutation={replyMutation}
            />
          ))}

          {/* If more than 2 sub-comments: 'see more replies' */}
          {replies.length > maxInitialReplies && (
            <div className="relative pt-1">
              {!expandedReplies ? (
                <button
                  type="button"
                  onClick={() => setExpandedReplies(true)}
                  className="relative flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-accent)] hover:underline ml-2 py-0.5 cursor-pointer"
                >
                  {/* Branch connector hook to 'see more' button */}
                  <div className="absolute -left-6 top-2.5 w-6 h-2.5 border-l-2 border-b-2 border-zinc-700/60 dark:border-zinc-700/60 rounded-bl-lg pointer-events-none" />
                  <span>
                    ↪ View {hiddenRepliesCount} more {hiddenRepliesCount === 1 ? "reply" : "replies"}...
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setExpandedReplies(false)}
                  className="relative flex items-center gap-1.5 text-[10px] font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] ml-2 py-0.5 cursor-pointer"
                >
                  <span>Show fewer replies</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReplyItem({
  reply,
  currentUser,
  replyingTo,
  setReplyingTo,
  replyMutation,
  depth = 1,
}: {
  reply: any;
  currentUser: User | null;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyMutation: any;
  depth?: number;
}) {
  const { data: likesData } = useQuery({
    queryKey: ["comment-likes", reply._id],
    queryFn: () => likesApi.getCommentLikes(reply._id),
  });

  const isLiked =
    likesData?.data?.docs?.some(
      (like: any) =>
        like.likedBy === currentUser?._id || like.owner?._id === currentUser?._id
    ) ?? false;
  const likeCount = likesData?.data?.likeCount ?? 0;

  const queryClient = useQueryClient();
  const likeMutation = useMutation({
    mutationFn: () => likesApi.toggleCommentLike(reply._id),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["comment-likes", reply._id],
      });
      const previousLikes = queryClient.getQueryData([
        "comment-likes",
        reply._id,
      ]);
      queryClient.setQueryData(
        ["comment-likes", reply._id],
        (old: any) => {
          if (!old) return old;
          const wasLiked = old.data?.docs?.some(
            (like: any) =>
              like.likedBy === currentUser?._id ||
              like.owner?._id === currentUser?._id
          );
          const newDocs = wasLiked
            ? (old.data?.docs || []).filter(
                (l: any) =>
                  l.likedBy !== currentUser?._id &&
                  l.owner?._id !== currentUser?._id
              )
            : [
                ...(old.data?.docs || []),
                { likedBy: currentUser?._id },
              ];
          return {
            ...old,
            data: {
              ...old.data,
              likeCount: wasLiked
                ? Math.max(0, (old.data?.likeCount || 1) - 1)
                : (old.data?.likeCount || 0) + 1,
              docs: newDocs,
            },
          };
        }
      );
      return { previousLikes };
    },
    onError: (err: any, variables: any, context: any) => {
      if (context?.previousLikes)
        queryClient.setQueryData(
          ["comment-likes", reply._id],
          context.previousLikes
        );
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ["comment-likes", reply._id],
      }),
  });

  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState(false);
  const isReplying = replyingTo === reply._id;
  const nestedReplies = reply.replies || [];
  const hasNestedReplies = nestedReplies.length > 0;
  const maxInitialReplies = 2;
  const visibleNestedReplies = expandedReplies
    ? nestedReplies
    : nestedReplies.slice(0, maxInitialReplies);
  const hiddenNestedCount = Math.max(0, nestedReplies.length - maxInitialReplies);

  return (
    <div className="relative">
      {/* If this reply has nested replies, draw the vertical line down from this avatar */}
      {(hasNestedReplies || isReplying) && (
        <div className="absolute left-[13px] top-7 bottom-3 w-[2px] bg-zinc-700/60 dark:bg-zinc-700/60 rounded-full pointer-events-none" />
      )}

      <div className="relative flex gap-2.5 items-start group">
        {/* Curved branch line connecting directly from parent's vertical line to this reply avatar */}
        <div className="absolute -left-6 top-3.5 w-6 h-3.5 border-l-2 border-b-2 border-zinc-700/60 dark:border-zinc-700/60 rounded-bl-xl pointer-events-none" />

        <UserAvatar
          user={reply.owner}
          className="w-7 h-7 rounded-full shrink-0 mt-0.5 relative z-10 ring-2 ring-[var(--color-surface)]"
          animate="always"
        />
        <div className="flex-1 min-w-0">
          <div className="bg-[var(--color-surface)] p-2.5 rounded-2xl rounded-tl-sm border border-[var(--color-border)]/60 shadow-sm">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <span className="font-semibold text-[11px] text-[var(--color-text-primary)]">
                {reply.owner?.fullName || "User"}
              </span>
              <span className="text-[9px] text-[var(--color-text-tertiary)] shrink-0">
                {formatTime(reply.createdAt)}
              </span>
            </div>
            <p className="text-[11px] text-[var(--color-text-secondary)] whitespace-pre-wrap leading-relaxed">
              {reply.content}
            </p>
          </div>

          <div className="flex gap-4 mt-1 ml-2 text-[10px] font-medium text-[var(--color-text-tertiary)] items-center">
            <button
              onClick={() => likeMutation.mutate()}
              className={`flex items-center gap-1 transition-colors ${
                isLiked ? "text-red-400" : "hover:text-red-400"
              }`}
            >
              <Heart size={10} className={isLiked ? "fill-current" : ""} />
              <span>{likeCount}</span>
            </button>
            <button
              onClick={() => {
                setReplyingTo(isReplying ? null : reply._id);
                setReplyContent("");
              }}
              className="hover:text-[var(--color-accent)] transition-colors cursor-pointer"
            >
              Reply
            </button>
            {nestedReplies.length > 0 && (
              <span className="text-[10px] text-[var(--color-text-tertiary)] font-normal flex items-center gap-1">
                • {nestedReplies.length} {nestedReplies.length === 1 ? "reply" : "replies"}
              </span>
            )}
          </div>

          {/* Reply input box for replying to this sub-comment */}
          {isReplying && (
            <div className="flex gap-2 mt-2 mb-2">
              <UserAvatar
                user={currentUser}
                className="w-5 h-5 rounded-full shrink-0 mt-1"
                animate="always"
              />
              <div className="flex-1 flex flex-col gap-2">
                <TextArea
                  value={replyContent}
                  onValueChange={setReplyContent}
                  placeholder={`Reply to @${reply.owner?.username || "user"}...`}
                  minRows={1}
                  maxRows={4}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (replyContent.trim()) {
                        replyMutation.mutate({
                          commentId: reply._id,
                          content: replyContent.trim(),
                        });
                        setReplyContent("");
                      }
                    }
                  }}
                  classNames={{
                    inputWrapper:
                      "min-h-[30px] bg-[var(--color-surface)] border border-[var(--color-border)] focus-within:border-[var(--color-accent)] rounded-xl px-2.5 py-1",
                    input: "text-xs",
                  }}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    radius="full"
                    variant="light"
                    onPress={() => {
                      setReplyingTo(null);
                      setReplyContent("");
                    }}
                    className="text-[10px] h-6 px-2.5"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    radius="full"
                    isLoading={replyMutation.isPending}
                    isDisabled={!replyContent.trim()}
                    onPress={() => {
                      replyMutation.mutate({
                        commentId: reply._id,
                        content: replyContent.trim(),
                      });
                      setReplyContent("");
                    }}
                    className="bg-[var(--color-accent)] text-[#09090B] font-semibold text-[10px] h-6 px-3"
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render Nested Replies recursively */}
      {hasNestedReplies && (
        <div className="relative ml-[13px] pl-5 pt-2 space-y-2.5">
          {visibleNestedReplies.map((nested: any) => (
            <ReplyItem
              key={nested._id}
              reply={nested}
              currentUser={currentUser}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyMutation={replyMutation}
              depth={depth + 1}
            />
          ))}

          {nestedReplies.length > maxInitialReplies && (
            <div className="relative pt-0.5">
              {!expandedReplies ? (
                <button
                  type="button"
                  onClick={() => setExpandedReplies(true)}
                  className="relative flex items-center gap-1.5 text-[10px] font-semibold text-[var(--color-accent)] hover:underline ml-2 py-0.5 cursor-pointer"
                >
                  <div className="absolute -left-5 top-2.5 w-5 h-2.5 border-l-2 border-b-2 border-zinc-700/60 dark:border-zinc-700/60 rounded-bl-lg pointer-events-none" />
                  <span>
                    ↪ View {hiddenNestedCount} more {hiddenNestedCount === 1 ? "reply" : "replies"}...
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setExpandedReplies(false)}
                  className="relative flex items-center gap-1.5 text-[9px] font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] ml-2 py-0.5 cursor-pointer"
                >
                  <span>Show fewer replies</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CommentsSection({
  tweetId,
  currentUser,
}: {
  tweetId: string;
  currentUser: User | null;
}) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["tweet-comments", tweetId],
    queryFn: () => commentsApi.getTweetComments(tweetId),
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => commentsApi.addComment(tweetId, content),
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["tweet-comments", tweetId] });
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) => commentsApi.addSubComment(commentId, content),
    onSuccess: () => {
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: ["tweet-comments", tweetId] });
    },
  });

  const comments: any[] = data?.data?.docs || [];

  // Total comment count includes top-level comments and all their nested sub-comments
  const totalCommentsAndRepliesCount = countAllComments(comments);

  // Show at least 7 comments by default; if more, see more...
  const maxInitialComments = 7;
  const visibleComments = expandedComments
    ? comments
    : comments.slice(0, maxInitialComments);
  const hiddenCommentsCount = Math.max(0, comments.length - maxInitialComments);

  return (
    <div className="mt-4 pt-4 border-t border-[var(--color-border)]/60">
      {/* Header with Comments Count */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] flex items-center gap-1.5">
          <MessageSquare size={13} className="text-[var(--color-accent)]" />
          <span>Comments ({totalCommentsAndRepliesCount})</span>
        </h4>
        {comments.length > maxInitialComments && (
          <span className="text-[11px] text-[var(--color-text-tertiary)]">
            Showing {visibleComments.length} of {comments.length}
          </span>
        )}
      </div>

      {/* Add Comment Input */}
      <div className="flex gap-3 mb-6">
        <UserAvatar
          user={currentUser}
          className="w-8 h-8 rounded-full shrink-0"
          animate="always"
        />
        <div className="flex-1 flex flex-col gap-2">
          <TextArea
            value={newComment}
            onValueChange={setNewComment}
            placeholder="Write a comment..."
            minRows={1}
            maxRows={4}
            classNames={{
              inputWrapper:
                "min-h-[40px] bg-[var(--color-surface-2)] border-transparent focus-within:border-[var(--color-accent)] rounded-xl px-3 py-2",
              input: "text-xs",
            }}
          />
          {newComment.trim() && (
            <div className="flex justify-end">
              <Button
                size="sm"
                radius="full"
                isLoading={commentMutation.isPending}
                onPress={() => commentMutation.mutate(newComment)}
                className="bg-[var(--color-accent)] text-[#09090B] font-semibold text-[11px] h-7 px-4 shadow-sm"
              >
                Comment
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex justify-center p-4">
          <Spinner size="sm" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-[var(--color-text-tertiary)] text-center py-2">
          No comments yet. Start the conversation!
        </p>
      ) : (
        <div className="space-y-5">
          {visibleComments.map((comment: any) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              currentUser={currentUser}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyMutation={replyMutation}
            />
          ))}

          {/* See more comments pagination control */}
          {comments.length > maxInitialComments && (
            <div className="pt-2">
              {!expandedComments ? (
                <button
                  type="button"
                  onClick={() => setExpandedComments(true)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-[var(--color-surface-2)]/70 hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-accent)] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <MessageSquare size={14} />
                  <span>
                    See {hiddenCommentsCount} more {hiddenCommentsCount === 1 ? "comment" : "comments"}... (View all {comments.length})
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setExpandedComments(false)}
                  className="w-full py-2 text-xs font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-all text-center cursor-pointer"
                >
                  Show fewer comments
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function TweetCard({
  tweet,
  currentUser,
  onEdit,
  onDelete,
}: {
  tweet: Tweet;
  currentUser: User | null;
  onEdit: (tweet: Tweet) => void;
  onDelete: (tweetId: string) => void;
}) {
  const owner = typeof tweet.owner === "object" ? tweet.owner : null;
  const isOwner =
    currentUser &&
    (typeof tweet.owner === "string"
      ? tweet.owner === currentUser._id
      : tweet.owner._id === currentUser._id);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showComments, setShowComments] = useState(true);

  // Fetch real likes from endpoint
  const { data: likesData, refetch: refetchLikes } = useQuery({
    queryKey: ["tweet-likes", tweet._id],
    queryFn: () => likesApi.getTweetLikes(tweet._id),
  });

  // Fetch real comments from endpoint to get count
  const { data: commentsData } = useQuery({
    queryKey: ["tweet-comments", tweet._id],
    queryFn: () => commentsApi.getTweetComments(tweet._id),
  });

  const isLiked = likesData?.data?.docs?.some((like: any) => like.likedBy === currentUser?._id || like.owner?._id === currentUser?._id) ?? false;
  const likeCount = likesData?.data?.likeCount ?? 0;
  
  // Calculate total comments + all nested sub-comments from real MongoDB data
  const commentsList: any[] = commentsData?.data?.docs || [];
  const commentsCount = countAllComments(commentsList);

  const queryClient = useQueryClient();
  const likeMutation = useMutation({
    mutationFn: () => likesApi.toggleTweetLike(tweet._id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["tweet-likes", tweet._id] });
      const previousLikes = queryClient.getQueryData(["tweet-likes", tweet._id]);
      
      queryClient.setQueryData(["tweet-likes", tweet._id], (old: any) => {
        if (!old) return old;
        const wasLiked = old.data?.docs?.some((like: any) => like.likedBy === currentUser?._id || like.owner?._id === currentUser?._id);
        const newDocs = wasLiked 
          ? (old.data?.docs || []).filter((l: any) => l.likedBy !== currentUser?._id && l.owner?._id !== currentUser?._id)
          : [...(old.data?.docs || []), { likedBy: currentUser?._id }];
        
        return {
          ...old,
          data: {
            ...old.data,
            likeCount: wasLiked ? Math.max(0, (old.data?.likeCount || 1) - 1) : (old.data?.likeCount || 0) + 1,
            docs: newDocs
          }
        };
      });
      return { previousLikes };
    },
    onError: (err, variables, context) => {
      if (context?.previousLikes) {
        queryClient.setQueryData(["tweet-likes", tweet._id], context.previousLikes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tweet-likes", tweet._id] });
    }
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <article className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-hover)] transition-all duration-150">
      <div className="flex items-start gap-3.5">
        <UserAvatar
          user={owner}
          className="w-9 h-9 rounded-full shrink-0 mt-0.5"
          animate="always"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              {owner && (
                <Link
                  href={`/channel/${owner.username}`}
                  className="font-semibold text-sm text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors truncate"
                >
                  {owner.fullName}
                </Link>
              )}
              {owner && (
                <span className="text-xs text-[var(--color-text-tertiary)] truncate">
                  @{owner.username}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-[var(--color-text-tertiary)]">
                {formatTime(tweet.createdAt)}
              </span>
              {isOwner && (
                <div className="flex items-center gap-1">
                  <Button
                    isIconOnly
                    size="sm"
                    radius="full"
                    variant="light"
                    onPress={() => onEdit(tweet)}
                    aria-label="Edit tweet"
                    className="min-w-0 w-8 h-8 rounded-full text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)]"
                  >
                    <Pencil size={13} />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    radius="full"
                    variant="light"
                    onPress={() => onDelete(tweet._id)}
                    aria-label="Delete tweet"
                    className="min-w-0 w-8 h-8 rounded-full text-[var(--color-text-tertiary)] hover:text-red-400"
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap mb-3">
            {tweet.content}
          </p>

          {/* Tweet Media Attachment (image or video) */}
          {tweet.media?.url && (
            <div className="mt-2 mb-3 rounded-2xl overflow-hidden border border-[var(--color-border)] bg-black/20">
              {tweet.media.type === "video" || /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(tweet.media.url) ? (
                <video
                  src={tweet.media.url}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full max-h-[480px] object-contain rounded-2xl bg-black"
                />
              ) : (
                <img
                  src={tweet.media.url}
                  alt="Post attachment"
                  loading="lazy"
                  className="w-full max-h-[500px] object-cover rounded-2xl cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => window.open(tweet.media?.url, "_blank")}
                />
              )}
            </div>
          )}

          {/* Social Media Actions */}
          <div className="flex items-center gap-5 mt-2 pt-3 border-t border-[var(--color-border)]/60 text-xs text-[var(--color-text-tertiary)] relative">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors ${
                isLiked ? "text-red-400" : "hover:text-red-400"
              }`}
            >
              <Heart size={14} className={isLiked ? "fill-current" : ""} />
              <span>{likeCount}</span>
            </button>

            <button 
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-1.5 transition-colors ${showComments ? "text-[var(--color-accent)]" : "hover:text-[var(--color-accent)]"}`}
            >
              <MessageSquare size={14} className={showComments ? "fill-[var(--color-accent)]/20" : ""} />
              <span>{commentsCount}</span>
            </button>

            <button onClick={handleShare} className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
              {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              <span>{copiedLink ? "Copied" : "Share"}</span>
            </button>

            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`flex items-center gap-1.5 transition-colors ml-auto ${
                isBookmarked ? "text-emerald-400" : "hover:text-emerald-400"
              }`}
            >
              <Bookmark size={14} className={isBookmarked ? "fill-current" : ""} />
            </button>
          </div>

          {showComments && (
            <CommentsSection tweetId={tweet._id} currentUser={currentUser} />
          )}
        </div>
      </div>
    </article>
  );
}

export default function CommunityPage() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [newTweet, setNewTweet] = useState("");
  const [editingTweet, setEditingTweet] = useState<Tweet | null>(null);
  const [editContent, setEditContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      alert("Please select an image or video file.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("File size exceeds 50MB limit.");
      return;
    }

    setMediaFile(file);
    setMediaType(file.type.startsWith("video/") ? "video" : "image");
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
  };

  const handleRemoveMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Fetch community tweets
  const {
    data: tweetsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["community-tweets"],
    queryFn: () => tweetsApi.getCommunityTweets(1, 20),
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: ({ content, media }: { content: string; media?: File | null }) =>
      tweetsApi.createTweet(content, media),
    onSuccess: () => {
      setNewTweet("");
      handleRemoveMedia();
      queryClient.invalidateQueries({ queryKey: ["community-tweets"] });
      if (user?._id) {
        queryClient.invalidateQueries({ queryKey: ["tweets", user._id] });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      tweetsApi.updateTweet(id, content),
    onSuccess: () => {
      setEditingTweet(null);
      setEditContent("");
      queryClient.invalidateQueries({ queryKey: ["community-tweets"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (tweetId: string) => tweetsApi.deleteTweet(tweetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-tweets"] });
      if (user?._id) {
        queryClient.invalidateQueries({ queryKey: ["tweets", user._id] });
      }
    },
  });

  const handleCreate = () => {
    if (!newTweet.trim()) return;
    if (createMutation.isPending) return;
    createMutation.mutate({ content: newTweet.trim(), media: mediaFile });
  };

  const handleEdit = (tweet: Tweet) => {
    setEditingTweet(tweet);
    setEditContent(tweet.content);
  };

  const handleUpdate = () => {
    if (!editingTweet || !editContent.trim()) return;
    updateMutation.mutate({ id: editingTweet._id, content: editContent.trim() });
  };

  const tweets: Tweet[] = tweetsData?.data?.docs ?? [];

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare size={20} className="text-[var(--color-accent)]" />
          <h1
            className="text-xl font-bold text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Community
          </h1>
          <Chip size="sm" color="success" variant="flat" className="text-xs">
            Live
          </Chip>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Share updates and connect with your audience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-6">
          {/* Compose */}
      {isAuthenticated ? (
        <div className="mb-6 p-5 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] shadow-sm">
          <div className="flex items-start gap-3.5">
            <UserAvatar user={user} className="w-9 h-9 rounded-full shrink-0 mt-1" animate="always" />
            <div className="flex-1">
              <TextArea
                value={newTweet}
                onValueChange={setNewTweet}
                placeholder="What's on your mind? (Press Enter to post, Shift+Enter for new line)"
                minRows={2}
                maxRows={6}
                maxLength={500}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleCreate();
                  }
                }}
                classNames={{
                  inputWrapper:
                    "bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] focus-within:border-[var(--color-accent)] rounded-2xl",
                  input:
                    "text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]",
                }}
              />

              {/* Media Preview if attached */}
              {mediaPreview && (
                <div className="relative mt-3 rounded-2xl overflow-hidden border border-[var(--color-border)] bg-black/20 group">
                  {mediaType === "video" ? (
                    <video
                      src={mediaPreview}
                      controls
                      playsInline
                      className="w-full max-h-[300px] object-contain rounded-2xl bg-black"
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="Upload preview"
                      className="w-full max-h-[300px] object-cover rounded-2xl"
                    />
                  )}
                  <button
                    type="button"
                    onClick={handleRemoveMedia}
                    aria-label="Remove media"
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-sm transition-all shadow-md cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/60 text-[11px] text-white/90 backdrop-blur-xs flex items-center gap-1.5">
                    <Film size={12} className="text-[var(--color-accent)]" />
                    <span className="truncate max-w-[200px]">{mediaFile?.name}</span>
                    <span className="text-zinc-400">
                      • {(mediaFile?.size ? (mediaFile.size / (1024 * 1024)).toFixed(1) : 0)} MB
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      mediaFile
                        ? "text-[var(--color-accent)] bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface)] border border-transparent hover:border-[var(--color-border)]"
                    }`}
                    title="Attach image or video"
                  >
                    <ImageIcon size={16} className="text-[var(--color-accent)]" />
                    <span>{mediaFile ? "Change Media" : "Media"}</span>
                  </button>
                  <span className="text-xs text-[var(--color-text-tertiary)] pl-1">
                    {newTweet.length}/500
                  </span>
                </div>

                <Button
                  size="sm"
                  radius="full"
                  isLoading={createMutation.isPending}
                  isDisabled={!newTweet.trim() || createMutation.isPending}
                  onPress={handleCreate}
                  className="bg-[var(--color-accent)] text-[#09090B] font-semibold px-5"
                  startContent={!createMutation.isPending && <Send size={14} />}
                >
                  {createMutation.isPending ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-5 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center gap-3">
          <Lock size={16} className="text-[var(--color-text-tertiary)]" />
          <span className="text-sm text-[var(--color-text-secondary)]">
            <Link href="/login" className="text-[var(--color-accent)] font-medium hover:underline">
              Sign in
            </Link>{" "}
            to post in the community.
          </span>
        </div>
      )}

      {/* Edit modal inline */}
      {editingTweet && (
        <div className="mb-6 p-5 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-accent)]/30">
          <p className="text-xs text-[var(--color-accent)] font-semibold mb-2 pl-1">
            Editing post
          </p>
          <TextArea
            value={editContent}
            onValueChange={setEditContent}
            minRows={2}
            maxRows={6}
            classNames={{
              inputWrapper:
                "bg-[var(--color-surface)] border border-[var(--color-border)] focus-within:border-[var(--color-accent)] rounded-2xl",
              input: "text-sm text-[var(--color-text-primary)]",
            }}
          />
          <div className="flex items-center gap-2 mt-3 justify-end">
            <Button
              size="sm"
              radius="full"
              variant="flat"
              onPress={() => setEditingTweet(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              radius="full"
              isLoading={updateMutation.isPending}
              onPress={handleUpdate}
              className="bg-[var(--color-accent)] text-[#09090B] font-semibold px-5"
            >
              Save
            </Button>
          </div>
        </div>
      )}

      {/* Tweets list */}
      {!isAuthenticated ? (
        <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <EmptyState
            title="Sign in to see posts"
            description="Log in to view and interact with community posts."
            icon={<MessageSquare size={32} className="text-[var(--color-accent)]" />}
            action={
              <Link href="/login">
                <Button
                  size="sm"
                  radius="full"
                  className="bg-[var(--color-accent)] text-[#09090B] font-semibold px-5"
                >
                  Sign In
                </Button>
              </Link>
            }
          />
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : tweets.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Be the first to share something with your community."
          icon={<MessageSquare size={32} className="text-[var(--color-accent)]" />}
        />
      ) : (
        <div className="space-y-4">
          {tweets.map((tweet) => (
            <TweetCard
              key={tweet._id}
              tweet={tweet}
              currentUser={user}
              onEdit={handleEdit}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-3">
            <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">
              About Community
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Samaj Community is an open creator feed where you can broadcast text updates, gather feedback, and engage directly with fellow creators and subscribers.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-3">
            <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">
              Community Guidelines
            </h3>
            <ul className="text-xs text-[var(--color-text-secondary)] space-y-2.5 list-disc list-inside leading-relaxed">
              <li>Be respectful and constructive</li>
              <li>Keep conversations relevant to creative work</li>
              <li>No spam, scams, or hateful conduct</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
