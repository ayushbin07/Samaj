import { apiClient } from "./client";
import type {
  ApiResponse,
  LoginCredentials,
  LoginResponse,
  User,
} from "../types";

export const authApi = {
  register: async (data: FormData): Promise<ApiResponse<User>> => {
    const res = await apiClient.post<ApiResponse<User>>("/users/register", data);
    return res.data;
  },

  login: async (
    credentials: LoginCredentials
  ): Promise<ApiResponse<LoginResponse>> => {
    const res = await apiClient.post<ApiResponse<LoginResponse>>(
      "/users/login",
      credentials
    );
    return res.data;
  },

  logout: async (): Promise<ApiResponse<object>> => {
    const res = await apiClient.post<ApiResponse<object>>("/users/logout");
    return res.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const res = await apiClient.get<ApiResponse<User>>("/users/current-user");
    return res.data;
  },

  refreshToken: async (
    refreshToken: string
  ): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    const res = await apiClient.post<
      ApiResponse<{ accessToken: string; refreshToken: string }>
    >("/users/refresh-token", { refreshToken });
    return res.data;
  },

  changePassword: async (data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<object>> => {
    const res = await apiClient.post<ApiResponse<object>>(
      "/users/change-password",
      data
    );
    return res.data;
  },

  updateAccount: async (data: {
    fullName: string;
    email: string;
  }): Promise<ApiResponse<User>> => {
    const res = await apiClient.patch<ApiResponse<User>>(
      "/users/update-account",
      data
    );
    return res.data;
  },

  updateAvatar: async (formData: FormData): Promise<ApiResponse<User>> => {
    const res = await apiClient.patch<ApiResponse<User>>(
      "/users/avatar",
      formData
    );
    return res.data;
  },

  switchAvatarType: async (avatarType: "blobatar" | "upload"): Promise<ApiResponse<User>> => {
    const res = await apiClient.patch<ApiResponse<User>>("/users/avatar", { avatarType });
    return res.data;
  },

  updateBlobatarConfig: async (
    config: import("../types").BlobatarConfig
  ): Promise<ApiResponse<User>> => {
    const res = await apiClient.patch<ApiResponse<User>>(
      "/users/avatar/blobatar",
      config
    );
    return res.data;
  },

  updateCoverImage: async (formData: FormData): Promise<ApiResponse<User>> => {
    const res = await apiClient.patch<ApiResponse<User>>(
      "/users/cover-image",
      formData
    );
    return res.data;
  },
};
