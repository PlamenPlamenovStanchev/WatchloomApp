import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { ApiClientError } from '@/lib/api-client';
import { deleteAccessToken, getAccessToken, saveAccessToken } from '@/lib/auth-storage';
import { login as loginRequest, me, register as registerRequest } from '@/services/auth-api';
import type { AuthUserDto, RegisterInput } from '@/types/api';

type AuthContextValue = {
  clearError: () => void;
  error: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  register: (input: RegisterInput) => Promise<RegisterResult>;
  user: AuthUserDto | null;
};

type RegisterResult = {
  isAuthenticated: boolean;
  user: AuthUserDto;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

function isInvalidAccessTokenError(error: unknown) {
  return error instanceof ApiClientError && (error.status === 401 || error.status === 403);
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUserDto | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let isActive = true;

    async function restoreSession() {
      try {
        const storedToken = await getAccessToken();

        if (!storedToken) {
          return;
        }

        try {
          const response = await me(storedToken);

          if (isActive) {
            setAccessToken(storedToken);
            setUser(response.user);
          }
        } catch (requestError) {
          if (isInvalidAccessTokenError(requestError)) {
            await deleteAccessToken().catch(() => undefined);
            return;
          }

          if (isActive) {
            setAccessToken(storedToken);
            setError(getErrorMessage(requestError));
          }
        }
      } catch (storageError) {
        if (isActive) {
          setError(getErrorMessage(storageError));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      isActive = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginRequest({ email, password });
      await saveAccessToken(response.accessToken);
      setAccessToken(response.accessToken);
      setUser(response.user);
    } catch (loginError) {
      setError(getErrorMessage(loginError));
      throw loginError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await registerRequest(input);

      if (response.accessToken) {
        await saveAccessToken(response.accessToken);
        setAccessToken(response.accessToken);
        setUser(response.user);
      }

      return {
        isAuthenticated: Boolean(response.accessToken),
        user: response.user,
      };
    } catch (registerError) {
      setError(getErrorMessage(registerError));
      throw registerError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await deleteAccessToken();
    } catch (logoutError) {
      setError(getErrorMessage(logoutError));
      throw logoutError;
    } finally {
      clearSession();
      setIsLoading(false);
    }
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    if (!accessToken) {
      clearSession();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await me(accessToken);
      setUser(response.user);
    } catch (refreshError) {
      if (isInvalidAccessTokenError(refreshError)) {
        await deleteAccessToken().catch(() => undefined);
        clearSession();
      }

      setError(getErrorMessage(refreshError));
      throw refreshError;
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      clearError,
      error,
      isAuthenticated: Boolean(accessToken && user),
      isLoading,
      login,
      logout,
      refreshUser,
      register,
      user,
    }),
    [accessToken, clearError, error, isLoading, login, logout, refreshUser, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
