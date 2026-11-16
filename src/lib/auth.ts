import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";
import { db } from "@/lib/db";

const secret = () => {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters.");
  return new TextEncoder().encode(value);
};
export type Session = { sub: string; role: Role; email: string };
export async function createSession(user: Session) {
  const token = await new SignJWT({ role: user.role, email: user.email }).setProtectedHeader({ alg: "HS256" }).setSubject(user.sub).setIssuedAt().setExpirationTime("8h").sign(secret());
  (await cookies()).set("tapconnect_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 8 * 60 * 60 });
}
export async function clearSession() { (await cookies()).delete("tapconnect_session"); }
export async function getSession(): Promise<Session | null> {
  try { const token = (await cookies()).get("tapconnect_session")?.value; if (!token) return null; const { payload } = await jwtVerify(token, secret()); const id=String(payload.sub); const user=await db.user.findUnique({where:{id},select:{id:true,email:true,role:true,active:true}}); if(!user?.active||user.email!==payload.email||user.role!==payload.role)return null; return { sub:user.id, email:user.email, role:user.role }; } catch { return null; }
}
export async function requireUser(roles?: Role[]) {
  const session = await getSession();
  if (!session || (roles && !roles.includes(session.role))) return null;
  return session;
}
export async function createPinSession(assetId: string) {
  const token = await new SignJWT({ assetId }).setProtectedHeader({ alg: "HS256" }).setSubject(assetId).setIssuedAt().setExpirationTime("20m").sign(secret());
  (await cookies()).set(`tapconnect_pin_${assetId}`, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 20 * 60 });
}
export async function hasPinSession(assetId: string) {
  try { const token = (await cookies()).get(`tapconnect_pin_${assetId}`)?.value; if (!token) return false; const { payload } = await jwtVerify(token, secret()); return payload.assetId === assetId; } catch { return false; }
}
