"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Home, Tag, LayoutGrid, Map, Ticket, ShoppingCart, LogIn, UserPlus, LayoutDashboard, LogOut, Store, User, ChevronRight } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useCart } from "@/lib/cart-context";
import { useAuthUser } from "@/lib/hooks/use-auth-user";
import { useClerk } from "@clerk/nextjs";

const navItems = [
  { href: "/",            label: "Inicio",     icon: Home,       exact: true  },
  { href: "/#productos",  label: "Productos",  icon: Tag,        exact: false },
  { href: "/#categorias", label: "Categorías", icon: LayoutGrid, exact: false },
  { href: "/map",         label: "Mapa",       icon: Map,        exact: false },
  { href: "/coupons",     label: "Cupones",    icon: Ticket,     exact: false },
];

export default function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { count, openCart } = useCart();
  const { userId, name, role, loading } = useAuthUser();
  const { signOut } = useClerk();
  const user = userId ? { id: userId } : null;

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const dashboardHref = role === "admin" ? "/admin" : role === "client" ? "/perfil" : "/dashboard/business";

  return (
    <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-50 bg-white/90 dark:bg-[#050e18]/90 backdrop-blur-md border-r border-slate-200 dark:border-white/10">
      {/* Logo */}
      <div className="p-5 border-b border-slate-200 dark:border-white/10">
        <Link href="/" className="flex items-center">
          <div className="h-10 bg-white rounded-xl px-3 flex items-center shadow-sm">
            <Image src="/acomdi.png" alt="Acom-Di" width={80} height={32} className="h-8 w-auto object-contain" priority />
          </div>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact
            ? pathname === "/"
            : pathname === href.split("#")[0] && href.split("#")[0] !== "/";
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-white dark:text-gray-900"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-slate-200 dark:border-white/10 space-y-1">
        {/* Carrito */}
        <button
          onClick={openCart}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-all"
        >
          <ShoppingCart className="w-5 h-5 flex-shrink-0" />
          Carrito
          {count > 0 && (
            <span className="ml-auto min-w-[20px] h-5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>

        {!loading && (
          user ? (
            /* Usuario logueado */
            <>
              {/* Info del usuario */}
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5">
                <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                  {role === "business"
                    ? <Store className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    : <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{name ?? "Usuario"}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">{role ?? "usuario"}</p>
                </div>
              </div>

              {/* Mi Tienda (solo para vendedores) */}
              {role === "business" ? (
                <Link
                  href="/dashboard/business"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-colors"
                >
                  <Store className="w-5 h-5 flex-shrink-0" />
                  Mi Tienda
                  <ChevronRight className="w-4 h-4 ml-auto opacity-70" />
                </Link>
              ) : (
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-all"
                >
                  <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                  Mi panel
                </Link>
              )}

              {/* Cerrar sesión */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-400 hover:text-red-600 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                Cerrar sesión
              </button>
            </>
          ) : (
            /* No logueado */
            <>
              <Link
                href="/login"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-all"
              >
                <LogIn className="w-5 h-5 flex-shrink-0" />
                Iniciar sesión
              </Link>

              <Link
                href="/register"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-colors"
              >
                <UserPlus className="w-5 h-5 flex-shrink-0" />
                Registrarse
              </Link>
            </>
          )
        )}

        <div className="flex items-center px-3 pt-2">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
