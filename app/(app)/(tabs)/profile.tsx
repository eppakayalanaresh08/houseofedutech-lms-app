import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { Button } from '@/src/components/ui/button';
import { Screen } from '@/src/components/ui/screen';
import { SectionHeading } from '@/src/components/ui/section-heading';
import { useAuthStore } from '@/src/stores/auth-store';
import { useCourseStore } from '@/src/stores/course-store';
import { usePreferencesStore } from '@/src/stores/preferences-store';

const avatarChoices = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
];

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateAvatar = useAuthStore((state) => state.updateAvatar);
  const bookmarks = useCourseStore((state) => state.bookmarks);
  const enrolledCourseIds = useCourseStore((state) => state.enrolledCourseIds);
  const preferences = usePreferencesStore((state) => state.preferences);
  const toggleDensity = usePreferencesStore((state) => state.toggleDensity);
  const enableNotifications = usePreferencesStore((state) => state.enableNotifications);

  if (!user) {
    return null;
  }

  return (
    <Screen scroll>
      <View className="gap-5 pb-12">
        <SectionHeading
          eyebrow="Learner profile"
          title={user.name}
          subtitle="A steady, readable UI with preferences, saved learning stats, and secure session handling."
        />

        <View className="items-center gap-4 rounded-[28px] border border-line bg-paper p-6">
          <Image source={{ uri: user.avatar }} style={{ height: 108, width: 108, borderRadius: 54 }} contentFit="cover" />
          <Text className="text-base text-muted">{user.email}</Text>
          <View className="w-full flex-row justify-between rounded-2xl bg-canvas p-4">
            <View className="items-center gap-1">
              <Text className="text-2xl font-semibold text-brand">{enrolledCourseIds.length}</Text>
              <Text className="text-xs uppercase tracking-[1px] text-muted">Enrolled</Text>
            </View>
            <View className="items-center gap-1">
              <Text className="text-2xl font-semibold text-brand">{bookmarks.length}</Text>
              <Text className="text-xs uppercase tracking-[1px] text-muted">Saved</Text>
            </View>
            <View className="items-center gap-1">
              <Text className="text-2xl font-semibold text-brand">{user.streakDays}</Text>
              <Text className="text-xs uppercase tracking-[1px] text-muted">Streak</Text>
            </View>
          </View>
        </View>

        <View className="gap-3 rounded-[28px] border border-line bg-paper p-5">
          <Text className="text-lg font-semibold text-ink">Profile photo</Text>
          <View className="flex-row gap-3">
            {avatarChoices.map((avatar) => (
              <Pressable key={avatar} onPress={() => updateAvatar(avatar)}>
                <Image source={{ uri: avatar }} style={{ height: 68, width: 68, borderRadius: 34 }} contentFit="cover" />
              </Pressable>
            ))}
          </View>
        </View>

        <View className="gap-4 rounded-[28px] border border-line bg-paper p-5">
          <Text className="text-lg font-semibold text-ink">Preferences</Text>
          <Text className="text-sm text-muted">Density: {preferences.classicDensity}</Text>
          <Button label="Toggle Density" variant="secondary" onPress={toggleDensity} />
          <Button label="Enable Notifications" variant="secondary" onPress={enableNotifications} />
        </View>

        <Button
          label="Log Out"
          variant="ghost"
          onPress={async () => {
            await logout();
            router.replace('/(auth)/login');
          }}
        />
      </View>
    </Screen>
  );
}
