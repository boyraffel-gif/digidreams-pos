"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { CategoryDto, ProductDto } from "@/lib/types";

/** Data menu: filter kategori dan pencarian dikerjakan server (debounce 200 ms). */
export function useCatalog(search: string, category: string | null) {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    apiFetch<CategoryDto[]>("/api/categories")
      .then(setCategories)
      .catch((cause: Error) => setError(cause.message));
  }, [version]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (category) params.set("category", category);

      apiFetch<ProductDto[]>(`/api/products?${params}`, { signal: controller.signal })
        .then((result) => {
          setProducts(result);
          setError(null);
          setIsLoading(false);
        })
        .catch((cause: Error) => {
          if (controller.signal.aborted) return;
          setError(cause.message);
          setIsLoading(false);
        });
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, category, version]);

  return { categories, products, isLoading, error, refresh };
}
