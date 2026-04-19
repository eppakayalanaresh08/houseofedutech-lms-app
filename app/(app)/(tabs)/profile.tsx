import { router } from 'expo-router';
import { Alert, Modal, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useEffect, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Screen } from '@/src/components/ui/screen';
import { useAuthStore } from '@/src/stores/auth-store';
import { useCourseStore } from '@/src/stores/course-store';
import { usePreferencesStore } from '@/src/stores/preferences-store';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateAvatar = useAuthStore((state) => state.updateAvatar);
  const bookmarks = useCourseStore((state) => state.bookmarks);
  const enrolledCourseIds = useCourseStore((state) => state.enrolledCourseIds);
  const progressByCourseId = useCourseStore((state) => state.progressByCourseId);
  const preferences = usePreferencesStore((state) => state.preferences);
  const toggleDensity = usePreferencesStore((state) => state.toggleDensity);
  const enableNotifications = usePreferencesStore((state) => state.enableNotifications);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [isPhotoSheetOpen, setIsPhotoSheetOpen] = useState(false);

  const averageProgress =
    enrolledCourseIds.length === 0
      ? 0
      : Math.round(
          enrolledCourseIds.reduce((total, courseId) => total + (progressByCourseId[courseId] ?? 0), 0) /
            enrolledCourseIds.length
        );

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [user?.avatar]);

  async function persistAvatar(uri: string) {
    if (!uri) {
      await updateAvatar('');
      return;
    }

    const extensionMatch = uri.match(/\.(\w+)(?:\?|$)/);
    const extension = extensionMatch?.[1]?.toLowerCase() ?? 'jpg';
    const directory = `${FileSystem.documentDirectory}profile/`;
    const targetUri = `${directory}avatar.${extension}`;

    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });

    try {
      const existing = await FileSystem.getInfoAsync(targetUri);

      if (existing.exists) {
        await FileSystem.deleteAsync(targetUri, { idempotent: true });
      }
    } catch {
      // Continue even if the previous avatar could not be removed.
    }

    await FileSystem.copyAsync({
      from: uri,
      to: targetUri,
    });

    await updateAvatar(targetUri);
  }

  async function handleUpdateFromCamera() {
    setIsUpdatingPhoto(true);

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Camera permission needed', 'Please allow camera access to update your profile photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        await persistAvatar(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Unable to update photo', 'Please try again from your device camera.');
    } finally {
      setIsUpdatingPhoto(false);
    }
  }

  async function handleUpdateFromGallery() {
    setIsUpdatingPhoto(true);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Photo permission needed', 'Please allow photo access to choose a profile image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        await persistAvatar(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Unable to update photo', 'Please try again from your photo library.');
    } finally {
      setIsUpdatingPhoto(false);
    }
  }

  async function handleRemovePhoto() {
    await persistAvatar('');
  }

  function openPhotoOptions() {
    if (isUpdatingPhoto) {
      return;
    }
    setIsPhotoSheetOpen(true);
  }

  function showPersonalOptions() {
    router.push('/(app)/profile/edit');
  }

  function showHelp() {
    Alert.alert('Help', 'Open the profile photo action to update your picture. Notifications and density settings are available in the rows below.');
  }

  if (!user) {
    return null;
  }

  return (
    <Screen scroll>
      <View className="pb-12 pt-2">
        <View className="items-center">
          <Text className="text-[22px] font-semibold text-ink">Profile</Text>
        </View>

        <View className="items-center px-4 pb-8 pt-7">
          <View className="relative">
            {user.avatar && !avatarLoadFailed ? (
              <Image
                source={{ uri: user.avatar }}
                style={{ height: 108, width: 108, borderRadius: 54 }}
                contentFit="cover"
                onError={() => setAvatarLoadFailed(true)}
              />
            ) : (
              <View
                className="items-center justify-center rounded-full border border-line bg-paper"
                style={{ height: 108, width: 108 }}
              >
                <Ionicons name="person" size={42} color="#8C8F94" />
              </View>
            )}

            <Pressable
              onPress={openPhotoOptions}
              disabled={isUpdatingPhoto}
              className="absolute bottom-0 right-0 items-center justify-center rounded-full border-4 border-canvas bg-brand"
              style={{ height: 34, width: 34 }}
            >
              <Ionicons name="pencil" size={16} color="#FCF8F0" />
            </Pressable>
          </View>

          <View className="mt-4 items-center gap-1">
            <Text className="text-[24px] font-semibold text-ink">{user.name}</Text>
            <Text className="text-sm text-muted">{user.email}</Text>
          </View>

          <View className="mt-8 w-full flex-row items-center justify-between rounded-[28px] bg-paper px-5 py-4">
            <View className="flex-1 items-center">
              <View className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-[#EEF2FF]">
                <Ionicons name="book-outline" size={18} color="#4F46E5" />
              </View>
              <Text className="text-lg font-semibold text-ink">{enrolledCourseIds.length}</Text>
              <Text className="text-xs text-muted">Enrolled</Text>
            </View>
            <View className="h-11 w-px bg-line" />
            <View className="flex-1 items-center">
              <View className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-[#FFF1DB]">
                <Ionicons name="bookmark-outline" size={18} color="#D97706" />
              </View>
              <Text className="text-lg font-semibold text-ink">{bookmarks.length}</Text>
              <Text className="text-xs text-muted">Saved</Text>
            </View>
            <View className="h-11 w-px bg-line" />
            <View className="flex-1 items-center">
              <View className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-[#ECFDF3]">
                <Ionicons name="bar-chart-outline" size={18} color="#16A34A" />
              </View>
              <Text className="text-lg font-semibold text-ink">{averageProgress}%</Text>
              <Text className="text-xs text-muted">Progress</Text>
            </View>
          </View>
        </View>

        <View className="rounded-[30px] border border-line bg-paper px-5 py-3 shadow-card">
          <ProfileRow icon="person-outline" label="My Profile" onPress={showPersonalOptions} />
          <ProfileRow
            icon="settings-outline"
            label={`General - ${preferences.classicDensity}`}
            onPress={toggleDensity}
          />
          <ProfileRow
            icon="notifications-outline"
            label={preferences.notificationsEnabled ? 'Notifications enabled' : 'Enable notifications'}
            onPress={enableNotifications}
          />
          <ProfileRow icon="help-circle-outline" label="Help" onPress={showHelp} />
        </View>

        <View className="mt-5 gap-3">
          <Button
            label={isUpdatingPhoto ? 'Opening Photo Options...' : 'Update Photo'}
            variant="secondary"
            onPress={openPhotoOptions}
            disabled={isUpdatingPhoto}
          />
        </View>

        <View className="mt-8">
          <Button
            label="Log Out"
            variant="ghost"
            onPress={async () => {
              await logout();
              router.replace('/(auth)/login');
            }}
          />
        </View>
      </View>

      <Modal
        visible={isPhotoSheetOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPhotoSheetOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/30">
          <Pressable className="flex-1" onPress={() => setIsPhotoSheetOpen(false)} />
          <View className="rounded-t-[32px] bg-paper px-5 pb-8 pt-4">
            <View className="mb-5 items-center">
              <View className="h-1.5 w-12 rounded-full bg-line" />
            </View>

            <Text className="text-center text-xl font-semibold text-ink">Edit Profile Photo</Text>
            <Text className="mt-2 text-center text-sm leading-6 text-muted">
              Choose how you want to update your profile picture.
            </Text>

            <View className="mt-6 gap-3">
              <PhotoSheetAction
                icon="camera-outline"
                label="Open Camera"
                onPress={async () => {
                  setIsPhotoSheetOpen(false);
                  await handleUpdateFromCamera();
                }}
              />
              <PhotoSheetAction
                icon="image-outline"
                label="Choose From Gallery"
                onPress={async () => {
                  setIsPhotoSheetOpen(false);
                  await handleUpdateFromGallery();
                }}
              />
              {user.avatar ? (
                <PhotoSheetAction
                  icon="trash-outline"
                  label="Remove Current Photo"
                  destructive
                  onPress={async () => {
                    setIsPhotoSheetOpen(false);
                    await handleRemovePhoto();
                  }}
                />
              ) : null}
            </View>

            <Pressable
              onPress={() => setIsPhotoSheetOpen(false)}
              className="mt-4 items-center rounded-2xl border border-line bg-canvas px-4 py-4"
            >
              <Text className="text-base font-semibold text-ink">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function ProfileRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void | Promise<void>;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between border-b border-[#F1EEE8] py-4 last:border-b-0"
    >
      <View className="flex-row items-center gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-canvas">
          <Ionicons name={icon} size={18} color="#1E3A5F" />
        </View>
        <Text className="text-base font-medium text-ink">{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#8C8F94" />
    </Pressable>
  );
}

function PhotoSheetAction({
  icon,
  label,
  onPress,
  destructive = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void | Promise<void>;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-4 rounded-[24px] px-4 py-4 ${
        destructive ? 'bg-[#FFF0F0]' : 'bg-canvas'
      }`}
    >
      <View
        className={`h-11 w-11 items-center justify-center rounded-full ${
          destructive ? 'bg-[#FFD9D9]' : 'bg-paper'
        }`}
      >
        <Ionicons name={icon} size={20} color={destructive ? '#B42318' : '#1E3A5F'} />
      </View>
      <Text className={`text-base font-semibold ${destructive ? 'text-[#B42318]' : 'text-ink'}`}>{label}</Text>
    </Pressable>
  );
}
