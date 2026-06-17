import Link from "next/link";
import { DEMO_BUSINESS, DEMO_STATS } from "@/lib/demo-data";
import { Package, Ticket, Star, ScanLine, Plus } from "lucide-react";

export default function DashboardPage() {
  const business = DEMO_BUSINESS;
  const stats = DEMO_STATS;

  const statCards = [
    { label: "Productos", value: stats.products, icon: Package, color: "bg-blue-50 text-blue-600", href: "/dashboard/business/products" },
    { label: "Cupones activos", value: stats.coupons, icon: Ticket, color: "bg-orange-50 text-orange-600", href: "/dashboard/business/coupons" },
    { label: "Reseñas", value: stats.reviews, icon: Star, color: "bg-yellow-50 text-yellow-600", href: "/dashboard/business" },
    { label: "Cupones canjeados", value: stats.redemptions, icon: ScanLine, color: "bg-green-50 text-green-600", href: "/dashboard/business/coupons/scan" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
          <p className="text-gray-500 mt-0.5">{business.category} · {business.address}</p>
        </div>
        <span className="badge bg-green-100 text-green-700 px-3 py-1 text-sm">
          ✓ Negocio aprobado
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="card p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Rating */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          Calificación promedio
        </h2>
        <div className="flex items-end gap-3">
          <span className="text-5xl font-bold text-gray-900">
            {Number(stats.rating_avg).toFixed(1)}
          </span>
          <div className="mb-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${
                    s <= Math.round(stats.rating_avg)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-200 fill-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">{stats.rating_count} reseñas</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/business/products" className="card p-5 hover:shadow-md transition-shadow flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Agregar producto</p>
            <p className="text-xs text-gray-500">Publica lo que vendes</p>
          </div>
        </Link>
        <Link href="/dashboard/business/coupons/new" className="card p-5 hover:shadow-md transition-shadow flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
            <Ticket className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Crear cupón</p>
            <p className="text-xs text-gray-500">Con código QR incluido</p>
          </div>
        </Link>
        <Link href="/dashboard/business/coupons/scan" className="card p-5 hover:shadow-md transition-shadow flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Escanear cupón</p>
            <p className="text-xs text-gray-500">Valida en tiempo real</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
