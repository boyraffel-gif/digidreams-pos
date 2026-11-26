import { NextResponse } from "next/server";
import { checkout } from "@/server/checkout";
import { db } from "@/server/db";
import { errorResponse, readJson } from "@/server/http";
import { parseCheckoutInput } from "@/server/validation";

/** POST /api/checkout { items, paymentMethod, promoCode } */
export async function POST(request: Request) {
  try {
    const input = parseCheckoutInput(await readJson(request));
    return NextResponse.json(await checkout(db, input), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
