import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Business } from "@/types";
import AdminApproveButton from "./AdminApproveButton";
import AdminBusinessActions from "./AdminBusinessActions";
import AssignCouponsButton from "./AssignCouponsButton";
import CategoryIcon from "@/components/ui/CategoryIcon";
import {
  CheckCircle, Store, Users, Package, Clock, TrendingUp,
  AlertCircle, ShieldCheck, Star, MapPin, Crown, User, Ticket,
} from "lucide-react";
import Link from "next/link";
import { DEMO_BUSINESSES, DEMO_PRODUCTS } from "@/lib/demo-data";

interface Profile {
  id: string;
  name: string;
  phone?: string;
  role: "client" | "business" | "admin";
  created_at: string;
}

const roleConfig = {
  admin:    { label: "Admin",    icon: Crown, bg: "bg-red-50 dark:bg-red-500/10",      text: "text-red-700 dark:text-red-400",      border: "border-red-200 dark:border-red-500/20" },
  business: { label: "Negocio", icon: Store,  bg: "bg-brand-50 dark:bg-brand-500/10",  text: "text-brand-700 dark:text-brand-400",  border: "border-brand-100 dark:border-brand-500/20" },
  client:   { label: "Cliente", icon: User,   bg: "bg-slate-50 dark:bg-slate-700",     text: "text-slate-600 dark:text-slate-300",  border: "border-slate-200 dark:border-slate-600" },
};

async function getData() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const isDemo = !url || url.includes("your-project") || url === "https://placeholder.supabase.co";

  if (isDemo) {
    const demoUsers: Profile[] = [
      { id: "1", name: "Admin Principal",      role: "admin",    created_at: "2024-01-01T00:00:00Z" },
      { id: "2", name: "Ferretería Acámbaro",  role: "business", created_at: "2024-01-05T00:00:00Z" },
      { id: "3", name: "Boutique Acámbaro",    role: "business", created_at: "2024-02-01T00:00:00Z" },
      { id: "4", name: "María González",        role: "client",   created_at: "2024-02-10T00:00:00Z" },
      { id: "5", name: "Carlos Ramírez",        role: "client",   created_at: "2024-02-15T00:00:00Z" },
    ];
    return {
      isDemo: true,
      pending: [] as (Business & { profiles: { name: string } })[],
      approvedCount: DEMO_BUSINESSES.length,
      usersCount: demoUsers.length,
      productsCount: DEMO_PRODUCTS.length,
      allBusinesses: DEMO_BUSINESSES as Business[],
      users: demoUsers,
    };
  }

  try {
    const { userId } = await auth();
    if (!userId) redirect("/login");
    const supabase = await createClient();
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
    if (profile?.role !== "admin") redirect("/");

    const [pendingRes, allBizRes, usersRes, productsRes] = await Promise.all([
      supabase.from("businesses").select("*, profiles(name)").eq("is_approved", false).order("created_at", { ascending: false }),
      supabase.from("businesses").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, name, phone, role, created_at").order("created_at", { ascending: false }),
      supabase.from("products").select("id", { count: "exact" }),
    ]);

    const all = (allBizRes.data ?? []) as Business[];
    return {
      isDemo: false,
      pending: (pendingRes.data ?? []) as (Business & { profiles: { name: string } })[],
      approvedCount: all.filter((b) => b.is_approved).length,
      usersCount: usersRes.data?.length ?? 0,
      productsCount: productsRes.count ?? 0,
      allBusinesses: all,
      users: (usersRes.data ?? []) as Profile[],
    };
  } catch {
    redirect("/login");
  }
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "resumen" } = await searchParams;
  const { isDemo, pending, approvedCount, usersCount, productsCount, allBusinesses, users } =
    await getData();

  const approvedBusinesses = allBusinesses.filter((b) => b.is_approved);
  const admins   = users.filter((u) => u.role === "admin");
  const negocios = users.filter((u) => u.role === "business");
  const clientes = users.filter((u) => u.role === "client");

  const tabs = [
    { id: "resumen",   label: "Resumen",   emoji: "📊" },
    { id: "negocios",  label: "Negocios",  emoji: "🏪", badge: pending.length > 0 ? pending.length : undefined },
    { id: "usuarios",  label: "Usuarios",  emoji: "👥" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Panel de Control</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Acom-Di — administración completa</p>
        </div>
        <div className="flex items-center gap-2">
          {isDemo && (
            <span className="text-xs bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20 px-3 py-1.5 rounded-full font-medium">
              Modo demo
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin verificado
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl w-fit">
        {tabs.map(({ id, label, emoji, badge }) => (
          <Link
            key={id}
            href={`/admin?tab=${id}`}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === id
                ? "bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
            }`}
          >
            <span>{emoji}</span>
            {label}
            {badge && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* ── RESUMEN ── */}
      {tab === "resumen" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Pendientes",         value: pending.length,   icon: Clock,        color: "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400", alert: pending.length > 0, href: "/admin?tab=negocios" },
              { label: "Negocios aprobados", value: approvedCount,    icon: CheckCircle,  color: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",   href: "/admin?tab=negocios" },
              { label: "Usuarios",           value: usersCount,       icon: Users,        color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",        href: "/admin?tab=usuarios" },
              { label: "Productos",          value: productsCount,    icon: Package,      color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400", href: "/admin?tab=negocios" },
            ].map(({ label, value, icon: Icon, color, alert, href }) => (
              <Link key={label} href={href}
                className="card p-5 hover:shadow-md transition-all group">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
                {alert && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Requiere atención
                  </p>
                )}
              </Link>
            ))}
          </div>

          {pending.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" /> Pendientes de aprobación
              </h2>
              <div className="space-y-3">
                {pending.slice(0, 3).map((b) => (
                  <div key={b.id} className="card p-4 flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{b.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{b.category} · {b.address}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Dueño: {(b as Business & { profiles?: { name: string } }).profiles?.name ?? "—"}</p>
                    </div>
                    {!isDemo && <AdminApproveButton businessId={b.id} />}
                  </div>
                ))}
                {pending.length > 3 && (
                  <Link href="/admin?tab=negocios" className="block text-center text-sm text-brand-600 dark:text-brand-400 hover:underline py-2">
                    Ver {pending.length - 3} más en Negocios...
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── NEGOCIOS ── */}
      {tab === "negocios" && (
        <div className="space-y-8">
          {pending.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                Pendientes de aprobación
                <span className="text-xs bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full">{pending.length}</span>
              </h2>
              <div className="space-y-3">
                {pending.map((b) => (
                  <div key={b.id} className="card p-4 flex items-start justify-between gap-4 flex-wrap border-l-4 border-l-yellow-400">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                        <CategoryIcon category={b.category} className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{b.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{b.category}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {b.address}
                        </p>
                      </div>
                    </div>
                    {!isDemo && <AdminBusinessActions businessId={b.id} isApproved={false} isActive={false} />}
                    {isDemo && <span className="text-xs text-slate-400 italic">Demo</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Negocios aprobados
              <span className="text-xs bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">{approvedBusinesses.length}</span>
            </h2>
            {approvedBusinesses.length === 0 ? (
              <div className="card p-10 text-center">
                <Store className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No hay negocios aprobados todavía.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {approvedBusinesses.map((b) => (
                  <div key={b.id} className={`card p-4 flex items-start gap-3 ${!b.is_active ? "opacity-60" : ""}`}>
                    <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 flex items-center justify-center flex-shrink-0">
                      <CategoryIcon category={b.category} className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{b.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{b.category}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              {Number(b.rating_avg).toFixed(1)} ({b.rating_count})
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${
                              b.is_active
                                ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600"
                            }`}>
                              {b.is_active ? "Activo" : "Suspendido"}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full border bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20 flex items-center gap-1">
                              <Ticket className="w-3 h-3" /> Cupones disponibles: {b.coupon_credits ?? 0}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{b.address}</span>
                      </p>
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        {!isDemo ? (
                          <>
                            <AdminBusinessActions businessId={b.id} isApproved={true} isActive={b.is_active} />
                            <AssignCouponsButton businessId={b.id} businessName={b.name} />
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Demo — sin acción</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── USUARIOS ── */}
      {tab === "usuarios" && (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { title: "Administradores", count: admins.length,   ...roleConfig.admin },
              { title: "Negocios",        count: negocios.length, ...roleConfig.business },
              { title: "Clientes",        count: clientes.length, ...roleConfig.client },
            ].map(({ title, count, icon: Icon, bg, text, border }) => (
              <div key={title} className={`card p-5 border ${border}`}>
                <div className={`w-9 h-9 rounded-xl ${bg} border ${border} flex items-center justify-center mb-2`}>
                  <Icon className={`w-5 h-5 ${text}`} />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{count}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
              </div>
            ))}
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Usuario</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Rol</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden sm:table-cell">Teléfono</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden md:table-cell">Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {users.map((u) => {
                    const r = roleConfig[u.role];
                    const RIcon = r.icon;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full ${r.bg} border ${r.border} flex items-center justify-center flex-shrink-0`}>
                              <RIcon className={`w-3.5 h-3.5 ${r.text}`} />
                            </div>
                            <span className="font-medium text-slate-900 dark:text-white">{u.name ?? "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${r.bg} ${r.text} ${r.border}`}>
                            <RIcon className="w-3 h-3" /> {r.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                          {u.phone ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-400 dark:text-slate-500 hidden md:table-cell text-xs">
                          {new Date(u.created_at).toLocaleDateString("es-MX")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
