"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

type AccountType = "buyer" | "seller";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<AccountType | null>(null);

  const handleSelect = (type: AccountType) => {
    setLoading(type);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "pending_role",
        type === "seller" ? "business" : "client"
      );
    }
    router.push("/signup");
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
        <p className="text-slate-400 mt-1 text-sm">
          ¿Cómo quieres usar Acom-Di?
        </p>
      </div>

      {/* Comprador */}
      <button
        onClick={() => handleSelect("buyer")}
        disabled={loading !== null}
        className="group w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-white/10 bg-white/5 hover:bg-brand-500/10 hover:border-brand-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left"
      >
        <div className="w-14 h-14 bg-brand-500/20 border border-brand-500/30 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-105 transition-transform">
          🛍️
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-base">Soy Comprador</p>
          <p className="text-slate-400 text-sm mt-0.5">
            Explora tiendas y productos locales
          </p>
        </div>
        {loading === "buyer" ? (
          <Loader2 className="w-5 h-5 text-brand-400 animate-spin flex-shrink-0" />
        ) : (
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        )}
      </button>

      {/* Vendedor */}
      <button
        onClick={() => handleSelect("seller")}
        disabled={loading !== null}
        className="group w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-white/10 bg-white/5 hover:bg-orange-500/10 hover:border-orange-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left"
      >
        <div className="w-14 h-14 bg-orange-500/20 border border-orange-500/30 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-105 transition-transform">
          🏪
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-base">Tengo una Tienda</p>
          <p className="text-slate-400 text-sm mt-0.5">
            Gestiona tu negocio y conecta con clientes
          </p>
        </div>
        {loading === "seller" ? (
          <Loader2 className="w-5 h-5 text-orange-400 animate-spin flex-shrink-0" />
        ) : (
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        )}
      </button>

      <p className="text-center text-slate-500 text-sm pt-2">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
        >
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
