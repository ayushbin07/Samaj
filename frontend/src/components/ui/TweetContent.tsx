"use client";

import React from "react";

interface TweetContentProps {
  content: string;
  className?: string;
  onTagClick?: (tag: string) => void;
}

export function TweetContent({
  content,
  className = "",
  onTagClick,
}: TweetContentProps) {
  if (!content) return null;

  // Split string keeping the captured hashtags in the array
  const parts = content.split(/(#[a-zA-Z0-9_\u00C0-\u017F]+)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (/^#[a-zA-Z0-9_\u00C0-\u017F]+$/.test(part)) {
          return (
            <span
              key={index}
              role={onTagClick ? "button" : undefined}
              tabIndex={onTagClick ? 0 : undefined}
              onClick={(e) => {
                if (onTagClick) {
                  e.stopPropagation();
                  onTagClick(part);
                }
              }}
              onKeyDown={(e) => {
                if (onTagClick && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  e.stopPropagation();
                  onTagClick(part);
                }
              }}
              className={`text-sky-400 hover:text-sky-300 font-medium transition-colors ${
                onTagClick ? "cursor-pointer hover:underline" : ""
              }`}
            >
              {part}
            </span>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
}
