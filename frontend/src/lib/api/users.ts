import { apiClient } from "./client";
import type { ApiResponse, ChannelProfile, Video, User, ActivityItem } from "../types";

export const usersApi = {
  getChannelProfile: async (
    username: string
  ): Promise<ApiResponse<ChannelProfile>> => {
    const res = await apiClient.get<ApiResponse<ChannelProfile>>(
      `/users/c/${username}`
    );
    return res.data;
  },

  getWatchHistory: async (): Promise<ApiResponse<Video[]>> => {
    const res = await apiClient.get<ApiResponse<Video[]>>("/users/history");
    return res.data;
  },

  getRecommendedUsers: async (limit: number = 4): Promise<ApiResponse<User[]>> => {
    const res = await apiClient.get<ApiResponse<User[]>>("/users/get-recommended-users", {
      params: { limit },
    });
    return res.data;
  },

  getRecentActivity: async (): Promise<ApiResponse<ActivityItem[]>> => {
    const res = await apiClient.get<ApiResponse<ActivityItem[]>>("/users/recent-activity");
    return res.data;
  },
};

