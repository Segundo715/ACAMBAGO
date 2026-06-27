// Demo Mode: cuentas ficticias para probar la app sin Clerk/Supabase real.
// Para desactivar: borrar este archivo y revertir los cambios en proxy.ts,
// use-auth-user.ts, DemoLoginButtons.tsx y DemoBanner.tsx.

export type DemoRole = "buyer" | "seller";

// ── Datos del comprador demo ────────────────────────────────────────────────

export const DEMO_BUYER = {
  userId: "demo_buyer_001",
  name: "Carlos Mendoza",
  firstName: "Carlos",
  email: "demo.comprador@acomdi.mx",
  role: "client" as const,
  phone: "4181234567",
  initials: "CM",
};

// ── Datos del vendedor demo ─────────────────────────────────────────────────

export const DEMO_SELLER = {
  userId: "demo_seller_001",
  name: "Ana García",
  firstName: "Ana",
  email: "demo.tienda@acomdi.mx",
  role: "business" as const,
  businessName: "Ferretería Acámbaro",
  businessId: "demo-ferreteria",
};

// ── Pedidos del comprador ───────────────────────────────────────────────────

export const DEMO_BUYER_ORDERS = [
  {
    id: "ORD-009",
    store: "Ferretería Acámbaro",
    item: "Taladro Percutor 750W",
    total: 889,
    status: "entregado",
    date: "20 Jun 2026",
    storeId: "demo-ferreteria",
  },
  {
    id: "ORD-010",
    store: "Boutique Élite",
    item: "Playera Casual Talla M",
    total: 189,
    status: "en_camino",
    date: "25 Jun 2026",
    storeId: "demo-ropa",
  },
  {
    id: "ORD-011",
    store: "Zapatería Piso Firme",
    item: "Tenis Runner Blanco",
    total: 680,
    status: "pendiente",
    date: "27 Jun 2026",
    storeId: "demo-zapateria",
  },
];

export const DEMO_BUYER_FAVORITES = [
  {
    id: "demo-ferreteria",
    name: "Ferretería Acámbaro",
    category: "Ferretería",
    rating: 4.7,
    emoji: "🔧",
  },
  {
    id: "demo-ropa",
    name: "Boutique Élite",
    category: "Tienda de ropa",
    rating: 4.5,
    emoji: "👗",
  },
  {
    id: "demo-zapateria",
    name: "Zapatería Piso Firme",
    category: "Zapatería",
    rating: 4.8,
    emoji: "👟",
  },
];

export const DEMO_BUYER_COUPONS = [
  {
    id: "rc-1",
    title: "15% en herramientas",
    businessName: "Ferretería Acámbaro",
    value: 15,
    type: "percent",
    date: "15 Jun 2026",
  },
  {
    id: "rc-2",
    title: "$50 de descuento",
    businessName: "Boutique Élite",
    value: 50,
    type: "fixed",
    date: "10 Jun 2026",
  },
];

export const DEMO_BUYER_NOTIFICATIONS = [
  {
    id: "n1",
    type: "order",
    title: "Pedido en camino",
    body: "Tu pedido ORD-010 está en camino, llegará hoy.",
    time: "Hace 2 horas",
    read: false,
  },
  {
    id: "n2",
    type: "coupon",
    title: "Nuevo cupón disponible",
    body: "Ferretería Acámbaro: 15% de descuento en herramientas.",
    time: "Hace 1 día",
    read: false,
  },
  {
    id: "n3",
    type: "promo",
    title: "¡Oferta especial!",
    body: "Solo hoy: envío gratis en Boutique Élite.",
    time: "Hace 2 días",
    read: true,
  },
];

// ── Notificaciones del vendedor ─────────────────────────────────────────────

export const DEMO_SELLER_NOTIFICATIONS = [
  {
    id: "sn1",
    type: "order",
    title: "Nuevo pedido",
    body: "María García ordenó: Taladro Percutor 750W",
    time: "Hace 30 min",
    read: false,
  },
  {
    id: "sn2",
    type: "review",
    title: "Nueva reseña",
    body: "Carlos Ramírez te dejó 5 estrellas",
    time: "Hace 3 horas",
    read: false,
  },
  {
    id: "sn3",
    type: "low_stock",
    title: "Stock bajo",
    body: "Taladro Percutor 750W: solo 2 unidades restantes",
    time: "Hace 1 día",
    read: true,
  },
  {
    id: "sn4",
    type: "order",
    title: "Pedido entregado",
    body: "ORD-005 marcado como entregado",
    time: "Hace 2 días",
    read: true,
  },
];

// ── Helpers de cookie (client-side) ────────────────────────────────────────

export function getDemoMode(): DemoRole | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/demo_mode=([^;]+)/);
  return (match?.[1] as DemoRole) ?? null;
}

export function startDemoMode(role: DemoRole): void {
  document.cookie = `demo_mode=${role}; path=/; max-age=86400; SameSite=Lax`;
  window.location.href = role === "buyer" ? "/perfil" : "/dashboard/business";
}

export function stopDemoMode(): void {
  document.cookie = "demo_mode=; path=/; max-age=0";
  window.location.href = "/";
}
