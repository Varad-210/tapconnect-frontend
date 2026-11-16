import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
const input = z.object({ status: z.enum(["ACTIVE", "BLOCKED", "PENDING"]).optional(), assignedToId: z.string().nullable().optional(), resetPin: z.boolean().optional() }).refine(v => v.status !== undefined || v.assignedToId !== undefined || v.resetPin === true);
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const user = await requireUser(["ADMIN"]); if (!user) return jsonError("Admin access required.", 403);
  const { code } = await params; const parsed = input.safeParse(await request.json().catch(() => null)); if (!parsed.success) return jsonError("Choose a valid asset action.");
  const asset = await db.asset.findUnique({ where: { publicCode: code } }); if (!asset) return jsonError("Asset not found.", 404);
  if (parsed.data.status === "ACTIVE" && (!asset.pinHash || !asset.businessId)) return jsonError("An unactivated asset cannot be made active.", 409);
  if (parsed.data.status === "PENDING" && !asset.activationHash) return jsonError("An activated asset cannot be reset to pending.", 409);
  const update: { status?: "ACTIVE" | "BLOCKED" | "PENDING"; assignedToId?: string | null; pinHash?: string; pinFailedAttempts?: number; pinLockedUntil?: Date | null } = {};
  if (parsed.data.status) update.status = parsed.data.status;
  if (parsed.data.assignedToId !== undefined) {
    if (parsed.data.assignedToId && !(await db.user.findFirst({ where: { id: parsed.data.assignedToId, role: "RESELLER", active: true } }))) return jsonError("Choose an active reseller.");
    update.assignedToId = parsed.data.assignedToId;
  }
  let resetPin: string | undefined;
  if (parsed.data.resetPin) { resetPin = String(randomInt(0, 10000)).padStart(4, "0"); update.pinHash = await bcrypt.hash(resetPin, 12); update.pinFailedAttempts = 0; update.pinLockedUntil = null; }
  const saved = await db.asset.update({ where: { id: asset.id }, data: update, select: { publicCode: true, status: true, assignedToId: true } });
  await db.auditLog.create({ data: { actorId: user.sub, action: "ASSET_ADMIN_UPDATE", targetType: "Asset", targetId: asset.id, details: { status: saved.status, assignedToId: saved.assignedToId, pinReset: Boolean(resetPin) } } });
  return NextResponse.json({ asset: saved, ...(resetPin ? { resetPin } : {}) });
}
