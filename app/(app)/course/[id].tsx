import { router, useLocalSearchParams } from 'expo-router';
import { Modal, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Screen } from '@/src/components/ui/screen';
import { SectionHeading } from '@/src/components/ui/section-heading';
import { useCourseStore } from '@/src/stores/course-store';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isEnrollSuccessOpen, setIsEnrollSuccessOpen] = useState(false);
  const course = useCourseStore((state) => state.courses.find((entry) => entry.id === id));
  const bookmarks = useCourseStore((state) => state.bookmarks);
  const bookmarkPendingIds = useCourseStore((state) => state.bookmarkPendingIds);
  const enrolledCourseIds = useCourseStore((state) => state.enrolledCourseIds);
  const progressByCourseId = useCourseStore((state) => state.progressByCourseId);
  const toggleBookmark = useCourseStore((state) => state.toggleBookmark);
  const enroll = useCourseStore((state) => state.enroll);

  if (!course) {
    return (
      <Screen>
        <Text className="text-base text-muted">Course not found.</Text>
      </Screen>
    );
  }

  const isBookmarked = bookmarks.some((entry) => entry.courseId === course.id);
  const isBookmarkPending = bookmarkPendingIds.includes(course.id);
  const isEnrolled = enrolledCourseIds.includes(course.id);
  const progress = progressByCourseId[course.id] ?? 0;

  async function handleEnroll() {
    if (isEnrolled) {
      return;
    }

    await enroll(course.id);
    setIsEnrollSuccessOpen(true);
  }

  return (
    <Screen scroll>
      <View className="gap-5 pb-10">
        <Image source={{ uri: course.thumbnail }} style={{ height: 240, width: '100%', borderRadius: 28 }} contentFit="cover" />
        <View className="flex-row items-start gap-4">
          <View className="flex-1">
            <SectionHeading eyebrow={course.category} title={course.title} subtitle={course.description} />
          </View>
          <Pressable
            onPress={() => toggleBookmark(course.id)}
            className={`mt-2 items-center justify-center rounded-full border ${
              isBookmarked
                ? 'border-[#B88932] bg-[#B88932]'
                : 'border-line bg-paper'
            }`}
            style={{ height: 46, width: 46 }}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isBookmarked ? '#FFF8EB' : '#1E3A5F'}
            />
          </Pressable>
        </View>
        <View className="rounded-[28px] border border-line bg-paper p-5">
          <View className="mb-4 flex-row items-center gap-4">
            <Image
              source={{ uri: course.instructor.avatar }}
              style={{ height: 56, width: 56, borderRadius: 28 }}
              contentFit="cover"
            />
            <View className="flex-1">
              <Text className="text-base font-semibold text-ink">{course.instructor.name}</Text>
              <Text className="text-sm text-muted">{course.instructor.headline}</Text>
            </View>
          </View>
          <View className="flex-row flex-wrap gap-3">
            <DetailChip icon="layers-outline" label={course.level} />
            <DetailChip icon="star-outline" label={`${course.rating}`} />
          </View>
          <Text className="mt-4 text-sm leading-7 text-muted">
            {course.lessons} lessons over approximately {course.durationMinutes} minutes. Designed with a calmer,
            classic mobile reading rhythm for better comprehension.
          </Text>
          <Text className="mt-4 text-sm font-medium text-brand">Progress: {progress}% complete</Text>
        </View>
        <View className="gap-3">
          <Button
            label={isEnrolled ? 'Enrolled Successfully' : 'Enroll in Course'}
            onPress={handleEnroll}
            disabled={isEnrolled}
          />
          <Text className="text-center text-sm text-muted">
            {isBookmarked ? 'Saved to your bookmarks' : ''}
          </Text>
          <Button
            label="Open Embedded Viewer"
            variant="ghost"
            onPress={() => router.push({ pathname: '/(app)/viewer/[id]', params: { id: course.id } })}
          />
        </View>
      </View>

      <Modal
        visible={isEnrollSuccessOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEnrollSuccessOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/30">
          <Pressable className="flex-1" onPress={() => setIsEnrollSuccessOpen(false)} />
          <View className="rounded-t-[32px] bg-paper px-5 pb-8 pt-4">
            <View className="mb-5 items-center">
              <View className="h-1.5 w-12 rounded-full bg-line" />
            </View>

            <View className="items-center">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-[#ECFDF3]">
                <Ionicons name="checkmark" size={30} color="#16A34A" />
              </View>
            </View>

            <Text className="mt-5 text-center text-xl font-semibold text-ink">Enrollment successful</Text>
            <Text className="mt-2 text-center text-sm leading-6 text-muted">
              You are now enrolled in {course.title}.
            </Text>

            <View className="mt-6 gap-3">
              <Button
                label="Start Learning"
                onPress={() => {
                  setIsEnrollSuccessOpen(false);
                  router.push({ pathname: '/(app)/viewer/[id]', params: { id: course.id } });
                }}
              />
              <Pressable
                onPress={() => setIsEnrollSuccessOpen(false)}
                className="items-center rounded-2xl border border-line bg-canvas px-4 py-4"
              >
                <Text className="text-base font-semibold text-ink">Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function DetailChip({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View className="flex-row items-center gap-2 rounded-full border border-line bg-canvas px-3 py-2">
      <Ionicons name={icon} size={15} color="#1E3A5F" />
      <Text className="text-sm font-medium text-ink">{label}</Text>
    </View>
  );
}
