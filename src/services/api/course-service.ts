import { appConfig } from '@/src/config/app-config';
import { apiRequest } from '@/src/services/api/client';
import { mockCourses } from '@/src/services/api/mock-data';
import type { Course, Instructor } from '@/src/types/domain';

interface FreeApiList<T> {
  data?: {
    data?: T[];
  };
}

interface RandomUserApiItem {
  id: number;
  firstName: string;
  lastName: string;
  maidenName?: string;
  email: string;
  image: string;
  company?: {
    title?: string;
  };
}

interface RandomProductApiItem {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  rating?: number;
  thumbnail: string;
  stock?: number;
}

function adaptInstructor(item: RandomUserApiItem): Instructor {
  return {
    id: `ins-${item.id}`,
    name: `${item.firstName} ${item.lastName}`,
    email: item.email,
    avatar: item.image,
    headline: item.company?.title ?? item.maidenName ?? 'Course mentor',
  };
}

function adaptCourse(item: RandomProductApiItem, instructor: Instructor): Course {
  return {
    id: `course-${item.id}`,
    title: item.title,
    description: item.description,
    category: item.category,
    price: item.price,
    rating: item.rating ?? 4.6,
    lessons: Math.max(8, (item.stock ?? 20) % 24),
    durationMinutes: 90 + ((item.stock ?? 20) % 8) * 25,
    thumbnail: item.thumbnail,
    instructor,
    level: item.price > 100 ? 'Advanced' : item.price > 50 ? 'Intermediate' : 'Beginner',
  };
}

export const courseService = {
  async listCourses(): Promise<Course[]> {
    if (appConfig.useMockApi) {
      return mockCourses;
    }

    const [usersResponse, productsResponse] = await Promise.all([
      apiRequest<FreeApiList<RandomUserApiItem>>({ path: '/api/v1/public/randomusers?page=1&limit=12' }),
      apiRequest<FreeApiList<RandomProductApiItem>>({ path: '/api/v1/public/randomproducts?page=1&limit=20' }),
    ]);

    const instructors = (usersResponse.data?.data ?? []).map(adaptInstructor);
    const courses = (productsResponse.data?.data ?? []).map((item, index) =>
      adaptCourse(item, instructors[index % Math.max(instructors.length, 1)] ?? mockCourses[0].instructor)
    );

    return courses.length > 0 ? courses : mockCourses;
  },
};
