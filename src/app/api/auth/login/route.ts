import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { jsonError, rateLimited } from "@/lib/http";
const input = z.object({ email: z.string().email(), password: z.string().min(1) });
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (rateLimited(`login:${ip}`, 10)) return jsonError("Too many sign-in attempts. Try again later.", 429);
  const parsed = input.safeParse(await request.json().catch(() => null)); if (!parsed.success) return jsonError("Enter a valid email and password.");
  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !user.active || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return jsonError("Email or password is incorrect.", 401);
  await createSession({ sub: user.id, role: user.role, email: user.email });
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
