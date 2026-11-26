import type { Prisma, PrismaClient } from "@prisma/client";
import { calculateSubtotal, summarize } from "@/lib/pricing";
import type { CheckoutInput } from "@/lib/types";
import { AppError } from "./errors";
import { findValidPromo } from "./promo";

/** Format INV-<tahun WIB>-<urutan>, contoh: INV-2026-001. */
async function nextInvoiceNumber(tx: Prisma.TransactionClient, now: Date): Promise<string> {
  const year = Number(
    new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: "Asia/Jakarta" }).format(now),
  );
  const counter = await tx.invoiceCounter.upsert({
    where: { year },
    update: { last: { increment: 1 } },
    create: { year, last: 1 },
  });
  return `INV-${year}-${String(counter.last).padStart(3, "0")}`;
}

/**
 * Seluruh proses berjalan dalam satu transaksi: bila satu langkah gagal,
 * stok, nomor invoice, dan order semuanya dibatalkan.
 */
export function checkout(
  db: PrismaClient,
  input: CheckoutInput,
  now: Date = new Date(),
): Promise<{ invoiceNumber: string }> {
  return db.$transaction(async (tx) => {
    // Tulis lebih dulu supaya SQLite langsung mengunci dan checkout paralel antre.
    const invoiceNumber = await nextInvoiceNumber(tx, now);

    const products = await tx.product.findMany({
      where: { id: { in: input.items.map((item) => item.productId) } },
    });
    const productById = new Map(products.map((product) => [product.id, product]));

    const lines = input.items.map(({ productId, quantity }) => {
      const product = productById.get(productId);
      if (!product) throw new AppError("Produk tidak ditemukan.", 404);
      return { product, quantity };
    });

    for (const { product, quantity } of lines) {
      // Pengurangan bersyarat: hanya berhasil bila stok masih cukup.
      const { count } = await tx.product.updateMany({
        where: { id: product.id, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });
      if (count === 0) {
        throw new AppError(`Stok ${product.name} tidak cukup (tersisa ${product.stock}).`, 409);
      }
    }

    const subtotal = calculateSubtotal(
      lines.map(({ product, quantity }) => ({ price: product.price, quantity })),
    );
    const promo = input.promoCode
      ? await findValidPromo(tx, input.promoCode, subtotal, now)
      : null;

    await tx.order.create({
      data: {
        invoiceNumber,
        ...summarize(subtotal, promo),
        promoCode: promo?.code ?? null,
        paymentMethod: input.paymentMethod,
        status: "PAID",
        createdAt: now,
        items: {
          create: lines.map(({ product, quantity }) => ({
            productId: product.id,
            quantity,
            unitPrice: product.price,
            subtotal: product.price * quantity,
          })),
        },
      },
    });

    return { invoiceNumber };
  });
}
