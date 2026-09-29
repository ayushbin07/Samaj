import { apiClient } from "./client";
import type { ApiResponse, Subscription } from "../types";

export const subscriptionsApi = {
  toggleSubscription: async (
    channelId: string
  ): Promise<ApiResponse<{ isSubscribed: boolean; subscription?: Subscription }>> => {
    const res = await apiClient.post<
      ApiResponse<{ isSubscribed: boolean; subscription?: Subscription }>
    >(`/subscriptions/toogle-subscription/${channelId}`);
    return res.data;
  },

  getSubscriberCount: async (
    channelId: string
  ): Promise<ApiResponse<{ subscriberCount: number }>> => {
    const res = await apiClient.get<
      ApiResponse<{ subscriberCount: number }>
    >(`/subscriptions/count-subscriber/${channelId}`);
    return res.data;
  },

  getChannelSubscribers: async (
    channelId: string
  ): Promise<ApiResponse<Subscription[]>> => {
    const res = await apiClient.get<ApiResponse<Subscription[]>>(
      `/subscriptions/get-subscribers/${channelId}`
    );
    return res.data;
  },

  getSubscriptionsList: async (): Promise<ApiResponse<Subscription[]>> => {
    const res = await apiClient.get<ApiResponse<Subscription[]>>(
      "/subscriptions/get-subscription-list"
    );
    return res.data;
  },

  isSubscribedTo: async (
    channelId: string
  ): Promise<ApiResponse<{ isSubscribed: boolean }>> => {
    const res = await apiClient.get<ApiResponse<{ isSubscribed: boolean }>>(
      `/subscriptions/is-subscribed/${channelId}`
    );
    return res.data;
  },
};
