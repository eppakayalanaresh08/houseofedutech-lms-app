import { Redirect } from 'expo-router';

import { useAuthStore } from '@/src/stores/auth-store';

export default function IndexScreen() {
  const status = useAuthStore((state) => state.status);

  if (status === 'authenticated') {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
