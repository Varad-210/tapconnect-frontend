import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
const schema = z.object({ name: z.string().trim().min(2).max(100), email: z.string().email(), password: z.string().min(12).max(128) });
export async function GET() { const user = await requireUser(["ADMIN"]); if (!user) return jsonError("Admin access required.", 403); const users = await db.user.findMany({ where: { role: "RESELLER" }, select: { id: true, name: true, email: true, active: true, bulkGenerationAllowed: true, createdAt: true, _count: { select: { assets: true } } }, orderBy: { createdAt: "desc" } }); return NextResponse.json({ resellers: users }); }
export async function POST(request: NextRequest) { const user = await requireUser(["ADMIN"]); if (!user) return jsonError("Admin access required.", 403); const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return jsonError("Provide a name, valid email, and password of at least 12 characters."); const email = parsed.data.email.toLowerCase(); if (await db.user.findUnique({ where: { email } })) return jsonError("That email is already in use.", 409); const reseller = await db.user.create({ data: { name: parsed.data.name, email, passwordHash: await bcrypt.hash(parsed.data.password, 12), role: "RESELLER" }, select: { id: true, name: true, email: true, role: true } }); await db.auditLog.create({ data: { actorId: user.sub, action: "RESELLER_CREATED", targetType: "User", targetId: reseller.id } }); return NextResponse.json({ reseller }, { status: 201 }); }
