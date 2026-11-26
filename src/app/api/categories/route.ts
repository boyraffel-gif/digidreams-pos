import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { errorResponse } from "@/server/http";
import { listCategories } from "@/server/products";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await listCategories(db));
  } catch (error) {
    return errorResponse(error);
  }
}
