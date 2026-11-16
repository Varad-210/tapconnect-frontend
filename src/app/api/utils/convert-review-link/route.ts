import { NextRequest, NextResponse } from "next/server";
import { resolveToGoogle5StarReviewLink } from "@/lib/google-review-link";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const result = await resolveToGoogle5StarReviewLink(url);

    return NextResponse.json({
      originalUrl: url,
      reviewUrl: result.reviewUrl,
      placeId: result.placeId,
      isConverted: result.isConverted,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to convert review link" },
      { status: 500 }
    );
  }
}
