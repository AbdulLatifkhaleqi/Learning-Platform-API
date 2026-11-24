import { z } from "zod";

export const enrollmentAnalyticsQuerySchema = z
  .object({
    startDate: z.iso.date().optional(),
    endDate: z.iso.date().optional(),
    limit: z.coerce.number().int().min(1).max(365).default(90),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) {
        return true;
      }

      return data.startDate <= data.endDate;
    },
    {
      message: "startDate must be before or equal to endDate",
      path: ["endDate"],
    },
  );

export type EnrollmentAnalyticsQuery = z.infer<
  typeof enrollmentAnalyticsQuerySchema
>;
