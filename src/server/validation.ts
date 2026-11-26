import type { CheckoutInput, CheckoutItem } from "@/lib/types";
import { AppError } from "./errors";

const MAX_QUANTITY = 999;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

export function normalizePromoCode(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") throw new AppError("Kode promo tidak valid.");
  return value.trim().toUpperCase() || null;
}

/** Validasi item keranjang; baris dengan produk yang sama digabung agar cek stok akurat. */
export function parseItems(value: unknown): CheckoutItem[] {
  if (!Array.isArray(value) || value.length === 0) throw new AppError("Keranjang masih kosong.");

  const merged = new Map<number, number>();
  for (const item of value as unknown[]) {
    if (!isRecord(item) || !isPositiveInteger(item.productId) || !isPositiveInteger(item.quantity)) {
      throw new AppError("Item keranjang tidak valid.");
    }
    const quantity = (merged.get(item.productId) ?? 0) + item.quantity;
    if (quantity > MAX_QUANTITY) throw new AppError(`Jumlah per produk maksimal ${MAX_QUANTITY}.`);
    merged.set(item.productId, quantity);
  }
  return Array.from(merged, ([productId, quantity]) => ({ productId, quantity }));
}

export function parseCheckoutInput(body: unknown): CheckoutInput {
  if (!isRecord(body)) throw new AppError("Data checkout tidak valid.");
  const { paymentMethod } = body;
  if (paymentMethod !== "CASH" && paymentMethod !== "QRIS") {
    throw new AppError("Metode pembayaran harus CASH atau QRIS.");
  }
  return {
    items: parseItems(body.items),
    paymentMethod,
    promoCode: normalizePromoCode(body.promoCode),
  };
}
