"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/client";
import { DEMO_BUSINESS, DEMO_STATS } from "@/lib/demo-data";
import { Package, Ticket, Star, ScanLine, Plus, ArrowRight, TrendingUp } from "lucide-react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const IS_DEMO = !SUPABASE_URL || SUPABASE_URL.includes("your-project") || SUPABASE_URL === "https://placeholder.supabase.co";

interface Stats {
  products: number;
  coupons: number;
  reviews: number;
  redemptions: number;
  rating_avg: number;
  rating_count: number;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [business, setBusiness] = useState<any>(IS_DEMO ? DEMO_BUSINESS : null);
  const [stats, setStats] = useState<Stats>(DEMO_STATS);
  const [loaded, setLoaded] = useState(IS_DEMO);
  const [noBusiness, setNoBusiness] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (IS_DEMO) return;
    if (!isLoaded || !user) return;
    const load = async () => {

      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (!biz) {
        setNoBusiness(true);
        setLoaded(true);
        return;
      }
      setBusiness(biz);

      const [
        { count: products },
        { count: coupons },
        { count: reviews },
        { count: redemptions },
      ] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }).eq("business_id", biz.id),
        supabase.from("coupons").select("*", { count: "exact", head: true }).eq("business_id", biz.id).eq("is_active", true),
        supabase.from("reviews").select("*", { count: "exact", head: true }).eq("business_id", biz.id),
        supabase.from("coupon_redemptions").select("*", { count: "exact", head: true }).eq("business_id", biz.id),
      ]);

      setStats({
        products: products ?? 0,
        coupons: coupons ?? 0,
        reviews: reviews ?? 0,
        redemptions: redemptions ?? 0,
        rating_avg: Number(biz.rating_avg) ?? 0,
        rating_count: biz.rating_count ?? 0,
      });

      setLoaded(true);
    };
    load();
  }, [isLoaded, user?.id]);

  const statCards = [
    { label: "Productos", value: stats.products, icon: Package, bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-100 dark:border-blue-500/20", href: "/dashboard/business/products" },
    { label: "Cupones activos", value: stats.coupons, icon: Ticket, bg: "bg-orange-50 dark:bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", border: "border-orange-100 dark:border-orange-500/20", href: "/dashboard/business/coupons" },
    { label: "Reseñas", value: stats.reviews, icon: Star, bg: "bg-yellow-50 dark:bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400", border: "border-yellow-100 dark:border-yellow-500/20", href: "/dashboard/business" },
    { label: "Cupones canjeados", value: stats.redemptions, icon: ScanLine, bg: "bg-green-50 dark:bg-green-500/10", text: "text-green-600 dark:text-green-400", border: "border-green-100 dark:border-green-500/20", href: "/dashboard/business/coupons/scan" },
  ];

  if (!loaded) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-slate-100 dark:bg-white/5 rounded-xl w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-28 bg-slate-100 dark:bg-white/5 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (noBusiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-brand-50 dark:bg-brand-500/10 rounded-2xl flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-brand-600 dark:text-brand-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Registra tu negocio</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
          Aun no tienes un perfil de negocio. Completa tus datos para aparecer en el directorio y gestionar productos y cupones.
        </p>
        <button
          onClick={() => router.push("/dashboard/business/settings")}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Crear perfil de negocio
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{business?.name ?? "Mi Negocio"}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">{business?.category} · {business?.address}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 px-3 py-1.5 rounded-full">
          ✓ Negocio aprobado
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, bg, text, border, href }) => (
          <Link key={label} href={href} className="card p-5 hover:shadow-md transition-all group">
            <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${text}`} />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Rating */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-500" />
          Calificación promedio
        </h2>
        <div className="flex items-end gap-3">
          <span className="text-5xl font-bold text-slate-900 dark:text-white">
            {Number(stats.rating_avg).toFixed(1)}
          </span>
          <div className="mb-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-5 h-5 ${s <= Math.round(stats.rating_avg) ? "text-yellow-400 fill-yellow-400" : "text-slate-200 dark:text-slate-600 fill-slate-200 dark:fill-slate-600"}`} />
              ))}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stats.rating_count} reseñas</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <h2 className="font-semibold text-slate-900 dark:text-white mb-3">Acciones rápidas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/business/products" className="card p-5 hover:shadow-md transition-all flex items-center gap-3 group border-2 border-brand-100 dark:border-brand-500/20 hover:border-brand-300 dark:hover:border-brand-500/50">
          <div className="w-10 h-10 bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-900 dark:text-white text-sm">Gestionar productos</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Agregar, editar o eliminar</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors" />
        </Link>
        <Link href="/dashboard/business/coupons/new" className="card p-5 hover:shadow-md transition-all flex items-center gap-3 group">
          <div className="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl flex items-center justify-center">
            <Ticket className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-900 dark:text-white text-sm">Crear cupón</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Con código QR incluido</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
        </Link>
        <Link href="/dashboard/business/coupons/scan" className="card p-5 hover:shadow-md transition-all flex items-center gap-3 group">
          <div className="w-10 h-10 bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 rounded-xl flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-900 dark:text-white text-sm">Escanear cupón</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Valida en tiempo real</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-green-500 transition-colors" />
        </Link>
      </div>
    </div>
  );
}
