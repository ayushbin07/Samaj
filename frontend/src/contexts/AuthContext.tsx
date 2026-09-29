"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { authApi } from "@/lib/api/auth";
import { setStoredToken, removeStoredTokens } from "@/lib/api/client";
import type { User, LoginCredentials } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (formData: FormData) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.getCurrentUser();
      setUser(res.data);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    authApi
      .getCurrentUser()
      .then((res) => {
        if (active) {
          setUser(res.data);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const res = await authApi.login(credentials);
    // authApi.login returns axios res.data = ApiResponse<LoginResponse>
    // ApiResponse shape: { statusCode, data: { user, accessToken, refreshToken }, message }
    // So tokens live at res.data
    const { user, accessToken, refreshToken } = res.data as any;
    if (!accessToken) {
      throw new Error("Login failed: no access token in response");
    }
    setStoredToken("accessToken", accessToken);
    setStoredToken("refreshToken", refreshToken);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      removeStoredTokens();
      setUser(null);
    }
  }, []);

  const register = useCallback(async (formData: FormData) => {
    await authApi.register(formData);
    // After registration, user needs to log in separately
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
