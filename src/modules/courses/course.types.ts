export const COURSE_LEVELS = ["beginner", "intermediate", "advanced"] as const;

export type CourseLevel = (typeof COURSE_LEVELS)[number];

export const COURSE_STATUSES = ["draft", "published", "archived"] as const;

export type CourseStatus = (typeof COURSE_STATUSES)[number];

export interface CreateCourseInput {
  title: string;
  description: string;
  price: number;
  level: CourseLevel;
}

export interface UpdateCourseInput {
  title?: string | undefined;
  description?: string | undefined;
  price?: number | undefined;
  level?: CourseLevel | undefined;
  status?: CourseStatus | undefined;
}

export interface ListCoursesInput {
  page: number;
  limit: number;
  search?: string | undefined;
  level?: CourseLevel | undefined;
  status?: CourseStatus | undefined;
  instructorId?: string | undefined;
  sortBy: "createdAt" | "title" | "price";
  sortOrder: "asc" | "desc";
}
