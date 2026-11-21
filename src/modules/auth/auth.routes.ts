import { Router } from "express";

import { registerSchema, loginSchema } from "./auth.validation.js";
import { register, login } from "./auth.controller.js";
import { validate } from "../users/user.middleware.js";

const authRoutes = Router();

authRoutes.post("/register", validate(registerSchema, "body"), register);
authRoutes.post("/login", validate(loginSchema, "body"), login);

export default authRoutes;
