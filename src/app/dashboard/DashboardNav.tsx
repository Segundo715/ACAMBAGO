"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Ticket, Settings, ScanLine } from "lucide-react";

const navItems = [
  { href: "/dashboard/business",              label: "Resumen",       icon: LayoutDashboard },
  { href: "/dashboard/business/products",     label: "Productos",     icon: Package },
  { href: "/dashboard/business/coupons",      label: "Cupones",       icon: Ticket },
  { href: "/dashboard/business/coupons/scan", label: "Escáner QR",    icon: ScanLine },
  { href: "/dashboard/business/settings",     label: "Configuración", icon: Settings },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 p-3 space-y-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/dashboard/business" && pathname.startsWith(href));
        return (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? "bg-brand-500/15 text-brand-700 dark:text-brand-300"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10"
            }`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
