import { Text, View } from 'react-native';
import { router } from 'expo-router';

import { LegendList } from '@legendapp/list';

import { CourseCard } from '@/src/components/course-card';
import { Screen } from '@/src/components/ui/screen';
import { SectionHeading } from '@/src/components/ui/section-heading';
import { useCourseStore } from '@/src/stores/course-store';

export default function EnrolledCoursesScreen() {
  const courses = useCourseStore((state) => state.courses);
  const bookmarks = useCourseStore((state) => state.bookmarks);
  const bookmarkPendingIds = useCourseStore((state) => state.bookmarkPendingIds);
  const enrolledCourseIds = useCourseStore((state) => state.enrolledCourseIds);
  const toggleBookmark = useCourseStore((state) => state.toggleBookmark);
  const selectCourse = useCourseStore((state) => state.selectCourse);

  const enrolledCourses = courses.filter((course) => enrolledCourseIds.includes(course.id));

  return (
    <Screen>
      <LegendList
        data={enrolledCourses}
        keyExtractor={(item) => item.id}
        recycleItems
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="gap-3 pb-5">
            <SectionHeading
              eyebrow="Learning in progress"
              title="Enrolled Courses"
              subtitle="All the courses you have already joined are collected here for quick access."
            />
            {enrolledCourses.length === 0 ? (
              <Text className="rounded-2xl border border-dashed border-line bg-paper px-4 py-4 text-sm leading-6 text-muted">
                Enroll in a course from the catalog to build your active learning list.
              </Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            bookmarked={bookmarks.some((entry) => entry.courseId === item.id)}
            bookmarkPending={bookmarkPendingIds.includes(item.id)}
            enrolled
            onPress={() => {
              selectCourse(item.id);
              router.push({ pathname: '/(app)/course/[id]', params: { id: item.id } });
            }}
            onToggleBookmark={() => toggleBookmark(item.id)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 92 }}
      />
    </Screen>
  );
}
