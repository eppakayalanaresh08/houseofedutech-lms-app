import { Text, View } from 'react-native';
import { router } from 'expo-router';

import { LegendList } from '@legendapp/list';

import { CourseCard } from '@/src/components/course-card';
import { Screen } from '@/src/components/ui/screen';
import { SectionHeading } from '@/src/components/ui/section-heading';
import { useCourseStore } from '@/src/stores/course-store';

export default function BookmarksScreen() {
  const courses = useCourseStore((state) => state.courses);
  const bookmarks = useCourseStore((state) => state.bookmarks);
  const bookmarkPendingIds = useCourseStore((state) => state.bookmarkPendingIds);
  const enrolledCourseIds = useCourseStore((state) => state.enrolledCourseIds);
  const toggleBookmark = useCourseStore((state) => state.toggleBookmark);
  const selectCourse = useCourseStore((state) => state.selectCourse);

  const bookmarkedCourses = courses.filter((course) => bookmarks.some((entry) => entry.courseId === course.id));

  return (
    <Screen>
      <LegendList
        data={bookmarkedCourses}
        keyExtractor={(item) => item.id}
        recycleItems
        ListHeaderComponent={
          <View className="gap-3 pb-5">
            <SectionHeading
              eyebrow="Saved collection"
              title="Bookmarks"
              subtitle="Local persistence keeps your saved courses available even when the network is unreliable."
            />
            {bookmarkedCourses.length === 0 ? (
              <Text className="rounded-2xl border border-dashed border-line bg-paper px-4 py-4 text-sm leading-6 text-muted">
                Save a few courses from the catalog to build your study shelf.
              </Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            bookmarked
            bookmarkPending={bookmarkPendingIds.includes(item.id)}
            enrolled={enrolledCourseIds.includes(item.id)}
            onPress={() => {
              selectCourse(item.id);
              router.push({ pathname: '/(app)/course/[id]', params: { id: item.id } });
            }}
            onToggleBookmark={() => toggleBookmark(item.id)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 140 }}
      />
    </Screen>
  );
}
