import { API_BASE_URL } from '@/config/env';

type QueryValue = string | number | boolean | null | undefined;

export type QueryParams = Record<string, QueryValue | readonly QueryValue[]>;

type ApiErrorBody = {
  success: false;
  error?: string | { message?: string };
};

type ApiSuccessBody<T> = {
  success: true;
  data: T;
};

type RequestOptions = {
  body?: unknown;
  headers?: HeadersInit;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  query?: QueryParams;
  signal?: AbortSignal;
  token?: string;
};

type MethodOptions = Omit<RequestOptions, 'method'>;

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export function buildQueryString(params?: QueryParams) {
  if (!params) {
    return '';
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    const values = Array.isArray(value) ? value : [value];

    values.forEach((item) => {
      if (item !== undefined && item !== null) {
        searchParams.append(key, String(item));
      }
    });
  });

  const query = searchParams.toString();

  return query ? `?${query}` : '';
}

function getErrorMessage(body: unknown, fallback: string) {
  if (!body || typeof body !== 'object' || !('error' in body)) {
    return fallback;
  }

  const error = (body as ApiErrorBody).error;

  if (typeof error === 'string') {
    return error;
  }

  return error?.message ?? fallback;
}

function buildUrl(path: string, query?: QueryParams) {
  if (!API_BASE_URL) {
    throw new ApiClientError(
      'EXPO_PUBLIC_API_BASE_URL is not configured. Set it before making API requests.',
      0,
    );
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${API_BASE_URL}${normalizedPath}${buildQueryString(query)}`;
}

async function parseJson(response: Response) {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiClientError('The server returned an invalid JSON response.', response.status);
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, method = 'GET', query, signal, token } = options;
  const requestHeaders = new Headers(headers);

  requestHeaders.set('Accept', 'application/json');

  if (body !== undefined) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: requestHeaders,
      method,
      signal,
    });
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    throw new ApiClientError('Unable to reach the server.', 0, error);
  }

  const responseBody = await parseJson(response);

  if (
    !response.ok ||
    (responseBody &&
      typeof responseBody === 'object' &&
      'success' in responseBody &&
      responseBody.success === false)
  ) {
    throw new ApiClientError(
      getErrorMessage(responseBody, `Request failed with status ${response.status}.`),
      response.status,
      responseBody,
    );
  }

  if (
    !responseBody ||
    typeof responseBody !== 'object' ||
    !('success' in responseBody) ||
    responseBody.success !== true ||
    !('data' in responseBody)
  ) {
    throw new ApiClientError('The server returned an unexpected response.', response.status, responseBody);
  }

  return (responseBody as ApiSuccessBody<T>).data;
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<MethodOptions, 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: MethodOptions) =>
    request<T>(path, { ...options, body, method: 'POST' }),
  patch: <T>(path: string, body?: unknown, options?: MethodOptions) =>
    request<T>(path, { ...options, body, method: 'PATCH' }),
  delete: <T>(path: string, options?: MethodOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
