import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
export async function GET(){const user=await requireUser();if(!user)return jsonError("Sign in required.",401);const rows=await db.business.findMany({where:user.role==="ADMIN"?{}:{assets:{some:{assignedToId:user.sub}}},select:{id:true,name:true,category:true},orderBy:{name:"asc"},take:1000});return NextResponse.json({businesses:rows})}
