"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/client";
import { Coupon } from "@/types";
import CouponCard from "@/components/coupons/CouponCard";
import { Plus, Ticket } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { loadOwnedBusinesses } from "@/lib/current-business";

export default function CouponsPage() {
  const { user, isLoaded } = useUser();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [renewDate, setRenewDate] = useState("");
  const supabase = createClient();

  useEffect(() => {
    if (!isLoaded || !user) return;
    const load = async () => {
      const { active: biz } = await loadOwnedBusinesses(supabase, user.id);
      if (!biz) {
        window.location.href = "/perfil/crear-tienda";
        return;
      }
      const { data } = await supabase.from("coupons").select("*").eq("business_id", biz.id).order("created_at", { ascending: false });
      setCoupons((data ?? []) as Coupon[]);
      setLoading(false);
    };
    load();
  }, [isLoaded, user?.id]);

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

  const confirmRenew = async (coupon: Coupon) => {
    const { error } = await supabase
      .from("coupons")
      .update({ expires_at: renewDate || null, is_active: true })
      .eq("id", coupon.id);
    if (error) {
      toast.error("No se pudo renovar el cupón");
      return;
    }
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, expires_at: renewDate || undefined, is_active: true } : c))
    );
    setRenewingId(null);
    toast.success("Cupón renovado");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cupones</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">{coupons.length} cupones creados</p>
        </div>
        <Link href="/dashboard/business/coupons/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Crear cupón
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => (
            <div key={i} className="card h-28 animate-pulse bg-gray-100 dark:bg-white/5" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="card p-12 text-center">
          <Ticket className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-slate-400">Sin cupones todavía</p>
          <Link href="/dashboard/business/coupons/new" className="btn-primary mt-4 text-sm inline-block">
            Crear el primero
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {coupons.map((c) => {
            const isExpired = c.expires_at ? new Date(c.expires_at) < new Date() : false;
            const isRenewing = renewingId === c.id;
            return (
              <div key={c.id} className="space-y-2">
                <CouponCard coupon={c} showQR />
                <div className="flex gap-2 px-1 flex-wrap items-center">
                  {isExpired ? (
                    isRenewing ? (
                      <>
                        <input
                          type="date"
                          value={renewDate}
                          onChange={(e) => setRenewDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="input text-xs py-1.5 px-2 w-auto"
                        />
                        <button
                          onClick={() => confirmRenew(c)}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 transition-colors"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setRenewingId(null)}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => { setRenewingId(c.id); setRenewDate(""); }}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors"
                      >
                        Renovar cupón
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => toggleActive(c)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        c.is_active ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"
                      }`}
                    >
                      {c.is_active ? "Desactivar" : "Activar"}
                    </button>
                  )}
                  <button
                    onClick={() => deleteCoupon(c.id)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
