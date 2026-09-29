import { apiClient } from "./client";
import type { ApiResponse } from "../types";

export const commentsApi = {
  addComment: async (tweetId: string, content: string): Promise<ApiResponse<any>> => {
    const res = await apiClient.post<ApiResponse<any>>(`/comments/add-comment`, { tweetId, content });
    return res.data;
  },
  addSubComment: async (commentId: string, content: string): Promise<ApiResponse<any>> => {
    const res = await apiClient.post<ApiResponse<any>>(`/comments/add-sub-comment`, { commentId, content });
    return res.data;
  },
  getTweetComments: async (tweetId: string, page = 1): Promise<ApiResponse<any>> => {
    const res = await apiClient.get<ApiResponse<any>>(`/comments/tweet/${tweetId}?page=${page}`);
    return res.data;
  }
};
