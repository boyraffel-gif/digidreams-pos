import { formatRupiah } from "./format";

export interface PromoValidity {
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  minOrder: number;
}

/** Mengembalikan alasan penolakan, atau null bila promo boleh dipakai. */
export function getPromoRejection(promo: PromoValidity, subtotal: number, now: Date): string | null {
  if (!promo.isActive) return "Kode promo sudah tidak aktif.";
  if (promo.startsAt && now < promo.startsAt) return "Kode promo belum mulai berlaku.";
  if (promo.endsAt && now > promo.endsAt) return "Kode promo sudah kedaluwarsa.";
  if (subtotal < promo.minOrder) {
    return `Minimal belanja ${formatRupiah(promo.minOrder)} untuk memakai promo ini.`;
  }
  return null;
}
