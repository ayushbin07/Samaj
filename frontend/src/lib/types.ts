// API response wrapper from the backend
export interface ApiResponse<T = unknown> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface BlobatarConfig {
  hue?: number;
  tone?: number;
  traits?: Record<string, number | number[]>;
  palette?: Record<string, string>;
  expression?: string;
}

// User types
export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatarType?: "blobatar" | "upload";
  avatar?: string;
  blobatar?: BlobatarConfig;
  coverImage?: string;
  watchHistory?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChannelProfile extends User {
  subscribersCount: number;
  channelsSubscribedToCount: number;
  isSubscribed: boolean;
}

// Video types
export interface Video {
  _id: string;
  videoFile: string;
  thumbnail: string;
  title: string;
  description: string;
  duration: number;
  views: number;
  isPublished: boolean;
  owner: string | User;
  createdAt: string;
  updatedAt: string;
}

// Community types
export interface Community {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon?: string;
  banner?: string;
  membersCount: number;
  isMember?: boolean;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: "reply" | "post" | "follow" | "join";
  user: User;
  text: string;
  targetId?: string;
  createdAt: string;
}

export interface ActiveDiscussion {
  _id: string;
  content: string;
  repliesCount: number;
  owner: User;
  createdAt: string;
}

// Tweet types
export interface Tweet {
  _id: string;
  content: string;
  owner: string | User;
  media?: {
    url: string;
    type?: "image" | "video" | string;
  };
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface PaginatedTweets {
  docs: Tweet[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

// Subscription types
export interface Subscription {
  _id: string;
  subscriber: string | User;
  channel: string | User;
  lastVideo?: Video;
  lastTweet?: Tweet;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  username?: string;
  email?: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  username: string;
  password: string;
  avatar: File;
  coverImage?: File;
}
