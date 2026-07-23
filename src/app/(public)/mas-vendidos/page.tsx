import Link from "next/link";
import { TrendingUp, ArrowLeft } from "lucide-react";
import ProductsReel from "@/components/ui/ProductsReel";

export const revalidate = 60;

interface FeaturedRow {
  id: string; name: string; price: number; image_url: string | null;
  business_id: string; business_name: string; business_category: string; total_sold: number;
}

async function getBestSellers() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!url || url.includes("your-project") || url === "https://placeholder.supabase.co") return [];
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase.rpc("get_featured_products", { p_limit: 30 });
    return ((data ?? []) as FeaturedRow[]).map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      image: p.image_url ?? "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80",
      business_id: p.business_id,
      business_name: p.business_name,
      business_category: p.business_category,
    }));
  } catch { return []; }
}

export default async function BestSellersPage() {
  const items = await getBestSellers();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver al inicio
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-50 dark:bg-brand-500/10 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Más vendidos</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm">Los productos con más ventas reales en Acámbaro</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card p-14 text-center">
          <TrendingUp className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-300 font-medium mb-1">Todavía no hay ventas registradas</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm">Cuando haya pedidos, los productos más vendidos aparecerán aquí</p>
        </div>
      ) : (
        <ProductsReel grid items={items} />
      )}
    </div>
  );
}
