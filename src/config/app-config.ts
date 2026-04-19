import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as
  | {
      apiBaseUrl?: string;
      useMockApi?: boolean;
    }
  | undefined;

export const appConfig = {
  apiBaseUrl: extra?.apiBaseUrl ?? 'https://api.freeapi.app',
  useMockApi: extra?.useMockApi ?? true,
  requestTimeoutMs: 8000,
  retryCount: 2,
};
