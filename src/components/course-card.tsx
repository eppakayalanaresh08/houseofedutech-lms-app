import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';

import type { Course } from '@/src/types/domain';

export const CourseCard = memo(function CourseCard({
  course,
  bookmarked,
  enrolled,
  onPress,
  onToggleBookmark,
}: {
  course: Course;
  bookmarked: boolean;
  enrolled: boolean;
  onPress: () => void;
  onToggleBookmark: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="mb-4 overflow-hidden rounded-[28px] border border-line bg-paper shadow-card">
      <Image source={{ uri: course.thumbnail }} style={{ height: 180, width: '100%' }} contentFit="cover" />
      <View className="gap-3 p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-2">
            <Text className="text-xs uppercase tracking-[2px] text-accent">{course.category}</Text>
            <Text className="text-xl font-semibold text-ink">{course.title}</Text>
          </View>
          <Pressable onPress={onToggleBookmark} className="rounded-full border border-line bg-canvas p-2">
            <Feather name={bookmarked ? 'bookmark' : 'bookmark'} size={18} color={bookmarked ? '#B88932' : '#325779'} />
          </Pressable>
        </View>
        <Text className="text-sm leading-6 text-muted" numberOfLines={2}>
          {course.description}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-brand">{course.instructor.name}</Text>
          <Text className="text-sm text-muted">{course.lessons} lessons</Text>
        </View>
        {enrolled ? (
          <View className="self-start rounded-full bg-accentSoft px-3 py-2">
            <Text className="text-xs font-semibold uppercase tracking-[1px] text-brand">Enrolled</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
});
