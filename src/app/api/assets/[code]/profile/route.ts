import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession, hasPinSession } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { resolveToGoogle5StarReviewLink } from "@/lib/google-review-link";

const webUrl = z.string().trim().url().refine(value => { try { return ["http:","https:"].includes(new URL(value).protocol); } catch { return false; } });
const schema = z.object({
  name: z.string().trim().min(2).max(100),
  category: z.string().max(80).nullish(),
  tagline: z.string().max(180).nullish(),
  description: z.string().max(1000).nullish(),
  destinationUrl: webUrl.or(z.literal("")).nullish(),
  links: z.array(z.object({ label: z.string().trim().min(1).max(50), url: webUrl, kind: z.string().max(30) })).max(15).optional(),
  keywords: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  tone: z.string().max(40).nullish(),
  newPin: z.string().regex(/^\d{4}$/).optional(),
});

async function findAsset(code: string) {
  return db.asset.findUnique({
    where: { publicCode: code },
    include: { business: { include: { links: { orderBy: { sortOrder: "asc" } } } } },
  });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const asset = await findAsset(code);
  if (!asset || asset.status !== "ACTIVE" || !asset.business) return jsonError("Profile not found.", 404);
  return NextResponse.json({
    profile: {
      name: asset.business.name,
      category: asset.business.category,
      tagline: asset.business.tagline,
      description: asset.business.description,
      logoUrl: asset.business.logoUrl,
      keywords: asset.business.keywords,
      tone: asset.business.tone,
      links: asset.business.links.map(({ label, url, kind }) => ({ label, url, kind })),
      destinationUrl: asset.destinationUrl,
    },
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const asset = await findAsset(code);
  if (!asset || asset.status !== "ACTIVE" || !asset.business) return jsonError("Profile not found.", 404);
  const session = await getSession();
  const authorized = session?.role === "ADMIN" || (session?.role === "RESELLER" && session.sub === asset.assignedToId);
  if (!authorized && !(await hasPinSession(asset.id))) return jsonError("Verify the card PIN to edit this profile.", 401);

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path.join(".");
    return jsonError(issue ? `Check ${field || "the profile details"}: ${issue.message}` : "Check the profile details and link URLs.");
  }

  const { newPin, links, keywords, tone, ...profile } = parsed.data;

  // Auto-convert destinationUrl to 5-star review link if it's a Google Maps / review link
  let finalDestinationUrl = profile.destinationUrl || null;
  if (finalDestinationUrl) {
    const converted = await resolveToGoogle5StarReviewLink(finalDestinationUrl);
    if (converted.isConverted) {
      finalDestinationUrl = converted.reviewUrl;
    }
  }

  // Auto-convert any Google Maps link in links array
  let finalLinks = links;
  if (finalLinks && finalLinks.length) {
    finalLinks = await Promise.all(
      finalLinks.map(async (l) => {
        const isReviewOrMaps = /google|maps|review|writereview/i.test(`${l.label} ${l.url} ${l.kind}`);
        if (isReviewOrMaps) {
          const converted = await resolveToGoogle5StarReviewLink(l.url);
          if (converted.isConverted) {
            return {
              ...l,
              url: converted.reviewUrl,
              label: l.label.toLowerCase().includes("review") ? l.label : "Google Review",
              kind: "review",
            };
          }
        }
        return l;
      })
    );
  }

  await db.$transaction(async tx => {
    await tx.business.update({
      where: { id: asset.businessId! },
      data: {
        name: profile.name,
        category: profile.category || null,
        tagline: profile.tagline || null,
        description: profile.description || null,
        ...(keywords ? { keywords } : {}),
        ...(tone !== undefined ? { tone: tone || null } : {}),
      },
    });

    await tx.asset.update({
      where: { id: asset.id },
      data: {
        destinationUrl: finalDestinationUrl,
        ...(newPin ? { pinHash: await bcrypt.hash(newPin, 12), pinFailedAttempts: 0, pinLockedUntil: null } : {}),
      },
    });

    if (finalLinks) {
      await tx.destinationLink.deleteMany({ where: { businessId: asset.businessId! } });
      if (finalLinks.length) {
        await tx.destinationLink.createMany({
          data: finalLinks.map((link, sortOrder) => ({ ...link, businessId: asset.businessId!, sortOrder })),
        });
      }
    }

    await tx.auditLog.create({
      data: {
        actorId: session?.sub,
        action: newPin ? "PROFILE_AND_PIN_UPDATED" : "PROFILE_UPDATED",
        targetType: "Asset",
        targetId: asset.id,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
