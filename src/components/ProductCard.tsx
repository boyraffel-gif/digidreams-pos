import { formatRupiah } from "@/lib/format";
import type { ProductDto } from "@/lib/types";

const TILE_STYLES: Record<string, string> = {
  Coffee: "bg-amber-100 text-amber-900",
  "Non-Coffee": "bg-emerald-100 text-emerald-900",
  Food: "bg-rose-100 text-rose-900",
  "Coworking Space": "bg-indigo-100 text-indigo-900",
};

const LOW_STOCK = 5;

interface Props {
  product: ProductDto;
  inCart: number;
  onAdd: (product: ProductDto) => void;
}

export function ProductCard({ product, inCart, onAdd }: Props) {
  const isSoldOut = product.stock < 1;
  const isMaxed = !isSoldOut && inCart >= product.stock;
  const initials = product.name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("");

  const stockDot = isSoldOut
    ? "bg-red-500"
    : product.stock <= LOW_STOCK
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border bg-white transition hover:shadow-md ${
        inCart > 0 ? "border-brand" : "border-line"
      }`}
    >
      <div
        className={`relative flex h-36 items-center justify-center ${
          TILE_STYLES[product.category.name] ?? "bg-slate-100 text-slate-800"
        } ${isSoldOut ? "opacity-50" : ""}`}
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL gambar bebas dari database
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden className="text-3xl font-black tracking-tight">
            {initials}
          </span>
        )}
        {inCart > 0 && (
          <span className="absolute top-2 right-2 rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">
            {inCart}×
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex-1">
          <p className="text-xs text-muted">{product.category.name}</p>
          <h3 className="text-sm leading-snug font-semibold">{product.name}</h3>
        </div>
        <p className="font-bold tabular-nums">{formatRupiah(product.price)}</p>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <span className={`size-2 rounded-full ${stockDot}`} />
          {isSoldOut ? "Stok habis" : `Stok ${product.stock}`}
        </p>
        <button
          type="button"
          onClick={() => onAdd(product)}
          disabled={isSoldOut || isMaxed}
          className="rounded-lg bg-brand py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:bg-slate-200 disabled:text-slate-500"
          aria-label={`Tambah ${product.name}`}
        >
          {isSoldOut ? "Habis" : isMaxed ? "Stok maksimal" : "+ Tambah"}
        </button>
      </div>
    </article>
  );
}
