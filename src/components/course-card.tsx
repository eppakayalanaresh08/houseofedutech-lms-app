import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { memo, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { Course } from '@/src/types/domain';

const defaultCourseThumbnail =
  'https://scontent.fhyd5-2.fna.fbcdn.net/v/t39.30808-6/473733499_122151734738347601_8963855852835636920_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=2a1932&_nc_ohc=woiFIDbftv4Q7kNvwHvvt4V&_nc_oc=AdrQ9NILCw_6L8FCFBVrZ0kYF2VPdk72JI-gQgtrgMxgXprZWsF7b-QwilYRubXUPcI&_nc_zt=23&_nc_ht=scontent.fhyd5-2.fna&_nc_gid=sD48aPMWySmevybPJHdIEA&_nc_ss=7a389&oh=00_Af0JUUJGUkurozAaHS7dIQGrURNzI8ovImzW8DsFH1afzg&oe=69EAC107';

function CourseCardComponent({
  course,
  bookmarked,
  bookmarkPending,
  enrolled,
  onPress,
  onToggleBookmark,
}: {
  course: Course;
  bookmarked: boolean;
  bookmarkPending?: boolean;
  enrolled: boolean;
  onPress: () => void;
  onToggleBookmark: () => Promise<void> | void;
}) {
  const [imageUri, setImageUri] = useState(course.thumbnail || defaultCourseThumbnail);

  useEffect(() => {
    setImageUri(course.thumbnail || defaultCourseThumbnail);
  }, [course.thumbnail]);

  return (
    <Pressable
      onPress={onPress}
      className="mb-4 overflow-hidden rounded-[28px] border border-line bg-paper shadow-card"
    >
      <Image
        source={{ uri: imageUri }}
        style={{ height: 180, width: '100%' }}
        contentFit="cover"
        onError={() => {
          if (imageUri !== defaultCourseThumbnail) {
            setImageUri(defaultCourseThumbnail);
          }
        }}
      />
      <View className="gap-3 p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-2">
            <Text className="text-xs uppercase tracking-[2px] text-accent">{course.category}</Text>
            <Text className="text-xl font-semibold text-ink">{course.title}</Text>
          </View>
          <Pressable
            disabled={bookmarkPending}
            onPress={async (event) => {
              event.stopPropagation?.();
              await onToggleBookmark();
            }}
            className={`${bookmarked ? 'border border-[#B88932] bg-[#B88932]' : 'border border-line bg-canvas'} rounded-full p-2 ${bookmarkPending ? 'opacity-60' : ''}`}
          >
            <Feather name="bookmark" size={18} color={bookmarked ? '#FFF8EB' : '#325779'} />
          </Pressable>
        </View>
        <Text className="text-sm leading-6 text-muted" numberOfLines={2}>
          {course.description}
        </Text>
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1 flex-row items-center gap-3">
            <Image
              source={{ uri: course.instructor.avatar }}
              style={{ height: 38, width: 38, borderRadius: 19 }}
              contentFit="cover"
            />
            <View className="flex-1">
              <Text className="text-sm font-medium text-brand">{course.instructor.name}</Text>
              <Text className="text-xs text-muted" numberOfLines={1}>
                {course.instructor.headline}
              </Text>
            </View>
          </View>
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
}

export const CourseCard = memo(CourseCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.bookmarked === nextProps.bookmarked &&
    prevProps.bookmarkPending === nextProps.bookmarkPending &&
    prevProps.enrolled === nextProps.enrolled &&
    prevProps.course.id === nextProps.course.id &&
    prevProps.course.thumbnail === nextProps.course.thumbnail &&
    prevProps.course.title === nextProps.course.title &&
    prevProps.course.description === nextProps.course.description &&
    prevProps.course.category === nextProps.course.category &&
    prevProps.course.lessons === nextProps.course.lessons &&
    prevProps.course.instructor.name === nextProps.course.instructor.name &&
    prevProps.course.instructor.avatar === nextProps.course.instructor.avatar &&
    prevProps.course.instructor.headline === nextProps.course.instructor.headline
  );
});
