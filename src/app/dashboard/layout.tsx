import Link from "next/link";
import Image from "next/image";
import LogoutButton from "@/components/ui/LogoutButton";
import UserInfo from "@/components/ui/UserInfo";
import DashboardNav from "./DashboardNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-slate-200 dark:border-white/10 fixed inset-y-0 left-0 bg-white dark:bg-[#040a14]/85 dark:backdrop-blur-md">
        <div className="p-5 border-b border-slate-200 dark:border-white/10">
          <Link href="/" className="flex items-center">
            <div className="h-9 bg-white rounded-xl px-2 flex items-center shadow-sm">
              <Image src="/acomdi.png" alt="Acom-Di" width={70} height={28} className="h-7 w-auto object-contain" />
            </div>
          </Link>
        </div>

        <UserInfo />
        <DashboardNav />

        <div className="p-3 border-t border-slate-200 dark:border-white/10">
          <LogoutButton />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-60">
        {/* Mobile top bar */}
        <div className="lg:hidden border-b border-slate-200 dark:border-white/10 px-4 py-3 flex items-center justify-between bg-white/90 dark:bg-[#040a14]/85 backdrop-blur-md">
          <Link href="/" className="flex items-center">
            <div className="h-8 bg-white rounded-xl px-2 flex items-center shadow-sm">
              <Image src="/acomdi.png" alt="Acom-Di" width={60} height={24} className="h-6 w-auto object-contain" />
            </div>
          </Link>
          <UserInfo />
        </div>

        {/* Mobile bottom nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-slate-200 dark:border-white/10 flex z-40 bg-white/95 dark:bg-[#040a14]/95 backdrop-blur-md">
          {[
            { href: "/dashboard/business",              label: "Resumen",  icon: "📊" },
            { href: "/dashboard/business/products",     label: "Productos", icon: "📦" },
            { href: "/dashboard/business/coupons",      label: "Cupones",  icon: "🎟️" },
            { href: "/dashboard/business/coupons/scan", label: "Escáner",  icon: "📷" },
            { href: "/dashboard/business/settings",     label: "Config.",  icon: "⚙️" },
          ].map(({ href, label, icon }) => (
            <Link key={href} href={href}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 text-slate-400 hover:text-brand-600 dark:text-gray-500 dark:hover:text-brand-400 transition-colors">
              <span className="text-lg leading-none">{icon}</span>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}
        </div>

        <main className="p-4 lg:p-8 pb-20 lg:pb-8">{children}</main>
      </div>
    </div>
  );
}
