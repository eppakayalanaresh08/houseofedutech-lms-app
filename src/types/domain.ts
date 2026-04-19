export type AuthMode = 'login' | 'register';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  enrolledCourseIds: string[];
  bookmarkedCourseIds: string[];
  streakDays: number;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  avatar: string;
  headline: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  lessons: number;
  durationMinutes: number;
  thumbnail: string;
  instructor: Instructor;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface AppPreferences {
  notificationsEnabled: boolean;
  reminderScheduledAt?: string;
  classicDensity: 'comfortable' | 'compact';
}

export interface AuthPayload {
  email: string;
  password: string;
  username?: string;
  name?: string;
}

export interface BookmarkRecord {
  courseId: string;
  savedAt: string;
}
