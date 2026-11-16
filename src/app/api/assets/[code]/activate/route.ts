import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { jsonError, rateLimited } from "@/lib/http";
import { resolveToGoogle5StarReviewLink } from "@/lib/google-review-link";
const schema = z.object({
  activationCode: z.string().min(10),
  pin: z.string().regex(/^\d{4}$/).optional(),
  businessName: z.string().trim().min(2).max(100),
  category: z.string().trim().min(1).max(80),
  tagline: z.string().max(180).optional(),
  description: z.string().max(1000).optional(),
  destinationUrl: z.string().url().optional(),
  keywords: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
});
export async function POST(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) return jsonError("Enter a business name, business category, a four-digit PIN, and valid details.");
  if (rateLimited(`activate:${code}`, 8)) return jsonError("Too many attempts. Try again later.", 429);
  const asset = await db.asset.findUnique({ where: { publicCode: code } });
  if (!asset || asset.status !== "PENDING" || !asset.activationHash) return jsonError("This card is unavailable for activation.", 404);
  if (!(await bcrypt.compare(body.data.activationCode, asset.activationHash))) return jsonError("Activation code is incorrect.", 401);
  if (!asset.pinHash && !body.data.pin) return jsonError("Set a four-digit card editing PIN.");
  const session = await getSession();
  if (session && session.role === "RESELLER" && asset.assignedToId !== session.sub) return jsonError("This card is assigned to another reseller.", 403);
  if (!session && asset.assignedToId) return jsonError("Sign in as the assigned reseller to activate this card.", 401);
  const { activationCode: _secret, ...data } = body.data;

  // Auto-convert destinationUrl to 5-star Google Review link if it's a Google Maps / review URL
  let finalDestinationUrl = data.destinationUrl;
  let isGoogleReview = false;
  if (finalDestinationUrl) {
    const converted = await resolveToGoogle5StarReviewLink(finalDestinationUrl);
    if (converted.isConverted) {
      finalDestinationUrl = converted.reviewUrl;
      isGoogleReview = true;
    }
  }

  const result = await db.$transaction(async tx => {
    const business = asset.businessId
      ? await tx.business.update({
          where: { id: asset.businessId },
          data: {
            name: data.businessName,
            category: data.category,
            tagline: data.tagline,
            description: data.description,
            ...(data.keywords ? { keywords: data.keywords } : {}),
          },
        })
      : await tx.business.create({
          data: {
            name: data.businessName,
            category: data.category,
            tagline: data.tagline,
            description: data.description,
            keywords: data.keywords || [],
          },
        });

    // If destination is a Google review link, also ensure a Google Review destination link exists
    if (finalDestinationUrl && isGoogleReview) {
      await tx.destinationLink.deleteMany({ where: { businessId: business.id, kind: "review" } });
      await tx.destinationLink.create({
        data: {
          businessId: business.id,
          label: "Google Review",
          url: finalDestinationUrl,
          kind: "review",
          sortOrder: 0,
        },
      });
    }

    const updated = await tx.asset.update({
      where: { id: asset.id, status: "PENDING" },
      data: {
        status: "ACTIVE",
        pinHash: asset.pinHash || await bcrypt.hash(data.pin!, 12),
        activationHash: null,
        businessId: business.id,
        destinationUrl: finalDestinationUrl,
        activatedAt: new Date(),
      },
      select: { id: true, publicCode: true, status: true },
    });
    return { business, asset: updated };
  });
  return NextResponse.json(result, { status: 201 });
}
