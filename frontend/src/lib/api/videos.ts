import { apiClient } from "./client";
import type { ApiResponse, Video } from "../types";

export const videosApi = {
  publishVideo: async (formData: FormData): Promise<ApiResponse<Video>> => {
    const res = await apiClient.post<ApiResponse<Video>>(
      "/videos/publish",
      formData
    );
    return res.data;
  },
};
