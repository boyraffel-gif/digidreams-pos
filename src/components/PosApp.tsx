"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useCatalog } from "@/hooks/useCatalog";
import { apiFetch } from "@/lib/api-client";
import { formatRupiah } from "@/lib/format";
import type { PaymentMethod, PromoRule, ReceiptDto } from "@/lib/types";
import { Cart, getCartSummary } from "./Cart";
import { Catalog } from "./Catalog";
import { ReceiptModal } from "./ReceiptModal";

const toMessage = (cause: unknown) =>
  cause instanceof Error ? cause.message : "Terjadi kesalahan.";

export function PosApp() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [promo, setPromo] = useState<PromoRule | null>(null);
  const [receipt, setReceipt] = useState<ReceiptDto | null>(null);
  const [lastInvoice, setLastInvoice] = useState<string | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const { categories, products, isLoading, error, refresh } = useCatalog(search, category);
  const { lines, add, setQuantity, remove, clear, sync } = useCart();

  // Stok/harga terbaru dari server selalu diterapkan ke isi keranjang.
  useEffect(() => sync(products), [products, sync]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsReceiptOpen(false);
        return;
      }
      const target = event.target as HTMLElement;
      const isTyping = target.matches("input:not([type=radio]), textarea, select");
      if (event.key === "/" && !isTyping && !isReceiptOpen) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isReceiptOpen]);

  async function openReceipt(invoiceNumber: string) {
    setPayError(null);
    try {
      setReceipt(await apiFetch<ReceiptDto>(`/api/orders/${encodeURIComponent(invoiceNumber)}`));
      setIsReceiptOpen(true);
    } catch (cause) {
      setPayError(`${invoiceNumber} tersimpan, tetapi struk gagal dimuat: ${toMessage(cause)}`);
    }
  }

  async function pay(paymentMethod: PaymentMethod, promoCode: string | null) {
    setIsPaying(true);
    setPayError(null);
    try {
      const { invoiceNumber } = await apiFetch<{ invoiceNumber: string }>("/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          paymentMethod,
          promoCode,
          items: lines.map((line) => ({ productId: line.product.id, quantity: line.quantity })),
        }),
      });
      setLastInvoice(invoiceNumber);
      clear();
      setPromo(null);
      await openReceipt(invoiceNumber);
    } catch (cause) {
      setPayError(toMessage(cause));
    } finally {
      // Muat ulang stok, baik checkout berhasil maupun ditolak.
      refresh();
      setIsPaying(false);
    }
  }

  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <>
      <div className="mx-auto max-w-[1440px] p-4 pb-24 lg:pb-4">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-ink text-lg font-black text-white">
              DD
            </span>
            <div>
              <h1 className="text-lg leading-tight font-bold">DigiDreams Space</h1>
              <p className="text-sm text-muted">Kasir · Cafe &amp; Coworking</p>
            </div>
          </div>
          {lastInvoice && (
            <button
              type="button"
              onClick={() => openReceipt(lastInvoice)}
              className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium"
            >
              Struk terakhir: {lastInvoice}
            </button>
          )}
        </header>

        <main className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Catalog
            categories={categories}
            products={products}
            cartLines={lines}
            search={search}
            category={category}
            isLoading={isLoading}
            error={error}
            searchRef={searchRef}
            onSearch={setSearch}
            onCategory={setCategory}
            onAdd={(product) => {
              if (isPaying) return;
              setPayError(null);
              add(product);
            }}
            onRetry={refresh}
          />
          <Cart
            lines={lines}
            promo={promo}
            isPaying={isPaying}
            error={payError}
            onPromo={setPromo}
            onQuantity={setQuantity}
            onRemove={remove}
            onClear={() => {
              clear();
              setPromo(null);
              setPayError(null);
            }}
            onPay={pay}
          />
        </main>

        {itemCount > 0 && (
          <a
            href="#cart"
            className="fixed inset-x-4 bottom-4 flex justify-between rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white shadow-lg lg:hidden"
          >
            <span>Lihat keranjang ({itemCount})</span>
            <span>{formatRupiah(getCartSummary(lines, promo).total)}</span>
          </a>
        )}
      </div>

      {receipt && isReceiptOpen && (
        <ReceiptModal receipt={receipt} onClose={() => setIsReceiptOpen(false)} />
      )}
    </>
  );
}
