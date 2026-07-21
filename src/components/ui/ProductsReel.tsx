"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import AddToCartButton from "./AddToCartButton";
import FavoriteButton from "./FavoriteButton";

interface ReelItem {
  id: string;
  name: string;
  price: number;
  image: string;
  business_id: string;
  business_name: string;
  business_category: string;
}

function ReelCard({ item }: { item: ReelItem }) {
  return (
    <div className="w-56 flex-shrink-0 card group hover:shadow-md hover:border-brand-300 dark:hover:border-brand-500/40 dark:hover:bg-white/10 transition-all duration-200 relative">
      {/* Enlace invisible que cubre toda la card excepto el botón */}
      <Link
        href={`/product/${item.id}`}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={`Ver ${item.name}`}
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
        <FavoriteButton productId={item.id} />
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
  );
}

// Con pocos productos, duplicarlos para el loop infinito se nota demasiado
// (el mismo producto aparece 2 veces en pantalla). Con este mínimo de
// productos, el scroll ya alcanza a disimular la repetición.
const MIN_ITEMS_FOR_LOOP = 5;

// Velocidad del auto-avance en px por frame (~60fps).
const AUTO_SCROLL_SPEED = 0.6;

export default function ProductsReel({ items }: { items: ReelItem[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);

  useEffect(() => {
    if (items.length < MIN_ITEMS_FOR_LOOP) return;
    const el = scrollerRef.current;
    if (!el) return;

    let rafId: number;
    const tick = () => {
      if (!pausedRef.current) {
        const half = el.scrollWidth / 2;
        el.scrollLeft += AUTO_SCROLL_SPEED;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [items.length]);

  if (items.length < MIN_ITEMS_FOR_LOOP) {
    return (
      <div className="flex gap-5 flex-wrap px-4">
        {items.map((item) => (
          <ReelCard key={item.id} item={item} />
        ))}
      </div>
    );
  }

  const doubled = [...items, ...items];

  // El toque en móvil usa el scroll nativo (con inercia); solo el mouse en
  // desktop necesita el arrastre manual, ya que overflow-x-auto no se puede
  // "jalar" con click sostenido por sí solo.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pausedRef.current = true;
    if (e.pointerType === "mouse" && scrollerRef.current) {
      draggingRef.current = true;
      dragStartX.current = e.clientX;
      dragStartScroll.current = scrollerRef.current.scrollLeft;
      scrollerRef.current.setPointerCapture(e.pointerId);
    }
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !scrollerRef.current) return;
    scrollerRef.current.scrollLeft = dragStartScroll.current - (e.clientX - dragStartX.current);
  };
  const endInteraction = () => {
    draggingRef.current = false;
    pausedRef.current = false;
  };

  return (
    <div
      ref={scrollerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endInteraction}
      onPointerLeave={endInteraction}
      onPointerCancel={endInteraction}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={endInteraction}
      className="overflow-x-auto cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, white 8%, white 92%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, white 8%, white 92%, transparent)",
      }}
    >
      <div className="flex gap-5 w-max">
        {doubled.map((item, i) => (
          <ReelCard key={`${item.id}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}
