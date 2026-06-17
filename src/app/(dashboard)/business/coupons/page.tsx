"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Coupon } from "@/types";
import CouponCard from "@/components/coupons/CouponCard";
import { Plus, Ticket } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: biz } = await supabase.from("businesses").select("id").eq("owner_id", user.id).single();
      if (!biz) return;
      const { data } = await supabase.from("coupons").select("*").eq("business_id", biz.id).order("created_at", { ascending: false });
      setCoupons((data ?? []) as Coupon[]);
      setLoading(false);
    };
    load();
  }, []);

  const toggleActive = async (coupon: Coupon) => {
    const { error } = await supabase.from("coupons").update({ is_active: !coupon.is_active }).eq("id", coupon.id);
    if (!error) {
      setCoupons((prev) => prev.map((c) => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c));
      toast.success(coupon.is_active ? "Cupón desactivado" : "Cupón activado");
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("¿Eliminar este cupón?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast.success("Cupón eliminado");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cupones</h1>
          <p className="text-gray-500 text-sm mt-0.5">{coupons.length} cupones creados</p>
        </div>
        <Link href="/dashboard/business/coupons/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Crear cupón
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => (
            <div key={i} className="card h-28 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="card p-12 text-center">
          <Ticket className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Sin cupones todavía</p>
          <Link href="/dashboard/business/coupons/new" className="btn-primary mt-4 text-sm inline-block">
            Crear el primero
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {coupons.map((c) => (
            <div key={c.id} className="space-y-2">
              <CouponCard coupon={c} showQR />
              <div className="flex gap-2 px-1">
                <button
                  onClick={() => toggleActive(c)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    c.is_active ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
                >
                  {c.is_active ? "Desactivar" : "Activar"}
                </button>
                <button
                  onClick={() => deleteCoupon(c.id)}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
