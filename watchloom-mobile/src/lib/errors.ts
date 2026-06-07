import { ApiClientError } from '@/lib/api-client';

export function getUserFriendlyError(error: unknown, fallback: string) {
  if (!(error instanceof ApiClientError)) {
    return error instanceof Error ? error.message : fallback;
  }

  if (error.status === 0) {
    return 'Unable to reach the server. Check your connection and try again.';
  }

  if (error.status >= 500) {
    return 'The server is having trouble right now. Please try again shortly.';
  }

  return fallback;
}
