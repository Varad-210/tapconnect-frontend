import { randomBytes, randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";

const httpUrl = z.string().url().refine(value => ["http:", "https:"].includes(new URL(value).protocol));
const rowSchema = z.object({ businessName: z.string().trim().max(100).optional(), cardName: z.string().trim().max(100).optional(), destinationUrl: httpUrl.optional() });
const schema = z.object({ quantity: z.number().int().min(1).max(100), start: z.number().int().min(1).max(100000).default(1), prefix: z.string().trim().min(2).max(24).regex(/^[a-zA-Z0-9-]+$/), template: z.string().min(1).max(80), templateId: z.string().optional(), businessId: z.string().optional(), assignedToId: z.string().optional(), rows: z.array(rowSchema).max(100).optional(), pins: z.array(z.string().regex(/^\d{4}$/)).max(100).optional(), design: z.object({ primary: z.string().regex(/^#[0-9a-fA-F]{6}$/), secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/), text: z.string().regex(/^#[0-9a-fA-F]{6}$/), brand: z.string().trim().min(1).max(60), html: z.string().max(40000).optional(), react: z.string().max(40000).optional(), css: z.string().max(20000).optional() }).optional() }).refine(v=>!v.pins||(v.pins.length===v.quantity&&new Set(v.pins).size===v.pins.length),{message:"Each card PIN must be unique."});

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (!user) return jsonError("Sign in required.", 401);
  if (user.role === "RESELLER") {
    const account = await db.user.findUnique({ where: { id: user.sub }, select: { bulkGenerationAllowed: true } });
    if (!account?.bulkGenerationAllowed) return jsonError("Bulk generation is not enabled for your account.", 403);
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Check the quantity, prefix, and card design.");
  const data = parsed.data;
  if (data.rows && data.rows.length !== data.quantity) return jsonError("CSV rows must match the batch quantity.");
  const selectedTemplate = data.templateId ? await db.designTemplate.findFirst({ where: { id: data.templateId, ...(user.role === "RESELLER" ? { published: true } : {}) }, select: { id: true, name: true, html: true, react: true, css: true } }) : null;
  if (data.templateId && !selectedTemplate) return jsonError("The selected card template is unavailable.", 404);
  if (user.role === "RESELLER" && data.assignedToId) return jsonError("Resellers can only generate cards for their own inventory.", 403);
  const assignedToId = user.role === "RESELLER" ? user.sub : data.assignedToId;
  if (assignedToId && !(await db.user.findFirst({ where: { id: assignedToId, role: "RESELLER", active: true } }))) return jsonError("Choose an active reseller.");
  if (data.businessId) {
    const business = await db.business.findFirst({ where: { id: data.businessId, assets: user.role === "RESELLER" ? { some: { assignedToId: user.sub } } : undefined } });
    if (!business) return jsonError("That business is unavailable.", 404);
  }
  const serials = Array.from({ length: data.quantity }, (_, i) => `${data.prefix}-${String(data.start + i).padStart(4, "0")}`);
  if (await db.asset.findFirst({ where: { serialNumber: { in: serials } } })) return jsonError("The selected serial range already exists. Choose a different prefix.", 409);
  const pinPool = new Set<string>();
  while (pinPool.size < data.quantity) pinPool.add(String(randomInt(0, 10_000)).padStart(4, "0"));
  const pins = data.pins || [...pinPool];
  const credentials = serials.map((serial, index) => ({ serial, publicCode: randomBytes(7).toString("base64url"), activationCode: randomBytes(24).toString("base64url"), pin: pins[index] }));
  try {
    const batch = await db.$transaction(async tx => {
      const created = await tx.generationBatch.create({ data: { createdById: user.sub, quantity: data.quantity, prefix: data.prefix, template: selectedTemplate?.name ?? data.template, design: { ...(data.design ?? {}), templateId: selectedTemplate?.id ?? null, html: selectedTemplate?.html ?? data.design?.html ?? null, react: selectedTemplate?.react ?? data.design?.react ?? null, css: selectedTemplate?.css ?? data.design?.css ?? null }, status: "COMPLETED" } });
      for (let i = 0; i < credentials.length; i++) {
        const credential = credentials[i];
        const row = data.rows?.[i];
        let businessId = data.businessId;
        if (!businessId && row?.businessName) businessId = (await tx.business.create({ data: { name: row.businessName, category: "Business" } })).id;
        const asset = await tx.asset.create({ data: { publicCode: credential.publicCode, type: "NFC", status: "PENDING", serialNumber: credential.serial, cardName: row?.cardName, activationHash: await bcrypt.hash(credential.activationCode, 10), pinHash: await bcrypt.hash(credential.pin, 10), assignedToId, businessId, destinationUrl: row?.destinationUrl }, select: { id: true } });
        await tx.generationBatchItem.create({ data: { batchId: created.id, assetId: asset.id, serial: credential.serial } });
        await tx.inventoryMovement.create({ data: { assetId: asset.id, actorId: user.sub, action: "BULK_NFC_CREATED", details: { batchId: created.id, template: data.template } } });
      }
      await tx.auditLog.create({ data: { actorId: user.sub, action: "NFC_BULK_GENERATED", targetType: "GenerationBatch", targetId: created.id, details: { quantity: data.quantity, prefix: data.prefix } } });
      return created;
    });
    return NextResponse.json({ batch, credentials: credentials.map((item, i) => ({ ...item, businessName: data.rows?.[i]?.businessName, cardName: data.rows?.[i]?.cardName })) }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") return jsonError("A generated card code or serial already exists. Choose a new range and retry.", 409);
    throw error;
  }
}

export async function GET() {
  const user = await requireUser();
  if (!user) return jsonError("Sign in required.", 401);
  if (user.role === "RESELLER") {
    const account = await db.user.findUnique({ where: { id: user.sub }, select: { bulkGenerationAllowed: true } });
    if (!account?.bulkGenerationAllowed) return jsonError("Bulk generation is not enabled for your account.", 403);
  }
  const batches = await db.generationBatch.findMany({ where: user.role === "ADMIN" ? {} : { createdById: user.sub }, include: { _count: { select: { items: true } } }, orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ batches });
}
