import { create } from 'zustand';

import { jsonStorage, storageKeys } from '@/src/lib/storage';
import { notifyBookmarkMilestone } from '@/src/services/notifications';
import { courseService } from '@/src/services/api/course-service';
import type { BookmarkRecord, Course } from '@/src/types/domain';

type CourseState = {
  courses: Course[];
  bookmarks: BookmarkRecord[];
  enrolledCourseIds: string[];
  selectedCourseId: string | null;
  search: string;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  fetchCourses: (refresh?: boolean) => Promise<void>;
  setSearch: (value: string) => void;
  toggleBookmark: (courseId: string) => Promise<void>;
  enroll: (courseId: string) => Promise<void>;
  selectCourse: (courseId: string | null) => void;
};

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  bookmarks: [],
  enrolledCourseIds: [],
  selectedCourseId: null,
  search: '',
  loading: false,
  refreshing: false,
  error: null,

  async hydrate() {
    const [bookmarks, enrollments] = await Promise.all([
      jsonStorage.getItem<BookmarkRecord[]>(storageKeys.bookmarks),
      jsonStorage.getItem<string[]>(storageKeys.enrollments),
    ]);

    set({
      bookmarks: bookmarks ?? [],
      enrolledCourseIds: enrollments ?? [],
    });
  },

  async fetchCourses(refresh = false) {
    set({ loading: !refresh, refreshing: refresh, error: null });

    try {
      const courses = await courseService.listCourses();
      set({ courses, loading: false, refreshing: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unable to load courses.',
        loading: false,
        refreshing: false,
      });
    }
  },

  setSearch(value) {
    set({ search: value });
  },

  async toggleBookmark(courseId) {
    const state = get();
    const exists = state.bookmarks.some((entry) => entry.courseId === courseId);
    const bookmarks = exists
      ? state.bookmarks.filter((entry) => entry.courseId !== courseId)
      : [{ courseId, savedAt: new Date().toISOString() }, ...state.bookmarks];

    await jsonStorage.setItem(storageKeys.bookmarks, bookmarks);
    set({ bookmarks });

    if (!exists && bookmarks.length >= 5) {
      await notifyBookmarkMilestone(bookmarks.length);
    }
  },

  async enroll(courseId) {
    const enrolledCourseIds = Array.from(new Set([...get().enrolledCourseIds, courseId]));
    await jsonStorage.setItem(storageKeys.enrollments, enrolledCourseIds);
    set({ enrolledCourseIds });
  },

  selectCourse(courseId) {
    set({ selectedCourseId: courseId });
  },
}));
