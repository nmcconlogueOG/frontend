import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchPermissionToken } from '../api/auth';
import type { PermissionToken } from '../types/permissions';

export interface AuthContextValue {
  token: PermissionToken | null;
  isLoading: boolean;
  error: string | null;
  /** Re-fetch the token from the backend (e.g. after login or session renewal). */
  refresh: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  /**
   * Override the token-fetching function.
   * Defaults to the real API call; pass a stub in tests.
   */
  fetchToken?: () => Promise<PermissionToken>;
}

export function AuthProvider({ children, fetchToken = fetchPermissionToken }: AuthProviderProps) {
  const [token, setToken] = useState<PermissionToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetchToken()
      .then(setToken)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Failed to load auth token');
      })
      .finally(() => setIsLoading(false));
  }, [fetchToken]);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo<AuthContextValue>(
    () => ({ token, isLoading, error, refresh: load }),
    [token, isLoading, error, load],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
