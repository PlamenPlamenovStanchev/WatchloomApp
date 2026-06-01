const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, '');

if (!apiBaseUrl) {
  console.error(
    'EXPO_PUBLIC_API_BASE_URL is missing. Please check your .env file.',
  );
}

export const API_BASE_URL = apiBaseUrl ?? '';
