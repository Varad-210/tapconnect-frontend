import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createPinSession, getSession } from "@/lib/auth";
import { jsonError, rateLimited } from "@/lib/http";
const schema = z.object({ pin: z.string().regex(/^\d{4}$/).optional() });
export async function GET(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params; const asset = await db.asset.findUnique({ where: { publicCode: code }, select: { id: true, status: true, assignedToId: true } });
  if (!asset || asset.status !== "ACTIVE") return jsonError("This profile is not ready to edit.", 404);
  const user = await getSession(); const authorized = user?.role === "ADMIN" || (user?.role === "RESELLER" && user.sub === asset.assignedToId);
  if (!authorized) return jsonError("Enter the card PIN to continue.", 401);
  await createPinSession(asset.id); return NextResponse.json({ ok: true });
}
export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params; const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return jsonError("Enter your four-digit PIN.");
  if (rateLimited(`pin:${code}`, 8)) return jsonError("Too many attempts. Try again in 15 minutes.", 429);
  const asset = await db.asset.findUnique({ where: { publicCode: code }, select: { id: true, pinHash: true, status: true, pinLockedUntil: true, pinFailedAttempts: true, assignedToId: true } });
  if (!asset || asset.status !== "ACTIVE" || !asset.pinHash) return jsonError("This profile is not ready to edit.", 404);
  if (asset.pinLockedUntil && asset.pinLockedUntil > new Date()) return jsonError("Editing is temporarily locked. Contact your reseller.", 423);
  const session = await getSession(); const authorized = session?.role === "ADMIN" || (session?.role === "RESELLER" && session.sub === asset.assignedToId);
  if (!authorized && !parsed.data.pin) return jsonError("Enter your four-digit PIN.");
  if (!authorized && !(await bcrypt.compare(parsed.data.pin!, asset.pinHash))) {
    const attempts = asset.pinFailedAttempts + 1; await db.asset.update({ where: { id: asset.id }, data: { pinFailedAttempts: attempts, pinLockedUntil: attempts >= 5 ? new Date(Date.now() + 15 * 60_000) : null } });
    return jsonError("That PIN doesn’t match. Try again.", 401);
  }
  await db.asset.update({ where: { id: asset.id }, data: { pinFailedAttempts: 0, pinLockedUntil: null } }); await createPinSession(asset.id);
  return NextResponse.json({ ok: true });
}
