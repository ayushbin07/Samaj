import { apiClient } from "./client";
import type { ApiResponse } from "../types";

export const likesApi = {
  toggleTweetLike: async (tweetId: string): Promise<ApiResponse<any>> => {
    const res = await apiClient.post<ApiResponse<any>>("/likes/toggle/tweet", { tweetId });
    return res.data;
  },
  getTweetLikes: async (tweetId: string): Promise<ApiResponse<any>> => {
    const res = await apiClient.request<ApiResponse<any>>({
      method: "GET",
      url: `/likes/tweet?tweetId=${tweetId}`,
    });
    return res.data;
  },
  toggleCommentLike: async (commentId: string): Promise<ApiResponse<any>> => {
    const res = await apiClient.post<ApiResponse<any>>("/likes/toggle/comment", { commentId });
    return res.data;
  },
  getCommentLikes: async (commentId: string): Promise<ApiResponse<any>> => {
    const res = await apiClient.request<ApiResponse<any>>({
      method: "GET",
      url: `/likes/comment?commentId=${commentId}`,
    });
    return res.data;
  }
};
