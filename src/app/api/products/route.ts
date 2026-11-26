import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/server/db";
import { errorResponse } from "@/server/http";
import { listProducts } from "@/server/products";

export const dynamic = "force-dynamic";

/** GET /api/products?category=Coffee&search=latte */
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const products = await listProducts(db, {
      category: params.get("category") ?? undefined,
      search: params.get("search") ?? undefined,
    });
    return NextResponse.json(products);
  } catch (error) {
    return errorResponse(error);
  }
}
