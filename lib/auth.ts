import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "aurora_admin";
const sessionValue = createHash("sha256")
  .update(`admin:admin:${process.env.AUTH_SECRET ?? "aurora-demo-secret"}`)
  .digest("hex");

export async function isAdmin() {
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  if (!value || value.length !== sessionValue.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(sessionValue));
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function setAdminSession() {
  (await cookies()).set(COOKIE_NAME, sessionValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE_NAME);
}
