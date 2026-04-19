import { create } from 'zustand';

import { jsonStorage, storageKeys } from '@/src/lib/storage';
import { configureNotifications, scheduleReturnReminder } from '@/src/services/notifications';
import type { AppPreferences } from '@/src/types/domain';

const defaultPreferences: AppPreferences = {
  notificationsEnabled: true,
  classicDensity: 'comfortable',
};

type PreferencesState = {
  preferences: AppPreferences;
  hydrate: () => Promise<void>;
  toggleDensity: () => Promise<void>;
  enableNotifications: () => Promise<void>;
  markAppOpened: () => Promise<void>;
};

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  preferences: defaultPreferences,

  async hydrate() {
    const saved = await jsonStorage.getItem<AppPreferences>(storageKeys.preferences);
    set({ preferences: saved ?? defaultPreferences });
  },

  async toggleDensity() {
    const nextPreferences: AppPreferences = {
      ...get().preferences,
      classicDensity: get().preferences.classicDensity === 'comfortable' ? 'compact' : 'comfortable',
    };
    await jsonStorage.setItem(storageKeys.preferences, nextPreferences);
    set({ preferences: nextPreferences });
  },

  async enableNotifications() {
    await configureNotifications();
    const nextPreferences = { ...get().preferences, notificationsEnabled: true };
    await jsonStorage.setItem(storageKeys.preferences, nextPreferences);
    set({ preferences: nextPreferences });
  },

  async markAppOpened() {
    await jsonStorage.setItem(storageKeys.lastOpenedAt, new Date().toISOString());

    if (get().preferences.notificationsEnabled) {
      await scheduleReturnReminder();
    }
  },
}));
