import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET
);

export async function createToken(admin) {
  return await new SignJWT({
    id: admin._id.toString(),
    email: admin.email,
    name: admin.name,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(
      token,
      secret
    );

    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession(request) {
  try {
    let token = request?.cookies?.get?.("admin_token")?.value;
    if (!token && typeof request?.headers?.get === "function") {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}