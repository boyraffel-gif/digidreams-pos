# DigiDreams Mini-POS & Order Engine

POS kasir satu halaman untuk DigiDreams Cafe & Coworking Space.

**Stack:** Next.js (App Router) · TypeScript strict · Tailwind CSS 4 · Prisma 6 · SQLite

## Prasyarat

Node.js 20 atau lebih baru dan npm.

## 1. Instalasi dependensi

```bash
npm install
cp .env.example .env      # Windows PowerShell: copy .env.example .env
```

## 2. Migrasi dan seed database

```bash
npx prisma migrate dev --name init   # membuat prisma/dev.db dan folder migrasi
npm run db:seed                      # 4 kategori, 12 produk, promo DIGIZEN10
```

Commit folder `prisma/migrations/` yang terbentuk. Pada clone berikutnya cukup jalankan
`npx prisma migrate dev` lalu `npm run db:seed`.

Menjalankan seed ulang akan mengembalikan stok dan harga ke nilai awal.

## 3. Menjalankan aplikasi

```bash
npm run dev               # http://localhost:3000
```

## Pemeriksaan sebelum rilis

```bash
npm test                  # unit test kalkulasi harga & promo
npm run lint
npm run typecheck
npm run build
npm run start
```

## API

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/api/categories` | Daftar kategori |
| GET | `/api/products?category=Coffee&search=latte` | Menu dengan filter dan pencarian |
| POST | `/api/promo` | `{ code, items }`, validasi kode promo |
| POST | `/api/checkout` | `{ items: [{ productId, quantity }], paymentMethod, promoCode }` |
| GET | `/api/orders/INV-2026-001` | Detail transaksi untuk struk |

## Aturan bisnis

- Subtotal = jumlah (harga × kuantitas); harga selalu diambil dari database.
- Promo ditolak bila tidak aktif, di luar periode, atau di bawah minimal belanja.
- PPN 10% dihitung dari nilai setelah diskon, dibulatkan ke Rupiah terdekat.
- Total = (Subtotal − Diskon) + PPN.
- Checkout berjalan dalam satu transaksi. Stok dikurangi secara bersyarat sehingga tidak bisa minus.
- Nomor invoice `INV-<tahun>-<urutan>` memakai penghitung per tahun (zona waktu WIB).
- Pembayaran QRIS dan Tunai hanya dicatat; belum terhubung ke payment gateway.

## Fitur kasir

- `/` fokus ke pencarian menu, `Esc` menutup struk.
- Cetak struk untuk kertas thermal 58mm atau 80mm. Di dialog cetak, pilih margin "None".

## Foto produk

Semua foto disimpan lokal di `public/images/products/` dan dipakai lewat kolom
`Product.imageUrl`. Bila `imageUrl` kosong, kartu menampilkan inisial nama produk.
Foto diambil dari Openverse (https://openverse.org) yang mengindeks karya
berlisensi terbuka; lisensi di bawah mengizinkan pemakaian komersial.

| Produk | Berkas | Sumber | Kreator | Lisensi |
| --- | --- | --- | --- | --- |
| Espresso | `espresso.jpg` | [Flickr](https://www.flickr.com/photos/72949902@N00/5076909942) | TheCulinaryGeek | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| Cafe Latte | `cafe-latte.jpg` | [Flickr](https://www.flickr.com/photos/29946195@N07/4256092375) | kkmarais | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| Es Kopi Susu Gula Aren | `es-kopi-susu-gula-aren.jpg` | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Es_Kopi_Susu_Gula_Aren.jpg) | Happywu | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Matcha Latte | `matcha-latte.jpg` | [Flickr](https://www.flickr.com/photos/94085795@N08/9600173692) | Kirinohana | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| Cokelat Panas | `cokelat-panas.jpg` | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Hot_chocolate_mug_with_whipped_cream.jpg) | User Jonik on en.wikipedia | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| Lemon Tea | `lemon-tea.jpg` | [Flickr](https://www.flickr.com/photos/44124483743@N01/6641522097) | brownpau | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| Croissant Butter | `croissant-butter.jpg` | [Flickr](https://www.flickr.com/photos/38142119@N00/28777473581) | The Marmot | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| Nasi Goreng DigiDreams | `nasi-goreng-digidreams.jpg` | [Flickr](https://www.flickr.com/photos/77742560@N06/11967588375) | shankar s. | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| Kentang Goreng | `kentang-goreng.jpg` | [Flickr](https://www.flickr.com/photos/60944931@N00/5729028796) | waferboard | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| Day Pass | `day-pass.jpg` | [Flickr](https://www.flickr.com/photos/47022937@N03/32365147778) | GoToVan | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |
| Half Day Pass (4 Jam) | `half-day-pass.jpg` | [Flickr](https://www.flickr.com/photos/36647976@N00/13976231765) | stevepurkiss | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) |
| Meeting Room (1 Jam) | `meeting-room.jpg` | [Flickr](https://www.flickr.com/photos/71401718@N00/5526839767) | Wonderlane | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |

## Struktur

```
prisma/          schema.prisma, seed.ts
src/app/         halaman dan route API
src/components/  UI kasir dan struk
src/hooks/       state katalog dan keranjang
src/lib/         tipe, format, kalkulasi harga (dipakai server & client)
src/server/      logika bisnis dan akses database
tests/           unit test
```
