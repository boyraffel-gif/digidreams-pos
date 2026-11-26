import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateDiscount, summarize } from "../src/lib/pricing";
import { getPromoRejection } from "../src/lib/promo";
import type { PromoRule } from "../src/lib/types";

const digizen: PromoRule = { code: "DIGIZEN10", type: "PERCENT", value: 10, minOrder: 50000 };

test("tanpa promo: PPN 10% dari subtotal", () => {
  assert.deepEqual(summarize(46000, null), { subtotal: 46000, discount: 0, tax: 4600, total: 50600 });
});

test("PPN dihitung dari nilai setelah diskon", () => {
  assert.deepEqual(summarize(55000, digizen), {
    subtotal: 55000,
    discount: 5500,
    tax: 4950,
    total: 54450,
  });
});

test("batas minimal belanja inklusif", () => {
  assert.equal(calculateDiscount(49999, digizen), 0);
  assert.equal(calculateDiscount(50000, digizen), 5000);
});

test("potongan tetap tidak melebihi subtotal", () => {
  const fixed: PromoRule = { code: "X", type: "FIXED", value: 100000, minOrder: 0 };
  assert.deepEqual(summarize(30000, fixed), { subtotal: 30000, discount: 30000, tax: 0, total: 0 });
});

test("validasi status dan tanggal promo", () => {
  const base = {
    isActive: true,
    startsAt: new Date("2026-01-01"),
    endsAt: new Date("2026-12-31"),
    minOrder: 0,
  };
  assert.equal(getPromoRejection(base, 1000, new Date("2026-06-01")), null);
  assert.match(getPromoRejection(base, 1000, new Date("2025-12-01")) ?? "", /belum mulai/);
  assert.match(getPromoRejection(base, 1000, new Date("2027-01-02")) ?? "", /kedaluwarsa/);
  assert.match(
    getPromoRejection({ ...base, isActive: false }, 1000, new Date("2026-06-01")) ?? "",
    /tidak aktif/,
  );
});
