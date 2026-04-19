import { appConfig } from '@/src/config/app-config';
import { apiRequest } from '@/src/services/api/client';
import { demoUser } from '@/src/services/api/mock-data';
import type { AuthPayload, AuthSession, UserProfile } from '@/src/types/domain';

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

const defaultAvatar = 'https://via.placeholder.com/200x200.png';

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

export const authService = {
  async login(payload: AuthPayload): Promise<{ session: AuthSession; user: UserProfile }> {
    if (appConfig.useMockApi) {
      return {
        session: buildSession(),
        user: demoUser({ email: payload.email }),
      };
    }

    return {
      session: buildSession(),
      user: demoUser({ email: payload.email }),
    };
  },

  async register(payload: AuthPayload): Promise<{ message: string; user: UserProfile }> {
    if (appConfig.useMockApi && !payload.username) {
      return {
        message: 'Account created successfully.',
        user: demoUser({ email: payload.email, name: payload.name ?? 'New Learner' }),
      };
    }

    const username =
      payload.username?.trim() ||
      payload.name?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '') ||
      `learner${Date.now()}`;

    const response = await apiRequest<RegisterResponse>({
      path: '/api/v1/users/register',
      method: 'POST',
      body: JSON.stringify({
        username,
        email: payload.email.trim(),
        password: payload.password,
        role: 'ADMIN',
      }),
    });

    return {
      message: response.message,
      user: buildUserProfile(response.data.user),
    };
  },

  async refreshToken(refreshToken: string | null): Promise<AuthSession | null> {
    if (!refreshToken) {
      return null;
    }

    return buildSession();
  },
};
