"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, ShoppingCart, LogIn, UserPlus, LayoutDashboard, LogOut, Store, User } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import ThemeToggle from "./ThemeToggle";
import { useAuthUser } from "@/lib/hooks/use-auth-user";
import { getDemoMode, stopDemoMode } from "@/lib/demo-mode";
import { useClerk } from "@clerk/nextjs";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, openCart } = useCart();
  const { userId, name, role, loading } = useAuthUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const user = userId ? { id: userId } : null;

  const handleLogout = async () => {
    if (getDemoMode()) { stopDemoMode(); return; }
    await signOut();
    setMenuOpen(false);
    router.push("/");
  };

  const dashboardHref = role === "admin" ? "/admin" : "/dashboard/business";

  return (
    <nav className="md:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm dark:bg-[#050e18]/75 dark:border-white/10 dark:shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <div className="h-10 bg-white rounded-xl px-2.5 flex items-center shadow-sm">
              <Image src="/acomdi.png" alt="Acom-Di" width={80} height={32} className="h-8 w-auto object-contain" priority />
            </div>
          </Link>

          {/* Mobile: theme + cart + hamburger */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={openCart}
              className="relative p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
              aria-label="Carrito"
            >
              <ShoppingCart className="w-5 h-5 text-slate-600 dark:text-gray-200" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-brand-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {count}
                </span>
              )}
            </button>
            <button
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen
                ? <X className="w-5 h-5 text-slate-600 dark:text-gray-200" />
                : <Menu className="w-5 h-5 text-slate-600 dark:text-gray-200" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-slate-200 dark:border-white/10 py-4 px-4 flex flex-col gap-2 bg-white dark:bg-[#050e18]/95">
          <Link href="/" className="text-sm font-medium py-2.5 px-3 rounded-xl text-slate-700 hover:bg-slate-100 dark:text-gray-200 dark:hover:bg-white/10" onClick={() => setMenuOpen(false)}>Inicio</Link>
          <Link href="/#productos" className="text-sm font-medium py-2.5 px-3 rounded-xl text-slate-700 hover:bg-slate-100 dark:text-gray-200 dark:hover:bg-white/10" onClick={() => setMenuOpen(false)}>Productos</Link>
          <Link href="/#categorias" className="text-sm font-medium py-2.5 px-3 rounded-xl text-slate-700 hover:bg-slate-100 dark:text-gray-200 dark:hover:bg-white/10" onClick={() => setMenuOpen(false)}>Categorías</Link>
          <Link href="/map" className="text-sm font-medium py-2.5 px-3 rounded-xl text-slate-700 hover:bg-slate-100 dark:text-gray-200 dark:hover:bg-white/10" onClick={() => setMenuOpen(false)}>Mapa</Link>
          <Link href="/coupons" className="text-sm font-medium py-2.5 px-3 rounded-xl text-slate-700 hover:bg-slate-100 dark:text-gray-200 dark:hover:bg-white/10" onClick={() => setMenuOpen(false)}>Cupones</Link>

          <hr className="border-slate-200 dark:border-white/10 my-1" />

          {!loading && (
            user ? (
              <>
                {/* Info usuario */}
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                    {role === "business"
                      ? <Store className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      : <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{name ?? "Usuario"}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{role ?? "usuario"}</p>
                  </div>
                </div>

                <Link
                  href={dashboardHref}
                  className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-gray-200 dark:hover:bg-white/10"
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" /> Mi panel
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 w-full"
                >
                  <LogOut className="w-4 h-4" /> Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 py-2.5 border border-slate-300 dark:border-white/20 rounded-xl text-sm font-medium text-slate-700 dark:text-gray-200"
                  onClick={() => setMenuOpen(false)}
                >
                  <LogIn className="w-4 h-4" /> Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserPlus className="w-4 h-4" /> Registrarse
                </Link>
              </>
            )
          )}
        </div>
      )}
    </nav>
  );
}
