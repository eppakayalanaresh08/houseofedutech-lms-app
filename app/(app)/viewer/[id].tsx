import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { WebView } from "react-native-webview";

import { Button } from "@/src/components/ui/button";
import { Screen } from "@/src/components/ui/screen";
import { buildCourseHtml } from "@/src/services/webview-template";
import { useCourseStore } from "@/src/stores/course-store";

export default function ViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [message, setMessage] = useState("Waiting for lesson interaction...");
  const [hasError, setHasError] = useState(false);
  const course = useCourseStore((state) =>
    state.courses.find((entry) => entry.id === id),
  );
  const advanceProgress = useCourseStore((state) => state.advanceProgress);
  const enroll = useCourseStore((state) => state.enroll);

  if (!course) {
    return (
      <Screen>
        <Text className="text-base text-muted">
          Unable to open the lesson viewer.
        </Text>
      </Screen>
    );
  }

  const headers = {
    "x-course-context": course.id,
    "x-render-mode": "native-webview",
  };

  const html = buildCourseHtml(course);

  return (
    <Screen>
      {/* <View className="mb-3 rounded-2xl border border-line bg-paper px-4 py-3">
        <Text className="text-sm text-muted">{message}</Text>
      </View> */}
      {hasError ? (
        <View className="gap-3 rounded-2xl bg-[#FCE8E8] px-4 py-4">
          {/* <Text className="text-sm text-danger">
            The embedded lesson failed to load. Try re-opening the viewer.
          </Text> */}
          <Button
            label="Mark Intro Complete Anyway"
            variant="secondary"
            onPress={async () => {
              await enroll(course.id);
              await advanceProgress(course.id, 10);
              setHasError(false);
              setMessage(
                "Stored a fallback progress update while the WebView is unavailable.",
              );
            }}
          />
        </View>
      ) : (
        <View className="flex-1 overflow-hidden rounded-[28px] border border-line">
          <WebView
            source={{
              html,
              baseUrl: "https://houseofedtech.local",
            }}
            injectedJavaScriptBeforeContentLoaded={`window.__NATIVE_HEADER_BRIDGE__ = ${JSON.stringify(headers)}; true;`}
            onMessage={async (event) => {
              try {
                const payload = JSON.parse(event.nativeEvent.data) as {
                  type?: string;
                  courseId?: string;
                  renderMode?: string;
                };

                if (payload.type === "viewer_ready") {
                  setMessage(
                    `WebView ready in ${payload.renderMode ?? "native"} mode.`,
                  );
                  return;
                }

                if (payload.type === "chapter_complete" && payload.courseId) {
                  await enroll(payload.courseId);
                  await advanceProgress(payload.courseId, 18);
                  setMessage(
                    "Chapter completion received from the embedded lesson and progress was updated.",
                  );
                  return;
                }
              } catch {
                // Ignore parse failures and show the raw bridge payload instead.
              }

              setMessage(`Received from WebView: ${event.nativeEvent.data}`);
            }}
            onError={() => setHasError(true)}
            onHttpError={() => setHasError(true)}
            javaScriptEnabled
            setSupportMultipleWindows={false}
          />
        </View>
      )}
    </Screen>
  );
}
