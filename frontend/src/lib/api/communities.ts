import { apiClient } from "./client";
import type { ApiResponse, Community } from "../types";

export const communitiesApi = {
  getAllCommunities: async (): Promise<ApiResponse<Community[]>> => {
    const res = await apiClient.get<ApiResponse<Community[]>>("/communities");
    return res.data;
  },

  getCommunityBySlug: async (slug: string): Promise<ApiResponse<Community>> => {
    const res = await apiClient.get<ApiResponse<Community>>(`/communities/slug/${slug}`);
    return res.data;
  },

  toggleJoinCommunity: async (
    communityId: string
  ): Promise<ApiResponse<{ communityId: string; isMember: boolean; membersCount: number }>> => {
    const res = await apiClient.post<
      ApiResponse<{ communityId: string; isMember: boolean; membersCount: number }>
    >(`/communities/${communityId}/join`);
    return res.data;
  },
};
