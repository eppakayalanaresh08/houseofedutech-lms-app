import { ActivityIndicator, Text, View } from 'react-native';
import { Image } from 'expo-image';

export function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-canvas">
      <View className="h-24 w-24 items-center justify-center rounded-[32px] bg-paper shadow-card">
        <Image
          source={require('@/assets/images/icon.png')}
          style={{ height: 64, width: 64, borderRadius: 16 }}
          contentFit="contain"
        />
      </View>
      <View className="mt-8 items-center">
        <Text className="text-[10px] font-bold uppercase tracking-[4px] text-brand/60">
          Welcome to
        </Text>
        <Text className="mt-1 text-lg font-bold tracking-[-0.5px] text-ink">
          HouseofEdTech
        </Text>
      </View>
      <ActivityIndicator size="small" color="#1E3A5F" style={{ marginTop: 40 }} />
    </View>
  );
}
