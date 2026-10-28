import { Schema, model, type InferSchemaType } from "mongoose";

import { ENROLLMENT_STATUSES } from "./enrollment.types.js";

const enrollmentSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    status: {
      type: String,
      enum: ENROLLMENT_STATUSES,
      default: "active",
      required: true,
    },

    enrolledAt: {
      type: Date,
      default: Date.now,
      required: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw",
  },
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

enrollmentSchema.index({ student: 1, status: 1, createdAt: -1 });
enrollmentSchema.index({ course: 1, status: 1, createdAt: -1 });

export type EnrollmentDocument = InferSchemaType<typeof enrollmentSchema>;

export const Enrollment = model("Enrollment", enrollmentSchema);
