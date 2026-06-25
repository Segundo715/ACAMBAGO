"use client";

import Image from "next/image";
import Link from "next/link";
import { Tag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import AddToCartButton from "./AddToCartButton";

interface ReelItem {
  id: string;
  name: string;
  price: number;
  image: string;
  business_id: string;
  business_name: string;
  business_category: string;
}

export default function ProductsReel({ items }: { items: ReelItem[] }) {
  const doubled = [...items, ...items];

  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, white 8%, white 92%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, white 8%, white 92%, transparent)",
      }}
    >
      <div className="flex gap-5 w-max animate-reel hover:[animation-play-state:paused]">
        {doubled.map((item, i) => (
          <div
            key={`${item.id}-${i}`}
            className="w-56 flex-shrink-0 card group hover:shadow-md hover:border-brand-300 dark:hover:border-brand-500/40 dark:hover:bg-white/10 transition-all duration-200 relative"
          >
            {/* Enlace invisible que cubre toda la card excepto el botón */}
            <Link
              href={`/business/${item.business_id}`}
              className="absolute inset-0 z-0 rounded-2xl"
              aria-label={`Ver ${item.business_name}`}
            />

            <div className="relative h-44 bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/50 dark:to-brand-800/50 overflow-hidden">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center gap-1 bg-brand-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  <Tag className="w-3 h-3" />{item.business_category}
                </span>
              </div>
            </div>

            <div className="p-4">
              <p className="text-xs text-slate-500 dark:text-gray-500 mb-1 truncate">{item.business_name}</p>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug mb-2">{item.name}</h3>
              <p className="text-brand-600 dark:text-brand-400 font-bold text-base mb-3">{formatPrice(item.price)}</p>
              {/* z-10 para que el botón esté por encima del Link invisible */}
              <div className="relative z-10">
                <AddToCartButton
                  product={{ id: item.id, business_id: item.business_id, name: item.name, price: item.price }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
