export type UserRole = "client" | "business" | "admin";
export type DiscountType = "percent" | "fixed";

export interface Profile {
  id: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  category: string;
  address: string;
  latitude?: number;
  longitude?: number;
  whatsapp?: string;
  image_url?: string;
  banner_url?: string;
  rating_avg: number;
  rating_count: number;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  business_id: string;
  title: string;
  description?: string;
  discount_type: DiscountType;
  value: number;
  code: string;
  qr_data: string;
  limit_count?: number;
  used_count: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface CouponRedemption {
  id: string;
  coupon_id: string;
  user_id?: string;
  business_id: string;
  redeemed_at: string;
}

export interface Review {
  id: string;
  business_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  profiles?: Pick<Profile, "name" | "avatar_url">;
}

export interface QRPayload {
  coupon_code: string;
  business_id: string;
}

export const BUSINESS_CATEGORIES = [
  "Tienda de ropa",
  "Zapatería",
  "Farmacia",
  "Ferretería",
  "Papelería",
  "Electrónica",
  "Joyería",
  "Mueblería",
  "Abarrotes",
  "Cosméticos",
  "Mascotas",
  "Artesanías",
  "Deportes",
  "Juguetería",
  "Librería",
  "Otro",
] as const;
