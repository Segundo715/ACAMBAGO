"use client";

import { useState } from "react";
import { BarChart2, TrendingUp, Users, ShoppingBag, Star, ArrowUp, ArrowDown } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const MONTHLY_DATA = [
  { label: "Ene", revenue: 8200,  orders: 18, customers: 14 },
  { label: "Feb", revenue: 9400,  orders: 21, customers: 17 },
  { label: "Mar", revenue: 11200, orders: 26, customers: 22 },
  { label: "Abr", revenue: 10500, orders: 23, customers: 19 },
  { label: "May", revenue: 13800, orders: 31, customers: 28 },
  { label: "Jun", revenue: 15640, orders: 34, customers: 31 },
];

const WEEKLY_DATA = [
  { label: "Lun", revenue: 1200, orders: 3, customers: 2 },
  { label: "Mar", revenue: 890,  orders: 2, customers: 2 },
  { label: "Mié", revenue: 2100, orders: 5, customers: 4 },
  { label: "Jue", revenue: 1750, orders: 4, customers: 3 },
  { label: "Vie", revenue: 2340, orders: 6, customers: 5 },
  { label: "Sáb", revenue: 1980, orders: 5, customers: 4 },
  { label: "Dom", revenue: 650,  orders: 1, customers: 1 },
];

const TOP_PRODUCTS = [
  { name: "Taladro Percutor 750W",     sold: 18, revenue: 16002, pct: 100 },
  { name: "Pintura Vinílica 4L",       sold: 12, revenue: 3840,  pct: 67 },
  { name: "Kit Fumigador Pro",         sold: 9,  revenue: 2520,  pct: 50 },
  { name: "Cortadora de Césped",       sold: 6,  revenue: 8700,  pct: 33 },
  { name: "Nivel Láser Digital",       sold: 5,  revenue: 2900,  pct: 28 },
];

type Period = "semanal" | "mensual";
type Metric = "revenue" | "orders" | "customers";

const METRIC_CONFIG = {
  revenue:   { label: "Ingresos",  color: "bg-brand-500 dark:bg-brand-400",    fmt: (v: number) => formatPrice(v) },
  orders:    { label: "Pedidos",   color: "bg-blue-500 dark:bg-blue-400",      fmt: (v: number) => String(v) },
  customers: { label: "Clientes",  color: "bg-green-500 dark:bg-green-400",    fmt: (v: number) => String(v) },
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("mensual");
  const [metric, setMetric] = useState<Metric>("revenue");

  const data = period === "semanal" ? WEEKLY_DATA : MONTHLY_DATA;
  const values = data.map((d) => d[metric] as number);
  const maxVal = Math.max(...values);
  const total = values.reduce((s, v) => s + v, 0);
  const prevTotal = metric === "revenue" ? 11200 : metric === "orders" ? 26 : 22;
  const growth = Math.round(((total - prevTotal) / prevTotal) * 100);
  const cfg = METRIC_CONFIG[metric];

  const kpis = [
    { label: "Ingresos totales", value: formatPrice(15640), sub: "+23% vs mes anterior", icon: TrendingUp, up: true, color: "text-brand-600 dark:text-brand-400", bg: "bg-brand-50 dark:bg-brand-500/10" },
    { label: "Total pedidos",    value: "34",               sub: "+8 vs mes anterior",   icon: ShoppingBag, up: true, color: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-500/10" },
    { label: "Clientes nuevos",  value: "31",               sub: "+3 vs mes anterior",   icon: Users,       up: true, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-500/10" },
    { label: "Calificación",     value: "4.7 ★",            sub: "89 reseñas totales",   icon: Star,        up: null, color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-500/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-brand-500" /> Estadísticas
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Rendimiento de tu negocio</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, sub, icon: Icon, up, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 text-xs leading-tight">{label}</p>
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${
              up === true ? "text-green-600 dark:text-green-400" :
              up === false ? "text-red-500 dark:text-red-400" :
              "text-slate-400"
            }`}>
              {up === true && <ArrowUp className="w-3 h-3" />}
              {up === false && <ArrowDown className="w-3 h-3" />}
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card p-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            {cfg.label} — {period}
          </h2>
          <div className="flex gap-2 flex-wrap">
            {/* Metric selector */}
            <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-lg p-0.5">
              {(Object.keys(METRIC_CONFIG) as Metric[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    metric === m ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {METRIC_CONFIG[m].label}
                </button>
              ))}
            </div>
            {/* Period selector */}
            <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-lg p-0.5">
              {(["semanal", "mensual"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all capitalize ${
                    period === p ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bars */}
        <div className="flex items-end gap-2 h-40">
          {data.map((d, i) => {
            const val = d[metric] as number;
            const heightPct = maxVal > 0 ? Math.max(4, (val / maxVal) * 100) : 4;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 text-center leading-tight">
                  {cfg.fmt(val)}
                </span>
                <div
                  className={`w-full ${cfg.color} rounded-t-lg transition-all duration-300 hover:opacity-80`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[10px] text-slate-400 dark:text-slate-500">{d.label}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Total {period}</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">{cfg.fmt(total)}</span>
            <span className={`text-xs flex items-center gap-0.5 font-medium ${growth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
              {growth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {Math.abs(growth)}% vs anterior
            </span>
          </div>
        </div>
      </div>

      {/* Top products */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Productos mas vendidos</h2>
        <div className="space-y-4">
          {TOP_PRODUCTS.map((p, i) => (
            <div key={p.name}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{p.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400">{p.sold} uds.</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{formatPrice(p.revenue)}</span>
                </div>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 dark:bg-brand-400 rounded-full"
                  style={{ width: `${p.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
