import { LegendList } from "@legendapp/list";
import { router } from "expo-router";
import { useMemo } from "react";
import { RefreshControl, Text, TextInput, View } from "react-native";

import { CourseCard } from "@/src/components/course-card";
import { Screen } from "@/src/components/ui/screen";
import { SectionHeading } from "@/src/components/ui/section-heading";
import { useCourseStore } from "@/src/stores/course-store";

export default function CatalogScreen() {
  const courses = useCourseStore((state) => state.courses);
  const bookmarks = useCourseStore((state) => state.bookmarks);
  const bookmarkPendingIds = useCourseStore((state) => state.bookmarkPendingIds);
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
  const bookmarkedIds = useMemo(() => new Set(bookmarks.map((entry) => entry.courseId)), [bookmarks]);
  const pendingBookmarkIds = useMemo(() => new Set(bookmarkPendingIds), [bookmarkPendingIds]);

  return (
    <Screen>
      <LegendList
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        extraData={bookmarks}
        estimatedItemSize={280}
        maintainVisibleContentPosition
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
              subtitle="Searchable lessons, bookmark persistence, pull-to-refresh, and production-minded state flows."
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
          <CourseCard
            course={item}
            bookmarked={bookmarkedIds.has(item.id)}
            bookmarkPending={pendingBookmarkIds.has(item.id)}
            enrolled={enrolledCourseIds.includes(item.id)}
            onPress={() => {
              selectCourse(item.id);
              router.push({
                pathname: "/(app)/course/[id]",
                params: { id: item.id },
              });
            }}
            onToggleBookmark={() => toggleBookmark(item.id)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 140 }}
      />
    </Screen>
  );
}
