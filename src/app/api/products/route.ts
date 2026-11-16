import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";

const variant = z.object({ name: z.string().trim().min(1).max(60), pricePaise: z.number().int().min(1).max(100_000_000), stock: z.number().int().min(0).max(1_000_000) });
const schema = z.object({ name: z.string().trim().min(3).max(120), slug: z.string().trim().min(3).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), category: z.string().trim().min(2).max(60), description: z.string().trim().min(10).max(2000), imageUrl: z.string().url().optional().or(z.literal("")), published: z.boolean().optional(), variants: z.array(variant).min(1).max(30) });
export async function GET(request: NextRequest) {
  const admin = await requireUser(["ADMIN"]); const url = new URL(request.url); const requested = url.searchParams.get("all") === "1";
  if (requested && !admin) return jsonError("Admin access required.", 403);
  const products = await db.product.findMany({ where: requested ? {} : { published: true }, include: { variants: { where: requested ? {} : { active: true }, orderBy: { pricePaise: "asc" } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ products });
}
export async function POST(request: NextRequest) {
  const user = await requireUser(["ADMIN"]); if (!user) return jsonError("Admin access required.", 403);
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return jsonError("Check product details, prices, stock, and variants.");
  if (await db.product.findUnique({ where: { slug: parsed.data.slug } })) return jsonError("That product URL is already in use.", 409);
  const { variants, ...product } = parsed.data;
  const created = await db.product.create({ data: { ...product, imageUrl: product.imageUrl || null, published: Boolean(product.published), variants: { create: variants } }, include: { variants: true } });
  await db.auditLog.create({ data: { actorId: user.sub, action: "PRODUCT_CREATED", targetType: "Product", targetId: created.id } });
  return NextResponse.json({ product: created }, { status: 201 });
}
