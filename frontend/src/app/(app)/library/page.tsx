"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { usersApi } from "@/lib/api/users";
import { Library, History, Bookmark, Heart, Sparkles } from "lucide-react";
import VideoCard from "@/components/video/VideoCard";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import ComingSoon from "@/components/ui/ComingSoon";
import { Spinner, Button } from "@/components/ui";
import Link from "next/link";
import type { Video as VideoType } from "@/lib/types";

export default function LibraryPage() {
  const { isAuthenticated } = useAuth();

  const {
    data: historyData,
    isLoading: historyLoading,
    isError: historyError,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["watch-history"],
    queryFn: () => usersApi.getWatchHistory(),
    enabled: isAuthenticated,
  });

  const historyVideos: VideoType[] = historyData?.data ?? [];

  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Library size={22} className="text-[var(--color-accent)]" />
          <h1
            className="text-2xl font-bold text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Library
          </h1>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Manage your watch history, saved collections, and favorite creator content.
        </p>
      </div>

      {/* Watch History Section (Live Backend API) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History size={18} className="text-[var(--color-accent)]" />
            <h2
              className="text-lg font-bold text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Watch History
            </h2>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Live API
          </span>
        </div>

        {!isAuthenticated ? (
          <div className="rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 overflow-hidden shadow-sm">
            <EmptyState
              title="Sign in to view history"
              description="Keep track of what you've watched and pick up where you left off."
              icon={<History size={32} className="text-[var(--color-accent)]" />}
              action={
                <Link href="/login">
                  <Button size="sm" color="primary">
                    Sign In
                  </Button>
                </Link>
              }
            />
          </div>
        ) : historyLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : historyError ? (
          <ErrorState onRetry={refetchHistory} />
        ) : historyVideos.length === 0 ? (
          <div className="space-y-6">
            <div className="rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden shadow-sm">
              <EmptyState
                title="No watch history yet"
                description="Videos you watch will show up here so you can easily find them again."
                icon={<History size={32} className="text-[var(--color-accent)]" />}
                action={
                  <Link href="/community">
                    <Button size="sm" color="primary">
                      Explore Feed
                    </Button>
                  </Link>
                }
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {historyVideos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </section>

      {/* Collections & Liked Videos in side-by-side grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Playlists & Collections */}
        <section className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Bookmark size={18} className="text-[var(--color-accent)]" />
            <h2
              className="text-lg font-bold text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Playlists & Collections
            </h2>
          </div>
          <div className="flex-1 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden shadow-sm">
            <ComingSoon
              title="Playlists Coming Soon"
              description="Create custom playlists, save videos to Watch Later, and organize your media collections."
              icon={<Bookmark size={32} className="text-[var(--color-accent)]" />}
            />
          </div>
        </section>

        {/* Liked Videos */}
        <section className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Heart size={18} className="text-[var(--color-accent)]" />
            <h2
              className="text-lg font-bold text-[var(--color-text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Liked Videos
            </h2>
          </div>
          <div className="flex-1 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden shadow-sm">
            <ComingSoon
              title="Liked Videos Coming Soon"
              description="Persistent liked videos collection will be available once the backend Likes API is deployed."
              icon={<Heart size={32} className="text-[var(--color-accent)]" />}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
