"use client";

import VideoCard from "./VideoCard";
import { Skeleton } from "@/components/ui";
import EmptyState from "@/components/ui/EmptyState";
import { Video as VideoIcon } from "lucide-react";
import type { Video } from "@/lib/types";

interface VideoGridProps {
  videos: Video[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export default function VideoGrid({
  videos,
  isLoading,
  emptyTitle = "No videos found",
  emptyDescription = "There are no videos available in this section yet.",
}: VideoGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col p-1.5 rounded-xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)]"
          >
            <Skeleton className="w-full aspect-video rounded-lg bg-[var(--color-surface-2)]" />
            <div className="p-3.5 flex gap-3">
              <Skeleton className="w-9 h-9 rounded-full shrink-0 bg-[var(--color-surface-2)]" />
              <div className="space-y-2 flex-1 mt-0.5">
                <Skeleton className="w-full h-3.5 rounded-full bg-[var(--color-surface-2)]" />
                <Skeleton className="w-2/3 h-3 rounded-full bg-[var(--color-surface-2)]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={<VideoIcon size={32} className="text-[var(--color-accent)]" />}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  );
}
