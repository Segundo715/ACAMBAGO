import { Business, Product, Coupon, Review } from "@/types";
import StarRating from "@/components/business/StarRating";
import CouponCard from "@/components/coupons/CouponCard";
import { MapPin, Phone, Tag, Wrench, MessageSquare, User } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  business: Business;
  products: Product[];
  coupons: Coupon[];
  reviews: Review[];
  emoji: string;
  productLabel?: string;
}

export default function DemoBusinessPage({
  business,
  products,
  coupons,
  reviews,
  emoji,
  productLabel = "Productos y servicios",
}: Props) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al inicio
      </Link>

      {/* Header */}
      <div className="card mb-6">
        <div className="h-52 bg-gradient-to-br from-brand-50 to-brand-100 rounded-t-2xl flex items-end p-6">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center text-4xl -mb-10">
            {emoji}
          </div>
        </div>
        <div className="px-6 pb-6 pt-12">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="badge bg-brand-100 text-brand-700">
                  <Tag className="w-3 h-3 mr-1" />
                  {business.category}
                </span>
                <div className="flex items-center gap-1">
                  <StarRating value={Math.round(business.rating_avg)} readonly size="sm" />
                  <span className="text-sm text-gray-500">
                    {Number(business.rating_avg).toFixed(1)} ({business.rating_count} reseñas)
                  </span>
                </div>
              </div>
            </div>
            {business.whatsapp && (
              <a
                href={`https://wa.me/52${business.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Phone className="w-4 h-4" />
                Contactar por WhatsApp
              </a>
            )}
          </div>

          {business.description && (
            <p className="text-gray-600 mt-3">{business.description}</p>
          )}

          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-3">
            <MapPin className="w-4 h-4 text-brand-500" />
            {business.address}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Products / Services */}
          {products.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-brand-600" />
                {productLabel}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((p) => (
                  <div key={p.id} className="card flex gap-3 p-4">
                    <div className="w-16 h-16 rounded-xl bg-brand-50 flex-shrink-0 flex items-center justify-center text-2xl">
                      {emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {p.description}
                        </p>
                      )}
                      <p className="text-brand-600 font-bold text-sm mt-1">
                        ${Number(p.price).toLocaleString("es-MX")} MXN
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-600" />
              Reseñas ({reviews.length})
            </h2>

            <div className="card p-4 mb-4 bg-gray-50 border border-dashed border-gray-200">
              <p className="text-sm text-gray-400 text-center">
                🔒{" "}
                <Link href="/register" className="text-brand-600 hover:underline">
                  Regístrate
                </Link>{" "}
                para dejar una reseña
              </p>
            </div>

            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm text-gray-900">
                          {r.profiles?.name ?? "Usuario"}
                        </p>
                        <span className="text-xs text-gray-400">
                          {format(new Date(r.created_at), "dd MMM yyyy", { locale: es })}
                        </span>
                      </div>
                      <StarRating value={r.rating} readonly size="sm" />
                      {r.comment && (
                        <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar: Coupons */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">🎟️ Cupones disponibles</h2>
          {coupons.length === 0 ? (
            <div className="card p-6 text-center text-gray-400 text-sm">
              Sin cupones activos por el momento
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map((c) => (
                <CouponCard key={c.id} coupon={c} showQR />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
