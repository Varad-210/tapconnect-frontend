import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { jsonError, rateLimited } from "@/lib/http";
const schema=z.object({name:z.string().trim().min(2).max(100),email:z.string().email(),message:z.string().trim().min(10).max(2000)});
export async function POST(request:NextRequest){const ip=request.headers.get("x-forwarded-for")?.split(",")[0]||"unknown";if(rateLimited(`contact:${ip}`,8))return jsonError("Too many messages. Please try again later.",429);const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return jsonError("Enter your name, a valid email, and a message.");const row=await db.contactMessage.create({data:{...parsed.data,email:parsed.data.email.toLowerCase()}});return NextResponse.json({received:true,id:row.id},{status:201})}
export async function GET(){const user=await getSession();if(user?.role!=="ADMIN")return jsonError("Admin access required.",403);const messages=await db.contactMessage.findMany({orderBy:{createdAt:"desc"},take:100});return NextResponse.json({messages})}
