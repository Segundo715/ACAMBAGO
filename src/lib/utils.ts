import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

export function generateCouponCode(): string {
  return `ACAM-${nanoid()}`;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(price);
}

export function formatDiscount(type: "percent" | "fixed", value: number): string {
  if (type === "percent") return `${value}% OFF`;
  return `$${value} MXN OFF`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function isCouponValid(coupon: {
  is_active: boolean;
  expires_at?: string | null;
  limit_count?: number | null;
  used_count: number;
}): { valid: boolean; reason?: string } {
  if (!coupon.is_active) return { valid: false, reason: "Cupón inactivo" };
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { valid: false, reason: "Cupón expirado" };
  }
  if (coupon.limit_count !== null && coupon.limit_count !== undefined && coupon.used_count >= coupon.limit_count) {
    return { valid: false, reason: "Límite de usos alcanzado" };
  }
  return { valid: true };
}
