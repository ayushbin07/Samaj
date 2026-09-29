import { apiClient } from "./client";
import type { ApiResponse, PaginatedTweets, Tweet } from "../types";

export const tweetsApi = {
  createTweet: async (
    content: string,
    mediaFile?: File | null
  ): Promise<ApiResponse<Tweet>> => {
    let payload: any;
    if (mediaFile) {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("media", mediaFile);
      payload = formData;
    } else {
      payload = { content };
    }
    const res = await apiClient.post<ApiResponse<Tweet>>("/tweets/create-tweet", payload);
    return res.data;
  },

  getUserTweets: async (
    userId: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<PaginatedTweets>> => {
    const res = await apiClient.get<ApiResponse<PaginatedTweets>>(
      `/tweets/get-user-tweets/${userId}`,
      { params: { page, limit } }
    );
    return res.data;
  },

  getCommunityTweets: async (
    page = 1,
    limit = 10
  ): Promise<ApiResponse<PaginatedTweets>> => {
    const res = await apiClient.get<ApiResponse<PaginatedTweets>>(
      `/tweets/get-community-tweets`,
      { params: { page, limit } }
    );
    return res.data;
  },

  updateTweet: async (
    tweetId: string,
    content: string
  ): Promise<ApiResponse<Tweet>> => {
    const res = await apiClient.patch<ApiResponse<Tweet>>(
      `/tweets/update-tweet/${tweetId}`,
      { content }
    );
    return res.data;
  },

  deleteTweet: async (tweetId: string): Promise<ApiResponse<string>> => {
    const res = await apiClient.delete<ApiResponse<string>>(
      `/tweets/delete-tweet/${tweetId}`
    );
    return res.data;
  },

  getActiveDiscussions: async (limit: number = 6): Promise<ApiResponse<Tweet[]>> => {
    const res = await apiClient.get<ApiResponse<Tweet[]>>("/tweets/active-discussions", {
      params: { limit },
    });
    return res.data;
  },
};

