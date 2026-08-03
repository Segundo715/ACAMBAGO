"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  Search, LayoutGrid, Package, Ticket, Store, ArrowRight, MapPin,
} from "lucide-react";
import SearchBar from "./SearchBar";
import BusinessCard from "@/components/business/BusinessCard";
import ProductsReel from "./ProductsReel";
import { Business } from "@/types";

interface ReelItem {
  id: string;
  name: string;
  price: number;
  image: string;
  business_id: string;
  business_name: string;
  business_category: string;
}

interface CategoryPreview {
  name: string;
  emoji: string;
  image: string;
  desc: string;
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

function ReelSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      className={`snap-start shrink-0 min-h-full w-full flex flex-col justify-center px-5 py-8 ${className}`}
    >
      {children}
    </motion.section>
  );
}

// Contenedor propio con scroll y scroll-snap vertical (como Instagram/TikTok),
// del alto exacto entre el header fijo y la barra inferior, para no tocar
// el scroll normal del documento ni la posicion de esos dos elementos.
export default function MobileReelsHome({
  totalCount,
  featured,
  categories,
  businesses,
}: {
  totalCount: number;
  featured: ReelItem[];
  categories: CategoryPreview[];
  businesses: Business[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    window.dispatchEvent(new CustomEvent("app-scroll", { detail: e.currentTarget.scrollTop }));
  };

  return (
    <div
      ref={scrollerRef}
      onScroll={onScroll}
      className="md:hidden snap-y snap-mandatory overflow-y-scroll overscroll-y-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ height: "calc(100dvh - 4rem - 5.25rem)" }}
    >
      {/* Bienvenida */}
      <ReelSection className="text-center items-center bg-gradient-to-br from-brand-700 via-brand-800 to-[#050e18] text-white">
        <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-xs font-medium mb-5">
          <MapPin className="w-3.5 h-3.5 text-brand-300" /> Acámbaro, Guanajuato
        </span>
        <h1 className="text-3xl font-bold leading-tight mb-3">
          Compra local,<br /><span className="text-brand-300">apoya tu ciudad</span>
        </h1>
        <p className="text-gray-300 text-sm mb-2 max-w-xs">
          El marketplace de productos locales de Acámbaro.
        </p>
        <div className="w-full mt-4">
          <SearchBar />
        </div>
        <p className="text-xs text-gray-400 mt-1">{totalCount} tiendas activas · desliza hacia arriba ↑</p>
      </ReelSection>

      {/* Categorías */}
      <ReelSection className="bg-white dark:bg-[#050e18]">
        <div className="flex items-center gap-2 mb-1">
          <LayoutGrid className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Categorías</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-gray-400 mb-5">Explora por tipo de negocio</p>
        <div className="grid grid-cols-3 gap-3">
          {categories.slice(0, 6).map((c) => (
            <Link
              key={c.name}
              href={`/?category=${encodeURIComponent(c.name)}`}
              className="card p-3 flex flex-col items-center text-center gap-1.5 hover:shadow-md transition-all"
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-[11px] font-medium text-slate-700 dark:text-gray-200 leading-tight line-clamp-2">{c.name}</span>
            </Link>
          ))}
        </div>
        <Link href="/categorias" className="btn-primary text-sm mt-5 mx-auto flex items-center gap-2 w-fit">
          Ver todas las categorías <ArrowRight className="w-4 h-4" />
        </Link>
      </ReelSection>

      {/* Productos Destacados */}
      <ReelSection className="bg-slate-50 dark:bg-black/20">
        <div className="flex items-center gap-2 mb-1">
          <Package className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Productos Destacados</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-gray-400 mb-5">Selección variada de las tiendas locales</p>
        <ProductsReel grid items={featured.slice(0, 4)} />
        <Link href="/productos" className="btn-primary text-sm mt-5 mx-auto flex items-center gap-2 w-fit">
          Ver más productos <ArrowRight className="w-4 h-4" />
        </Link>
      </ReelSection>

      {/* Cupones */}
      <ReelSection className="text-center items-center bg-gradient-to-br from-orange-500 to-orange-700 text-white">
        <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center mb-5">
          <Ticket className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Cupones con QR</h2>
        <p className="text-sm text-orange-50 max-w-xs mb-6">
          Descuentos exclusivos de negocios de Acámbaro, listos para canjear mostrando tu celular en tienda.
        </p>
        <Link href="/coupons" className="bg-white text-orange-700 font-semibold px-6 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg">
          Ver cupones disponibles <ArrowRight className="w-4 h-4" />
        </Link>
      </ReelSection>

      {/* Tiendas */}
      <ReelSection className="bg-white dark:bg-[#050e18]">
        <div className="flex items-center gap-2 mb-1">
          <Store className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tiendas locales</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-gray-400 mb-5">{totalCount} negocios reales de Acámbaro</p>
        <div className="grid grid-cols-1 gap-4">
          {businesses.slice(0, 2).map((b) => <BusinessCard key={b.id} business={b} />)}
        </div>
        <Link href="/map" className="btn-primary text-sm mt-5 mx-auto flex items-center gap-2 w-fit">
          Ver todas en el mapa <ArrowRight className="w-4 h-4" />
        </Link>
      </ReelSection>
    </div>
  );
}
