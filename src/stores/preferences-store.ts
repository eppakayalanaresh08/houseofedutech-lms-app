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
  initializeNotifications: () => Promise<void>;
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

  async initializeNotifications() {
    const granted = await configureNotifications();
    const nextPreferences: AppPreferences = {
      ...get().preferences,
      notificationsEnabled: granted,
    };

    await jsonStorage.setItem(storageKeys.preferences, nextPreferences);
    set({ preferences: nextPreferences });

    if (granted) {
      await scheduleReturnReminder();
    }
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
    const granted = await configureNotifications();

    if (!granted) {
      const nextPreferences = { ...get().preferences, notificationsEnabled: false };
      await jsonStorage.setItem(storageKeys.preferences, nextPreferences);
      set({ preferences: nextPreferences });
      return;
    }

    const nextPreferences = { ...get().preferences, notificationsEnabled: true };
    await jsonStorage.setItem(storageKeys.preferences, nextPreferences);
    set({ preferences: nextPreferences });
    await scheduleReturnReminder();
  },

  async markAppOpened() {
    const openedAt = new Date().toISOString();
    await jsonStorage.setItem(storageKeys.lastOpenedAt, openedAt);

    if (get().preferences.notificationsEnabled) {
      const scheduled = await scheduleReturnReminder();

      if (scheduled) {
        const nextPreferences: AppPreferences = {
          ...get().preferences,
          reminderScheduledAt: openedAt,
        };
        await jsonStorage.setItem(storageKeys.preferences, nextPreferences);
        set({ preferences: nextPreferences });
      }
    }
  },
}));
