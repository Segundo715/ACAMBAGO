"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ShoppingBag, Phone, Check, Truck, Clock, Search, AlertTriangle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Order, OrderStatus, PaymentMethod } from "@/types";
import { OrderStatusIcon, OrderStatusBadge } from "@/components/ui/OrderStatusBadge";
import { loadOwnedBusinesses } from "@/lib/current-business";
import { createNotification } from "@/lib/notifications";
import toast from "react-hot-toast";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const IS_DEMO = !SUPABASE_URL || SUPABASE_URL.includes("your-project") || SUPABASE_URL === "https://placeholder.supabase.co";

interface OrderRow {
  id: string;
  user_id: string;
  customer: string;
  phone: string;
  items: string[];
  total: number;
  status: OrderStatus;
  date: string;
  address: string;
  payment_method: PaymentMethod;
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  card: "Tarjeta (no procesada, verificar en persona)",
  transfer: "Transferencia bancaria",
  cod: "Contra entrega",
  mercadopago: "Mercado Pago",
  stripe: "Tarjeta (Stripe)",
};

const DEMO_ORDERS: OrderRow[] = [
  { id: "ORD-001", user_id: "demo", customer: "María García", phone: "4151234567", items: ["Taladro Percutor 750W"], total: 889, status: "pendiente", date: "27 Jun 2026 · 10:32", address: "Av. Morelos 45, Centro", payment_method: "cash" },
  { id: "ORD-002", user_id: "demo", customer: "Carlos Ramírez", phone: "4151234568", items: ["Playera Casual M", "Tenis Runner Blanco"], total: 869, status: "en_camino", date: "26 Jun 2026 · 17:15", address: "Calle Hidalgo 12, Col. Lomas", payment_method: "transfer" },
  { id: "ORD-003", user_id: "demo", customer: "Ana Martínez", phone: "4151234569", items: ["Kit Fumigador Pro"], total: 280, status: "entregado", date: "26 Jun 2026 · 14:02", address: "Blvd. Insurgentes 88", payment_method: "cod" },
  { id: "ORD-004", user_id: "demo", customer: "José López", phone: "4151234570", items: ["Pintura Vinílica 4L Blanco"], total: 320, status: "cancelado", date: "25 Jun 2026 · 09:45", address: "Calle Juárez 3", payment_method: "cash" },
  { id: "ORD-005", user_id: "demo", customer: "Luisa Torres", phone: "4151234571", items: ["Taladro Percutor 750W", "Kit Fumigador Pro"], total: 1169, status: "pendiente", date: "25 Jun 2026 · 08:20", address: "Av. 5 de Febrero 201", payment_method: "transfer" },
  { id: "ORD-006", user_id: "demo", customer: "Roberto Sánchez", phone: "4151234572", items: ["Cortadora de Césped"], total: 1450, status: "en_camino", date: "24 Jun 2026 · 15:00", address: "Privada Las Flores 7", payment_method: "cash" },
  { id: "ORD-007", user_id: "demo", customer: "Patricia Hernández", phone: "4151234573", items: ["Nivel Láser Digital"], total: 580, status: "entregado", date: "23 Jun 2026 · 11:30", address: "Calle Obregón 55", payment_method: "card" },
];

const TABS = [
  { key: "todos",     label: "Todos" },
  { key: "pendiente", label: "Pendientes" },
  { key: "en_camino", label: "En camino" },
  { key: "entregado", label: "Entregados" },
  { key: "cancelado", label: "Cancelados" },
] as const;

type Tab = typeof TABS[number]["key"];

function orderToRow(o: Order): OrderRow {
  return {
    id: o.id,
    user_id: o.user_id,
    customer: o.customer_name,
    phone: (o.customer_phone ?? o.address?.phone ?? "").replace(/\D/g, ""),
    items: (o.order_items ?? []).map((it) => `${it.name} x${it.quantity}`),
    total: o.total,
    status: o.status,
    date: new Date(o.created_at).toLocaleString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    address: o.delivery_method === "home" ? (o.address?.street ?? "") : o.delivery_method === "meeting" ? "Punto de reunión" : "Recoger en tienda",
    payment_method: o.payment_method,
  };
}

export default function OrdersPage() {
  const { user, isLoaded } = useUser();
  const [tab, setTab] = useState<Tab>("todos");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const businessIdRef = useRef<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      if (IS_DEMO) {
        setOrders(DEMO_ORDERS);
        setLoaded(true);
        return;
      }
      if (!isLoaded || !user) return;

      const { active: biz } = await loadOwnedBusinesses(supabase, user.id);
      if (!biz) { setLoaded(true); return; }
      businessIdRef.current = biz.id;

      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("business_id", biz.id)
        .order("created_at", { ascending: false });

      setOrders(((data ?? []) as Order[]).map(orderToRow));
      setLoaded(true);
    };
    load();
  }, [isLoaded, user?.id]);

  // Mantiene la lista al dia mientras esta viendo esta pagina. El sonido y el
  // toast de "pedido nuevo" ya suenan en todo el panel via OrderAlertListener
  // (dashboard/layout.tsx), asi que aqui solo se actualiza la lista.
  useEffect(() => {
    if (IS_DEMO || !businessIdRef.current) return;
    const bizId = businessIdRef.current;
    const instanceId = Math.random().toString(36).slice(2);

    const channel = supabase
      .channel(`orders-list-${bizId}-${instanceId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders", filter: `business_id=eq.${bizId}` },
        async (payload) => {
          const { data: items } = await supabase.from("order_items").select("*").eq("order_id", payload.new.id);
          const fullOrder = { ...(payload.new as Order), order_items: items ?? [] };
          setOrders((prev) => [orderToRow(fullOrder), ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loaded]);

  const STATUS_LABELS: Record<OrderStatus, string> = {
    pendiente: "pendiente",
    en_camino: "en camino",
    entregado: "entregado",
    cancelado: "cancelado",
  };

  const updateStatus = async (order: OrderRow, status: OrderStatus) => {
    if (IS_DEMO) { toast("Conecta Supabase para actualizar pedidos reales", { icon: "ℹ️" }); return; }
    const { error } = await supabase.from("orders").update({ status }).eq("id", order.id);
    if (error) { toast.error("Error al actualizar el pedido"); return; }
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
    toast.success("Pedido actualizado");
    if (order.user_id) {
      await createNotification(supabase, {
        user_id: order.user_id,
        type: "order_status",
        title: `Tu pedido cambió a "${STATUS_LABELS[status]}"`,
        body: order.items[0] ? `${order.items[0]}${order.items.length > 1 ? ` y ${order.items.length - 1} más` : ""}` : undefined,
        link: `/checkout/tracking?order=${order.id}`,
      });
    }
  };

  const filtered = orders.filter((o) => {
    const matchTab = tab === "todos" || o.status === tab;
    const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts = {
    todos: orders.length,
    pendiente: orders.filter((o) => o.status === "pendiente").length,
    en_camino: orders.filter((o) => o.status === "en_camino").length,
    entregado: orders.filter((o) => o.status === "entregado").length,
    cancelado: orders.filter((o) => o.status === "cancelado").length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-brand-500" /> Pedidos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Gestiona los pedidos de tu tienda</p>
        </div>
      </div>

      {IS_DEMO && (
        <div className="card p-4 flex items-start gap-3 border-l-4 border-l-yellow-400 bg-yellow-50/50 dark:bg-yellow-500/5">
          <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Modo demo activo</p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-0.5">Estos pedidos son de demostración. Conecta Supabase para ver y notificar pedidos reales.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 overflow-x-auto">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              tab === key
                ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              tab === key ? "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300" : "bg-slate-200 dark:bg-white/10"
            }`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por cliente o ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        />
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {!loaded ? (
          <div className="card p-10 text-center text-slate-400 dark:text-slate-500">Cargando pedidos...</div>
        ) : filtered.length === 0 ? (
          <div className="card p-10 text-center">
            <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No se encontraron pedidos</p>
          </div>
        ) : (
          filtered.map((order) => {
            const isOpen = expanded === order.id;

            return (
              <div key={order.id} className="card overflow-hidden">
                {/* Row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left"
                >
                  <OrderStatusIcon status={order.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{order.customer}</p>
                      <span className="text-xs text-slate-400">#{order.id.slice(0, 8)}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{order.items.join(", ")}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <OrderStatusBadge status={order.status} className="hidden sm:inline-flex" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{formatPrice(order.total)}</span>
                    <span className={`text-slate-300 dark:text-slate-600 transition-transform ${isOpen ? "rotate-180" : ""}`}>▾</span>
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-white/10 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Fecha</p>
                        <p className="text-slate-700 dark:text-slate-300">{order.date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Dirección</p>
                        <p className="text-slate-700 dark:text-slate-300">{order.address}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Pago</p>
                        <p className="text-slate-700 dark:text-slate-300">{PAYMENT_LABELS[order.payment_method]}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Productos</p>
                        <ul className="space-y-0.5">
                          {order.items.map((item) => (
                            <li key={item} className="text-slate-700 dark:text-slate-300">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {order.payment_method === "transfer" && order.status === "pendiente" && (
                      <div className="flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          Este pedido se paga por transferencia. Verifica en tu cuenta bancaria que el depósito ya llegó antes de marcarlo como enviado.
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {order.phone && (
                        <a
                          href={`https://wa.me/52${order.phone}?text=Hola%20${encodeURIComponent(order.customer)}%2C%20te%20contactamos%20sobre%20tu%20pedido%20%23${order.id.slice(0, 8)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 rounded-lg text-xs font-medium hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" /> Contactar por WhatsApp
                        </a>
                      )}
                      {order.status === "pendiente" && (
                        <button
                          onClick={() => updateStatus(order, "en_camino")}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-lg text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" /> Marcar como enviado
                        </button>
                      )}
                      {order.status === "en_camino" && (
                        <button
                          onClick={() => updateStatus(order, "entregado")}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 rounded-lg text-xs font-medium hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Marcar como entregado
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
