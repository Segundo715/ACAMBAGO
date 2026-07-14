import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import LogoutButton from "@/components/ui/LogoutButton";
import UserInfo from "@/components/ui/UserInfo";
import DashboardNav from "./DashboardNav";
import DemoBanner from "@/components/ui/DemoBanner";
import PendingApprovalGate from "./PendingApprovalGate";
import { Store, ShoppingBag } from "lucide-react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const IS_DEMO = !SUPABASE_URL || SUPABASE_URL.includes("your-project") || SUPABASE_URL === "https://placeholder.supabase.co";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Demo seller bypasses role check (middleware already blocked demo buyer)
  const cookieStore = await cookies();
  const isDemoSeller = cookieStore.get("demo_mode")?.value === "seller";

  let pendingApproval = false;

  if (!isDemoSeller && !IS_DEMO) {
    const { userId } = await auth();
    if (!userId) redirect("/login");

    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profile?.role !== "business" && profile?.role !== "admin") {
      redirect("/");
    }

    if (profile.role === "business") {
      const { data: business } = await supabase
        .from("businesses")
        .select("is_approved")
        .eq("owner_id", userId)
        .single();
      pendingApproval = !business || !business.is_approved;
    }
  }
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#030810]">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-white/10 fixed inset-y-0 left-0 bg-white dark:bg-[#040a14]/90 dark:backdrop-blur-md z-40">
        {/* Logo + modo badge */}
        <div className="p-5 border-b border-slate-200 dark:border-white/10 space-y-3">
          <Link href="/" className="flex items-center">
            <div className="h-9 bg-white rounded-xl px-2 flex items-center shadow-sm">
              <Image src="/acomdi.png" alt="Acom-Di" width={70} height={28} className="h-7 w-auto object-contain" />
            </div>
          </Link>
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-brand-500/10 dark:bg-brand-500/15 rounded-xl border border-brand-200 dark:border-brand-500/30">
            <Store className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">Modo Vendedor</span>
          </div>
        </div>

        <UserInfo />
        <DashboardNav />

        <div className="p-3 border-t border-slate-200 dark:border-white/10 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-all"
          >
            <ShoppingBag className="w-4 h-4 flex-shrink-0" />
            Ir a comprar
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile top bar */}
        <div className="lg:hidden border-b border-slate-200 dark:border-white/10 px-4 py-3 flex items-center justify-between bg-white/90 dark:bg-[#040a14]/90 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <Link href="/">
              <div className="h-8 bg-white rounded-xl px-2 flex items-center shadow-sm">
                <Image src="/acomdi.png" alt="Acom-Di" width={60} height={24} className="h-6 w-auto object-contain" />
              </div>
            </Link>
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-500/20">
              Vendedor
            </span>
          </div>
          <UserInfo />
        </div>

        {/* Mobile bottom nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-slate-200 dark:border-white/10 flex z-40 bg-white/95 dark:bg-[#040a14]/95 backdrop-blur-md">
          {[
            { href: "/dashboard/business",              label: "Inicio",    icon: "📊" },
            { href: "/dashboard/business/products",     label: "Productos", icon: "📦" },
            { href: "/dashboard/business/orders",       label: "Pedidos",   icon: "🛒" },
            { href: "/dashboard/business/coupons",      label: "Cupones",   icon: "🎟️" },
            { href: "/dashboard/business/settings",     label: "Config.",   icon: "⚙️" },
          ].map(({ href, label, icon }) => (
            <Link key={href} href={href}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 text-slate-400 hover:text-brand-600 dark:text-gray-500 dark:hover:text-brand-400 transition-colors">
              <span className="text-lg leading-none">{icon}</span>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}
        </div>

        <DemoBanner />
        <main className="p-4 lg:p-8 pb-24 lg:pb-8">
          <PendingApprovalGate pendingApproval={pendingApproval}>{children}</PendingApprovalGate>
        </main>
      </div>
    </div>
  );
}
