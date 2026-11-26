"use client";

import { useCallback, useState } from "react";
import type { CartLine, ProductDto } from "@/lib/types";

const clamp = (quantity: number, stock: number) => Math.min(Math.max(quantity, 1), stock);

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);

  const add = useCallback((product: ProductDto) => {
    if (product.stock < 1) return;
    setLines((current) => {
      const exists = current.some((line) => line.product.id === product.id);
      if (!exists) return [...current, { product, quantity: 1 }];
      return current.map((line) =>
        line.product.id === product.id
          ? { product, quantity: clamp(line.quantity + 1, product.stock) }
          : line,
      );
    });
  }, []);

  const setQuantity = useCallback((productId: number, quantity: number) => {
    setLines((current) =>
      current.map((line) =>
        line.product.id === productId
          ? { ...line, quantity: clamp(quantity, line.product.stock) }
          : line,
      ),
    );
  }, []);

  const remove = useCallback((productId: number) => {
    setLines((current) => current.filter((line) => line.product.id !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  /** Menyamakan harga & stok di keranjang dengan data terbaru dari server. */
  const sync = useCallback((products: ProductDto[]) => {
    const latest = new Map(products.map((product) => [product.id, product]));
    setLines((current) =>
      current.flatMap((line) => {
        const product = latest.get(line.product.id) ?? line.product;
        if (product.stock < 1) return [];
        return [{ product, quantity: clamp(line.quantity, product.stock) }];
      }),
    );
  }, []);

  return { lines, add, setQuantity, remove, clear, sync };
}
