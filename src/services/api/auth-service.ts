import { appConfig } from '@/src/config/app-config';
import { jsonStorage, storageKeys } from '@/src/lib/storage';
import { apiRequest, requestTokenRefresh } from '@/src/services/api/client';
import { demoUser } from '@/src/services/api/mock-data';
import type { AuthPayload, AuthSession, RegisteredAccount, UserProfile } from '@/src/types/domain';

const defaultAvatar = 'https://via.placeholder.com/200x200.png';

const buildSession = (): AuthSession => ({
  accessToken: `demo-access-${Date.now()}`,
  refreshToken: `demo-refresh-${Date.now()}`,
  expiresAt: Date.now() + 1000 * 60 * 60,
});

type RegisterResponse = {
  message: string;
  data: {
    user: {
      _id: string;
      username: string;
      email: string;
      avatar?: {
        url?: string;
      };
    };
  };
};

type LoginResponse = {
  message?: string;
  data?: {
    user?: {
      _id?: string;
      id?: string | number;
      username?: string;
      fullName?: string;
      email?: string;
      avatar?: {
        url?: string;
      };
    };
    accessToken?: string;
    refreshToken?: string;
    refresh_token?: string;
    token?: string;
    access_token?: string;
    expiresAt?: number;
    expiry?: number;
  };
};

function buildUserProfile(user: RegisterResponse['data']['user']): UserProfile {
  return {
    id: user._id,
    name: user.username,
    email: user.email,
    avatar: user.avatar?.url ?? defaultAvatar,
    enrolledCourseIds: [],
    bookmarkedCourseIds: [],
    streakDays: 0,
  };
}

function buildRegisteredProfile(account: RegisteredAccount): UserProfile {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    avatar: account.avatar,
    enrolledCourseIds: [],
    bookmarkedCourseIds: [],
    streakDays: 0,
  };
}

function buildUserProfileFromLogin(response: LoginResponse, fallbackEmail: string): UserProfile {
  const user = response.data?.user;

  return {
    id: String(user?._id ?? user?.id ?? `user-${fallbackEmail}`),
    name: user?.fullName ?? user?.username ?? fallbackEmail.split('@')[0] ?? 'Learner',
    email: user?.email ?? fallbackEmail,
    avatar: user?.avatar?.url ?? defaultAvatar,
    enrolledCourseIds: [],
    bookmarkedCourseIds: [],
    streakDays: 0,
  };
}

function buildSessionFromLogin(response: LoginResponse): AuthSession {
  return {
    accessToken: response.data?.accessToken ?? response.data?.access_token ?? response.data?.token ?? `demo-access-${Date.now()}`,
    refreshToken: response.data?.refreshToken ?? response.data?.refresh_token ?? `demo-refresh-${Date.now()}`,
    expiresAt: response.data?.expiresAt ?? response.data?.expiry ?? Date.now() + 1000 * 60 * 60,
  };
}

async function getRegisteredAccounts() {
  return (await jsonStorage.getItem<RegisteredAccount[]>(storageKeys.registeredUsers)) ?? [];
}

async function saveRegisteredAccount(account: RegisteredAccount) {
  const accounts = await getRegisteredAccounts();
  const nextAccounts = [...accounts.filter((entry) => entry.email !== account.email), account];
  await jsonStorage.setItem(storageKeys.registeredUsers, nextAccounts);
}

export const authService = {
  async login(payload: AuthPayload): Promise<{ session: AuthSession; user: UserProfile }> {
    if (appConfig.useMockApi) {
      return {
        session: buildSession(),
        user: demoUser({ email: payload.email }),
      };
    }

    try {
      const identifier = payload.username?.trim() || payload.email.trim();
      const response = await apiRequest<LoginResponse>({
        path: '/api/v1/users/login',
        method: 'POST',
        body: JSON.stringify({
          ...(identifier.includes('@') ? { email: identifier } : { username: identifier }),
          password: payload.password,
        }),
      });

      return {
        session: buildSessionFromLogin(response),
        user: buildUserProfileFromLogin(response, payload.email.trim() || identifier),
      };
    } catch {
      const accounts = await getRegisteredAccounts();
      const account = accounts.find((entry) =>
        (
          entry.email.toLowerCase() === payload.email.trim().toLowerCase() ||
          entry.username.toLowerCase() === (payload.username?.trim().toLowerCase() ?? payload.email.trim().toLowerCase())
        ) &&
        entry.password === payload.password
      );

      if (!account) {
        throw new Error('Unable to sign in with those credentials.');
      }

      return {
        session: buildSession(),
        user: buildRegisteredProfile(account),
      };
    }
  },

  async register(payload: AuthPayload): Promise<{ message: string; user: UserProfile }> {
    const username =
      payload.username?.trim() ||
      payload.name?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '') ||
      `learner${Date.now()}`;

    const localAccount: RegisteredAccount = {
      id: `local-${Date.now()}`,
      email: payload.email.trim(),
      password: payload.password,
      username,
      name: payload.name?.trim() || username,
      avatar: defaultAvatar,
    };

    if (appConfig.useMockApi) {
      await saveRegisteredAccount(localAccount);

      return {
        message: 'Account created successfully.',
        user: demoUser({ email: payload.email, name: payload.name ?? 'New Learner' }),
      };
    }

    try {
      const response = await apiRequest<RegisterResponse>({
        path: '/api/v1/users/register',
        method: 'POST',
        body: JSON.stringify({
          username,
          email: payload.email.trim(),
          password: payload.password,
          role: 'USER',
        }),
      });

      await saveRegisteredAccount({
        ...localAccount,
        id: response.data.user._id,
        avatar: response.data.user.avatar?.url ?? defaultAvatar,
        name: response.data.user.username,
      });

      return {
        message: response.message,
        user: buildUserProfile(response.data.user),
      };
    } catch {
      await saveRegisteredAccount(localAccount);

      return {
        message: 'Account created locally for demo login.',
        user: buildRegisteredProfile(localAccount),
      };
    }
  },

  async refreshToken(refreshToken: string | null): Promise<AuthSession | null> {
    if (appConfig.useMockApi) {
      return buildSession();
    }

    return requestTokenRefresh(refreshToken);
  },
};
