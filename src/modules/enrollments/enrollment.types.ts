export const ENROLLMENT_STATUSES = [
  "active",
  "completed",
  "cancelled",
] as const;

export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export interface CreateEnrollmentInput {
  courseId: string;
}

export interface UpdateEnrollmentInput {
  status: EnrollmentStatus;
}

export interface ListEnrollmentsInput {
  page: number;
  limit: number;
  studentId?: string | undefined;
  courseId?: string | undefined;
  status?: EnrollmentStatus | undefined;
  sortOrder: "asc" | "desc";
}
