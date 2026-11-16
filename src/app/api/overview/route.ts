import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
export async function GET() {
  const user = await requireUser(); if (!user) return jsonError("Sign in required.", 401);
  const where = user.role === "ADMIN" ? {} : { assignedToId: user.sub };
  const [assets, businesses, scans, resellers] = await Promise.all([
    db.asset.groupBy({ by: ["status", "type"], where, _count: { _all: true } }),
    db.asset.findMany({ where: { ...where, businessId: { not: null } }, distinct: ["businessId"], select: { businessId: true } }),
    db.scanEvent.count({ where: { asset: where } }),
    user.role === "ADMIN" ? db.user.count({ where: { role: "RESELLER" } }) : Promise.resolve(undefined),
  ]);
  return NextResponse.json({ role: user.role, assets, businesses: businesses.length, scans, resellers });
}
