import { env } from '@/config/env';

export type ApiClientConfig = {
  baseUrl: string;
};

export const apiClientConfig: ApiClientConfig = {
  baseUrl: env.apiUrl,
};
