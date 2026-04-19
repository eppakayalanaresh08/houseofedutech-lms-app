import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export const storageKeys = {
  authToken: 'houseofedtech.auth.token',
  refreshToken: 'houseofedtech.auth.refresh',
  authUser: 'houseofedtech.auth.user',
  authSession: 'houseofedtech.auth.session',
  registeredUsers: 'houseofedtech.auth.registeredUsers',
  bookmarks: 'houseofedtech.course.bookmarks',
  enrollments: 'houseofedtech.course.enrollments',
  courseProgress: 'houseofedtech.course.progress',
  preferences: 'houseofedtech.preferences',
  lastOpenedAt: 'houseofedtech.app.lastOpenedAt',
};

export const secureStorage = {
  getToken: (key: string) => SecureStore.getItemAsync(key),
  setToken: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  deleteToken: (key: string) => SecureStore.deleteItemAsync(key),
};

export const jsonStorage = {
  async getItem<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  async setItem<T>(key: string, value: T) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};
