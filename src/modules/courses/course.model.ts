import { Schema, model, type InferSchemaType } from "mongoose";

import { COURSE_LEVELS, COURSE_STATUSES } from "./course.types.js";

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 5000,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      max: 1_000_000,
    },

    level: {
      type: String,
      enum: COURSE_LEVELS,
      required: true,
    },

    status: {
      type: String,
      enum: COURSE_STATUSES,
      default: "draft",
      required: true,
    },

    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw",
  },
);

courseSchema.index({ createdAt: -1 });
courseSchema.index({ status: 1, level: 1 });
courseSchema.index({ title: 1 });

export type CourseDocument = InferSchemaType<typeof courseSchema>;

export const Course = model("Course", courseSchema);
