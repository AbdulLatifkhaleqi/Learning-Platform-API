import { Schema, model, type InferSchemaType } from "mongoose";
import { USER_ROLES } from "./user.types.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: USER_ROLES,
      default: "student",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw",
  },
);

userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1, isActive: 1 });

export type UserDocument = InferSchemaType<typeof userSchema>;

export const User = model("User", userSchema);
