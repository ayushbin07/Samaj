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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { communitiesApi } from "@/lib/api/communities";
import { usersApi } from "@/lib/api/users";
import { tweetsApi } from "@/lib/api/tweets";
import { subscriptionsApi } from "@/lib/api/subscriptions";
import { UserAvatar, BLOBATAR_EXPRESSIONS, type ExpressionKey } from "@/components/ui/user-avatar";
import { Blobatar as BlobatarRenderer } from "@blobatar/react";
import type { Community, User, Tweet, ActivityItem } from "@/lib/types";

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


  // 2. Fetch authentic communities from MongoDB
  const { data: communitiesData, isLoading: communitiesLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: communitiesApi.getAllCommunities,
  });

  // 3. Fetch recommended people you may know from MongoDB
  const { data: recommendedData, isLoading: recommendedLoading } = useQuery({
    queryKey: ["recommended-users"],
    queryFn: () => usersApi.getRecommendedUsers(6),
  });

  // 4. Fetch active discussions with authentic comments/replies from MongoDB
  const { data: discussionsData, isLoading: discussionsLoading } = useQuery({
    queryKey: ["active-discussions"],
    queryFn: () => tweetsApi.getActiveDiscussions(6),
  });

  // 5. Fetch real recent community activity timeline from MongoDB
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: usersApi.getRecentActivity,
  });

  // Mutation for joining / leaving a community
  const joinMutation = useMutation({
    mutationFn: (communityId: string) =>
      communitiesApi.toggleJoinCommunity(communityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
  });

  // Mutation for following a user with optimistic state
  const followMutation = useMutation({
    mutationFn: (userId: string) => subscriptionsApi.toggleSubscription(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommended-users"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
    },
  });

  const communities: Community[] = communitiesData?.data || [];
  const recommendedUsers: User[] = (recommendedData?.data as any) || [];
  const activeDiscussions: Tweet[] = discussionsData?.data || [];
  const recentActivities: ActivityItem[] = activityData?.data || [];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12 space-y-14">
      {/* 1. Welcome Section */}
      <section className="bezel-shell enter-stage">
        <div className="bezel-core relative isolate overflow-hidden min-h-[190px] sm:min-h-[226px] p-7 sm:p-10 flex items-center justify-between">
        <div className="absolute left-0 top-7 bottom-7 w-1 bg-[var(--color-accent)]" aria-hidden="true" />
        <div className="relative z-10 space-y-2 max-w-xl pl-2 sm:pl-3">
          <div className="inline-flex items-center gap-2 text-[var(--color-accent)] text-[11px] font-semibold uppercase tracking-[0.14em] mb-1">
            <Sparkles size={13} />
            <span>Your private network</span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {greeting}, {displayName}
          </h1>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)] max-w-md">
            Here&apos;s what&apos;s happening across your communities.
          </p>
        </div>

        {/* User Blobatar placed in z-index: -1 on the right */}
        <div
          className="absolute right-4 sm:right-10 md:right-16 top-1/2 -translate-y-1/2 pointer-events-none select-none flex items-center justify-center opacity-80 sm:opacity-95"
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


      {/* 2. Your Communities Horizontal Cards */}
      <section className="enter-stage-delayed space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2
              className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] -tracking-[0.02em]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Your Communities
            </h2>
            {communities.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-[var(--color-surface-2)] text-[var(--color-text-tertiary)] font-medium">
                {communities.length}
              </span>
            )}
          </div>
          <Link
            href="/community"
            className="text-xs font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
          >
            <span>View feed</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {communitiesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-36 rounded-xl bg-[var(--color-surface-2)]/60 animate-pulse"
              />
            ))}
          </div>
        ) : communities.length === 0 ? (
          <div className="p-8 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
            <p className="text-xs text-[var(--color-text-tertiary)]">
              No communities found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            {communities.map((community, index) => (
              <div
                key={community._id}
                className={`group relative p-1.5 rounded-[1.65rem] bg-[var(--color-surface-2)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1.5 hover:shadow-[0_22px_40px_-32px_rgba(43,28,14,0.78)] ${index === 0 ? "lg:col-span-4" : index === 1 || index === 2 ? "lg:col-span-3" : "lg:col-span-2"}`}
              >
                <div className="rounded-[1.28rem] bg-[var(--color-surface)] p-4 h-full flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.13)]">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <MessageSquare size={19} className="text-[var(--color-accent)]" aria-label={community.icon ? `${community.icon} community` : "Community"} />
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] font-medium">
                      {community.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-[var(--color-text-primary)] truncate">
                    {community.name}
                  </h3>
                  <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-2 mt-1 leading-snug">
                    {community.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--color-border)]/60 flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-tertiary)] font-medium">
                    {community.membersCount} {community.membersCount === 1 ? "member" : "members"}
                  </span>

                  {isAuthenticated ? (
                    <button
                      onClick={() => joinMutation.mutate(community._id)}
                      disabled={joinMutation.isPending}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        community.isMember
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                          : "bg-[var(--color-accent)]/15 text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)] border border-[var(--color-accent)]/30"
                      }`}
                    >
                      {community.isMember ? "Joined" : "Join"}
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]"
                    >
                      Join
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Main Grid: Left Column (Discussions & People) + Right Column (Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-9">
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
                href="/explore"
                className="text-xs font-semibold text-[var(--color-accent)] hover:underline inline-flex items-center gap-1"
              >
                <span>Explore all</span>
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
