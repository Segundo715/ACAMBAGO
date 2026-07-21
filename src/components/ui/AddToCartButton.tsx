"use client";

import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";

interface Props {
  product: {
    id: string;
    business_id: string;
    name: string;
    price: number;
    image_url?: string;
  };
  size?: "sm" | "md";
}

export default function AddToCartButton({ product, size = "md" }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (size === "sm") {
    return (
      <button
        onClick={handleAdd}
        className={`p-2 rounded-xl transition-all duration-200 ${
          added
            ? "bg-green-500 text-white"
            : "bg-brand-600 hover:bg-brand-700 text-white"
        }`}
        title="Agregar al carrito"
      >
        {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
        added
          ? "bg-green-500 text-white"
          : "bg-brand-600 hover:bg-brand-700 text-white"
      }`}
    >
      {added ? (
        <>
          <Check className="w-4 h-4" />
          Agregado
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4" />
          Agregar al carrito
        </>
      )}
    </button>
  );
}
