import { useMemo } from "react";
import { useAuth } from "../store/auth";
import { createApiClient, type ApiClient } from "../utils/apiClient";

export function useApi(): ApiClient {
  const auth = useAuth();
  const api = useMemo(() => createApiClient(auth), [auth.token, auth.logout]);
  return api;
}

export default useApi;
