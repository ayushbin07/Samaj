"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Compass, Search } from "lucide-react";
import VideoGrid from "@/components/video/VideoGrid";
import { SAMPLE_VIDEOS } from "@/lib/data/mockVideos";
import clsx from "clsx";

const CATEGORIES = [
  "All",
  "Web Development",
  "Architecture",
  "Design Systems",
  "Backend & Cloud",
  "Creative Tech",
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState(urlQuery);

  const filteredVideos = useMemo(() => {
    return SAMPLE_VIDEOS.filter((video) => {
      const matchesSearch =
        !searchTerm.trim() ||
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (activeCategory === "All") return true;
      if (activeCategory === "Web Development")
        return (
          video.title.toLowerCase().includes("next.js") ||
          video.title.toLowerCase().includes("web")
        );
      if (activeCategory === "Architecture")
        return video.title.toLowerCase().includes("architecture");
      if (activeCategory === "Design Systems")
        return video.title.toLowerCase().includes("design");
      if (activeCategory === "Backend & Cloud")
        return (
          video.title.toLowerCase().includes("node") ||
          video.title.toLowerCase().includes("redis")
        );
      if (activeCategory === "Creative Tech")
        return video.title.toLowerCase().includes("creative");

      return true;
    });
  }, [searchTerm, activeCategory]);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-10">
      {/* Header */}
      <div className="mb-8 border-l-2 border-[var(--color-accent)] pl-4">
        <div className="flex items-center gap-2 mb-1">
          <Compass size={22} className="text-[var(--color-accent)]" />
          <h1
            className="text-3xl font-bold text-[var(--color-text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Explore
          </h1>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Discover videos across software engineering, architecture, design, and creative technology.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search input */}
        <div className="relative flex-1 max-w-lg">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter explore videos..."
            className="w-full h-11 pl-11 pr-4 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none transition-all"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                "h-9 px-4 rounded-md text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-[0.98]",
                activeCategory === cat
                  ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] shadow-sm font-semibold"
                  : "bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-hover)]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Videos */}
      <VideoGrid
        videos={filteredVideos}
        emptyTitle="No videos match your criteria"
        emptyDescription="Try selecting another category or searching for a different keyword."
      />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse text-xs text-[var(--color-text-secondary)]">Loading explore...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
