import { appConfig } from '@/src/config/app-config';
import { ApiError, TimeoutError } from '@/src/services/api/errors';

interface RequestOptions extends RequestInit {
  path: string;
  timeoutMs?: number;
  retries?: number;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

export async function apiRequest<T>({ path, timeoutMs, retries, ...init }: RequestOptions): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs ?? appConfig.requestTimeoutMs);

  try {
    const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
      signal: controller.signal,
    });

      if (!response.ok) {
        if ((retries ?? appConfig.retryCount) > 0 && response.status >= 500) {
          await delay(500);
          return apiRequest<T>({
          path,
          timeoutMs,
          retries: (retries ?? appConfig.retryCount) - 1,
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
        ...init,
      });
    }

    throw new ApiError('Unable to connect right now. Please try again.');
  } finally {
    clearTimeout(timeout);
  }
}
