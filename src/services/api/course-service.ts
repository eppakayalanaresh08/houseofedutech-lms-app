import { appConfig } from '@/src/config/app-config';
import { apiRequest } from '@/src/services/api/client';
import { mockCourses } from '@/src/services/api/mock-data';
import type { Course, Instructor } from '@/src/types/domain';

const defaultCourseThumbnail =
  'https://scontent.fhyd5-2.fna.fbcdn.net/v/t39.30808-6/473733499_122151734738347601_8963855852835636920_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=2a1932&_nc_ohc=woiFIDbftv4Q7kNvwHvvt4V&_nc_oc=AdrQ9NILCw_6L8FCFBVrZ0kYF2VPdk72JI-gQgtrgMxgXprZWsF7b-QwilYRubXUPcI&_nc_zt=23&_nc_ht=scontent.fhyd5-2.fna&_nc_gid=sD48aPMWySmevybPJHdIEA&_nc_ss=7a389&oh=00_Af0JUUJGUkurozAaHS7dIQGrURNzI8ovImzW8DsFH1afzg&oe=69EAC107';

interface FreeApiList<T> {
  data?: {
    data?: T[];
  };
}

interface RandomUserApiItem {
  id: number;
  email: string;
  nat?: string;
  dob?: {
    age?: number;
  };
  name?: {
    first?: string;
    last?: string;
  };
  picture?: {
    large?: string;
    medium?: string;
    thumbnail?: string;
  };
  login?: {
    username?: string;
  };
  location?: {
    city?: string;
    country?: string;
  };
}

interface RandomProductApiItem {
  id: number;
  title: string;
  category: string;
  price: number;
  thumbnail: string;
  images?: string[];
}

function unwrapPaginatedData<T>(response: FreeApiList<T>): T[] {
  return Array.isArray(response.data?.data) ? response.data.data : [];
}

function titleCase(value: string) {
  return value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeProductImageUrl(url: string, productId: number) {
  if (!url) {
    return defaultCourseThumbnail;
  }

  if (url.includes('i.dummyjson.com/data/products/')) {
    return defaultCourseThumbnail;
  }

  if (url.includes('cdn.dummyjson.com/product-images/')) {
    return defaultCourseThumbnail;
  }

  return url;
}

function buildCourseDescription(item: RandomProductApiItem, instructor: Instructor) {
  const categoryLabel = titleCase(item.category);
  return `${item.title} is presented as a ${categoryLabel} course guided by ${instructor.name}. Learn the core ideas, practical walkthroughs, and a polished study flow in a focused mobile-friendly format.`;
}

function adaptInstructor(item: RandomUserApiItem): Instructor {
  const firstName = item.name?.first?.trim() ?? 'Guest';
  const lastName = item.name?.last?.trim() ?? 'Instructor';
  const location = [item.location?.city, item.location?.country].filter(Boolean).join(', ');

  return {
    id: `ins-${item.id}`,
    name: `${firstName} ${lastName}`.trim(),
    email: item.email,
    avatar: item.picture?.large ?? item.picture?.medium ?? item.picture?.thumbnail ?? mockCourses[0].instructor.avatar,
    headline:
      location ||
      item.login?.username ||
      (typeof item.dob?.age === 'number' ? `${item.dob.age}+ years of experience` : undefined) ||
      item.nat ||
      'Course mentor',
  };
}

function adaptCourse(item: RandomProductApiItem, instructor: Instructor, index: number): Course {
  const derivedLessonCount = 10 + (index % 6) * 2;
  const derivedDuration = 120 + (index % 5) * 35;

  return {
    id: `course-${item.id}`,
    title: item.title,
    description: buildCourseDescription(item, instructor),
    category: titleCase(item.category),
    price: item.price,
    rating: 4.4 + ((index % 5) * 0.1),
    lessons: derivedLessonCount,
    durationMinutes: derivedDuration,
    thumbnail: normalizeProductImageUrl(item.thumbnail, item.id),
    instructor,
    level: item.price > 100 ? 'Advanced' : item.price >= 50 ? 'Intermediate' : 'Beginner',
  };
}

export const courseService = {
  async listCourses(): Promise<Course[]> {
    if (appConfig.useMockApi) {
      return mockCourses;
    }

    try {
      const [usersResponse, productsResponse] = await Promise.all([
        apiRequest<FreeApiList<RandomUserApiItem>>({ path: '/api/v1/public/randomusers?page=1&limit=10' }),
        apiRequest<FreeApiList<RandomProductApiItem>>({
          path: '/api/v1/public/randomproducts?page=1&limit=10&inc=category%2Cprice%2Cthumbnail%2Cimages%2Ctitle%2Cid&query=mens-watches',
        }),
      ]);

      const instructors = unwrapPaginatedData(usersResponse).map(adaptInstructor);
      const courses = unwrapPaginatedData(productsResponse).map((item, index) =>
        adaptCourse(item, instructors[index % Math.max(instructors.length, 1)] ?? mockCourses[0].instructor, index)
      );

      return courses.length > 0 ? courses : mockCourses;
    } catch {
      return mockCourses;
    }
  },
};
