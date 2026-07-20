"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  User, Save, Ticket, Store, ArrowLeft, ShoppingBag,
  Heart, Star, MapPin, ChevronRight, Package,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatPrice } from "@/lib/utils";
import { OrderStatusIcon, OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { Order, OrderStatus } from "@/types";
import {
  getDemoMode,
  DEMO_BUYER,
  DEMO_BUYER_ORDERS,
  DEMO_BUYER_FAVORITES,
  DEMO_BUYER_COUPONS,
} from "@/lib/demo-mode";

interface Redemption {
  id: string;
  redeemed_at: string;
  coupons: { title: string; value: number; discount_type: string; businesses: { name: string } };
}

type BuyerOrder = Order & { businesses: { name: string } | null };

const DEMO_MY_ORDERS = DEMO_BUYER_ORDERS;
const DEMO_FAVORITES = DEMO_BUYER_FAVORITES;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const IS_DEMO = !SUPABASE_URL || SUPABASE_URL.includes("your-project") || SUPABASE_URL === "https://placeholder.supabase.co";

function orderItemsSummary(order: BuyerOrder) {
  const items = order.order_items ?? [];
  if (items.length === 0) return "Pedido";
  if (items.length === 1) return items[0].name;
  return `${items[0].name} y ${items.length - 1} más`;
}

export default function PerfilPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [ordersCount, setOrdersCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    // Demo mode: skip Clerk user requirement
    const demoMode = getDemoMode();
    if (demoMode === "buyer") {
      setName(DEMO_BUYER.name);
      setPhone(DEMO_BUYER.phone);
      setLoading(false);
      return;
    }

    if (!isLoaded) return;
    if (!user) { router.push("/login"); return; }

    if (IS_DEMO) {
      setName(user.fullName ?? user.firstName ?? "Comprador");
      setLoading(false);
      return;
    }

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

      setRedemptions((reds ?? []) as unknown as Redemption[]);

      const { data: myOrders, count } = await supabase
        .from("orders")
        .select("*, order_items(*), businesses(name)", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setOrders((myOrders ?? []) as unknown as BuyerOrder[]);
      setOrdersCount(count ?? 0);
      setLoading(false);
    };
    load();
  }, [isLoaded, user?.id]);

  // Notificación en vivo: si el vendedor cambia el estado de un pedido, avisa sin recargar.
  useEffect(() => {
    if (IS_DEMO || !user) return;

    const channel = supabase
      .channel(`buyer-orders-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const updated = payload.new as Order;
          setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
          toast.success(`Tu pedido cambió a "${updated.status.replace("_", " ")}"`, { icon: "📦" });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const demoMode = getDemoMode();
    if (demoMode || IS_DEMO) { toast.success("Perfil actualizado (modo demo)"); setEditOpen(false); return; }
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, name, phone, role: "client" });
    if (!error) { toast.success("Perfil actualizado"); setEditOpen(false); }
    else toast.error("Error al guardar");
    setSaving(false);
  };

  if (loading || (!getDemoMode() && !isLoaded)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse space-y-4">
        <div className="h-32 bg-slate-100 dark:bg-white/5 rounded-2xl" />
        <div className="h-20 bg-slate-100 dark:bg-white/5 rounded-2xl" />
        <div className="h-48 bg-slate-100 dark:bg-white/5 rounded-2xl" />
      </div>
    );
  }

  const demoMode = getDemoMode();
  const email = demoMode === "buyer" ? DEMO_BUYER.email : (user?.emailAddresses[0]?.emailAddress ?? "");
  const initials = name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Inicio
      </Link>

      {/* Hero */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-md">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{name || "Mi cuenta"}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">{email}</p>
            <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-100 dark:border-brand-500/20">
              <User className="w-3 h-3" /> Comprador
            </span>
          </div>
          <button
            onClick={() => setEditOpen(!editOpen)}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
          >
            {editOpen ? "Cancelar" : "Editar"}
          </button>
        </div>

        {/* Edit form (inline collapse) */}
        {editOpen && (
          <form onSubmit={handleSave} className="mt-5 pt-5 border-t border-slate-100 dark:border-white/10 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Nombre</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Tu nombre" />
              </div>
              <div>
                <label className="label">Teléfono</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="4181234567" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 w-full sm:w-auto">
              <Save className="w-4 h-4" />
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: ShoppingBag, label: "Pedidos",   value: demoMode ? DEMO_MY_ORDERS.length : (IS_DEMO ? DEMO_MY_ORDERS.length : ordersCount), color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-500/10" },
          { icon: Heart,       label: "Favoritos", value: DEMO_FAVORITES.length, color: "text-red-500 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-500/10" },
          { icon: Ticket,      label: "Cupones",   value: demoMode ? DEMO_BUYER_COUPONS.length : (IS_DEMO ? 2 : redemptions.length), color: "text-orange-500 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10" },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="card p-4 text-center">
            <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* My orders */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-500" /> Mis pedidos
          </h2>
          {(demoMode || IS_DEMO) && <span className="text-xs text-slate-400">Demo</span>}
        </div>
        {demoMode || IS_DEMO ? (
          <div className="divide-y divide-slate-100 dark:divide-white/10">
            {DEMO_MY_ORDERS.map((o) => (
              <Link key={o.id} href={`/checkout/tracking?order=${o.id}`} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <OrderStatusIcon status={o.status as OrderStatus} className="w-8 h-8 rounded-xl" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{o.item}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <Store className="w-3 h-3" /> {o.store} · {o.date}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <OrderStatusBadge status={o.status as OrderStatus} className="hidden sm:inline-flex" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{formatPrice(o.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Todavía no has hecho ningún pedido.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/10">
            {orders.map((o) => (
              <Link key={o.id} href={`/checkout/tracking?order=${o.id}`} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <OrderStatusIcon status={o.status} className="w-8 h-8 rounded-xl" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{orderItemsSummary(o)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <Store className="w-3 h-3" /> {o.businesses?.name ?? "Negocio"} · {format(new Date(o.created_at), "dd MMM", { locale: es })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <OrderStatusBadge status={o.status} className="hidden sm:inline-flex" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{formatPrice(o.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Favorite stores */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" /> Tiendas favoritas
          </h2>
          <span className="text-xs text-slate-400">Demo</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-white/10">
          {DEMO_FAVORITES.map((s) => (
            <Link key={s.id} href={`/business/${s.id}`} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/30 dark:to-brand-800/30 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                {s.emoji}
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
      </div>

      {/* Redeemed coupons */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10">
          <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Ticket className="w-4 h-4 text-orange-500" /> Cupones canjeados
          </h2>
        </div>
        {(IS_DEMO ? [] : redemptions).length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Ticket className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Todavía no has canjeado cupones.</p>
            <Link href="/coupons" className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
              Ver cupones disponibles
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/10">
            {redemptions.map((r) => (
              <div key={r.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-50 dark:bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Ticket className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{r.coupons?.title ?? "Cupón"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Store className="w-3 h-3" /> {r.coupons?.businesses?.name ?? "Negocio"}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
                    {r.coupons?.discount_type === "percent" ? `${r.coupons.value}%` : `$${r.coupons?.value}`}
                  </p>
                  <p className="text-xs text-slate-400">
                    {format(new Date(r.redeemed_at), "dd MMM", { locale: es })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account links */}
      <div className="card divide-y divide-slate-100 dark:divide-white/10 overflow-hidden">
        {[
          { icon: ShoppingBag, label: "Ver todos los pedidos", href: "/perfil/pedidos" },
          { icon: Ticket,      label: "Explorar cupones",      href: "/coupons" },
          { icon: MapPin,      label: "Ver mapa de tiendas",   href: "/map" },
          { icon: Store,       label: "Todas las tiendas",     href: "/" },
        ].map(({ icon: Icon, label, href }) => (
          <Link key={label} href={href} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
          </Link>
        ))}
      </div>
    </div>
  );
}
