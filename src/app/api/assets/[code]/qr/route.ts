import QRCode from "qrcode";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const session = await requireUser(); if (!session) return jsonError("Sign in required.", 401);
  const { code } = await params; const asset = await db.asset.findUnique({ where: { publicCode: code }, select: { id: true, assignedToId: true } });
  if (!asset || (session.role === "RESELLER" && asset.assignedToId !== session.sub)) return jsonError("QR code not found.", 404);
  const origin = process.env.APP_URL || new URL(request.url).origin; const imageUrl = `${origin}/${code}`;
  const query = new URL(request.url).searchParams;
  const inline = query.get("inline") === "1";
  const download = query.get("download") === "1";
  const disposition = inline && !download ? "inline" : "attachment";
  if (query.get("format") === "svg") { const svg = await QRCode.toString(imageUrl, { type: "svg", margin: 2, width: 600 }); return new Response(svg, { headers: { "Content-Type": "image/svg+xml", "Content-Disposition": `${disposition}; filename="${code}.svg"` } }); }
  const png = await QRCode.toBuffer(imageUrl, { type: "png", margin: 2, width: 600 }); return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png", "Content-Disposition": `${disposition}; filename="${code}.png"` } });
}
