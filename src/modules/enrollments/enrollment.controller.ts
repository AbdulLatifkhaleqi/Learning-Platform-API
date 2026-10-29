import type { RequestHandler } from "express";
import { Types } from "mongoose";

import * as enrollmentService from "./enrollment.service.js";
import { AppError } from "../../utils/AppError.js";
import { Enrollment } from "./enrollment.model.js";

import type {
  CreateEnrollmentBody,
  EnrollmentIdParams,
  ListEnrollmentsQuery,
  UpdateEnrollmentBody,
} from "./enrollment.validation.js";

type AuthContext = {
  userId: string;
  role: "student" | "teacher" | "admin";
};

const assertValidId = (id: string, resource: string): void => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${resource} ID`, 400);
  }
};

const getAuthContext = (res: Parameters<RequestHandler>[1]): AuthContext => {
  const auth = res.locals.auth as AuthContext | undefined;

  if (!auth?.userId || !auth.role) {
    throw new AppError("Authentication required", 401);
  }

  return auth;
};

export const createEnrollment: RequestHandler = async (_req, res, next) => {
  try {
    const input = res.locals.validatedBody as CreateEnrollmentBody;
    const auth = getAuthContext(res);

    if (auth.role !== "student") {
      throw new AppError("Only students can enroll in courses", 403);
    }

    const enrollment = await enrollmentService.createEnrollment(
      input,
      auth.userId,
    );

    res.status(201).json({
      success: true,
      message: "Enrollment created successfully",
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllEnrollments: RequestHandler = async (_req, res, next) => {
  try {
    const query = res.locals.validatedQuery as ListEnrollmentsQuery;
    const auth = getAuthContext(res);

    const result = await enrollmentService.getAllEnrollments(query, {
      userId: auth.userId,
      role: auth.role,
    });

    res.status(200).json({
      success: true,
      data: result.enrollments,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getEnrollmentById = async (enrollmentId: string) => {
  assertValidId(enrollmentId, "enrollment");

  const enrollment = await Enrollment.findById(enrollmentId)
    .populate("student", "name email")
    .populate("course", "title price level status instructor")
    .lean()
    .exec();

  if (!enrollment) {
    throw new AppError("Enrollment not found", 404);
  }

  return enrollment;
};

export const updateEnrollment: RequestHandler = async (_req, res, next) => {
  try {
    const { id } = res.locals.validatedParams as EnrollmentIdParams;
    const input = res.locals.validatedBody as UpdateEnrollmentBody;
    const auth = getAuthContext(res);

    if (auth.role !== "admin") {
      throw new AppError(
        "Only administrators can update enrollment status",
        403,
      );
    }

    const enrollment = await enrollmentService.updateEnrollment(id, input);

    res.status(200).json({
      success: true,
      message: "Enrollment updated successfully",
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEnrollment: RequestHandler = async (_req, res, next) => {
  try {
    const { id } = res.locals.validatedParams as EnrollmentIdParams;
    const auth = getAuthContext(res);

    if (auth.role !== "admin") {
      throw new AppError("Only administrators can delete enrollments", 403);
    }

    await enrollmentService.deleteEnrollment(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
