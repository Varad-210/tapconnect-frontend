import { NextResponse } from "next/server";
export function jsonError(message: string, status = 400) { return NextResponse.json({ error: message }, { status }); }
const attempts = new Map<string, { count: number; until: number }>();
// In-memory guard for local/single-process deployments. Use a shared store before horizontal scaling.
export function rateLimited(key: string, limit = 5, windowMs = 15 * 60_000) {
  const now = Date.now(); const current = attempts.get(key);
  if (!current || current.until < now) { attempts.set(key, { count: 1, until: now + windowMs }); return false; }
  current.count += 1; return current.count > limit;
}
export function safeReturnUrl(value: string) { try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.toString() : null; } catch { return null; } }
