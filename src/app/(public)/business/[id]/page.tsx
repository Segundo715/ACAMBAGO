import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Business, Product, Coupon, Review } from "@/types";
import StarRating from "@/components/business/StarRating";
import CouponCard from "@/components/coupons/CouponCard";
import ReviewSection from "./ReviewSection";
import { MapPin, Phone, Tag, Package } from "lucide-react";

export const revalidate = 30;

async function getData(id: string) {
  const supabase = await createClient();

  const [bizRes, productsRes, couponsRes, reviewsRes] = await Promise.all([
    supabase.from("businesses").select("*").eq("id", id).eq("is_approved", true).single(),
    supabase.from("products").select("*").eq("business_id", id).eq("is_available", true),
    supabase.from("coupons").select("*").eq("business_id", id).eq("is_active", true),
    supabase
      .from("reviews")
      .select("*, profiles(name, avatar_url)")
      .eq("business_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (bizRes.error || !bizRes.data) notFound();

  return {
    business: bizRes.data as Business,
    products: (productsRes.data ?? []) as Product[],
    coupons: (couponsRes.data ?? []) as Coupon[],
    reviews: (reviewsRes.data ?? []) as Review[],
  };
}

export default async function BusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { business, products, coupons, reviews } = await getData(id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="card mb-6 overflow-visible">
        <div className="relative h-52 bg-gradient-to-br from-brand-100 to-brand-200 rounded-t-2xl overflow-hidden">
          {business.banner_url ? (
            <Image src={business.banner_url} alt="Banner" fill className="object-cover" />
          ) : business.image_url ? (
            <Image src={business.image_url} alt={business.name} fill className="object-cover opacity-40" />
          ) : null}
        </div>
        <div className="px-6 pb-6 -mt-10 relative">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-lg border-2 border-white overflow-hidden flex items-center justify-center text-4xl">
            {business.image_url ? (
              <Image src={business.image_url} alt={business.name} fill className="object-cover" />
            ) : (
              "🏪"
            )}
          </div>
          <div className="mt-3">
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
                  href={`https://wa.me/52${business.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Phone className="w-4 h-4" />
                  WhatsApp
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Products */}
          {products.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-600" />
                Productos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((p) => (
                  <div key={p.id} className="card flex gap-3 p-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {p.image_url ? (
                        <Image src={p.image_url} alt={p.name} width={64} height={64} className="object-cover w-full h-full" />
                      ) : (
                        <Package className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{p.description}</p>
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
          <ReviewSection businessId={business.id} initialReviews={reviews} />
        </div>

        {/* Sidebar: Coupons */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            🎟️ Cupones disponibles
          </h2>
          {coupons.length === 0 ? (
            <div className="card p-6 text-center text-gray-500 text-sm">
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
