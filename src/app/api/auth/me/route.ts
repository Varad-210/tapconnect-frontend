import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
export async function GET() { const s = await getSession(); if (!s) return NextResponse.json({ user: null }); const user = await db.user.findUnique({ where: { id: s.sub }, select: { id: true, name: true, email: true, role: true, active: true } }); return NextResponse.json({ user: user?.active ? user : null }); }
