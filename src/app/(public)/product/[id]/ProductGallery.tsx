"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(0);

  // Movimiento automático, igual que el carrusel de "Productos", sin flechas.
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setSelected((s) => (s + 1) % images.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${selected * 100}%)` }}
        >
          {images.map((img, i) => (
            <div key={i} className="relative w-full h-full flex-shrink-0">
              <Image
                src={img}
                alt={`${name} - imagen ${i + 1}`}
                fill
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`h-2 rounded-full transition-all ${i === selected ? "bg-white w-5" : "bg-white/50 w-2"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                i === selected
                  ? "border-brand-500 opacity-100 shadow-sm"
                  : "border-slate-200 dark:border-white/10 opacity-55 hover:opacity-100"
              }`}
            >
              <Image src={img} alt={`${name} - ${i + 1}`} width={64} height={64} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
