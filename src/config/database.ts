import mongoose from "mongoose";

export const connectDatabase = async (): Promise<void> => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not defined");
  }

  await mongoose.connect(databaseUrl);
  console.log("MongoDB connected successfully");
};
