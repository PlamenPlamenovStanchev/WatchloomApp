const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, '');

if (!apiBaseUrl) {
  console.warn(
    'EXPO_PUBLIC_API_BASE_URL is not configured. Mobile API requests will fail until it is set.',
  );
}

export const API_BASE_URL = apiBaseUrl ?? '';
