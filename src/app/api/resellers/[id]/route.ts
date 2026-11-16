import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
const schema=z.object({active:z.boolean().optional(),bulkGenerationAllowed:z.boolean().optional()}).refine(x=>x.active!==undefined||x.bulkGenerationAllowed!==undefined);
export async function PATCH(request:NextRequest,{params}:{params:Promise<{id:string}>}){const admin=await requireUser(["ADMIN"]);if(!admin)return jsonError("Admin access required.",403);const {id}=await params;const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return jsonError("Choose a reseller permission to update.");const reseller=await db.user.findFirst({where:{id,role:"RESELLER"}});if(!reseller)return jsonError("Reseller not found.",404);const updated=await db.user.update({where:{id},data:parsed.data,select:{id:true,name:true,email:true,active:true,bulkGenerationAllowed:true}});await db.auditLog.create({data:{actorId:admin.sub,action:"RESELLER_SETTINGS_UPDATED",targetType:"User",targetId:id,details:parsed.data}});return NextResponse.json({reseller:updated})}
