
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "@/models/Admin";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

const globalCache = globalThis;

if (!globalCache.mongoose) {
  globalCache.mongoose = {
    conn: null,
    promise: null,
  };
}

const cached = globalCache.mongoose;

async function createDefaultAdmin() {
  const defaultEmail = (
    process.env.ADMIN_EMAIL || "admin@example.com"
  ).toLowerCase();

  const defaultPassword = process.env.ADMIN_PASSWORD;

  // Don't silently create an insecure production admin.
  if (!defaultPassword) {
    console.warn(
      "ADMIN_PASSWORD is not configured; skipping default admin creation."
    );
    return;
  }

  const existingAdmin = await Admin.findOne({
    email: defaultEmail,
  });

  if (existingAdmin) return;

  const hashedPassword = await bcrypt.hash(defaultPassword, 12);

  await Admin.create({
    name: "Administrator",
    email: defaultEmail,
    password: hashedPassword,
  });

  console.log("Default admin created.");
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    cached.conn = await cached.promise;
    await createDefaultAdmin();
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;

    console.error("MongoDB initialization failed:", {
      name: error?.name,
      message: error?.message,
    });

    throw error;
  }
}

export default connectDB;