import { useEffect } from 'react';
import { router, type Href } from 'expo-router';

import { routes } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';

export function useRequireAuth() {
  const auth = useAuth();

  useEffect(() => {
    if (auth.isInitialized && !auth.isAuthenticated) {
      router.replace(routes.auth.login as Href);
    }
  }, [auth.isAuthenticated, auth.isInitialized]);

  return auth;
}
