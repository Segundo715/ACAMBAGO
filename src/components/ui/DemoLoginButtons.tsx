"use client";

import { useState } from "react";
import { Loader2, ShoppingBag, Store } from "lucide-react";
import { startDemoMode } from "@/lib/demo-mode";

export default function DemoLoginButtons() {
  const [loading, setLoading] = useState<"buyer" | "seller" | null>(null);

  const enter = (role: "buyer" | "seller") => {
    setLoading(role);
    startDemoMode(role);
  };

  return (
    <div className="mt-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          Probar sin registrarse
        </span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Comprador demo */}
        <button
          onClick={() => enter("buyer")}
          disabled={loading !== null}
          className="group relative flex flex-col items-center gap-2.5 px-3 py-4 rounded-2xl border-2 border-brand-500/30 bg-brand-500/8 hover:bg-brand-500/15 hover:border-brand-500/60 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent pointer-events-none" />
          {loading === "buyer" ? (
            <Loader2 className="w-7 h-7 text-brand-400 animate-spin" />
          ) : (
            <div className="w-12 h-12 bg-brand-500/20 border border-brand-500/30 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-6 h-6 text-brand-400" />
            </div>
          )}
          <div className="text-center">
            <p className="text-xs font-bold text-brand-300">Demo Comprador</p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
              Explora el marketplace
            </p>
          </div>
        </button>

        {/* Vendedor demo */}
        <button
          onClick={() => enter("seller")}
          disabled={loading !== null}
          className="group relative flex flex-col items-center gap-2.5 px-3 py-4 rounded-2xl border-2 border-orange-500/30 bg-orange-500/8 hover:bg-orange-500/15 hover:border-orange-500/60 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
          {loading === "seller" ? (
            <Loader2 className="w-7 h-7 text-orange-400 animate-spin" />
          ) : (
            <div className="w-12 h-12 bg-orange-500/20 border border-orange-500/30 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Store className="w-6 h-6 text-orange-400" />
            </div>
          )}
          <div className="text-center">
            <p className="text-xs font-bold text-orange-300">Demo Tienda</p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
              Panel de vendedor
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
