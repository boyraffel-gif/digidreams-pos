import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { errorResponse } from "@/server/http";
import { getReceipt } from "@/server/orders";

export const dynamic = "force-dynamic";

/** GET /api/orders/INV-2026-001 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ invoiceNumber: string }> },
) {
  try {
    const { invoiceNumber } = await params;
    return NextResponse.json(await getReceipt(db, invoiceNumber));
  } catch (error) {
    return errorResponse(error);
  }
}
