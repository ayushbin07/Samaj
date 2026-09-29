import axios from "axios";

// In the browser, always use the relative path "/api/v1" so requests route through
// the Next.js reverse proxy (rewrites in next.config.ts), avoiding cross-origin CORS blocks.
function buildServerBaseUrl(): string {
  const raw =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.BACKEND_URL ||
    "http://127.0.0.1:8000";
  // Ensure the URL ends with /api/v1 so SSR calls hit the right endpoint.
  return raw.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "") + "/api/v1";
}

export function getStoredToken(key: "accessToken" | "refreshToken"): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setStoredToken(key: "accessToken" | "refreshToken", value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage issues in restricted environments
  }
}

export function removeStoredTokens(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  } catch {
    // Ignore
  }
}

const BASE_URL =
  typeof window !== "undefined" ? "/api/v1" : buildServerBaseUrl();

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to attach access token and handle FormData boundary
apiClient.interceptors.request.use((config) => {
  const token = getStoredToken("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // If payload is FormData, remove manual Content-Type header so browser sets multipart boundary
  if (config.data instanceof FormData && config.headers) {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
    if (typeof (config.headers as any).delete === "function") {
      (config.headers as any).delete("Content-Type");
      (config.headers as any).delete("content-type");
    }
  }

  return config;
});

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

// Add response interceptor to handle Express HTML errors and 401 refresh token flow
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If backend returns Express HTML error page, extract the clean error text
    if (error.response?.data && typeof error.response.data === "string") {
      const match = error.response.data.match(/<pre>(?:Error:\s*)?([^<\n]+)/i);
      if (match && match[1]) {
        error.response.data = { message: decodeHtmlEntities(match[1]) };
      }
    }

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getStoredToken("refreshToken");

        if (!refreshToken) {
          // No refresh token — let the error propagate
          return Promise.reject(error);
        }

        const res = await axios.post(
          `${BASE_URL}/users/refresh-token`,
          { refreshToken },
          { withCredentials: true }
        );

        const { accessToken, refreshToken: newRefreshToken } = res.data.data;

        setStoredToken("accessToken", accessToken);
        setStoredToken("refreshToken", newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch {
        // Refresh failed — clear storage
        removeStoredTokens();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(err: unknown, fallback: string): string {
  const error = err as {
    response?: { data?: { message?: string } | string };
    message?: string;
  };
  if (error?.response?.data) {
    if (typeof error.response.data === "object" && error.response.data?.message) {
      return error.response.data.message;
    }
    if (typeof error.response.data === "string") {
      const match = error.response.data.match(/<pre>(?:Error:\s*)?([^<\n]+)/i);
      if (match && match[1]) {
        return decodeHtmlEntities(match[1]);
      }
    }
  }
  return error?.message || fallback;
}
