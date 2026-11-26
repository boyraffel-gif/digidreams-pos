import type { Prisma, PrismaClient } from "@prisma/client";
import { calculateSubtotal } from "@/lib/pricing";
import { getPromoRejection } from "@/lib/promo";
import type { CheckoutItem, PromoRule } from "@/lib/types";
import { AppError } from "./errors";

type DbClient = PrismaClient | Prisma.TransactionClient;

export async function findValidPromo(
  db: DbClient,
  code: string,
  subtotal: number,
  now: Date,
): Promise<PromoRule> {
  const promo = await db.promo.findUnique({ where: { code } });
  if (!promo) throw new AppError("Kode promo tidak ditemukan.", 404);

  const rejection = getPromoRejection(promo, subtotal, now);
  if (rejection) throw new AppError(rejection, 422);

  return { code: promo.code, type: promo.type, value: promo.value, minOrder: promo.minOrder };
}

/** Dipakai tombol "Apply": subtotal dihitung dari harga di database, bukan dari client. */
export async function previewPromo(
  db: PrismaClient,
  code: string,
  items: CheckoutItem[],
): Promise<PromoRule> {
  const products = await db.product.findMany({
    where: { id: { in: items.map((item) => item.productId) } },
  });
  const prices = new Map(products.map((product) => [product.id, product.price]));

  const subtotal = calculateSubtotal(
    items.map((item) => {
      const price = prices.get(item.productId);
      if (price === undefined) throw new AppError("Produk tidak ditemukan.", 404);
      return { price, quantity: item.quantity };
    }),
  );
  return findValidPromo(db, code, subtotal, new Date());
}
