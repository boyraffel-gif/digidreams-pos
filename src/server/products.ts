import type { PrismaClient } from "@prisma/client";
import type { CategoryDto, ProductDto } from "@/lib/types";

export function listCategories(db: PrismaClient): Promise<CategoryDto[]> {
  return db.category.findMany({ orderBy: { id: "asc" } });
}

export function listProducts(
  db: PrismaClient,
  filters: { category?: string; search?: string },
): Promise<ProductDto[]> {
  const search = filters.search?.trim();
  const category = filters.category?.trim();

  return db.product.findMany({
    where: {
      // LIKE pada SQLite tidak membedakan huruf besar/kecil (ASCII).
      ...(search ? { name: { contains: search } } : {}),
      ...(category ? { category: { name: category } } : {}),
    },
    select: { id: true, name: true, price: true, stock: true, imageUrl: true, category: true },
    orderBy: [{ categoryId: "asc" }, { name: "asc" }],
  });
}
