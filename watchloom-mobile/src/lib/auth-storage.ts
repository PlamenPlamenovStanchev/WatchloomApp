import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'watchloom.accessToken';

export async function saveAccessToken(token: string) {
  if (Platform.OS === 'web') {
    getWebStorage()?.setItem(ACCESS_TOKEN_KEY, token);
    return;
  }

  return SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function getAccessToken() {
  if (Platform.OS === 'web') {
    return getWebStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
  }

  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function deleteAccessToken() {
  if (Platform.OS === 'web') {
    getWebStorage()?.removeItem(ACCESS_TOKEN_KEY);
    return;
  }

  return SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}

function getWebStorage() {
  return typeof window === 'undefined' ? undefined : window.localStorage;
}
