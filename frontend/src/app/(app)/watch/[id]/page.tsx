"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Share2,
  Bookmark,
  Bell,
  BellOff,
  Check,
  MessageSquare,
  Info,
  Send,
  ThumbsUp,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoCard from "@/components/video/VideoCard";
import { Button } from "@/components/ui";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAuth } from "@/contexts/AuthContext";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import { SAMPLE_VIDEOS, INITIAL_COMMENTS, type CommentItem } from "@/lib/data/mockVideos";
import type { Video, User } from "@/lib/types";
import clsx from "clsx";

const FALLBACK_CREATED_AT = "2026-09-25T12:00:00.000Z";

export default function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user: currentUser, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Find video in sample videos or create placeholder
  const video: Video =
    SAMPLE_VIDEOS.find((v) => v._id === id) || {
      _id: id,
      title: "Featured Community Stream & Highlights",
      description:
        "Welcome to VideoTube. Explore original content and engage with the creator community.",
      thumbnail:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      videoFile:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      duration: 596,
      views: 9540,
      isPublished: true,
      owner: {
        _id: "user-default",
        fullName: "Featured Creator",
        username: "creator",
        email: "creator@example.com",
        avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        createdAt: FALLBACK_CREATED_AT,
        updatedAt: FALLBACK_CREATED_AT,
      },
      createdAt: FALLBACK_CREATED_AT,
      updatedAt: FALLBACK_CREATED_AT,
    };

  const owner =
    typeof video.owner === "object"
      ? (video.owner as User)
      : {
          _id: "user-default",
          fullName: "Creator",
          username: "creator",
          avatar: "",
        };

  // Local Like State (Rule 14 & 30: explicitly local/mock state)
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(128);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Local Comments State (Rule 14 & 30: local preview comments)
  const [comments, setComments] = useState<CommentItem[]>(
    INITIAL_COMMENTS[video._id] || [
      {
        id: "c-default-1",
        author: {
          name: "Alex Rivera",
          username: "alexdev",
          avatar:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        },
        content: "Awesome presentation, really loved the visual examples and practical tips!",
        createdAt: "3 hours ago",
        likes: 12,
        isLiked: false,
      },
    ]
  );
  const [newCommentText, setNewCommentText] = useState("");

  // Real backend subscription query & mutation if channel owner ID exists
  const channelId = owner._id;
  const { data: subStatusData } = useQuery({
    queryKey: ["isSubscribed", channelId],
    queryFn: () => subscriptionsApi.isSubscribedTo(channelId),
    enabled: isAuthenticated && !!channelId && channelId !== "user-default",
  });

  const { data: subCountData } = useQuery({
    queryKey: ["subscriberCount", channelId],
    queryFn: () => subscriptionsApi.getSubscriberCount(channelId),
    enabled: !!channelId && channelId !== "user-default",
  });

  const isSubscribed = subStatusData?.data?.isSubscribed ?? false;
  const subCount = subCountData?.data?.subscriberCount ?? 1240;

  const subscribeMutation = useMutation({
    mutationFn: () => subscriptionsApi.toggleSubscription(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isSubscribed", channelId] });
      queryClient.invalidateQueries({ queryKey: ["subscriberCount", channelId] });
      queryClient.invalidateQueries({ queryKey: ["subscriptions-list"] });
    },
  });

  // Handle Like
  const handleLikeToggle = () => {
    setIsLiked((prev) => {
      setLikeCount((count) => (prev ? count - 1 : count + 1));
      return !prev;
    });
  };

  // Handle Share
  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  // Handle adding local comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: CommentItem = {
      id: `c-local-${Date.now()}`,
      author: {
        name: currentUser?.fullName || "Guest Viewer",
        username: currentUser?.username || "guest",
        avatar: currentUser?.avatar,
      },
      content: newCommentText.trim(),
      createdAt: "just now",
      likes: 0,
      isLiked: false,
    };

    setComments((prev) => [newComment, ...prev]);
    setNewCommentText("");
  };

  // Handle toggling like on comment
  const handleCommentLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const nextLiked = !c.isLiked;
          return {
            ...c,
            isLiked: nextLiked,
            likes: nextLiked ? c.likes + 1 : c.likes - 1,
          };
        }
        return c;
      })
    );
  };

  // Related videos (exclude current video)
  const relatedVideos = SAMPLE_VIDEOS.filter((v) => v._id !== video._id);

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Player, Video Meta, Comments */}
        <div className="xl:col-span-8 space-y-6">
          {/* Custom Video Player */}
          <VideoPlayer
            src={video.videoFile}
            poster={video.thumbnail}
            title={video.title}
            autoPlay
          />

          {/* Video Title */}
          <div>
            <h1
              className="text-lg md:text-2xl font-bold text-[var(--color-text-primary)] leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {video.title}
            </h1>
          </div>

          {/* Creator & Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-[var(--color-border)]">
            {/* Creator info & subscribe */}
            <div className="flex items-center gap-3">
              <Link
                href={`/channel/${owner.username}`}
                className="shrink-0 hover:opacity-85 transition-opacity"
              >
                <UserAvatar
                  user={owner}
                  className="w-10 h-10 rounded-full ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-bg)]"
                  animate="always"
                />
              </Link>
              <div>
                <Link
                  href={`/channel/${owner.username}`}
                  className="font-bold text-sm text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors block"
                >
                  {owner.fullName}
                </Link>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  {subCount.toLocaleString()}{" "}
                  {subCount === 1 ? "subscriber" : "subscribers"}
                </p>
              </div>

              {/* Real Subscription Action */}
              {isAuthenticated && currentUser?.username !== owner.username && (
                <Button
                  size="sm"
                  radius="full"
                  onPress={() => subscribeMutation.mutate()}
                  isLoading={subscribeMutation.isPending}
                  className={clsx(
                    "ml-2 text-xs font-semibold px-4 rounded-full",
                    isSubscribed
                      ? "bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-2)]"
                      : "bg-[var(--color-accent)] text-[#09090B] hover:bg-[var(--color-accent-hover)]"
                  )}
                  startContent={
                    !subscribeMutation.isPending &&
                    (isSubscribed ? <BellOff size={14} /> : <Bell size={14} />)
                  }
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </Button>
              )}
            </div>

            {/* Engagement buttons */}
            <div className="flex items-center gap-2">
              {/* Like Button */}
              <div className="relative group">
                <button
                  onClick={handleLikeToggle}
                  aria-label="Like video"
                  className={clsx(
                    "flex items-center gap-2 h-9 px-4 rounded-full border text-xs font-medium transition-colors",
                    isLiked
                      ? "bg-red-500/10 border-red-500/30 text-red-400"
                      : "bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)]"
                  )}
                >
                  <Heart
                    size={16}
                    className={clsx(isLiked ? "fill-red-400 text-red-400" : "")}
                  />
                  <span>{likeCount}</span>
                </button>
                {/* Local preview disclaimer tooltip (Rule 14 & 30) */}
                <div className="absolute right-0 top-11 hidden group-hover:block z-30 w-56 p-2.5 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[11px] text-[var(--color-text-tertiary)] shadow-2xl leading-normal pointer-events-none">
                  ❤️ Liked. This interaction is currently local. Backend persistence coming soon.
                </div>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                aria-label="Share video link"
                className="flex items-center gap-2 h-9 px-4 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {copiedLink ? (
                  <>
                    <Check size={16} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={16} />
                    <span>Share</span>
                  </>
                )}
              </button>

              {/* Save / Playlist Button (Coming Soon) */}
              <div className="relative group">
                <button
                  aria-label="Save video to playlist"
                  className="flex items-center gap-2 h-9 px-4 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <Bookmark size={16} />
                  <span>Save</span>
                </button>
                <div className="absolute right-0 top-11 hidden group-hover:block z-30 w-48 p-2.5 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[11px] text-[var(--color-text-tertiary)] shadow-2xl leading-normal pointer-events-none">
                  Playlists & Watch Later — Coming Soon
                </div>
              </div>
            </div>
          </div>

          {/* Video Description Box */}
          <div className="rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] p-5 text-xs">
            <div className="flex items-center gap-3 font-semibold text-[var(--color-text-primary)] mb-2">
              <span>{video.views.toLocaleString()} views</span>
              <span>•</span>
              <span>
                {new Date(video.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div
              className={clsx(
                "text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap",
                !isDescriptionExpanded && "line-clamp-2"
              )}
            >
              {video.description}
            </div>
            <button
              onClick={() => setIsDescriptionExpanded((p) => !p)}
              className="mt-2 font-semibold text-[var(--color-accent)] hover:underline block"
            >
              {isDescriptionExpanded ? "Show less" : "Show more"}
            </button>
          </div>

          {/* Comments Section (Rule 14 & 30: Clearly treated as temporary/mock local preview) */}
          <section className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-[var(--color-accent)]" />
                <h2
                  className="text-base font-bold text-[var(--color-text-primary)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Comments ({comments.length})
                </h2>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[11px] text-[var(--color-text-tertiary)]">
                <Info size={12} className="text-[var(--color-accent)]" />
                <span>Preview feature • Local interaction</span>
              </div>
            </div>

            {/* Comment Composer */}
            <form onSubmit={handleAddComment} className="flex gap-3 mb-6">
              <UserAvatar
                user={currentUser}
                className="w-9 h-9 rounded-full mt-1 shrink-0"
                animate="always"
              />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder={
                    isAuthenticated
                      ? "Add a comment..."
                      : "Add a comment (as guest)..."
                  }
                  className="w-full h-10 px-4 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] outline-none transition-all"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    radius="full"
                    isDisabled={!newCommentText.trim()}
                    className="bg-[var(--color-accent)] text-[#09090B] font-semibold text-xs px-4"
                    startContent={<Send size={13} />}
                  >
                    Comment
                  </Button>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      user={{
                        fullName: comment.author.name,
                        username: comment.author.username,
                        avatar: comment.author.avatar,
                      }}
                      fallbackName={comment.author.username || comment.author.name}
                      className="w-9 h-9 rounded-full shrink-0 mt-0.5"
                      animate="always"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-xs text-[var(--color-text-primary)] truncate">
                          {comment.author.name}
                        </span>
                        <span className="text-[11px] text-[var(--color-text-tertiary)]">
                          @{comment.author.username}
                        </span>
                        <span className="text-[11px] text-[var(--color-text-tertiary)]">
                          • {comment.createdAt}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-2 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                      <button
                        onClick={() => handleCommentLike(comment.id)}
                        className={clsx(
                          "inline-flex items-center gap-1.5 text-[11px] font-medium transition-colors",
                          comment.isLiked
                            ? "text-[var(--color-accent)]"
                            : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                        )}
                      >
                        <ThumbsUp size={12} className={comment.isLiked ? "fill-current" : ""} />
                        <span>{comment.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Suggested & Up Next Videos */}
        <div className="xl:col-span-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
            <h2
              className="font-bold text-sm text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Up Next
            </h2>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">
              Autoplay on
            </span>
          </div>

          <div className="space-y-2">
            {relatedVideos.map((item) => (
              <VideoCard key={item._id} video={item} layout="horizontal" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
