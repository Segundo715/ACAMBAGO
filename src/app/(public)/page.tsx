import BusinessCard from "@/components/business/BusinessCard";
import { Business, BUSINESS_CATEGORIES } from "@/types";
import { DEMO_BUSINESSES } from "@/lib/demo-data";
import Link from "next/link";
import { MapPin, Search, Ticket, Store, ArrowRight, ShieldCheck, Star } from "lucide-react";

export const revalidate = 60;

async function getBusinesses(category?: string, search?: string): Promise<Business[]> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    let query = supabase
      .from("businesses")
      .select("*")
      .eq("is_approved", true)
      .eq("is_active", true)
      .order("rating_avg", { ascending: false });

    if (category) query = query.eq("category", category);
    if (search) query = query.ilike("name", `%${search}%`);

    const { data } = await query.limit(24);
    return (data ?? []) as Business[];
  } catch {
    return [];
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabaseBusinesses = await getBusinesses(params.category, params.q);

  // Filtrar demos según búsqueda/categoría
  const query = params.q?.toLowerCase() ?? "";
  const cat = params.category ?? "";

  const filteredDemos = DEMO_BUSINESSES.filter((b) => {
    const matchesCat = !cat || b.category === cat;
    const matchesQuery = !query || b.name.toLowerCase().includes(query) || b.description?.toLowerCase().includes(query);
    return matchesCat && matchesQuery;
  });

  const businesses: Business[] = [
    ...filteredDemos,
    ...supabaseBusinesses.filter((b) => !b.id.startsWith("demo")),
  ];

  const totalCount = businesses.length;
  const serviceBusinesses = businesses.filter((b) => b.category === "Servicios del hogar");
  const productBusinesses = businesses.filter((b) => b.category !== "Servicios del hogar");

  const isFiltered = !!(params.category || params.q);

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-600 to-orange-500 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-5">
            <MapPin className="w-4 h-4" />
            Acámbaro, Guanajuato
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Compra, vende y contrata<br />
            <span className="text-yellow-300">en tu ciudad</span>
          </h1>
          <p className="text-brand-100 text-lg max-w-2xl mx-auto mb-8">
            El marketplace local de Acámbaro. Publica tus productos y servicios, o encuentra lo que necesitas a unos pasos de casa.
          </p>

          {/* Search */}
          <form method="GET" className="max-w-xl mx-auto mb-8">
            <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-xl">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  name="q"
                  defaultValue={params.q}
                  placeholder="Buscar productos, servicios o negocios..."
                  className="flex-1 outline-none text-gray-900 text-sm"
                />
              </div>
              <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                Buscar
              </button>
            </div>
          </form>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="#negocios" className="bg-white text-brand-700 font-semibold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors text-sm flex items-center gap-2 shadow-lg">
              <Store className="w-4 h-4" />
              Explorar negocios
            </Link>
            <Link href="/register?role=business" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-6 py-3 rounded-xl transition-colors text-sm flex items-center gap-2 shadow-lg">
              Publicar mi negocio
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-brand-100 flex-wrap">
            <div className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />{totalCount} negocios activos</div>
            <div className="flex items-center gap-1.5"><Ticket className="w-4 h-4" />Cupones con QR</div>
            <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" />Negocios verificados</div>
            <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /><Link href="/map" className="hover:text-white transition-colors">Ver en mapa</Link></div>
          </div>
        </div>
      </section>

      {/* ── Category pills ── */}
      <section className="max-w-7xl mx-auto px-4 pt-8 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Link href="/" className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${!cat ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"}`}>
            Todos
          </Link>
          {BUSINESS_CATEGORIES.map((c) => (
            <Link key={c} href={`/?category=${encodeURIComponent(c)}`}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${cat === c ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"}`}>
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Main content ── */}
      <div id="negocios" className="max-w-7xl mx-auto px-4 pb-16 pt-4">
        {isFiltered ? (
          /* Filtered view — flat grid */
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {cat || `Resultados para "${params.q}"`}
                <span className="ml-2 text-sm font-normal text-gray-400">({totalCount})</span>
              </h2>
              <Link href="/" className="text-sm text-brand-600 hover:underline">Limpiar filtros</Link>
            </div>
            {businesses.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-gray-500 mb-4">Sin resultados para tu búsqueda</p>
                <Link href="/" className="btn-primary text-sm">Ver todos</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {businesses.map((b) => <BusinessCard key={b.id} business={b} />)}
              </div>
            )}
          </>
        ) : (
          /* Default view — two sections */
          <div className="space-y-12">
            {/* Servicios */}
            {serviceBusinesses.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">🛠️ Servicios populares</h2>
                    <p className="text-gray-500 text-sm mt-0.5">Contrata directamente desde tu cel</p>
                  </div>
                  <Link href="/?category=Servicios+del+hogar" className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1">
                    Ver todos <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {serviceBusinesses.map((b) => <BusinessCard key={b.id} business={b} />)}
                </div>
              </section>
            )}

            {/* Productos y tiendas */}
            {productBusinesses.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">🏪 Tiendas y productos</h2>
                    <p className="text-gray-500 text-sm mt-0.5">Artículos, herramientas y más</p>
                  </div>
                  <Link href="/map" className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Ver en mapa
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {productBusinesses.map((b) => <BusinessCard key={b.id} business={b} />)}
                </div>
              </section>
            )}

            {/* CTA para registrarse como negocio */}
            <section className="bg-gradient-to-r from-brand-600 to-orange-500 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-2">¿Tienes un negocio en Acámbaro?</h3>
              <p className="text-brand-100 mb-6">Publica tus productos y servicios gratis. Llega a más clientes con cupones digitales y perfil propio.</p>
              <Link href="/register?role=business" className="bg-white text-brand-700 font-bold px-8 py-3 rounded-xl hover:bg-brand-50 transition-colors inline-flex items-center gap-2">
                Publicar mi negocio gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
            </section>
          </div>
        )}
      </div>
    </>
  );
}
