import express from "express";
import { globalErrorHandler } from "./middlewares/error.moddleware.js";
import { notFoundHandler } from "./middlewares/notfound.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
  });
});

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
