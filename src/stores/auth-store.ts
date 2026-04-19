import { create } from 'zustand';

import { secureStorage, jsonStorage, storageKeys } from '@/src/lib/storage';
import { authService } from '@/src/services/api/auth-service';
import type { AuthMode, UserProfile } from '@/src/types/domain';

type AuthState = {
  status: 'idle' | 'loading' | 'authenticated' | 'anonymous';
  token: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  error: string | null;
  bootstrap: () => Promise<void>;
  authenticate: (mode: AuthMode, payload: { email: string; password: string; username?: string; name?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateAvatar: (avatar: string) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  token: null,
  refreshToken: null,
  user: null,
  error: null,

  async bootstrap() {
    set({ status: 'loading', error: null });

    const [token, refreshToken, user] = await Promise.all([
      secureStorage.getToken(storageKeys.authToken),
      secureStorage.getToken(storageKeys.refreshToken),
      jsonStorage.getItem<UserProfile>(storageKeys.authUser),
    ]);

    if (!token || !user) {
      set({ status: 'anonymous', token: null, refreshToken: null, user: null });
      return;
    }

    const refreshed = await authService.refreshToken(refreshToken);

    if (!refreshed) {
      await get().logout();
      return;
    }

    await Promise.all([
      secureStorage.setToken(storageKeys.authToken, refreshed.accessToken),
      secureStorage.setToken(storageKeys.refreshToken, refreshed.refreshToken),
    ]);

    set({
      status: 'authenticated',
      token: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      user,
      error: null,
    });
  },

  async authenticate(mode, payload) {
    set({ status: 'loading', error: null });

    try {
      if (mode === 'register') {
        await authService.register(payload);
        set({
          status: 'anonymous',
          token: null,
          refreshToken: null,
          user: null,
          error: null,
        });

        return true;
      }

      const result = await authService.login(payload);

      await Promise.all([
        secureStorage.setToken(storageKeys.authToken, result.session.accessToken),
        secureStorage.setToken(storageKeys.refreshToken, result.session.refreshToken),
        jsonStorage.setItem(storageKeys.authUser, result.user),
      ]);

      set({
        status: 'authenticated',
        token: result.session.accessToken,
        refreshToken: result.session.refreshToken,
        user: result.user,
        error: null,
      });

      return true;
    } catch (error) {
      set({
        status: 'anonymous',
        token: null,
        refreshToken: null,
        user: null,
        error: error instanceof Error ? error.message : 'Authentication failed.',
      });
      return false;
    }
  },

  async logout() {
    await Promise.all([
      secureStorage.deleteToken(storageKeys.authToken),
      secureStorage.deleteToken(storageKeys.refreshToken),
      jsonStorage.removeItem(storageKeys.authUser),
    ]);

    set({
      status: 'anonymous',
      token: null,
      refreshToken: null,
      user: null,
      error: null,
    });
  },

  async updateAvatar(avatar) {
    const currentUser = get().user;

    if (!currentUser) {
      return;
    }

    const nextUser = { ...currentUser, avatar };
    await jsonStorage.setItem(storageKeys.authUser, nextUser);
    set({ user: nextUser });
  },
}));
