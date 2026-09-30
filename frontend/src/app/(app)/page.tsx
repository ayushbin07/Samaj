"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Sparkles,
  Users,
  Flame,
  ArrowRight,
  Clock,
  UserPlus,
  BookOpen,
  Heart,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usersApi } from "@/lib/api/users";
import { tweetsApi } from "@/lib/api/tweets";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import { UserAvatar, BLOBATAR_EXPRESSIONS, type ExpressionKey } from "@/components/ui/user-avatar";
import { Blobatar as BlobatarRenderer } from "@blobatar/react";
import type { User, Tweet, ActivityItem } from "@/lib/types";
import { haptics } from "@/lib/haptics";
import { extractHashtags } from "@/lib/hashtags";
import { TweetContent } from "@/components/ui/TweetContent";

// Complete list of Blobatar expressions supported by the system
const ALL_BLOBATAR_EXPRESSIONS: ExpressionKey[] = [
  "idle",
  "happy",
  "sad",
  "mad",
  "surprised",
  "wink",
  "sleepy",
  "smug",
  "unsure",
  "scared",
  "love",
  "shy",
  "sick",
  "thinking",
];

// Helper to format human-readable relative timestamps
function formatRelativeTime(dateInput?: string | Date): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // 1. Time of day greeting
  const [greeting, setGreeting] = React.useState("Good evening");
  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const displayName = user?.fullName?.split(" ")[0] || user?.username || "there";

  // 2. Randomized Blobatar Expression based on time, strictly excluding the user's saved expression
  const userConfiguredExp = (user?.blobatar?.expression || "").toLowerCase().trim();
  const availableExpressions = React.useMemo(() => {
    const pool = ALL_BLOBATAR_EXPRESSIONS.filter(
      (exp) => exp.toLowerCase() !== userConfiguredExp
    );
    return pool.length > 0 ? pool : ALL_BLOBATAR_EXPRESSIONS;
  }, [userConfiguredExp]);

  // Derive time-based random expression: shifts dynamically every 7 seconds based on epoch time hash
  const getExpressionByTime = React.useCallback(
    (pool: ExpressionKey[]) => {
      if (pool.length === 0) return "happy";
      const now = Date.now();
      const timeSlice = Math.floor(now / 7000);
      const hash = Math.abs((timeSlice * 1664525 + 1013904223) & 0x7fffffff);
      return pool[hash % pool.length];
    },
    []
  );

  const [randomExpression, setRandomExpression] = React.useState<ExpressionKey>(() =>
    getExpressionByTime(availableExpressions)
  );

  React.useEffect(() => {
    setRandomExpression(getExpressionByTime(availableExpressions));

    // Update dynamically over time
    const interval = setInterval(() => {
      setRandomExpression(getExpressionByTime(availableExpressions));
    }, 7000);

    return () => clearInterval(interval);
  }, [availableExpressions, getExpressionByTime]);


  // 2. Fetch recommended people you may know from MongoDB
  const { data: recommendedData, isLoading: recommendedLoading } = useQuery({
    queryKey: ["recommended-users"],
    queryFn: () => usersApi.getRecommendedUsers(6),
  });

  // 3. Fetch active discussions with authentic comments/replies from MongoDB
  const { data: discussionsData, isLoading: discussionsLoading } = useQuery({
    queryKey: ["active-discussions"],
    queryFn: () => tweetsApi.getActiveDiscussions(6),
  });

  // 4. Fetch real recent community activity timeline from MongoDB
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: usersApi.getRecentActivity,
  });

  // Priority #blog detection: Fetch community tweets to filter and spotlight #blog posts
  const { data: communityTweetsData, isLoading: blogLoading } = useQuery({
    queryKey: ["community-tweets", "homepage-blog"],
    queryFn: () => tweetsApi.getCommunityTweets(1, 50),
  });

  const blogTweets = React.useMemo(() => {
    const docs = communityTweetsData?.data?.docs || [];
    return docs
      .filter((t: Tweet) => {
        const tags = extractHashtags(t.content);
        return tags.some((tag) => tag.toLowerCase() === "#blog");
      })
      .sort((a: Tweet, b: Tweet) => {
        const likesB = b.likesCount || 0;
        const likesA = a.likesCount || 0;
        if (likesB !== likesA) return likesB - likesA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 3);
  }, [communityTweetsData]);

  // Mutation for following a user with optimistic state
  const followMutation = useMutation({
    mutationFn: (userId: string) => subscriptionsApi.toggleSubscription(userId),
    onSuccess: () => {
      haptics.save();
      queryClient.invalidateQueries({ queryKey: ["recommended-users"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
    },
  });

  const recommendedUsers: User[] = (recommendedData?.data as any) || [];
  const activeDiscussions: Tweet[] = discussionsData?.data || [];
  const recentActivities: ActivityItem[] = activityData?.data || [];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-6 lg:px-10 py-6 sm:py-12 space-y-10 sm:space-y-14">
      {/* 1. Welcome Section */}
      <section className="bezel-shell enter-stage">
        <div className="bezel-core relative isolate overflow-hidden min-h-[216px] sm:min-h-[226px] p-6 sm:p-10 flex items-center justify-between bg-[radial-gradient(circle_at_100%_100%,var(--color-accent-soft),transparent_52%)] sm:bg-[var(--color-surface)]">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 text-[var(--color-accent)] text-[11px] font-semibold uppercase tracking-[0.14em] mb-1">
            <Sparkles size={13} />
            <span>Your private network</span>
          </div>
          <h1
            className="text-[2rem] sm:text-4xl font-bold text-[var(--color-text-primary)] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {greeting}, {displayName}
          </h1>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] max-w-md">
            Here&apos;s what&apos;s happening across your network.
          </p>
        </div>

        {/* User Blobatar placed in z-index: -1 on the right */}
        <div
          className="absolute right-1 sm:right-10 md:right-16 top-1/2 -translate-y-1/2 pointer-events-none select-none flex items-center justify-center opacity-45 sm:opacity-95"
          style={{ zIndex: 0 }}
          aria-hidden="true"
        >
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 flex items-center justify-center">
            {/* Ambient accent backlight glow */}
            <div className="absolute inset-0 rounded-full bg-[var(--color-accent)]/15 blur-2xl scale-125 -z-10" />

            <BlobatarRenderer
              name={user?._id || "user"}
              hue={user?.blobatar?.hue}
              tone={user?.blobatar?.tone}
              traits={user?.blobatar?.traits as any}
              palette={user?.blobatar?.palette as any}
              expression={BLOBATAR_EXPRESSIONS[randomExpression]}
              animate="always"
              className="w-full h-full select-none drop-shadow-md"
            />
          </div>
        </div>
        </div>
      </section>

      {/* Main Grid: Left Column (Discussions & People) + Right Column (Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-9">
          {/* Highest Priority: Featured #blog Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-sky-400" />
                <h2
                  className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] -tracking-[0.02em] flex items-center gap-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Featured Blogs
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    #blog
                  </span>
                </h2>
              </div>
              <Link
                href="/community?tag=blog"
                className="text-xs font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
              >
                <span>Browse all</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {blogLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-28 rounded-2xl bg-[var(--color-surface-2)]/60 animate-pulse"
                  />
                ))}
              </div>
            ) : blogTweets.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    No #blog posts yet
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Tag any community post with <span className="font-semibold text-sky-400">#blog</span> to feature it here on the homepage with top priority.
                  </p>
                </div>
                <Link
                  href="/community"
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-[var(--color-accent)] text-[#09090B] hover:opacity-90 transition-opacity shrink-0"
                >
                  Write a #blog &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {blogTweets.map((blog) => {
                  const author = typeof blog.owner === "object" ? blog.owner : null;
                  const replyCount = (blog as any).commentsCount ?? (blog as any).repliesCount ?? 0;
                  return (
                    <Link
                      key={blog._id}
                      href={`/community?tag=blog`}
                      className="group block p-5 rounded-2xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-sky-500/40 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {author && (
                            <UserAvatar
                              user={author}
                              className="w-8 h-8 rounded-full shrink-0"
                              animate="hover"
                            />
                          )}
                          <div className="min-w-0">
                            <span className="font-semibold text-xs text-[var(--color-text-primary)] group-hover:text-sky-400 transition-colors truncate block">
                              {author?.fullName || author?.username || "Author"}
                            </span>
                            <span className="text-[10px] text-[var(--color-text-tertiary)] truncate block">
                              @{author?.username}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            #blog
                          </span>
                          <span className="text-[10px] text-[var(--color-text-tertiary)]">
                            {formatRelativeTime(blog.createdAt)}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-[var(--color-text-primary)] leading-relaxed line-clamp-3">
                        <TweetContent content={blog.content} />
                      </p>

                      {blog.media?.url && (
                        <div className="rounded-xl overflow-hidden max-h-[220px] bg-black/20 border border-[var(--color-border)]/60">
                          <img
                            src={blog.media.url}
                            alt="Blog visual"
                            className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]/50 text-[11px] text-[var(--color-text-tertiary)]">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Heart size={12} className="text-red-400" />
                            {blog.likesCount || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare size={12} className="text-sky-400" />
                            {replyCount}
                          </span>
                        </div>
                        <span className="text-sky-400 font-medium group-hover:underline flex items-center gap-0.5 text-xs">
                          Read in Community &rarr;
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* 4. Active Discussions */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-amber-400" />
                <h2
                  className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] -tracking-[0.02em]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Active discussions
                </h2>
              </div>
              <Link
                href="/community"
                className="text-xs font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
              >
                <span>Browse all</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {discussionsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 rounded-xl bg-[var(--color-surface-2)]/60 animate-pulse"
                  />
                ))}
              </div>
            ) : activeDiscussions.length === 0 ? (
              <div className="p-8 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center space-y-2">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  No discussions yet
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Start the very first conversation in the community feed!
                </p>
                <Link
                  href="/community"
                  className="inline-flex mt-2 text-xs font-semibold text-[var(--color-accent)] hover:underline"
                >
                  Post an update &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeDiscussions.map((discussion) => {
                  const author = typeof discussion.owner === "object" ? discussion.owner : null;
                  const replyCount = (discussion as any).repliesCount ?? (discussion as any).commentsCount ?? 0;
                  return (
                    <Link
                      key={discussion._id}
                      href={`/community`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/45 transition-all"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {author && (
                          <UserAvatar
                            user={author}
                            className="w-9 h-9 rounded-full shrink-0 mt-0.5"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">
                            &ldquo;{discussion.content}&rdquo;
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-[var(--color-text-tertiary)]">
                            <span className="font-semibold text-[var(--color-text-secondary)]">
                              {author?.fullName || author?.username || "Community Member"}
                            </span>
                            <span>&bull;</span>
                            <span>{formatRelativeTime(discussion.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0 px-3 py-1 rounded-md bg-[var(--color-surface-2)] text-xs font-medium text-[var(--color-text-secondary)]">
                        <MessageSquare size={13} className="text-[var(--color-accent)]" />
                        <span>
                          {replyCount} {replyCount === 1 ? "reply" : "replies"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* 3. People you may know */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2
                  className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] -tracking-[0.02em]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  People you may know
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Connect with fellow creators in your invite-only community.
                </p>
              </div>
              <Link
                href="/subscriptions"
                onClick={() => haptics.selection()}
                className="text-xs font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {recommendedLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-28 rounded-xl bg-[var(--color-surface-2)]/60 animate-pulse"
                  />
                ))}
              </div>
            ) : recommendedUsers.length === 0 ? (
              <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  You are all caught up! No new recommendations right now.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {recommendedUsers.map((person) => {
                  const subCount = (person as any).subscribersCount ?? 0;
                  return (
                    <div
                      key={person._id}
                      className="p-4 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/45 transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <Link href={`/channel/${person.username}`} className="shrink-0">
                          <UserAvatar
                            user={person}
                            className="w-10 h-10 rounded-full border border-[var(--color-border)]"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/channel/${person.username}`}
                            className="font-semibold text-sm text-[var(--color-text-primary)] hover:underline truncate block"
                          >
                            {person.fullName || person.username}
                          </Link>
                          <p className="text-xs text-[var(--color-text-tertiary)] truncate">
                            @{person.username}
                          </p>
                          <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                            {subCount} {subCount === 1 ? "follower" : "followers"}
                          </p>
                        </div>
                      </div>

                      {isAuthenticated ? (
                        <button
                          onClick={() => followMutation.mutate(person._id)}
                          disabled={followMutation.isPending}
                          className="w-full inline-flex items-center justify-center gap-1.5 h-8 rounded-md bg-[var(--color-surface-2)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] transition-all cursor-pointer"
                        >
                          <UserPlus size={13} />
                          <span>Follow</span>
                        </button>
                      ) : (
                        <Link
                          href="/login"
                          className="w-full inline-flex items-center justify-center gap-1.5 h-8 rounded-md bg-[var(--color-surface-2)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] transition-all"
                        >
                          <span>Follow</span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Recent Activity & Network Guidelines */}
        <div className="lg:col-span-4 space-y-6">
          {/* 5. Recent Activity Timeline */}
          <div className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[var(--color-accent)]" />
                <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">
                  Recent activity
                </h3>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            {activityLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-12 rounded-xl bg-[var(--color-surface-2)]/60 animate-pulse"
                  />
                ))}
              </div>
            ) : recentActivities.length === 0 ? (
              <p className="text-xs text-[var(--color-text-tertiary)] py-4 text-center">
                No recent activity yet. Be the first to share an update!
              </p>
            ) : (
              <div className="space-y-3.5">
                {recentActivities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    {act.user && (
                      <UserAvatar
                        user={act.user}
                        className="w-7 h-7 rounded-full shrink-0 mt-0.5"
                      />
                    )}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-[12px] text-[var(--color-text-primary)] leading-snug">
                        {act.text}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)]">
                        {formatRelativeTime(act.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Network Guidelines / Info */}
          <div className="p-5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[var(--color-accent)]" />
              <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">
                About this platform
              </h3>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              A private, closed community platform for verified creators, engineering teams, and campus circles. Connect, debate, and share ideas directly.
            </p>
            <div className="pt-2 border-t border-[var(--color-border)]/60 flex items-center justify-between">
              <Link
                href="/community"
                className="text-xs font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
              >
                <span>Go to Community Feed</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
