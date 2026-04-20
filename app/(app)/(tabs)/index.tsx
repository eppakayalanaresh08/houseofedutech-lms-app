import { LegendList } from "@legendapp/list";
import { router } from "expo-router";
import { memo, useCallback, useMemo } from "react";
import { RefreshControl, Text, TextInput, View } from "react-native";

import { CourseCard } from "@/src/components/course-card";
import { Screen } from "@/src/components/ui/screen";
import { SectionHeading } from "@/src/components/ui/section-heading";
import { useCourseStore } from "@/src/stores/course-store";

const CatalogItem = memo(
  ({
    item,
    isBookmarked,
    isPending,
    isEnrolled,
    onPress,
    onToggle,
  }: {
    item: any;
    isBookmarked: boolean;
    isPending: boolean;
    isEnrolled: boolean;
    onPress: (id: string) => void;
    onToggle: (id: string) => void;
  }) => (
    <CourseCard
      course={item}
      bookmarked={isBookmarked}
      bookmarkPending={isPending}
      enrolled={isEnrolled}
      onPress={() => onPress(item.id)}
      onToggleBookmark={() => onToggle(item.id)}
    />
  ),
);

export default function CatalogScreen() {
  const courses = useCourseStore((state) => state.courses);
  const bookmarks = useCourseStore((state) => state.bookmarks);
  const bookmarkPendingIds = useCourseStore(
    (state) => state.bookmarkPendingIds,
  );
  const enrolledCourseIds = useCourseStore((state) => state.enrolledCourseIds);
  const search = useCourseStore((state) => state.search);
  const refreshing = useCourseStore((state) => state.refreshing);
  const loading = useCourseStore((state) => state.loading);
  const error = useCourseStore((state) => state.error);
  const setSearch = useCourseStore((state) => state.setSearch);
  const fetchCourses = useCourseStore((state) => state.fetchCourses);
  const toggleBookmark = useCourseStore((state) => state.toggleBookmark);
  const selectCourse = useCourseStore((state) => state.selectCourse);

  const filteredCourses = useMemo(() => {
    const normalized = search.toLowerCase().trim();

    if (!normalized) {
      return courses;
    }

    return courses.filter((course) =>
      [
        course.title,
        course.description,
        course.instructor.name,
        course.category,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [courses, search]);
  const bookmarkedIds = useMemo(
    () => new Set(bookmarks.map((entry) => entry.courseId)),
    [bookmarks],
  );
  const pendingBookmarkIds = useMemo(
    () => new Set(bookmarkPendingIds),
    [bookmarkPendingIds],
  );
  const enrolledIds = useMemo(
    () => new Set(enrolledCourseIds),
    [enrolledCourseIds],
  );

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
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        estimatedItemSize={280}
        recycleItems
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchCourses(true)}
            tintColor="#1E3A5F"
          />
        }
        ListHeaderComponent={
          <View className="gap-5 pb-5">
            <SectionHeading
              eyebrow="Course catalog"
              title="Classic learning studio"
              subtitle="Discover courses, save what matters, and keep your learning moving."
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search courses, mentors, or categories"
              placeholderTextColor="#8C8F94"
              className="rounded-2xl border border-line bg-paper px-4 py-4 text-base text-ink"
            />
            {error ? (
              <Text className="rounded-2xl bg-[#FCE8E8] px-4 py-3 text-sm text-danger">
                {error}
              </Text>
            ) : null}
            {loading ? (
              <Text className="text-sm text-muted">
                Loading course library...
              </Text>
            ) : null}
            {!loading && filteredCourses.length === 0 ? (
              <Text className="rounded-2xl border border-dashed border-line bg-paper px-4 py-4 text-sm leading-6 text-muted">
                No courses matched your search yet. Try a different title,
                instructor, or category.
              </Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <CatalogItem
            item={item}
            isBookmarked={bookmarkedIds.has(item.id)}
            isPending={pendingBookmarkIds.has(item.id)}
            isEnrolled={enrolledIds.has(item.id)}
            onPress={handlePress}
            onToggle={handleToggleBookmark}
          />
        )}
        contentContainerStyle={{ paddingBottom: 92 }}
      />
    </Screen>
  );
}
