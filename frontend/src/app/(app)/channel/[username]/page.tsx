"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/users";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import { tweetsApi } from "@/lib/api/tweets";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Skeleton, Chip } from "@/components/ui";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  Users,
  MessageSquare,
  Bell,
  BellOff,
  Video as VideoIcon,
  Info,
  Upload,
  Settings,
  Share2,
  Calendar,
  Sparkles,
  Heart,
  TrendingUp,
  Trash2,
} from "lucide-react";
import ErrorState from "@/components/ui/ErrorState";
import VideoGrid from "@/components/video/VideoGrid";
import { SAMPLE_VIDEOS } from "@/lib/data/mockVideos";
import Link from "next/link";
import type { Tweet } from "@/lib/types";

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

export default function ChannelPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { user: currentUser, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"videos" | "community" | "about">("videos");
  const [copied, setCopied] = useState(false);

  const {
    data: channelData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["channel", username],
    queryFn: () => usersApi.getChannelProfile(username),
    enabled: !!username,
  });

  const channel = channelData?.data;

  const { data: tweetsData } = useQuery({
    queryKey: ["tweets", channel?._id],
    queryFn: () => tweetsApi.getUserTweets(channel!._id, 1, 20),
    enabled: !!channel?._id,
  });

  const subscribeMutation = useMutation({
    mutationFn: () => subscriptionsApi.toggleSubscription(channel!._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channel", username] });
    },
  });

  const deleteTweetMutation = useMutation({
    mutationFn: (tweetId: string) => tweetsApi.deleteTweet(tweetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tweets", channel?._id] });
      queryClient.invalidateQueries({ queryKey: ["community-tweets"] });
    },
  });

  const isOwnChannel = currentUser?.username === username;
  const tweets: Tweet[] = tweetsData?.data?.docs ?? [];

  // Match sample videos that might belong to this creator or fallback to sample showcase
  const creatorVideos = SAMPLE_VIDEOS.filter(
    (v) =>
      typeof v.owner === "object" &&
      (v.owner.username === username || v.owner._id === channel?._id)
  );

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Skeleton className="w-full h-56 sm:h-64 md:h-80 lg:h-96 rounded-3xl" />
        <div className="flex items-start gap-5">
          <Skeleton className="w-28 h-28 md:w-36 md:h-36 rounded-full" />
          <div className="space-y-3 flex-1 pt-2">
            <Skeleton className="w-64 h-7 rounded-full" />
            <Skeleton className="w-40 h-4 rounded-full" />
            <Skeleton className="w-80 h-4 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !channel) {
    return (
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorState
          title="Channel not found"
          description="This channel doesn't exist or couldn't be loaded."
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* 1. Cinematic Panoramic Cover Banner */}
      <div className="relative w-full h-52 sm:h-64 md:h-80 lg:h-96 rounded-3xl overflow-hidden border border-[var(--color-border)] shadow-2xl bg-zinc-950">
        {channel.coverImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={channel.coverImage}
            alt={`${channel.fullName} cover`}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-neutral-900 to-black flex items-center justify-center">
            <div className="text-center opacity-40">
              <Sparkles size={48} className="text-[var(--color-accent)] mx-auto mb-2" />
              <p className="text-sm font-medium text-white tracking-widest uppercase">
                {channel.fullName}
              </p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* 2. Rich Creator Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 -mt-16 sm:-mt-20 md:-mt-24 px-4 sm:px-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
          <div className="relative">
            <UserAvatar
              user={channel}
              className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 ring-4 ring-[#09090B] shadow-2xl border-2 border-[var(--color-accent)]/40 rounded-full"
              animate="always"
            />
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--color-text-primary)] tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {channel.fullName}
              </h1>
              <Chip size="sm" variant="flat" color="warning" className="text-xs font-semibold">
                Creator
              </Chip>
            </div>

            <p className="text-sm font-medium text-[var(--color-accent)]">
              @{channel.username}
            </p>

            <div className="flex items-center gap-3 text-xs text-[var(--color-text-tertiary)] flex-wrap">
              <span className="flex items-center gap-1 font-medium text-[var(--color-text-secondary)]">
                <Users size={13} className="text-[var(--color-accent)]" />
                <strong className="text-[var(--color-text-primary)]">{channel.subscribersCount}</strong>{" "}
                {channel.subscribersCount === 1 ? "subscriber" : "subscribers"}
              </span>
              <span>•</span>
              <span>{channel.channelsSubscribedToCount} subscriptions</span>
              <span>•</span>
              <span>{tweets.length} posts</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto flex-wrap">
          <Button
            size="md"
            variant="flat"
            radius="full"
            onPress={handleShare}
            className="bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-xs font-semibold px-4"
            startContent={<Share2 size={15} />}
          >
            {copied ? "Copied Link!" : "Share"}
          </Button>

          {isOwnChannel ? (
            <div className="flex items-center gap-2.5">
              <Link href="/upload">
                <Button
                  size="md"
                  color="primary"
                  radius="full"
                  className="font-semibold px-5 shadow-md"
                  startContent={<Upload size={16} />}
                >
                  Upload Video
                </Button>
              </Link>
              <Link href="/settings">
                <Button
                  size="md"
                  variant="flat"
                  radius="full"
                  className="bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] px-4"
                  title="Channel Settings"
                >
                  <Settings size={16} />
                </Button>
              </Link>
            </div>
          ) : isAuthenticated ? (
            <Button
              size="md"
              radius="full"
              onPress={() => subscribeMutation.mutate()}
              isLoading={subscribeMutation.isPending}
              className={
                channel.isSubscribed
                  ? "bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] px-6 font-semibold"
                  : "bg-[var(--color-accent)] text-[#09090B] font-bold hover:bg-[var(--color-accent-hover)] px-6 shadow-md"
              }
              startContent={
                !subscribeMutation.isPending &&
                (channel.isSubscribed ? <BellOff size={16} /> : <Bell size={16} />)
              }
            >
              {channel.isSubscribed ? "Subscribed" : "Subscribe"}
            </Button>
          ) : (
            <Link href="/login">
              <Button size="md" color="primary" radius="full" className="font-semibold px-6 shadow-md">
                Subscribe
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 3. Interactive Channel Navigation Tabs */}
      <div className="border-b border-[var(--color-border)] flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
        <button
          onClick={() => setActiveTab("videos")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            activeTab === "videos"
              ? "bg-[var(--color-accent)] text-[#09090B] shadow-sm font-bold"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          <VideoIcon size={16} />
          <span>Videos</span>
        </button>

        <button
          onClick={() => setActiveTab("community")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            activeTab === "community"
              ? "bg-[var(--color-accent)] text-[#09090B] shadow-sm font-bold"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          <MessageSquare size={16} />
          <span>Community</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-black/20 font-bold">
            {tweets.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
            activeTab === "about"
              ? "bg-[var(--color-accent)] text-[#09090B] shadow-sm font-bold"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          <Info size={16} />
          <span>About</span>
        </button>
      </div>

      {/* 4. Tab Contents */}

      {/* TAB 1: VIDEOS */}
      {activeTab === "videos" && (
        <section className="space-y-8">
          {creatorVideos.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                  Uploads ({creatorVideos.length})
                </h2>
              </div>
              <VideoGrid videos={creatorVideos} />
            </div>
          ) : (
            <div className="space-y-10">
              {/* Creator upload CTA if owner */}
              {isOwnChannel ? (
                <div className="p-8 md:p-12 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center shadow-lg max-w-3xl mx-auto">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center mx-auto mb-4">
                    <VideoIcon size={32} className="text-[var(--color-accent)]" />
                  </div>
                  <h3
                    className="text-xl font-bold text-[var(--color-text-primary)] mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Upload your first video
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto mb-6">
                    Share your creations with the Samaj community and start building your audience today.
                  </p>
                  <Link href="/upload">
                    <Button color="primary" size="lg" radius="full" className="font-semibold shadow-md" startContent={<Upload size={16} />}>
                      Upload Video
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center max-w-2xl mx-auto">
                  <VideoIcon size={36} className="text-[var(--color-text-tertiary)] mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">
                    No videos published yet
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {channel.fullName} hasn&apos;t published any videos yet. Check back soon!
                  </p>
                </div>
              )}

              {/* Showcase Featured Videos */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-[var(--color-accent)]" />
                  <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                    Trending on Samaj
                  </h3>
                </div>
                <VideoGrid videos={SAMPLE_VIDEOS.slice(0, 4)} />
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 2: COMMUNITY (2-COLUMN WIDESCREEN DESIGN) */}
      {activeTab === "community" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Feed (8 columns) */}
          <div className="lg:col-span-8 space-y-5">
            {isOwnChannel && (
              <div className="p-5 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={channel} className="w-9 h-9 rounded-full" animate="always" />
                    <p className="text-sm text-[var(--color-text-secondary)] font-medium">
                      Post an update to your community...
                    </p>
                  </div>
                  <Link href="/community">
                    <Button size="sm" color="primary" radius="full" className="font-semibold px-4">
                      Create Post
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {tweets.length === 0 ? (
              <div className="rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8 text-center shadow-sm">
                <MessageSquare size={36} className="text-[var(--color-text-tertiary)] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">
                  No community posts yet
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {channel.fullName} hasn&apos;t shared any updates with the community yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tweets.map((tweet) => (
                  <article
                    key={tweet._id}
                    className="p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-hover)] transition-all duration-200 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <UserAvatar
                        user={channel}
                        className="w-10 h-10 rounded-full shrink-0 mt-0.5"
                        animate="always"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[var(--color-text-primary)]">
                              {channel.fullName}
                            </span>
                            <span className="text-xs text-[var(--color-accent)] font-medium">
                              @{channel.username}
                            </span>
                            <span className="text-xs text-[var(--color-text-tertiary)]">
                              • {formatTime(tweet.createdAt)}
                            </span>
                          </div>
                          {isOwnChannel && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this post?")) {
                                  deleteTweetMutation.mutate(tweet._id);
                                }
                              }}
                              disabled={
                                deleteTweetMutation.isPending &&
                                deleteTweetMutation.variables === tweet._id
                              }
                              aria-label="Delete post"
                              title="Delete post"
                              className="p-1.5 rounded-full text-[var(--color-text-tertiary)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                          {tweet.content}
                        </p>
                        {tweet.media?.url && (
                          <div className="mt-3 mb-2 rounded-2xl overflow-hidden border border-[var(--color-border)] bg-black/20">
                            {tweet.media.type === "video" || /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(tweet.media.url) ? (
                              <video
                                src={tweet.media.url}
                                controls
                                playsInline
                                className="w-full max-h-[400px] object-contain rounded-2xl bg-black"
                              />
                            ) : (
                              <img
                                src={tweet.media.url}
                                alt="Post attachment"
                                loading="lazy"
                                className="w-full max-h-[400px] object-cover rounded-2xl cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => window.open(tweet.media?.url, "_blank")}
                              />
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[var(--color-border)]/60 text-xs text-[var(--color-text-tertiary)]">
                          <button className="flex items-center gap-1.5 hover:text-red-400 transition-colors">
                            <Heart size={14} />
                            <span>Like</span>
                          </button>
                          <button className="flex items-center gap-1.5 hover:text-[var(--color-accent)] transition-colors">
                            <Share2 size={14} />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Info (4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-[var(--color-text-primary)] flex items-center gap-2">
                <Info size={16} className="text-[var(--color-accent)]" />
                About Creator
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                Welcome to {channel.fullName}&apos;s channel. Follow for video releases, development updates, and discussions.
              </p>
              <div className="pt-2 border-t border-[var(--color-border)] space-y-2.5 text-xs text-[var(--color-text-tertiary)]">
                <div className="flex items-center justify-between">
                  <span>Subscribers</span>
                  <strong className="text-[var(--color-text-primary)]">{channel.subscribersCount}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Subscriptions</span>
                  <strong className="text-[var(--color-text-primary)]">{channel.channelsSubscribedToCount}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Posts</span>
                  <strong className="text-[var(--color-text-primary)]">{tweets.length}</strong>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-[var(--color-text-primary)]">
                Community Guidelines
              </h3>
              <ul className="text-xs text-[var(--color-text-secondary)] space-y-2 list-disc list-inside leading-relaxed">
                <li>Keep conversations respectful</li>
                <li>No spam or duplicate promo messages</li>
                <li>Support creative work and discussions</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ABOUT */}
      {activeTab === "about" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
                Description
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                Welcome to {channel.fullName}&apos;s official Samaj channel. Stream content, discover new videos, and follow along for regular updates.
              </p>
            </div>

            <div className="pt-6 border-t border-[var(--color-border)]">
              <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-4">
                Channel Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[var(--color-surface-2)]/60 border border-[var(--color-border)]">
                  <span className="text-[var(--color-text-tertiary)] block mb-1">Handle</span>
                  <span className="font-semibold text-sm text-[var(--color-accent)]">@{channel.username}</span>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--color-surface-2)]/60 border border-[var(--color-border)]">
                  <span className="text-[var(--color-text-tertiary)] block mb-1">Status</span>
                  <span className="font-semibold text-sm text-emerald-400">Active Creator</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-5">
            <h3 className="font-bold text-sm text-[var(--color-text-primary)]">
              Stats
            </h3>
            <div className="space-y-3 text-xs text-[var(--color-text-secondary)]">
              <div className="flex items-center gap-2.5">
                <Calendar size={15} className="text-[var(--color-accent)]" />
                <span>Joined {new Date(channel.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Users size={15} className="text-[var(--color-accent)]" />
                <span>{channel.subscribersCount} subscribers</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageSquare size={15} className="text-[var(--color-accent)]" />
                <span>{tweets.length} community posts</span>
              </div>
            </div>
            <div className="pt-4 border-t border-[var(--color-border)]">
              <Button size="sm" variant="flat" radius="full" onPress={handleShare} className="w-full font-semibold">
                Share Channel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
