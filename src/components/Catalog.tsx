import type { RefObject } from "react";
import type { CartLine, CategoryDto, ProductDto } from "@/lib/types";
import { ProductCard } from "./ProductCard";

interface Props {
  categories: CategoryDto[];
  products: ProductDto[];
  cartLines: CartLine[];
  search: string;
  category: string | null;
  isLoading: boolean;
  error: string | null;
  searchRef: RefObject<HTMLInputElement | null>;
  onSearch: (value: string) => void;
  onCategory: (value: string | null) => void;
  onAdd: (product: ProductDto) => void;
  onRetry: () => void;
}

export function Catalog(props: Props) {
  const quantities = new Map(props.cartLines.map((line) => [line.product.id, line.quantity]));
  const tabs = [
    { label: "All", value: null },
    ...props.categories.map((item) => ({ label: item.name, value: item.name })),
  ];

  return (
    <section aria-label="Katalog produk" className="min-w-0">
      <div className="relative">
        <input
          ref={props.searchRef}
          type="search"
          value={props.search}
          onChange={(event) => props.onSearch(event.target.value)}
          placeholder="Cari menu…"
          aria-label="Cari menu"
          className="w-full rounded-xl border border-line bg-white py-3 pr-14 pl-4 text-sm"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded border border-line bg-canvas px-2 py-0.5 text-xs text-muted">
          /
        </kbd>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter kategori">
        {tabs.map((tab) => {
          const isActive = props.category === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              aria-pressed={isActive}
              onClick={() => props.onCategory(tab.value)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${
                isActive
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {props.error && (
        <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {props.error}{" "}
          <button type="button" onClick={props.onRetry} className="font-semibold underline">
            Coba lagi
          </button>
        </div>
      )}

      {props.isLoading ? (
        <p className="py-16 text-center text-sm text-muted">Memuat menu…</p>
      ) : props.products.length === 0 && !props.error ? (
        <p className="py-16 text-center text-sm text-muted">
          Menu tidak ditemukan. Ubah kata kunci atau pilih kategori lain.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {props.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              inCart={quantities.get(product.id) ?? 0}
              onAdd={props.onAdd}
            />
          ))}
        </div>
      )}
    </section>
  );
}
