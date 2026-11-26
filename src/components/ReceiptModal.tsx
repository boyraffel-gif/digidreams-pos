"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { TAX_PERCENT } from "@/lib/pricing";
import type { ReceiptDto } from "@/lib/types";

type PaperWidth = 58 | 80;

const PX_PER_MM = 96 / 25.4;

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between gap-2 ${bold ? "text-[1.15em] font-bold" : ""}`}>
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

const Divider = () => <hr className="my-2 border-t border-dashed border-black" />;

export function ReceiptModal({ receipt, onClose }: { receipt: ReceiptDto; onClose: () => void }) {
  const [width, setWidth] = useState<PaperWidth>(80);
  const paperRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    closeRef.current?.focus();
    return () => {
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  /** Atur ukuran halaman cetak sesuai lebar kertas dan panjang struk. */
  function print() {
    const height = Math.ceil((paperRef.current?.offsetHeight ?? 0) / PX_PER_MM) + 4;
    const style = document.createElement("style");
    style.textContent = `@page { size: ${width}mm ${Math.max(height, width + 1)}mm; margin: 0; }`;
    document.head.appendChild(style);
    window.addEventListener("afterprint", () => style.remove(), { once: true });
    window.print();
  }

  return createPortal(
    <div
      className="receipt-overlay fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Struk ${receipt.invoiceNumber}`}
        className="receipt-dialog flex max-h-full w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="no-print flex items-center justify-between border-b border-line p-3">
          <p className="font-bold text-emerald-700">Pembayaran berhasil</p>
          <div className="flex gap-1" role="group" aria-label="Lebar kertas">
            {([58, 80] as const).map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={width === size}
                onClick={() => setWidth(size)}
                className={`rounded-md border px-2 py-1 text-xs ${
                  width === size ? "border-ink bg-ink text-white" : "border-line"
                }`}
              >
                {size}mm
              </button>
            ))}
          </div>
        </div>

        <div className="receipt-scroll overflow-y-auto bg-canvas p-4">
          <div
            ref={paperRef}
            className={`receipt-paper mx-auto bg-white shadow ${
              width === 58 ? "p-[3mm] text-[10px]" : "p-[4mm] text-xs"
            }`}
            style={{ width: `${width}mm` }}
          >
            <header className="text-center">
              <p className="text-[1.4em] font-bold">DigiDreams Space</p>
              <p>Cafe &amp; Coworking Space</p>
            </header>
            <Divider />
            <Row label="No" value={receipt.invoiceNumber} />
            <Row label="Tanggal" value={formatDateTime(receipt.createdAt)} />
            <Row label="Bayar" value={receipt.paymentMethod === "CASH" ? "Tunai" : "QRIS"} />
            <Row label="Status" value={receipt.status === "PAID" ? "LUNAS" : receipt.status} />
            <Divider />
            {receipt.items.map((item) => (
              <div key={item.id} className="mb-1">
                <p className="break-words">{item.name}</p>
                <Row
                  label={`${item.quantity} x ${formatRupiah(item.unitPrice)}`}
                  value={formatRupiah(item.subtotal)}
                />
              </div>
            ))}
            <Divider />
            <Row label="Subtotal" value={formatRupiah(receipt.subtotal)} />
            {receipt.discount > 0 && (
              <Row
                label={`Diskon${receipt.promoCode ? ` ${receipt.promoCode}` : ""}`}
                value={`-${formatRupiah(receipt.discount)}`}
              />
            )}
            <Row label={`PPN ${TAX_PERCENT}%`} value={formatRupiah(receipt.tax)} />
            <Divider />
            <Row label="TOTAL" value={formatRupiah(receipt.total)} bold />
            <Divider />
            <p className="text-center">Terima kasih, selamat berkarya!</p>
          </div>
        </div>

        <div className="no-print grid grid-cols-2 gap-2 border-t border-line p-3">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line py-2 text-sm font-semibold"
          >
            Tutup (Esc)
          </button>
          <button
            type="button"
            onClick={print}
            className="rounded-lg bg-brand py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Cetak Struk
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
