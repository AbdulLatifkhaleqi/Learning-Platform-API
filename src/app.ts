import express from "express";

import userRoutes from "./modules/users/user.routes.js";
import { notFoundHandler } from "./middlewares/notfound.middleware.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.disable("x-powered-by");

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
  });
});

app.use("/api/v1/users", userRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
