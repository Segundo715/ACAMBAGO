"use client";

import { useState } from "react";
import { ShoppingBag, Phone, Check, Truck, Clock, X, Search } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Order {
  id: string;
  customer: string;
  phone: string;
  items: string[];
  total: number;
  status: "pendiente" | "en_camino" | "entregado" | "cancelado";
  date: string;
  address: string;
}

const DEMO_ORDERS: Order[] = [
  { id: "ORD-001", customer: "María García", phone: "4151234567", items: ["Taladro Percutor 750W"], total: 889, status: "pendiente", date: "27 Jun 2026 · 10:32", address: "Av. Morelos 45, Centro" },
  { id: "ORD-002", customer: "Carlos Ramírez", phone: "4151234568", items: ["Playera Casual M", "Tenis Runner Blanco"], total: 869, status: "en_camino", date: "26 Jun 2026 · 17:15", address: "Calle Hidalgo 12, Col. Lomas" },
  { id: "ORD-003", customer: "Ana Martínez", phone: "4151234569", items: ["Kit Fumigador Pro"], total: 280, status: "entregado", date: "26 Jun 2026 · 14:02", address: "Blvd. Insurgentes 88" },
  { id: "ORD-004", customer: "José López", phone: "4151234570", items: ["Pintura Vinílica 4L Blanco"], total: 320, status: "cancelado", date: "25 Jun 2026 · 09:45", address: "Calle Juárez 3" },
  { id: "ORD-005", customer: "Luisa Torres", phone: "4151234571", items: ["Taladro Percutor 750W", "Kit Fumigador Pro"], total: 1169, status: "pendiente", date: "25 Jun 2026 · 08:20", address: "Av. 5 de Febrero 201" },
  { id: "ORD-006", customer: "Roberto Sánchez", phone: "4151234572", items: ["Cortadora de Césped"], total: 1450, status: "en_camino", date: "24 Jun 2026 · 15:00", address: "Privada Las Flores 7" },
  { id: "ORD-007", customer: "Patricia Hernández", phone: "4151234573", items: ["Nivel Láser Digital"], total: 580, status: "entregado", date: "23 Jun 2026 · 11:30", address: "Calle Obregón 55" },
];

const STATUS_CONFIG = {
  pendiente:  { label: "Pendiente",  icon: Clock,  textCls: "text-yellow-700 dark:text-yellow-400", bgCls: "bg-yellow-50 dark:bg-yellow-500/10", borderCls: "border-yellow-200 dark:border-yellow-500/20" },
  en_camino:  { label: "En camino",  icon: Truck,  textCls: "text-blue-700 dark:text-blue-400",    bgCls: "bg-blue-50 dark:bg-blue-500/10",     borderCls: "border-blue-200 dark:border-blue-500/20" },
  entregado:  { label: "Entregado",  icon: Check,  textCls: "text-green-700 dark:text-green-400",  bgCls: "bg-green-50 dark:bg-green-500/10",   borderCls: "border-green-200 dark:border-green-500/20" },
  cancelado:  { label: "Cancelado",  icon: X,      textCls: "text-red-600 dark:text-red-400",      bgCls: "bg-red-50 dark:bg-red-500/10",       borderCls: "border-red-200 dark:border-red-500/20" },
};

const TABS = [
  { key: "todos",     label: "Todos" },
  { key: "pendiente", label: "Pendientes" },
  { key: "en_camino", label: "En camino" },
  { key: "entregado", label: "Entregados" },
  { key: "cancelado", label: "Cancelados" },
] as const;

type Tab = typeof TABS[number]["key"];

export default function OrdersPage() {
  const [tab, setTab] = useState<Tab>("todos");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = DEMO_ORDERS.filter((o) => {
    const matchTab = tab === "todos" || o.status === tab;
    const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts = {
    todos: DEMO_ORDERS.length,
    pendiente: DEMO_ORDERS.filter((o) => o.status === "pendiente").length,
    en_camino: DEMO_ORDERS.filter((o) => o.status === "en_camino").length,
    entregado: DEMO_ORDERS.filter((o) => o.status === "entregado").length,
    cancelado: DEMO_ORDERS.filter((o) => o.status === "cancelado").length,
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
        {filtered.length === 0 ? (
          <div className="card p-10 text-center">
            <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No se encontraron pedidos</p>
          </div>
        ) : (
          filtered.map((order) => {
            const cfg = STATUS_CONFIG[order.status];
            const StatusIcon = cfg.icon;
            const isOpen = expanded === order.id;

            return (
              <div key={order.id} className="card overflow-hidden">
                {/* Row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left"
                >
                  <div className={`w-9 h-9 rounded-xl ${cfg.bgCls} border ${cfg.borderCls} flex items-center justify-center flex-shrink-0`}>
                    <StatusIcon className={`w-4 h-4 ${cfg.textCls}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{order.customer}</p>
                      <span className="text-xs text-slate-400">#{order.id}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{order.items.join(", ")}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`hidden sm:inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bgCls} ${cfg.textCls} border ${cfg.borderCls}`}>
                      <StatusIcon className="w-3 h-3" /> {cfg.label}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{formatPrice(order.total)}</span>
                    <span className={`text-slate-300 dark:text-slate-600 transition-transform ${isOpen ? "rotate-180" : ""}`}>▾</span>
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-white/10 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Fecha</p>
                        <p className="text-slate-700 dark:text-slate-300">{order.date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">Dirección</p>
                        <p className="text-slate-700 dark:text-slate-300">{order.address}</p>
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
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <a
                        href={`https://wa.me/52${order.phone}?text=Hola%20${encodeURIComponent(order.customer)}%2C%20te%20contactamos%20sobre%20tu%20pedido%20%23${order.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 rounded-lg text-xs font-medium hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" /> Contactar por WhatsApp
                      </a>
                      {order.status === "pendiente" && (
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-lg text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                          <Truck className="w-3.5 h-3.5" /> Marcar como enviado
                        </button>
                      )}
                      {order.status === "en_camino" && (
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 rounded-lg text-xs font-medium hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors">
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
