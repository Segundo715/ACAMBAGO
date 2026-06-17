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
    image_url: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80",
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
    image_url: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80",
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
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
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
    image_url: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80",
    banner_url: undefined,
    rating_avg: 4.6,
    rating_count: 38,
    is_approved: true,
    is_active: true,
    created_at: "2024-04-01T00:00:00Z",
    updated_at: "2024-04-01T00:00:00Z",
  },
  {
    id: "demo-salon",
    owner_id: "demo-owner-5",
    name: "Salón Glamour Acámbaro",
    description: "Cortes, tintes, peinados, manicure y tratamientos capilares. Estilistas profesionales. Agenda tu cita por WhatsApp.",
    category: "Salón de belleza",
    address: "Calle Hidalgo 45, Centro, Acámbaro, Gto.",
    latitude: 20.0325,
    longitude: -100.728,
    whatsapp: "4185678901",
    image_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
    banner_url: undefined,
    rating_avg: 4.8,
    rating_count: 112,
    is_approved: true,
    is_active: true,
    created_at: "2024-05-01T00:00:00Z",
    updated_at: "2024-05-01T00:00:00Z",
  },
  {
    id: "demo-farmacia",
    owner_id: "demo-owner-6",
    name: "Farmacia San Rafael",
    description: "Medicamentos, vitaminas, productos de salud y consulta médica a bajo costo. Atención 7 días a la semana.",
    category: "Farmacia",
    address: "Blvd. Revolución 210, Acámbaro, Gto.",
    latitude: 20.033,
    longitude: -100.727,
    whatsapp: "4186789012",
    image_url: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800&q=80",
    banner_url: undefined,
    rating_avg: 4.6,
    rating_count: 203,
    is_approved: true,
    is_active: true,
    created_at: "2024-05-15T00:00:00Z",
    updated_at: "2024-05-15T00:00:00Z",
  },
  {
    id: "demo-taller",
    owner_id: "demo-owner-7",
    name: "Taller Mecánico FastAuto",
    description: "Servicio de afinación, frenos, suspensión, cambio de aceite y diagnóstico computarizado. Presupuesto sin costo.",
    category: "Taller mecánico",
    address: "Carr. Acámbaro-Morelia Km 2, Acámbaro, Gto.",
    latitude: 20.029,
    longitude: -100.724,
    whatsapp: "4187890123",
    image_url: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&q=80",
    banner_url: undefined,
    rating_avg: 4.7,
    rating_count: 67,
    is_approved: true,
    is_active: true,
    created_at: "2024-06-01T00:00:00Z",
    updated_at: "2024-06-01T00:00:00Z",
  },
  {
    id: "demo-veterinaria",
    owner_id: "demo-owner-8",
    name: "Veterinaria PetCare",
    description: "Consultas, vacunas, cirugías, estética canina y venta de alimentos para mascotas. Tu mascota en las mejores manos.",
    category: "Veterinaria",
    address: "Av. Juárez 88, Col. Centro, Acámbaro, Gto.",
    latitude: 20.031,
    longitude: -100.7265,
    whatsapp: "4188901234",
    image_url: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&q=80",
    banner_url: undefined,
    rating_avg: 4.9,
    rating_count: 145,
    is_approved: true,
    is_active: true,
    created_at: "2024-06-15T00:00:00Z",
    updated_at: "2024-06-15T00:00:00Z",
  },
  {
    id: "demo-papeleria",
    owner_id: "demo-owner-9",
    name: "Papelería El Estudiante",
    description: "Útiles escolares, impresiones, copias, encuadernación, papelería de oficina y artículos de arte. Todo para tu escuela.",
    category: "Papelería",
    address: "Calle Aldama 33, Centro, Acámbaro, Gto.",
    latitude: 20.0318,
    longitude: -100.7272,
    whatsapp: "4189012345",
    image_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    banner_url: undefined,
    rating_avg: 4.5,
    rating_count: 76,
    is_approved: true,
    is_active: true,
    created_at: "2024-07-01T00:00:00Z",
    updated_at: "2024-07-01T00:00:00Z",
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

export const DEMO_SERVICES_SALON: Product[] = [
  { id: "sl1", business_id: "demo-salon", name: "Corte de Cabello", description: "Corte moderno para dama o caballero con lavado incluido", price: 120, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "sl2", business_id: "demo-salon", name: "Tinte Completo", description: "Aplicación de tinte profesional con tratamiento de brillo", price: 350, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "sl3", business_id: "demo-salon", name: "Manicure + Pedicure", description: "Limpieza, esmaltado y diseño de uñas manos y pies", price: 180, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "sl4", business_id: "demo-salon", name: "Tratamiento Keratina", description: "Alisado y nutrición profunda, resultados hasta 4 meses", price: 650, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

export const DEMO_PRODUCTS_FARMACIA: Product[] = [
  { id: "f1", business_id: "demo-farmacia", name: "Vitamina C 1000mg (60 tabs)", description: "Vitamina C de alta potencia con zinc, refuerza el sistema inmune", price: 89, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "f2", business_id: "demo-farmacia", name: "Multivitamínico Daily", description: "Complejo de vitaminas y minerales esenciales para adultos", price: 120, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "f3", business_id: "demo-farmacia", name: "Consulta Médica General", description: "Consulta con médico general, incluye revisión y receta", price: 80, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "f4", business_id: "demo-farmacia", name: "Prueba Rápida Covid/Flu", description: "Resultado en 15 minutos, sin cita previa", price: 150, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

export const DEMO_SERVICES_TALLER: Product[] = [
  { id: "ta1", business_id: "demo-taller", name: "Cambio de Aceite y Filtro", description: "Aceite sintético 5W-30 con filtro nuevo, incluye revisión de 21 puntos", price: 450, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "ta2", business_id: "demo-taller", name: "Afinación Completa", description: "Bujías, filtros, cables y revisión de sistema de encendido", price: 800, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "ta3", business_id: "demo-taller", name: "Frenos Delanteros", description: "Cambio de pastillas delanteras y rectificación de discos", price: 950, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "ta4", business_id: "demo-taller", name: "Diagnóstico Computarizado", description: "Escaneo OBD2, lectura de códigos de falla con reporte impreso", price: 200, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

export const DEMO_SERVICES_VETERINARIA: Product[] = [
  { id: "v1", business_id: "demo-veterinaria", name: "Consulta General Mascota", description: "Revisión completa de salud, peso y signos vitales", price: 150, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "v2", business_id: "demo-veterinaria", name: "Vacuna Antirrábica", description: "Vacuna anual obligatoria, incluye certificado oficial", price: 120, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "v3", business_id: "demo-veterinaria", name: "Baño y Estética Canina", description: "Baño, secado, corte de uñas y limpieza de oídos", price: 200, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "v4", business_id: "demo-veterinaria", name: "Desparasitación Interna", description: "Tratamiento antiparasitario para perros y gatos", price: 90, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

export const DEMO_PRODUCTS_PAPELERIA: Product[] = [
  { id: "pp1", business_id: "demo-papeleria", name: "Impresión B/N (hoja)", description: "Impresión láser en hoja tamaño carta, calidad profesional", price: 2, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "pp2", business_id: "demo-papeleria", name: "Impresión Color (hoja)", description: "Impresión a color en carta, ideal para presentaciones", price: 8, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "pp3", business_id: "demo-papeleria", name: "Kit Escolar Básico", description: "Cuaderno, lápices, borrador, regla y sacapuntas", price: 65, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "pp4", business_id: "demo-papeleria", name: "Encuadernado Espiral", description: "Engargolado tamaño carta o doble carta, portada incluida", price: 35, image_url: undefined, is_available: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
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

export const DEMO_COUPONS_SALON: Coupon[] = [
  { id: "cu6", business_id: "demo-salon", title: "20% en tinte + corte", description: "Combo especial lunes y martes.", discount_type: "percent", value: 20, code: "ACAM-GLAM", qr_data: JSON.stringify({ coupon_code: "ACAM-GLAM", business_id: "demo-salon" }), limit_count: 25, used_count: 7, expires_at: "2026-12-31T23:59:59Z", is_active: true, created_at: "2024-01-01T00:00:00Z" },
];

export const DEMO_COUPONS_FARMACIA: Coupon[] = [
  { id: "cu7", business_id: "demo-farmacia", title: "Consulta médica $50", description: "Descuento especial en primera consulta.", discount_type: "fixed", value: 30, code: "ACAM-SALUD", qr_data: JSON.stringify({ coupon_code: "ACAM-SALUD", business_id: "demo-farmacia" }), limit_count: 50, used_count: 12, expires_at: "2026-09-30T23:59:59Z", is_active: true, created_at: "2024-01-01T00:00:00Z" },
];

export const DEMO_COUPONS_TALLER: Coupon[] = [
  { id: "cu8", business_id: "demo-taller", title: "Diagnóstico GRATIS", description: "Con cualquier servicio mayor a $500.", discount_type: "fixed", value: 200, code: "ACAM-AUTO", qr_data: JSON.stringify({ coupon_code: "ACAM-AUTO", business_id: "demo-taller" }), limit_count: 30, used_count: 8, expires_at: "2026-10-31T23:59:59Z", is_active: true, created_at: "2024-01-01T00:00:00Z" },
];

export const DEMO_COUPONS_VETERINARIA: Coupon[] = [
  { id: "cu9", business_id: "demo-veterinaria", title: "Baño + vacuna $250", description: "Combo especial para tu mascota.", discount_type: "fixed", value: 70, code: "ACAM-PET", qr_data: JSON.stringify({ coupon_code: "ACAM-PET", business_id: "demo-veterinaria" }), limit_count: 20, used_count: 4, expires_at: "2026-11-30T23:59:59Z", is_active: true, created_at: "2024-01-01T00:00:00Z" },
];

export const DEMO_COUPONS_PAPELERIA: Coupon[] = [
  { id: "cu10", business_id: "demo-papeleria", title: "50 copias por $80", description: "Paquete especial estudiantes.", discount_type: "fixed", value: 20, code: "ACAM-PAPEL", qr_data: JSON.stringify({ coupon_code: "ACAM-PAPEL", business_id: "demo-papeleria" }), limit_count: 100, used_count: 33, expires_at: "2026-12-31T23:59:59Z", is_active: true, created_at: "2024-01-01T00:00:00Z" },
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

export const DEMO_REVIEWS_SALON: Review[] = [
  { id: "r10", business_id: "demo-salon", user_id: "u10", rating: 5, comment: "Me encantó el resultado del tinte, quedó exactamente como quería.", created_at: "2025-05-10T10:00:00Z", profiles: { name: "Fernanda López", avatar_url: undefined } },
  { id: "r11", business_id: "demo-salon", user_id: "u11", rating: 5, comment: "El manicure duró más de 2 semanas. Súper recomendadas.", created_at: "2025-06-01T15:00:00Z", profiles: { name: "Valeria Mora", avatar_url: undefined } },
];

export const DEMO_REVIEWS_FARMACIA: Review[] = [
  { id: "r12", business_id: "demo-farmacia", user_id: "u12", rating: 5, comment: "El doctor muy amable y la atención rápida. Precio muy justo.", created_at: "2025-04-15T09:00:00Z", profiles: { name: "Gerardo Núñez", avatar_url: undefined } },
  { id: "r13", business_id: "demo-farmacia", user_id: "u13", rating: 4, comment: "Siempre tienen los medicamentos que necesito. Buena atención.", created_at: "2025-05-22T12:00:00Z", profiles: { name: "Carmen Salinas", avatar_url: undefined } },
];

export const DEMO_REVIEWS_TALLER: Review[] = [
  { id: "r14", business_id: "demo-taller", user_id: "u14", rating: 5, comment: "Honesto y rápido. Me explicaron todo lo que le hicieron al carro.", created_at: "2025-03-20T14:00:00Z", profiles: { name: "Arturo Vega", avatar_url: undefined } },
  { id: "r15", business_id: "demo-taller", user_id: "u15", rating: 5, comment: "Excelente afinación, el carro quedó como nuevo. Muy buen precio.", created_at: "2025-05-05T11:00:00Z", profiles: { name: "Hugo Ramírez", avatar_url: undefined } },
];

export const DEMO_REVIEWS_VETERINARIA: Review[] = [
  { id: "r16", business_id: "demo-veterinaria", user_id: "u16", rating: 5, comment: "El doctor es muy cariñoso con los animales. Mi perro ya no llora en la consulta.", created_at: "2025-04-28T09:30:00Z", profiles: { name: "Alejandra Fuentes", avatar_url: undefined } },
  { id: "r17", business_id: "demo-veterinaria", user_id: "u17", rating: 5, comment: "El baño quedó perfecto y mi gato regresó oliéndose muy bien.", created_at: "2025-06-03T16:00:00Z", profiles: { name: "Manuel Ortiz", avatar_url: undefined } },
];

export const DEMO_REVIEWS_PAPELERIA: Review[] = [
  { id: "r18", business_id: "demo-papeleria", user_id: "u18", rating: 5, comment: "Las impresiones salen muy claras y el servicio es rápido. Lo recomiendo.", created_at: "2025-05-18T08:30:00Z", profiles: { name: "Daniela Cruz", avatar_url: undefined } },
  { id: "r19", business_id: "demo-papeleria", user_id: "u19", rating: 4, comment: "Buena variedad de útiles y buen precio en las copias.", created_at: "2025-06-10T13:00:00Z", profiles: { name: "Rodrigo Ibáñez", avatar_url: undefined } },
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
