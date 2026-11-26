import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { AppError } from "@/server/errors";
import { errorResponse, readJson } from "@/server/http";
import { previewPromo } from "@/server/promo";
import { normalizePromoCode, parseItems } from "@/server/validation";

/** POST /api/promo { code, items } */
export async function POST(request: Request) {
  try {
    const body = (await readJson(request)) as { code?: unknown; items?: unknown } | null;
    const code = normalizePromoCode(body?.code);
    if (!code) throw new AppError("Masukkan kode promo.");
    return NextResponse.json(await previewPromo(db, code, parseItems(body?.items)));
  } catch (error) {
    return errorResponse(error);
  }
}
