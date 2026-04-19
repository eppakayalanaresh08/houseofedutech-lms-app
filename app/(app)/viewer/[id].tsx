import { useState } from 'react';
import { Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';

import { Screen } from '@/src/components/ui/screen';
import { buildCourseHtml } from '@/src/services/webview-template';
import { useCourseStore } from '@/src/stores/course-store';

export default function ViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [message, setMessage] = useState('Waiting for lesson interaction...');
  const [hasError, setHasError] = useState(false);
  const course = useCourseStore((state) => state.courses.find((entry) => entry.id === id));

  if (!course) {
    return (
      <Screen>
        <Text className="text-base text-muted">Unable to open the lesson viewer.</Text>
      </Screen>
    );
  }

  const headers = {
    'x-course-context': course.id,
    'x-render-mode': 'native-webview',
  };

  return (
    <Screen>
      <View className="mb-3 rounded-2xl border border-line bg-paper px-4 py-3">
        <Text className="text-sm text-muted">{message}</Text>
      </View>
      {hasError ? (
        <View className="rounded-2xl bg-[#FCE8E8] px-4 py-4">
          <Text className="text-sm text-danger">The embedded lesson failed to load. Pull back and retry.</Text>
        </View>
      ) : (
        <View className="flex-1 overflow-hidden rounded-[28px] border border-line">
          <WebView
            source={{
              html: buildCourseHtml(course, headers),
              baseUrl: 'https://houseofedtech.local',
            }}
            injectedJavaScriptBeforeContentLoaded={`window.__NATIVE_HEADER_BRIDGE__ = ${JSON.stringify(headers)}; true;`}
            onMessage={(event) => {
              setMessage(`Received from WebView: ${event.nativeEvent.data}`);
            }}
            onError={() => setHasError(true)}
            javaScriptEnabled
            setSupportMultipleWindows={false}
          />
        </View>
      )}
    </Screen>
  );
}
