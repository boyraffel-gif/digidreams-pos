import type { PrismaClient } from "@prisma/client";
import type { ReceiptDto } from "@/lib/types";
import { AppError } from "./errors";

export async function getReceipt(db: PrismaClient, invoiceNumber: string): Promise<ReceiptDto> {
  const order = await db.order.findUnique({
    where: { invoiceNumber },
    include: { items: { include: { product: true }, orderBy: { id: "asc" } } },
  });
  if (!order) throw new AppError("Transaksi tidak ditemukan.", 404);

  return {
    invoiceNumber: order.invoiceNumber,
    createdAt: order.createdAt.toISOString(),
    paymentMethod: order.paymentMethod,
    status: order.status,
    promoCode: order.promoCode,
    subtotal: order.subtotal,
    discount: order.discount,
    tax: order.tax,
    total: order.total,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    })),
  };
}
