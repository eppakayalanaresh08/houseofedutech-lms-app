import { router } from "expo-router";
import { memo, useCallback, useEffect, useMemo } from "react";
import { LayoutAnimation, Platform, Text, UIManager, View } from "react-native";

import { LegendList } from "@legendapp/list";

import { CourseCard } from "@/src/components/course-card";
import { Screen } from "@/src/components/ui/screen";
import { SectionHeading } from "@/src/components/ui/section-heading";
import { useCourseStore } from "@/src/stores/course-store";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Highly optimized list item to prevent full list re-renders
const BookmarkItem = memo(
  ({
    item,
    isPending,
    isEnrolled,
    onPress,
    onToggle,
  }: {
    item: any;
    isPending: boolean;
    isEnrolled: boolean;
    onPress: (id: string) => void;
    onToggle: (id: string) => void;
  }) => (
    <CourseCard
      course={item}
      bookmarked
      bookmarkPending={isPending}
      enrolled={isEnrolled}
      onPress={() => onPress(item.id)}
      onToggleBookmark={() => onToggle(item.id)}
    />
  ),
);

export default function BookmarksScreen() {
  const courses = useCourseStore((state) => state.courses);
  const bookmarks = useCourseStore((state) => state.bookmarks);
  const bookmarkPendingIds = useCourseStore(
    (state) => state.bookmarkPendingIds,
  );
  const enrolledCourseIds = useCourseStore((state) => state.enrolledCourseIds);
  const toggleBookmark = useCourseStore((state) => state.toggleBookmark);
  const selectCourse = useCourseStore((state) => state.selectCourse);

  const bookmarkedCourses = useMemo(
    () =>
      courses.filter((course) =>
        bookmarks.some((entry) => entry.courseId === course.id),
      ),
    [courses, bookmarks],
  );

  useEffect(() => {
    // Smoother transition for item removal
    LayoutAnimation.configureNext({
      ...LayoutAnimation.Presets.easeInEaseOut,
      duration: 300,
    });
  }, [bookmarkedCourses.length]);

  const handlePress = useCallback(
    (courseId: string) => {
      selectCourse(courseId);
      router.push({
        pathname: "/(app)/course/[id]",
        params: { id: courseId },
      });
    },
    [selectCourse],
  );

  const handleToggleBookmark = useCallback(
    (courseId: string) => {
      toggleBookmark(courseId);
    },
    [toggleBookmark],
  );

  return (
    <Screen>
      <LegendList
        data={bookmarkedCourses}
        keyExtractor={(item) => item.id}
        recycleItems
        estimatedItemSize={380}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="gap-3 pb-5">
            <SectionHeading
              eyebrow="Saved collection"
              title="Bookmarks"
              subtitle="Keep your favorite courses together and return to them anytime."
            />
            {bookmarkedCourses.length === 0 ? (
              <Text className="rounded-2xl border border-dashed border-line bg-paper px-4 py-4 text-sm leading-6 text-muted">
                Save a few courses from the catalog to build your study shelf.
              </Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <BookmarkItem
            item={item}
            isPending={bookmarkPendingIds.includes(item.id)}
            isEnrolled={enrolledCourseIds.includes(item.id)}
            onPress={handlePress}
            onToggle={handleToggleBookmark}
          />
        )}
        contentContainerStyle={{ paddingBottom: 92 }}
      />
    </Screen>
  );
}
