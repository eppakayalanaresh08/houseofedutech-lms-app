import { router } from 'expo-router';
import { Alert, Modal, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Screen } from '@/src/components/ui/screen';
import { useAuthStore } from '@/src/stores/auth-store';

export default function EditProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);
  const [isPhotoSheetOpen, setIsPhotoSheetOpen] = useState(false);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatar]);

  if (!user) {
    return null;
  }

  async function persistAvatar(uri: string) {
    if (!uri) {
      setAvatar('');
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
      // Ignore cleanup failures and continue writing the replacement avatar.
    }

    await FileSystem.copyAsync({
      from: uri,
      to: targetUri,
    });

    setAvatar(targetUri);
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

  function openPhotoOptions() {
    if (isUpdatingPhoto) {
      return;
    }

    setIsPhotoSheetOpen(true);
  }

  async function handleSaveProfile() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      Alert.alert('Missing details', 'Please enter both your name and email.');
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile({
        name: trimmedName,
        email: trimmedEmail,
        avatar,
      });
      router.back();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen scroll>
      <View className="pb-10 pt-2">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full bg-paper">
            <Ionicons name="chevron-back" size={20} color="#1E3A5F" />
          </Pressable>
          <Text className="text-[22px] font-semibold text-ink">My Profile</Text>
          <View className="h-11 w-11" />
        </View>

        <View className="mt-8 items-center rounded-[32px] bg-paper px-5 py-7 shadow-card">
          <View className="relative">
            {avatar && !avatarLoadFailed ? (
              <Image
                source={{ uri: avatar }}
                style={{ height: 116, width: 116, borderRadius: 58 }}
                contentFit="cover"
                onError={() => setAvatarLoadFailed(true)}
              />
            ) : (
              <View
                className="items-center justify-center rounded-full border border-line bg-canvas"
                style={{ height: 116, width: 116 }}
              >
                <Ionicons name="person" size={46} color="#8C8F94" />
              </View>
            )}

            <Pressable
              onPress={openPhotoOptions}
              disabled={isUpdatingPhoto}
              className="absolute bottom-0 right-0 items-center justify-center rounded-full border-4 border-paper bg-brand"
              style={{ height: 36, width: 36 }}
            >
              <Ionicons name="pencil" size={16} color="#FCF8F0" />
            </Pressable>
          </View>

          <Text className="mt-5 text-sm text-muted">Tap the pencil to update your profile photo.</Text>
        </View>

        <View className="mt-5 gap-4 rounded-[32px] bg-paper p-5 shadow-card">
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View className="mt-5 gap-3">
          <Button
            label={isSaving ? 'Saving Profile...' : 'Save Changes'}
            onPress={handleSaveProfile}
            disabled={isSaving}
          />
          <Button
            label="Cancel"
            variant="ghost"
            onPress={() => router.back()}
            disabled={isSaving}
          />
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
                {avatar ? (
                  <PhotoSheetAction
                    icon="trash-outline"
                    label="Remove Current Photo"
                    destructive
                    onPress={() => {
                      setIsPhotoSheetOpen(false);
                      setAvatar('');
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
      </View>
    </Screen>
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
