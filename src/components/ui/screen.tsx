import { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Screen({
  children,
  scroll = false,
  scrollRef,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  scrollRef?: React.RefObject<ScrollView | null>;
}) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const staticContent = (
    <View className="flex-1 bg-canvas px-5 pb-6 pt-3">{children}</View>
  );
  const scrollContent = <View className="bg-canvas">{children}</View>;

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-canvas">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {scroll ? (
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: keyboardHeight > 0 ? keyboardHeight + 20 : 24,
            }}
          >
            {scrollContent}
          </ScrollView>
        ) : (
          staticContent
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
