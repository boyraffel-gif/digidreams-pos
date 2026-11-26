import { PrismaClient, PromoType } from "@prisma/client";

const prisma = new PrismaClient();

type SeedProduct = { name: string; price: number; stock: number; imageUrl: string };

const catalog: Record<string, ReadonlyArray<SeedProduct>> = {
  Coffee: [
    { name: "Espresso", price: 18000, stock: 40, imageUrl: "/images/products/espresso.jpg" },
    { name: "Cafe Latte", price: 28000, stock: 30, imageUrl: "/images/products/cafe-latte.jpg" },
    {
      name: "Es Kopi Susu Gula Aren",
      price: 24000,
      stock: 50,
      imageUrl: "/images/products/es-kopi-susu-gula-aren.jpg",
    },
  ],
  "Non-Coffee": [
    { name: "Matcha Latte", price: 30000, stock: 25, imageUrl: "/images/products/matcha-latte.jpg" },
    { name: "Cokelat Panas", price: 26000, stock: 20, imageUrl: "/images/products/cokelat-panas.jpg" },
    { name: "Lemon Tea", price: 18000, stock: 35, imageUrl: "/images/products/lemon-tea.jpg" },
  ],
  Food: [
    {
      name: "Croissant Butter",
      price: 25000,
      stock: 12,
      imageUrl: "/images/products/croissant-butter.jpg",
    },
    {
      name: "Nasi Goreng DigiDreams",
      price: 35000,
      stock: 15,
      imageUrl: "/images/products/nasi-goreng-digidreams.jpg",
    },
    { name: "Kentang Goreng", price: 22000, stock: 3, imageUrl: "/images/products/kentang-goreng.jpg" },
  ],
  "Coworking Space": [
    { name: "Day Pass", price: 75000, stock: 20, imageUrl: "/images/products/day-pass.jpg" },
    {
      name: "Half Day Pass (4 Jam)",
      price: 45000,
      stock: 20,
      imageUrl: "/images/products/half-day-pass.jpg",
    },
    {
      name: "Meeting Room (1 Jam)",
      price: 100000,
      stock: 4,
      imageUrl: "/images/products/meeting-room.jpg",
    },
  ],
};

async function main(): Promise<void> {
  for (const [categoryName, products] of Object.entries(catalog)) {
    const category = await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });

    for (const product of products) {
      const data = { ...product, categoryId: category.id };
      await prisma.product.upsert({ where: { name: product.name }, update: data, create: data });
    }
  }

  const promo = {
    code: "DIGIZEN10",
    type: PromoType.PERCENT,
    value: 10,
    minOrder: 50000,
    isActive: true,
    startsAt: new Date("2026-01-01T00:00:00+07:00"),
    endsAt: new Date("2027-12-31T23:59:59+07:00"),
  };
  await prisma.promo.upsert({ where: { code: promo.code }, update: promo, create: promo });

  console.log("Seed selesai: 4 kategori, 12 produk, promo DIGIZEN10.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
