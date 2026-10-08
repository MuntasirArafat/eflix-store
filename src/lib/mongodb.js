import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "@/models/Admin";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

async function createDefaultAdmin() {
  const defaultEmail =
    process.env.ADMIN_EMAIL || "admin@example.com";

  const defaultPassword =
    process.env.ADMIN_PASSWORD || "admin123456";

  const existingAdmin = await Admin.findOne({
    email: defaultEmail.toLowerCase(),
  });

  if (existingAdmin) {
    return;
  }

  const hashedPassword = await bcrypt.hash(
    defaultPassword,
    12
  );

  await Admin.create({
    name: "Administrator",
    email: defaultEmail.toLowerCase(),
    password: hashedPassword,
  });

  console.log(`Default admin created: ${defaultEmail}`);
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }

  cached.conn = await cached.promise;

  // Create default admin on first DB connection
  await createDefaultAdmin();

  return cached.conn;
}

export default connectDB;