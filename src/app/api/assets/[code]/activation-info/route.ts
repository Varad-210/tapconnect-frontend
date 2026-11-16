import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/http";
export async function GET(_request:Request,{params}:{params:Promise<{code:string}>}){const {code}=await params;const asset=await db.asset.findUnique({where:{publicCode:code},select:{status:true,pinHash:true}});if(!asset||asset.status!=="PENDING")return jsonError("This card is not available for activation.",404);return NextResponse.json({requiresPinSetup:!asset.pinHash})}
