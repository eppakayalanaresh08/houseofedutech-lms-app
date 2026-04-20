import { create } from 'zustand';

import { jsonStorage, storageKeys } from '@/src/lib/storage';
import { courseService } from '@/src/services/api/course-service';
import { notifyBookmarkMilestone } from '@/src/services/notifications';
import type { BookmarkRecord, Course } from '@/src/types/domain';

type CourseState = {
  courses: Course[];
  bookmarks: BookmarkRecord[];
  bookmarkPendingIds: string[];
  enrolledCourseIds: string[];
  progressByCourseId: Record<string, number>;
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
  advanceProgress: (courseId: string, amount?: number) => Promise<void>;
  selectCourse: (courseId: string | null) => void;
};

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  bookmarks: [],
  bookmarkPendingIds: [],
  enrolledCourseIds: [],
  progressByCourseId: {},
  selectedCourseId: null,
  search: '',
  loading: false,
  refreshing: false,
  error: null,

  async hydrate() {
    const [bookmarks, enrollments, progressByCourseId] = await Promise.all([
      jsonStorage.getItem<BookmarkRecord[]>(storageKeys.bookmarks),
      jsonStorage.getItem<string[]>(storageKeys.enrollments),
      jsonStorage.getItem<Record<string, number>>(storageKeys.courseProgress),
    ]);

    set({
      bookmarks: bookmarks ?? [],
      enrolledCourseIds: enrollments ?? [],
      progressByCourseId: progressByCourseId ?? {},
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
    if (get().bookmarkPendingIds.includes(courseId)) {
      return;
    }

    const currentState = get();
    const exists = currentState.bookmarks.some((entry) => entry.courseId === courseId);
    const newBookmarks = exists
      ? currentState.bookmarks.filter((entry) => entry.courseId !== courseId)
      : [{ courseId, savedAt: new Date().toISOString() }, ...currentState.bookmarks];

    // 1. Optimistic UI update - Immediate
    set((state) => ({
      bookmarks: newBookmarks,
      bookmarkPendingIds: [...state.bookmarkPendingIds, courseId],
    }));

    try {
      // 2. Persistence - Non-blocking for UI responsiveness
      await jsonStorage.setItem(storageKeys.bookmarks, newBookmarks);

      // 3. Optional side effects
      if (!exists && newBookmarks.length >= 5) {
        // Don't await this if it blocks UI
        void notifyBookmarkMilestone(newBookmarks.length);
      }
    } catch (error) {
      // Revert on failure
      set({ bookmarks: currentState.bookmarks });
      console.error('Failed to sync bookmark:', error);
    } finally {
      // 4. Cleanup pending state - Always run
      set((state) => ({
        bookmarkPendingIds: state.bookmarkPendingIds.filter((id) => id !== courseId),
      }));
    }
  },

  async enroll(courseId) {
    const enrolledCourseIds = Array.from(new Set([...get().enrolledCourseIds, courseId]));
    const progressByCourseId = {
      ...get().progressByCourseId,
      [courseId]: Math.max(get().progressByCourseId[courseId] ?? 0, 12),
    };

    await Promise.all([
      jsonStorage.setItem(storageKeys.enrollments, enrolledCourseIds),
      jsonStorage.setItem(storageKeys.courseProgress, progressByCourseId),
    ]);

    set({ enrolledCourseIds, progressByCourseId });
  },

  async advanceProgress(courseId, amount = 12) {
    const current = get().progressByCourseId[courseId] ?? 0;
    const progressByCourseId = {
      ...get().progressByCourseId,
      [courseId]: Math.min(100, current + amount),
    };

    await jsonStorage.setItem(storageKeys.courseProgress, progressByCourseId);
    set({ progressByCourseId });
  },

  selectCourse(courseId) {
    set({ selectedCourseId: courseId });
  },
}));
