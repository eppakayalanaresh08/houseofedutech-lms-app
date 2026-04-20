import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="courses/enrolled" />
      <Stack.Screen name="profile/edit" />
      <Stack.Screen name="course/[id]" />
      <Stack.Screen name="viewer/[id]" />
    </Stack>
  );
}
