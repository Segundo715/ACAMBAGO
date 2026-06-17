import { Business, Product, Coupon, Review } from "@/types";

// ─── NEGOCIOS DEMO ────────────────────────────────────────────────────────────

export const DEMO_BUSINESSES: Business[] = [
  {
    id: "demo",
    owner_id: "demo-owner",
    name: "Ferretería y Materiales Acámbaro",
    description: "Tu ferretería de confianza con más de 30 años. Herramientas, materiales de construcción, pinturas, plomería, electricidad y más.",
    category: "Ferretería",
    address: "Av. Morelos 118, Centro, Acámbaro, Gto.",
    latitude: 20.0321,
    longitude: -100.7268,
    whatsapp: "4181234567",
    image_url: undefined,
    banner_url: undefined,
    rating_avg: 4.7,
    rating_count: 89,
    is_approved: true,
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "demo-lavado",
    owner_id: "demo-owner-2",
    name: "Lavado a Domicilio Express",
    description: "Lavado y desinfección de autos, tapicería y alfombras a domicilio. Resultados profesionales en la puerta de tu casa.",
    category: "Servicios del hogar",
    address: "Col. Lázaro Cárdenas, Acámbaro, Gto.",
    latitude: 20.034,
    longitude: -100.729,
    whatsapp: "4182345678",
    image_url: undefined,
    banner_url: undefined,
    rating_avg: 4.9,
    rating_count: 54,
    is_approved: true,
    is_active: true,
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
  },
  {
    id: "demo-cerrajero",
    owner_id: "demo-owner-3",
    name: "Cerrajería Rápida 24/7",
    description: "Apertura de puertas, duplicado de llaves, instalación de cerraduras y cajas fuertes. Servicio de emergencia las 24 horas.",
    category: "Servicios del hogar",
    address: "Centro, Acámbaro, Gto.",
    latitude: 20.0315,
    longitude: -100.726,
    whatsapp: "4183456789",
    image_url: undefined,
    banner_url: undefined,
    rating_avg: 4.8,
    rating_count: 71,
    is_approved: true,
    is_active: true,
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2024-03-01T00:00:00Z",
  },
  {
    id: "demo-pintor",
    owner_id: "demo-owner-4",
    name: "Pintura y Acabados Pro",
    description: "Pintura interior y exterior, yeso, impermeabilización y acabados finos. Presupuesto sin costo. Trabajo garantizado.",
    category: "Servicios del hogar",
    address: "Col. San Antonio, Acámbaro, Gto.",
    latitude: 20.0308,
    longitude: -100.7255,
    whatsapp: "4184567890",
    image_url: undefined,
    banner_url: undefined,
    rating_avg: 4.6,
    rating_count: 38,
    is_approved: true,
    is_active: true,
    created_at: "2024-04-01T00:00:00Z",
    updated_at: "2024-04-01T00:00:00Z",
  },
];

// Alias para compatibilidad con código existente
export const DEMO_BUSINESS = DEMO_BUSINESSES[0];

// ─── PRODUCTOS DEMO ───────────────────────────────────────────────────────────

export const DEMO_PRODUCTS: Product[] = [
  {
    id: "p1",
    business_id: "demo",
    name: "Taladro Percutor 1/2\"",
    description: "Taladro 750W con reversa, velocidad variable y maletín incluido",
    price: 890,
    image_url: undefined,
    is_available: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "p2",
    business_id: "demo",
    name: "Pintura Vinílica 4L",
    description: "Pintura lavable interior, colores variados, acabado mate",
    price: 320,
    image_url: undefined,
    is_available: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "p3",
    business_id: "demo",
    name: "Llave de Paso 1/2\" (juego)",
    description: "Llave de paso cromada con empaque, uso en tuberías de agua",
    price: 145,
    image_url: undefined,
    is_available: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "p4",
    business_id: "demo",
    name: "Kit Fumigador Portátil 5L",
    description: "Bomba de fumigación manual con boquilla ajustable, ideal para jardines, patios y desinfección del hogar",
    price: 280,
    image_url: undefined,
    is_available: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

export const DEMO_SERVICES_LAVADO: Product[] = [
  { id: "s1", business_id: "demo-lavado", name: "Lavado Exterior de Auto", description: "Lavado completo con shampoo, enjuague y secado", price: 80, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s2", business_id: "demo-lavado", name: "Lavado Interior + Exterior", description: "Limpieza profunda interior, aspirado y limpieza de tablero", price: 160, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s3", business_id: "demo-lavado", name: "Lavado de Tapicería", description: "Extracción de suciedad profunda en asientos y alfombra", price: 350, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s4", business_id: "demo-lavado", name: "Desinfección con Ozono", description: "Eliminación de bacterias, virus y malos olores con ozono", price: 250, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

export const DEMO_SERVICES_CERRAJERO: Product[] = [
  { id: "c1", business_id: "demo-cerrajero", name: "Apertura de Puerta", description: "Apertura sin daño de puertas residenciales o de vehículo", price: 200, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "c2", business_id: "demo-cerrajero", name: "Duplicado de Llave", description: "Copia de llave común, seguridad o de auto (precio desde)", price: 50, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "c3", business_id: "demo-cerrajero", name: "Instalación de Cerradura", description: "Instalación de cerradura de seguridad con mano de obra incluida", price: 350, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "c4", business_id: "demo-cerrajero", name: "Caja Fuerte — Apertura", description: "Apertura de caja fuerte con combinación olvidada", price: 500, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

export const DEMO_SERVICES_PINTOR: Product[] = [
  { id: "t1", business_id: "demo-pintor", name: "Pintura Interior (cuarto)", description: "Pintura de un cuarto incluye preparación y 2 manos", price: 800, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "t2", business_id: "demo-pintor", name: "Pintura Exterior (fachada)", description: "Fachada hasta 30m² con sellador e impermeabilizante", price: 2500, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "t3", business_id: "demo-pintor", name: "Textura Decorativa", description: "Aplicación de textura en paredes interiores, varios estilos", price: 1200, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "t4", business_id: "demo-pintor", name: "Impermeabilización de Techo", description: "Aplicación de impermeabilizante en techos hasta 40m²", price: 1800, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

// ─── CUPONES DEMO ─────────────────────────────────────────────────────────────

export const DEMO_COUPONS: Coupon[] = [
  {
    id: "cu1",
    business_id: "demo",
    title: "15% en herramientas eléctricas",
    description: "Descuento en toda la línea. Válido de lunes a viernes.",
    discount_type: "percent",
    value: 15,
    code: "ACAM-HERRA",
    qr_data: JSON.stringify({ coupon_code: "ACAM-HERRA", business_id: "demo" }),
    limit_count: 80,
    used_count: 21,
    expires_at: "2026-12-31T23:59:59Z",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "cu2",
    business_id: "demo",
    title: "$50 en compras mayores a $500",
    description: "Aplica en toda la tienda.",
    discount_type: "fixed",
    value: 50,
    code: "ACAM-FERRO",
    qr_data: JSON.stringify({ coupon_code: "ACAM-FERRO", business_id: "demo" }),
    limit_count: 60,
    used_count: 8,
    expires_at: "2026-09-30T23:59:59Z",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
  },
];

export const DEMO_COUPONS_LAVADO: Coupon[] = [
  {
    id: "cu3",
    business_id: "demo-lavado",
    title: "Lavado interior + exterior $120",
    description: "Precio especial combo completo. Solo fines de semana.",
    discount_type: "fixed",
    value: 40,
    code: "ACAM-LAVADO",
    qr_data: JSON.stringify({ coupon_code: "ACAM-LAVADO", business_id: "demo-lavado" }),
    limit_count: 30,
    used_count: 5,
    expires_at: "2026-10-31T23:59:59Z",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
  },
];

export const DEMO_COUPONS_CERRAJERO: Coupon[] = [
  {
    id: "cu4",
    business_id: "demo-cerrajero",
    title: "Duplicado de llave GRATIS",
    description: "Con la compra de cualquier cerradura te regalamos una copia.",
    discount_type: "percent",
    value: 100,
    code: "ACAM-LLAVE",
    qr_data: JSON.stringify({ coupon_code: "ACAM-LLAVE", business_id: "demo-cerrajero" }),
    limit_count: 20,
    used_count: 3,
    expires_at: "2026-08-31T23:59:59Z",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
  },
];

export const DEMO_COUPONS_PINTOR: Coupon[] = [
  {
    id: "cu5",
    business_id: "demo-pintor",
    title: "10% de descuento en pintura exterior",
    description: "Presupuesta tu fachada y aplica el cupón.",
    discount_type: "percent",
    value: 10,
    code: "ACAM-PINTA",
    qr_data: JSON.stringify({ coupon_code: "ACAM-PINTA", business_id: "demo-pintor" }),
    limit_count: 15,
    used_count: 2,
    expires_at: "2026-11-30T23:59:59Z",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
  },
];

// ─── RESEÑAS DEMO ─────────────────────────────────────────────────────────────

export const DEMO_REVIEWS: Review[] = [
  { id: "r1", business_id: "demo", user_id: "u1", rating: 5, comment: "Excelente servicio, me asesoraron muy bien para la instalación eléctrica.", created_at: "2025-03-10T14:00:00Z", profiles: { name: "Roberto Mendoza", avatar_url: undefined } },
  { id: "r2", business_id: "demo", user_id: "u2", rating: 5, comment: "Tienen todo lo que necesitas. El personal conoce bien los productos.", created_at: "2025-04-22T10:30:00Z", profiles: { name: "Lucía Vargas", avatar_url: undefined } },
  { id: "r3", business_id: "demo", user_id: "u3", rating: 4, comment: "Buen surtido de pinturas y plomería. Productos de calidad.", created_at: "2025-05-15T19:00:00Z", profiles: { name: "José Hernández", avatar_url: undefined } },
];

export const DEMO_REVIEWS_LAVADO: Review[] = [
  { id: "r4", business_id: "demo-lavado", user_id: "u4", rating: 5, comment: "Llegaron a tiempo y dejaron el auto impecable. Muy recomendados.", created_at: "2025-04-01T11:00:00Z", profiles: { name: "Diana Torres", avatar_url: undefined } },
  { id: "r5", business_id: "demo-lavado", user_id: "u5", rating: 5, comment: "El servicio de desinfección con ozono eliminó completamente el olor a cigarro.", created_at: "2025-05-20T09:00:00Z", profiles: { name: "Marcos Ríos", avatar_url: undefined } },
];

export const DEMO_REVIEWS_CERRAJERO: Review[] = [
  { id: "r6", business_id: "demo-cerrajero", user_id: "u6", rating: 5, comment: "Me dejé las llaves dentro. Llegaron en 15 minutos y abrieron sin dañar la puerta.", created_at: "2025-02-14T22:30:00Z", profiles: { name: "Sofía Castillo", avatar_url: undefined } },
  { id: "r7", business_id: "demo-cerrajero", user_id: "u7", rating: 5, comment: "Cambiaron toda la cerradura de mi negocio rápido y con precio justo.", created_at: "2025-03-28T16:00:00Z", profiles: { name: "Ernesto Guzmán", avatar_url: undefined } },
];

export const DEMO_REVIEWS_PINTOR: Review[] = [
  { id: "r8", business_id: "demo-pintor", user_id: "u8", rating: 5, comment: "Pintaron toda la fachada de mi casa en 2 días. El acabado quedó perfecto.", created_at: "2025-01-18T08:00:00Z", profiles: { name: "Patricia Luna", avatar_url: undefined } },
  { id: "r9", business_id: "demo-pintor", user_id: "u9", rating: 4, comment: "Muy profesionales, la textura decorativa quedó exactamente como la pedí.", created_at: "2025-04-05T14:30:00Z", profiles: { name: "Ignacio Pérez", avatar_url: undefined } },
];

// ─── STATS DEMO ───────────────────────────────────────────────────────────────

export const DEMO_STATS = {
  products: 4,
  coupons: 2,
  reviews: 89,
  redemptions: 29,
  rating_avg: 4.7,
  rating_count: 89,
};
