import type { RequestHandler } from "express";

import * as enrollmentService from "./enrollment.service.js";

import type {
  CreateEnrollmentBody,
  EnrollmentIdParams,
  ListEnrollmentsQuery,
  UpdateEnrollmentBody,
} from "./enrollment.validation.js";

export const createEnrollment: RequestHandler = async (_req, res, next) => {
  try {
    const input = res.locals.validatedBody as CreateEnrollmentBody;
    const studentId = res.locals.auth?.userId as string;

    const enrollment = await enrollmentService.createEnrollment(
      input,
      studentId,
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

    const result = await enrollmentService.getAllEnrollments(query);

    res.status(200).json({
      success: true,
      data: result.enrollments,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getEnrollmentById: RequestHandler = async (_req, res, next) => {
  try {
    const { id } = res.locals.validatedParams as EnrollmentIdParams;

    const enrollment = await enrollmentService.getEnrollmentById(id);

    res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEnrollment: RequestHandler = async (_req, res, next) => {
  try {
    const { id } = res.locals.validatedParams as EnrollmentIdParams;
    const input = res.locals.validatedBody as UpdateEnrollmentBody;

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

    await enrollmentService.deleteEnrollment(id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
