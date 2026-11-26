import { NextResponse } from "next/server";
import { AppError } from "./errors";

export function errorResponse(error: unknown): NextResponse<{ error: string }> {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: "Terjadi kesalahan pada server. Coba lagi." }, { status: 500 });
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new AppError("Body request harus berupa JSON yang valid.");
  }
}
