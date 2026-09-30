import type { Video } from "../types";

export interface CommentItem {
  id: string;
  author: {
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}

// Video streaming mock data deleted as Samaj is a community platform, not a video streaming platform
export const SAMPLE_VIDEOS: Video[] = [];

export const INITIAL_COMMENTS: Record<string, CommentItem[]> = {};
