export type PaymentMethod = "CASH" | "QRIS";
export type PromoType = "PERCENT" | "FIXED";

export interface CategoryDto {
  id: number;
  name: string;
}

export interface ProductDto {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: CategoryDto;
}

export interface PromoRule {
  code: string;
  type: PromoType;
  value: number;
  minOrder: number;
}

export interface CartLine {
  product: ProductDto;
  quantity: number;
}

export interface CheckoutItem {
  productId: number;
  quantity: number;
}

export interface CheckoutInput {
  items: CheckoutItem[];
  paymentMethod: PaymentMethod;
  promoCode: string | null;
}

export interface ReceiptDto {
  invoiceNumber: string;
  createdAt: string;
  paymentMethod: PaymentMethod;
  status: "PAID";
  promoCode: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
}
