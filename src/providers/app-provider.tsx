import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import { OfflineBanner } from '@/src/components/offline-banner';
import { useAuthStore } from '@/src/stores/auth-store';
import { useCourseStore } from '@/src/stores/course-store';
import { usePreferencesStore } from '@/src/stores/preferences-store';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const hasBootstrappedRef = useRef(false);

  useEffect(() => {
    if (hasBootstrappedRef.current) {
      return;
    }

    hasBootstrappedRef.current = true;
    let isMounted = true;

    async function bootstrapApp() {
      const { hydrate: hydrateCourses, fetchCourses } = useCourseStore.getState();
      const { hydrate: hydratePreferences, initializeNotifications, markAppOpened } = usePreferencesStore.getState();
      const { bootstrap: bootstrapAuth } = useAuthStore.getState();

      await Promise.all([hydrateCourses(), hydratePreferences(), bootstrapAuth()]);
      await initializeNotifications();
      await fetchCourses();
      await markAppOpened();

      if (isMounted) {
        setIsReady(true);
      }
    }

    bootstrapApp();

    const netInfoUnsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!(state.isConnected && state.isInternetReachable !== false));
    });

    const appStateSubscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        void usePreferencesStore.getState().markAppOpened();
      }
    });

    return () => {
      isMounted = false;
      netInfoUnsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  if (!isReady) {
    return <View className="flex-1 bg-canvas" />;
  }

  return (
    <>
      {isOffline ? <OfflineBanner /> : null}
      {children}
    </>
  );
}
