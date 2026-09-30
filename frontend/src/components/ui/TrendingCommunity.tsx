"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { tweetsApi } from "@/lib/api/tweets";
import { Flame, Heart, Hash } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import Link from "next/link";
import type { Tweet } from "@/lib/types";
import { extractHashtags, getTrendingHashtags } from "@/lib/hashtags";
import { TweetContent } from "@/components/ui/TweetContent";

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TrendingCommunity({
  currentUserId,
  onSelectTag,
}: {
  currentUserId?: string;
  onSelectTag?: (tag: string) => void;
}) {
  const { data: communityTweetsData } = useQuery({
    queryKey: ["community-tweets", "trending"],
    queryFn: () => tweetsApi.getCommunityTweets(1, 50),
  });

  const docs = communityTweetsData?.data?.docs || [];

  const trendingTweets = useMemo(() => {
    if (!docs.length) return [];

    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    return docs
      .filter((t: Tweet) => {
        const ownerId = typeof t.owner === "object" ? t.owner._id : t.owner;
        if (currentUserId && ownerId === currentUserId) return false;

        const tweetTime = new Date(t.createdAt).getTime();
        return now - tweetTime <= oneDay;
      })
      .sort((a: Tweet, b: Tweet) => (b.likesCount || 0) - (a.likesCount || 0))
      .slice(0, 3);
  }, [docs, currentUserId]);

  const trendingTags = useMemo(() => {
    return getTrendingHashtags(docs, 6);
  }, [docs]);

  if (trendingTweets.length === 0 && trendingTags.length === 0) return null;

  return (
    <div className="p-6 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm space-y-5">
      {trendingTweets.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-[var(--color-text-primary)] flex items-center gap-2">
            <Flame size={16} className="text-orange-500" />
            Trending in Community
          </h3>
          <div className="space-y-4">
            {trendingTweets.map((tweet) => {
              const owner = typeof tweet.owner === "object" ? tweet.owner : null;
              const tags = extractHashtags(tweet.content);

              return (
                <div key={tweet._id} className="block group">
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      user={owner}
                      className="w-8 h-8 rounded-full shrink-0"
                      animate="hover"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1 text-xs">
                        <Link
                          href={`/channel/${owner?.username || ""}`}
                          className="font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors truncate"
                        >
                          {owner?.fullName || "User"}
                        </Link>
                        <span className="text-[var(--color-text-tertiary)] truncate">
                          @{owner?.username}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                        <TweetContent content={tweet.content} onTagClick={onSelectTag} />
                      </p>
                      <div className="flex items-center gap-2.5 pt-1 text-[10px] font-medium text-[var(--color-text-tertiary)] flex-wrap">
                        <span className="flex items-center gap-1">
                          <Heart size={10} className="text-red-400" />
                          {tweet.likesCount || 0}
                        </span>
                        <span>{formatTime(tweet.createdAt)}</span>
                        {tags.slice(0, 2).map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              if (onSelectTag) {
                                onSelectTag(tag);
                              }
                            }}
                            className="px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[9px] font-semibold hover:bg-sky-500/20 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trending Topics / Hashtags */}
      {trendingTags.length > 0 && (
        <div className={`space-y-3 ${trendingTweets.length > 0 ? "pt-4 border-t border-[var(--color-border)]" : ""}`}>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)]">
            <Hash size={14} className="text-sky-400" />
            <span>Trending Tags</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {trendingTags.map(({ tag, count }) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectTag?.(tag)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs bg-[var(--color-surface-2)] hover:bg-sky-500/10 hover:text-sky-400 border border-[var(--color-border)] hover:border-sky-500/30 transition-all text-[var(--color-text-secondary)] cursor-pointer group"
              >
                <span className="font-semibold text-sky-400 group-hover:underline">
                  {tag}
                </span>
                <span className="text-[10px] text-[var(--color-text-tertiary)] font-normal">
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
