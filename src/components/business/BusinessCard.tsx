import Link from "next/link";
import Image from "next/image";
import { Business } from "@/types";
import { MapPin, Star, Tag } from "lucide-react";

interface Props {
  business: Business;
}

export default function BusinessCard({ business }: Props) {
  const demoSlugs: Record<string, string> = {
    "demo": "/business/demo",
    "demo-lavado": "/business/demo-lavado",
    "demo-cerrajero": "/business/demo-cerrajero",
    "demo-pintor": "/business/demo-pintor",
  };
  const href = demoSlugs[business.id] ?? `/business/${business.id}`;
  return (
    <Link href={href}>
      <div className="card hover:shadow-md transition-all duration-200 group cursor-pointer">
        {/* Image */}
        <div className="relative h-44 bg-gradient-to-br from-brand-100 to-brand-200 overflow-hidden">
          {business.image_url ? (
            <Image
              src={business.image_url}
              alt={business.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl">🏪</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="badge bg-white text-gray-700 shadow-sm">
              <Tag className="w-3 h-3 mr-1" />
              {business.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-lg group-hover:text-brand-600 transition-colors line-clamp-1">
            {business.name}
          </h3>
          {business.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{business.description}</p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-brand-500" />
              <span className="truncate max-w-[140px]">{business.address}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium text-gray-700">
                {business.rating_avg > 0
                  ? Number(business.rating_avg).toFixed(1)
                  : "Nuevo"}
              </span>
              {business.rating_count > 0 && (
                <span className="text-xs text-gray-400">({business.rating_count})</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
