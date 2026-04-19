import { appConfig } from '@/src/config/app-config';
import { jsonStorage, secureStorage, storageKeys } from '@/src/lib/storage';
import { ApiError, TimeoutError } from '@/src/services/api/errors';
import type { AuthSession } from '@/src/types/domain';

interface RequestOptions extends RequestInit {
  path: string;
  timeoutMs?: number;
  retries?: number;
  requiresAuth?: boolean;
  skipRefresh?: boolean;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const authRefreshWindowMs = 60 * 1000;

type RefreshPayload = {
  data?: {
    accessToken?: string;
    access_token?: string;
    token?: string;
    refreshToken?: string;
    refresh_token?: string;
    expiresAt?: number;
    expiry?: number;
  };
};

function shouldSkipAuth(path: string) {
  return (
    path.includes('/api/v1/users/login') ||
    path.includes('/api/v1/users/register') ||
    path.includes('/api/v1/users/refresh-token')
  );
}

function buildHeaders(headers?: HeadersInit, accessToken?: string) {
  const nextHeaders = new Headers(headers ?? {});

  if (!nextHeaders.has('Content-Type')) {
    nextHeaders.set('Content-Type', 'application/json');
  }

  if (accessToken) {
    nextHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  return nextHeaders;
}

function parseAuthSession(payload: RefreshPayload): AuthSession | null {
  const accessToken = payload.data?.accessToken ?? payload.data?.access_token ?? payload.data?.token;
  const refreshToken = payload.data?.refreshToken ?? payload.data?.refresh_token;

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    expiresAt: payload.data?.expiresAt ?? payload.data?.expiry ?? Date.now() + 1000 * 60 * 60,
  };
}

async function persistAuthSession(session: AuthSession) {
  await Promise.all([
    secureStorage.setToken(storageKeys.authToken, session.accessToken),
    secureStorage.setToken(storageKeys.refreshToken, session.refreshToken),
    jsonStorage.setItem(storageKeys.authSession, session),
  ]);
}

async function clearStoredAuthSession() {
  await Promise.all([
    secureStorage.deleteToken(storageKeys.authToken),
    secureStorage.deleteToken(storageKeys.refreshToken),
    jsonStorage.removeItem(storageKeys.authSession),
    jsonStorage.removeItem(storageKeys.authUser),
  ]);
}

async function clearAuthState() {
  await clearStoredAuthSession();

  try {
    const { useAuthStore } = await import('@/src/stores/auth-store');
    const authState = useAuthStore.getState();

    if (authState.status !== 'anonymous') {
      await authState.logout();
    }
  } catch {
    // If the auth store is not available yet, storage has already been cleared.
  }
}

async function executeRefreshRequest(refreshToken: string): Promise<AuthSession | null> {
  const attempts: RequestInit[] = [
    {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({ refreshToken }),
    },
    {
      method: 'POST',
      headers: buildHeaders({ Authorization: `Bearer ${refreshToken}` }),
    },
    {
      method: 'POST',
      headers: buildHeaders(),
    },
  ];

  for (const init of attempts) {
    try {
      const response = await fetch(`${appConfig.apiBaseUrl}/api/v1/users/refresh-token`, init);

      if (!response.ok) {
        continue;
      }

      const payload = (await response.json()) as RefreshPayload;
      const session = parseAuthSession(payload);

      if (session) {
        return session;
      }
    } catch {
      // Keep trying the next refresh shape.
    }
  }

  return null;
}

export async function requestTokenRefresh(refreshToken: string | null): Promise<AuthSession | null> {
  if (!refreshToken) {
    return null;
  }

  if (appConfig.useMockApi) {
    return {
      accessToken: `demo-access-${Date.now()}`,
      refreshToken: `demo-refresh-${Date.now()}`,
      expiresAt: Date.now() + 1000 * 60 * 60,
    };
  }

  return executeRefreshRequest(refreshToken);
}

async function refreshStoredSession(): Promise<AuthSession | null> {
  const [storedRefreshToken, storedSession] = await Promise.all([
    secureStorage.getToken(storageKeys.refreshToken),
    jsonStorage.getItem<AuthSession>(storageKeys.authSession),
  ]);

  const refreshed = await requestTokenRefresh(storedRefreshToken ?? storedSession?.refreshToken ?? null);

  if (!refreshed) {
    await clearAuthState();
    return null;
  }

  await persistAuthSession(refreshed);
  return refreshed;
}

async function buildApiError(response: Response): Promise<ApiError> {
  let message = `Request failed with status ${response.status}.`;

  try {
    const payload = (await response.json()) as { message?: string };

    if (payload.message) {
      message = payload.message;
    }
  } catch {
    // Ignore non-JSON error bodies and keep the fallback message.
  }

  return new ApiError(message, response.status);
}

export async function apiRequest<T>({
  path,
  timeoutMs,
  retries,
  requiresAuth = !shouldSkipAuth(path),
  skipRefresh = false,
  ...init
}: RequestOptions): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs ?? appConfig.requestTimeoutMs);

  try {
    let accessToken = requiresAuth ? await secureStorage.getToken(storageKeys.authToken) : null;

    if (requiresAuth && !skipRefresh) {
      const storedSession = await jsonStorage.getItem<AuthSession>(storageKeys.authSession);

      if (storedSession && storedSession.expiresAt <= Date.now() + authRefreshWindowMs) {
        const refreshed = await refreshStoredSession();
        accessToken = refreshed?.accessToken ?? accessToken;
      }
    }

    const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
      ...init,
      headers: buildHeaders(init.headers, accessToken ?? undefined),
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 401 && requiresAuth && !skipRefresh) {
        const refreshed = await refreshStoredSession();

        if (refreshed) {
          return apiRequest<T>({
            path,
            timeoutMs,
            retries,
            requiresAuth,
            skipRefresh: true,
            ...init,
            headers: buildHeaders(init.headers, refreshed.accessToken),
          });
        }
      }

      if ((retries ?? appConfig.retryCount) > 0 && response.status >= 500) {
        await delay(500);
        return apiRequest<T>({
          path,
          timeoutMs,
          retries: (retries ?? appConfig.retryCount) - 1,
          requiresAuth,
          skipRefresh,
          ...init,
        });
      }

      throw await buildApiError(response);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new TimeoutError();
    }

    if ((retries ?? appConfig.retryCount) > 0) {
      await delay(700);
      return apiRequest<T>({
        path,
        timeoutMs,
        retries: (retries ?? appConfig.retryCount) - 1,
        requiresAuth,
        skipRefresh,
        ...init,
      });
    }

    throw new ApiError('Unable to connect right now. Please try again.');
  } finally {
    clearTimeout(timeout);
  }
}
