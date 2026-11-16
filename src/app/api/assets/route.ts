import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { jsonError, safeReturnUrl } from "@/lib/http";
const createSchema = z.object({ type: z.enum(["QR", "NFC"]), serialNumber: z.string().trim().max(100).optional(), assignedToId: z.string().optional() });
export async function GET() {
  const session = await requireUser(); if (!session) return jsonError("Sign in required.", 401);
  const where = session.role === "ADMIN" ? {} : { assignedToId: session.sub };
  const assets = await db.asset.findMany({ where, include: { business: { select: { name: true } }, assignedTo: { select: { name: true } }, _count: { select: { scans: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ assets });
}
export async function POST(request: NextRequest) {
  const session = await requireUser(["ADMIN"]); if (!session) return jsonError("Admin access required.", 403);
  const parsed = createSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return jsonError("Check the asset details.");
  if (parsed.data.assignedToId && !(await db.user.findFirst({ where: { id: parsed.data.assignedToId, role: "RESELLER", active: true } }))) return jsonError("Choose an active reseller.");
  let publicCode = ""; for (let tries = 0; tries < 5; tries++) { publicCode = randomBytes(4).toString("base64url").slice(0, 7); if (!(await db.asset.findUnique({ where: { publicCode } }))) break; }
  const serialNumber = parsed.data.serialNumber || undefined;
  if (serialNumber && await db.asset.findUnique({ where: { serialNumber } })) return jsonError("That serial number is already registered.", 409);
  const activationCode = randomBytes(18).toString("base64url");
  const asset = await db.asset.create({ data: { publicCode, type: parsed.data.type, serialNumber, assignedToId: parsed.data.assignedToId, activationHash: await bcrypt.hash(activationCode, 10) }, include: { business: true } });
  await db.auditLog.create({ data: { actorId: session.sub, action: "ASSET_CREATED", targetType: "Asset", targetId: asset.id, details: { type: asset.type } } });
  return NextResponse.json({ asset, activationCode }, { status: 201 });
}
