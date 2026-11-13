import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "intake_admin";

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

export function passwordsMatch(input: string, expected: string) {
  return timingSafeEqual(digest(input), digest(expected));
}

function sessionToken() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update("intake-admin-v1").digest("hex");
}

export async function isAdmin() {
  const expected = sessionToken();
  if (!expected) return false;
  const jar = await cookies();
  const value = jar.get(COOKIE)?.value;
  if (!value) return false;
  const actual = Buffer.from(value);
  const wanted = Buffer.from(expected);
  if (actual.length !== wanted.length) return false;
  return timingSafeEqual(actual, wanted);
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/onboarding/admin/login");
}

export async function setAdminCookie() {
  const token = sessionToken();
  if (!token) throw new Error("SESSION_SECRET is not set");
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
