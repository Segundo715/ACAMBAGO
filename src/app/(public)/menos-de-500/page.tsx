import Link from "next/link";
import { Coins, ArrowLeft } from "lucide-react";
import ProductsReel from "@/components/ui/ProductsReel";

export const revalidate = 60;

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80";
const MAX_PRICE = 500;

async function getCheapProducts() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!url || url.includes("your-project") || url === "https://placeholder.supabase.co") return [];
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*, businesses!inner(id, name, category, is_approved, is_active)")
      .eq("is_available", true)
      .eq("businesses.is_approved", true)
      .eq("businesses.is_active", true)
      .lte("price", MAX_PRICE)
      .order("price", { ascending: true })
      .limit(60);

    return ((data ?? []) as unknown as {
      id: string; name: string; price: number; image_url: string | null; image_urls: string[] | null;
      business_id: string; businesses: { name: string; category: string };
    }[]).map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      image: p.image_url || p.image_urls?.[0] || FALLBACK_IMAGE,
      business_id: p.business_id,
      business_name: p.businesses.name,
      business_category: p.businesses.category,
    }));
  } catch { return []; }
}

export default async function CheapProductsPage() {
  const items = await getCheapProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver al inicio
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-50 dark:bg-brand-500/10 rounded-xl flex items-center justify-center">
          <Coins className="w-5 h-5 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Menos de $500</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm">Productos con precios bajos de tiendas locales</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card p-14 text-center">
          <Coins className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-300 font-medium mb-1">Sin productos en este rango por ahora</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm">Vuelve pronto, las tiendas actualizan sus precios seguido</p>
        </div>
      ) : (
        <ProductsReel grid items={items} />
      )}
    </div>
  );
}
