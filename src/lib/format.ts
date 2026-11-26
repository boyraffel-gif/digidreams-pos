const numberFormat = new Intl.NumberFormat("id-ID");

export function formatRupiah(amount: number): string {
  return `Rp ${numberFormat.format(amount)}`;
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}
