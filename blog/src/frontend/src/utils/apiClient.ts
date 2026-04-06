import type { AuthContextType } from "../store/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  skipErrorHandling?: boolean;
}

interface ApiError {
  message: string;
  status: number;
  data?: any;
}

export class ApiClientError extends Error implements ApiError {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.data = data;
  }
}

export function createApiClient(auth: AuthContextType) {
  const { token, logout } = auth;

  const handle401 = () => {
    console.warn("401 Unauthorized - logging out user");
    logout();
  };

  async function request<T = any>(
    endpoint: string,
    config: RequestConfig = {},
  ): Promise<T> {
    const {
      skipAuth = false,
      skipErrorHandling = false,
      headers = {},
      ...restConfig
    } = config;

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...(headers as Record<string, string>),
    };

    if (!skipAuth && token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...restConfig,
        headers: requestHeaders,
      });

      if (response.status === 401) {
        handle401();
        throw new ApiClientError("Unauthorized - please log in again", 401);
      }

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }

        const errorMessage =
          typeof errorData === "object" && errorData?.message
            ? errorData.message
            : `Request failed with status ${response.status}`;

        if (!skipErrorHandling) {
          throw new ApiClientError(errorMessage, response.status, errorData);
        }
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new ApiClientError(
          "Network error - please check your connection",
          0,
        );
      }

      throw new ApiClientError(
        error instanceof Error ? error.message : "An unknown error occurred",
        0,
      );
    }
  }

  return {
    request,

    get: <T = any>(endpoint: string, config?: RequestConfig) =>
      request<T>(endpoint, { ...config, method: "GET" }),

    post: <T = any>(endpoint: string, data?: any, config?: RequestConfig) =>
      request<T>(endpoint, {
        ...config,
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      }),

    put: <T = any>(endpoint: string, data?: any, config?: RequestConfig) =>
      request<T>(endpoint, {
        ...config,
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      }),

    patch: <T = any>(endpoint: string, data?: any, config?: RequestConfig) =>
      request<T>(endpoint, {
        ...config,
        method: "PATCH",
        body: data ? JSON.stringify(data) : undefined,
      }),

    delete: <T = any>(endpoint: string, config?: RequestConfig) =>
      request<T>(endpoint, { ...config, method: "DELETE" }),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
