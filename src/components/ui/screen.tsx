import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({
  children,
  scroll = false,
  scrollRef,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  scrollRef?: React.RefObject<ScrollView | null>;
}) {
  const staticContent = <View className="flex-1 bg-canvas px-5 pb-6 pt-3">{children}</View>;
  const scrollContent = <View className="bg-canvas">{children}</View>;

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}
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
