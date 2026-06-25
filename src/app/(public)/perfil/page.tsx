"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, Save, Ticket, Store, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Redemption {
  id: string;
  redeemed_at: string;
  coupons: { title: string; value: number; discount_type: string; businesses: { name: string } };
}

export default function PerfilPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push("/login"); return; }

    const load = async () => {
      const { data: profile } = await supabase.from("profiles").select("name, phone").eq("id", user.id).single();
      if (profile) {
        setName(profile.name ?? "");
        setPhone(profile.phone ?? "");
      } else {
        setName(user.fullName ?? user.firstName ?? "");
      }

      const { data: reds } = await supabase
        .from("coupon_redemptions")
        .select("id, redeemed_at, coupons(title, value, discount_type, businesses(name))")
        .eq("user_id", user.id)
        .order("redeemed_at", { ascending: false })
        .limit(10);

      setRedemptions((reds ?? []) as Redemption[]);
      setLoading(false);
    };
    load();
  }, [isLoaded, user?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, name, phone, role: "client" });
    if (!error) toast.success("Perfil actualizado");
    else toast.error("Error al guardar");
    setSaving(false);
  };

  if (!isLoaded || loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 animate-pulse space-y-4">
        <div className="h-10 bg-slate-100 dark:bg-white/5 rounded-xl w-1/3" />
        <div className="h-40 bg-slate-100 dark:bg-white/5 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Inicio
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-50 dark:bg-brand-500/10 rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mi perfil</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{user?.emailAddresses[0]?.emailAddress}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="card p-6 space-y-4 mb-6">
        <h2 className="font-semibold text-slate-900 dark:text-white">Datos personales</h2>
        <div>
          <label className="label">Nombre</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Tu nombre" />
        </div>
        <div>
          <label className="label">Teléfono</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="4181234567" />
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Ticket className="w-4 h-4 text-orange-500" />
          Cupones canjeados
        </h2>
        {redemptions.length === 0 ? (
          <div className="text-center py-8">
            <Ticket className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Todavía no has canjeado cupones.</p>
            <Link href="/coupons" className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
              Ver cupones disponibles
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {redemptions.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                <div className="w-9 h-9 bg-orange-50 dark:bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Ticket className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{r.coupons?.title ?? "Cupón"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Store className="w-3 h-3" />
                    {r.coupons?.businesses?.name ?? "Negocio"}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
                    {r.coupons?.discount_type === "percent" ? `${r.coupons.value}%` : `$${r.coupons?.value}`}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {format(new Date(r.redeemed_at), "dd MMM", { locale: es })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
