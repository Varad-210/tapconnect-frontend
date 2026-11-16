import { NextRequest, NextResponse } from "next/server";
import { generateCategoryReviews, ReviewTone } from "@/lib/review-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      businessName = "Business",
      category = "",
      subcategoryId = "taste",
      subcategoryLabel = "Taste & Quality",
      tone = "casual",
      keywords = [],
      notes = "",
      variation = 0,
    } = body;

    // Check if Gemini API key exists in environment
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const prompt = `You are an AI assistant helping a genuine happy customer draft a 5-star Google review for "${businessName}" (Category: "${category || "Business"}").
Aspect/Subcategory to focus on: "${subcategoryLabel}".
Tone: ${tone} (Options:
- "desi": natural everyday Indian Hinglish, e.g. "Bhai maza aa gaya, taste ekdum authentic tha...",
- "casual": warm, conversational and natural,
- "enthusiastic": high energy, exciting and highly recommending,
- "short": concise 1-2 punchy sentences,
- "formal": polite, courteous, respectful).
${keywords.length ? `Customer noted these points: ${keywords.join(", ")}.` : ""}
${notes ? `Customer's own words from visit: "${notes}".` : ""}

Requirements:
- Generate exactly 3 unique, realistic, 5-star Google review suggestions.
- Do NOT include placeholders, brackets, or rating numbers in the text.
- Do NOT output extra markdown or explanations.
- Output ONLY a valid JSON array of 3 strings: ["review 1", "review 2", "review 3"].`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.85 + (variation % 3) * 0.05,
              },
            }),
            signal: AbortSignal.timeout(4000),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (Array.isArray(parsed) && parsed.length >= 3) {
              return NextResponse.json({
                reviews: parsed.slice(0, 3).map((item: unknown) => String(item).trim()),
                source: "llm",
              });
            }
          }
        }
      } catch (err) {
        console.warn("LLM generation fallback to local engine:", err);
      }
    }

    // Local engine fallback (instant, robust, zero dependencies)
    const localReviews = generateCategoryReviews({
      businessName,
      category,
      subcategoryId,
      subcategoryLabel,
      tone: tone as ReviewTone,
      keywords,
      notes,
      variation,
    });

    return NextResponse.json({
      reviews: localReviews,
      source: "local",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate reviews" },
      { status: 500 }
    );
  }
}
