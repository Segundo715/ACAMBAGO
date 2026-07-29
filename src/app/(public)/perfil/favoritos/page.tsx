"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, MapPin, Star, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { getDemoMode, DEMO_BUYER_FAVORITES } from "@/lib/demo-mode";

interface FavoriteStore {
  id: string;
  name: string;
  category: string;
  rating: number;
}

interface FavoriteRow {
  businesses: { id: string; name: string; category: string; rating_avg: number } | null;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const IS_DEMO = !SUPABASE_URL || SUPABASE_URL.includes("your-project") || SUPABASE_URL === "https://placeholder.supabase.co";

export default function FavoritosPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [favoriteStores, setFavoriteStores] = useState<FavoriteStore[]>([]);
  const [loading, setLoading] = useState(true);
  const demoMode = getDemoMode();

  useEffect(() => {
    if (demoMode === "buyer" || IS_DEMO) { setLoading(false); return; }
    if (!isLoaded) return;
    if (!user) { router.push("/login"); return; }

    const supabase = createClient();
    supabase
      .from("business_favorites")
      .select("businesses(id, name, category, rating_avg)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const stores: FavoriteStore[] = [];
        for (const row of (data ?? []) as unknown as FavoriteRow[]) {
          const b = row.businesses;
          if (!b) continue;
          stores.push({ id: b.id, name: b.name, category: b.category, rating: Number(b.rating_avg) || 0 });
        }
        setFavoriteStores(stores);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user?.id]);

  const list = demoMode === "buyer" || IS_DEMO ? DEMO_BUYER_FAVORITES : favoriteStores;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" /> Tiendas favoritas
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Las tiendas que marcaste con el corazón</p>
      </div>

      {loading ? (
        <div className="card p-10 text-center text-slate-400 dark:text-slate-500">Cargando...</div>
      ) : list.length === 0 ? (
        <div className="card p-10 text-center">
          <Heart className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Todavía no tienes tiendas favoritas.</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Toca el corazón en una tienda para agregarla aquí.</p>
        </div>
      ) : (
        <div className="card overflow-hidden divide-y divide-slate-100 dark:divide-white/10">
          {list.map((s) => (
            <Link key={s.id} href={`/business/${s.id}`} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/30 dark:to-brand-800/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <CategoryIcon category={s.category} className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{s.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {s.category}
                  </span>
                  <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-current" /> {s.rating}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
