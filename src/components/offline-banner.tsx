import { Text, View } from 'react-native';

export function OfflineBanner() {
  return (
    <View className="bg-danger px-4 py-3">
      <Text className="text-center text-sm font-medium text-paper">
        You are offline. Cached bookmarks and enrollment state are still available.
      </Text>
    </View>
  );
}
