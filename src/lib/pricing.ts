import type { PromoRule } from "./types";

/** PPN dalam persen. */
export const TAX_PERCENT = 10;

export interface PriceSummary {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

export function calculateSubtotal(lines: ReadonlyArray<{ price: number; quantity: number }>): number {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}

/** Potongan promo: 0 bila belum memenuhi minimal belanja, dan tidak pernah melebihi subtotal. */
export function calculateDiscount(subtotal: number, promo: PromoRule | null): number {
  if (!promo || subtotal < promo.minOrder) return 0;
  const raw = promo.type === "PERCENT" ? Math.round((subtotal * promo.value) / 100) : promo.value;
  return Math.min(Math.max(raw, 0), subtotal);
}

/** PPN dihitung dari nilai setelah diskon; Total = (Subtotal - Diskon) + PPN. */
export function summarize(subtotal: number, promo: PromoRule | null): PriceSummary {
  const discount = calculateDiscount(subtotal, promo);
  const taxable = subtotal - discount;
  const tax = Math.round((taxable * TAX_PERCENT) / 100);
  return { subtotal, discount, tax, total: taxable + tax };
}
