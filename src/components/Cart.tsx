"use client";

import { useState, type FormEvent } from "react";
import { apiFetch } from "@/lib/api-client";
import { formatRupiah } from "@/lib/format";
import { calculateSubtotal, summarize, TAX_PERCENT } from "@/lib/pricing";
import type { CartLine, PaymentMethod, PromoRule } from "@/lib/types";

interface Props {
  lines: CartLine[];
  promo: PromoRule | null;
  isPaying: boolean;
  error: string | null;
  onPromo: (promo: PromoRule | null) => void;
  onQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  onClear: () => void;
  onPay: (method: PaymentMethod, promoCode: string | null) => void;
}

const PAYMENT_OPTIONS: Array<{ value: PaymentMethod; label: string }> = [
  { value: "CASH", label: "Tunai" },
  { value: "QRIS", label: "QRIS" },
];

export function getCartSummary(lines: CartLine[], promo: PromoRule | null) {
  const subtotal = calculateSubtotal(
    lines.map((line) => ({ price: line.product.price, quantity: line.quantity })),
  );
  return summarize(subtotal, promo);
}

export function Cart(props: Props) {
  const [code, setCode] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("CASH");

  const { lines, promo } = props;
  const summary = getCartSummary(lines, promo);
  const isEmpty = lines.length === 0;
  const shortfall = promo ? Math.max(promo.minOrder - summary.subtotal, 0) : 0;

  async function applyPromo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPromoError(null);
    setIsChecking(true);
    try {
      const result = await apiFetch<PromoRule>("/api/promo", {
        method: "POST",
        body: JSON.stringify({
          code,
          items: lines.map((line) => ({ productId: line.product.id, quantity: line.quantity })),
        }),
      });
      props.onPromo(result);
      setCode("");
    } catch (cause) {
      props.onPromo(null);
      setPromoError(cause instanceof Error ? cause.message : "Gagal memeriksa promo.");
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <aside
      id="cart"
      aria-label="Keranjang kasir"
      className="flex flex-col rounded-2xl border border-line bg-white lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto"
    >
      <div className="flex items-center justify-between border-b border-line p-4">
        <h2 className="font-bold">Keranjang</h2>
        {!isEmpty && (
          <button
            type="button"
            onClick={props.onClear}
            disabled={props.isPaying}
            className="text-sm text-muted hover:text-red-600"
          >
            Kosongkan
          </button>
        )}
      </div>

      {isEmpty ? (
        <p className="px-4 py-10 text-center text-sm text-muted">
          Belum ada item. Tekan “+ Tambah” pada menu.
        </p>
      ) : (
        <ul className="divide-y divide-line px-4">
          {lines.map(({ product, quantity }) => (
            <li key={product.id} className="py-3">
              <div className="flex justify-between gap-3">
                <p className="text-sm font-semibold">{product.name}</p>
                <p className="shrink-0 text-sm font-semibold tabular-nums">
                  {formatRupiah(product.price * quantity)}
                </p>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => props.onQuantity(product.id, quantity - 1)}
                    disabled={props.isPaying || quantity <= 1}
                    aria-label={`Kurangi ${product.name}`}
                    className="size-8 rounded-lg border border-line font-bold disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-7 text-center text-sm tabular-nums">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => props.onQuantity(product.id, quantity + 1)}
                    disabled={props.isPaying || quantity >= product.stock}
                    aria-label={`Tambah jumlah ${product.name}`}
                    className="size-8 rounded-lg border border-line font-bold disabled:opacity-40"
                  >
                    +
                  </button>
                  <span className="text-xs text-muted">@ {formatRupiah(product.price)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => props.onRemove(product.id)}
                  disabled={props.isPaying}
                  aria-label={`Hapus ${product.name}`}
                  className="text-sm text-red-600 hover:underline"
                >
                  Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-4 border-t border-line p-4">
        <div>
          <form onSubmit={applyPromo} className="flex gap-2">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="Kode promo"
              aria-label="Kode promo"
              className="min-w-0 flex-1 rounded-lg border border-line px-3 py-2 text-sm uppercase"
            />
            <button
              type="submit"
              disabled={isEmpty || !code.trim() || isChecking}
              className="rounded-lg border border-ink px-4 text-sm font-semibold disabled:border-line disabled:text-slate-400"
            >
              {isChecking ? "Cek…" : "Apply"}
            </button>
          </form>
          {promoError && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {promoError}
            </p>
          )}
          {promo && (
            <div
              className={`mt-2 flex items-start justify-between gap-2 rounded-lg p-2 text-sm ${
                shortfall > 0 ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"
              }`}
            >
              <span>
                <strong>{promo.code}</strong>{" "}
                {shortfall > 0
                  ? `belum aktif, kurang ${formatRupiah(shortfall)} lagi.`
                  : "diterapkan."}
              </span>
              <button type="button" onClick={() => props.onPromo(null)} className="underline">
                Lepas
              </button>
            </div>
          )}
        </div>

        <dl className="space-y-1 text-sm tabular-nums">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd>{formatRupiah(summary.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Diskon</dt>
            <dd className={summary.discount > 0 ? "text-emerald-700" : ""}>
              − {formatRupiah(summary.discount)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">PPN {TAX_PERCENT}%</dt>
            <dd>{formatRupiah(summary.tax)}</dd>
          </div>
          <div className="flex justify-between border-t border-dashed border-line pt-2 text-lg font-bold">
            <dt>Total Akhir</dt>
            <dd>{formatRupiah(summary.total)}</dd>
          </div>
        </dl>

        <fieldset className="grid grid-cols-2 gap-2">
          <legend className="sr-only">Metode pembayaran</legend>
          {PAYMENT_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-lg border py-2 text-center text-sm font-semibold has-focus-visible:outline-2 has-focus-visible:outline-brand ${
                method === option.value
                  ? "border-brand bg-brand-soft text-brand-dark"
                  : "border-line text-muted"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={option.value}
                checked={method === option.value}
                onChange={() => setMethod(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </fieldset>

        {props.error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {props.error}
          </p>
        )}

        <button
          type="button"
          onClick={() => props.onPay(method, promo && shortfall === 0 ? promo.code : null)}
          disabled={isEmpty || props.isPaying}
          className="w-full rounded-xl bg-brand py-3 font-bold text-white hover:bg-brand-dark disabled:bg-slate-200 disabled:text-slate-500"
        >
          {props.isPaying ? "Memproses…" : "Bayar Sekarang"}
        </button>
      </div>
    </aside>
  );
}
