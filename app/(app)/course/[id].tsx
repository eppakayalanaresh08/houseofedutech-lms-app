import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';

import { Button } from '@/src/components/ui/button';
import { Screen } from '@/src/components/ui/screen';
import { SectionHeading } from '@/src/components/ui/section-heading';
import { useCourseStore } from '@/src/stores/course-store';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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

  return (
    <Screen scroll>
      <View className="gap-5 pb-10">
        <Image source={{ uri: course.thumbnail }} style={{ height: 240, width: '100%', borderRadius: 28 }} contentFit="cover" />
        <SectionHeading eyebrow={course.category} title={course.title} subtitle={course.description} />
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
          <Text className="text-sm leading-7 text-muted">
            Instructor: {course.instructor.name} | Level: {course.level} | Rating: {course.rating}
          </Text>
          <Text className="mt-4 text-sm leading-7 text-muted">
            {course.lessons} lessons over approximately {course.durationMinutes} minutes. Designed with a calmer,
            classic mobile reading rhythm for better comprehension.
          </Text>
          <Text className="mt-4 text-sm font-medium text-brand">Progress: {progress}% complete</Text>
        </View>
        <View className="gap-3">
          <Button
            label={isEnrolled ? 'Enrolled Successfully' : 'Enroll in Course'}
            onPress={() => enroll(course.id)}
            disabled={isEnrolled}
          />
          <Button
            label={
              isBookmarkPending
                ? isBookmarked
                  ? 'Removing Bookmark...'
                  : 'Saving Bookmark...'
                : isBookmarked
                  ? 'Remove Bookmark'
                  : 'Save Bookmark'
            }
            variant="secondary"
            onPress={() => toggleBookmark(course.id)}
            disabled={isBookmarkPending}
          />
          <Button
            label="Open Embedded Viewer"
            variant="ghost"
            onPress={() => router.push({ pathname: '/(app)/viewer/[id]', params: { id: course.id } })}
          />
        </View>
      </View>
    </Screen>
  );
}
