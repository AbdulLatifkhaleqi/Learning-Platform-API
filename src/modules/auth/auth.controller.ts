import type { RequestHandler } from "express";

import * as authService from "./auth.service.js";
import type { LoginBody, RegisterBody } from "./auth.validation.js";

export const register: RequestHandler = async (req, res, next) => {
  try {
    const input = res.locals.validatedBody as RegisterBody;
    const result = await authService.register(input);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const input = res.locals.validatedBody as LoginBody;
    const result = await authService.login(input);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
