"use client";

import { Coupon } from "@/types";
import { formatDiscount } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { QRCodeSVG } from "qrcode.react";
import { Ticket, Calendar, Users } from "lucide-react";

interface Props {
  coupon: Coupon;
  showQR?: boolean;
}

export default function CouponCard({ coupon, showQR = false }: Props) {
  const isExpired = coupon.expires_at ? new Date(coupon.expires_at) < new Date() : false;
  const isFull = coupon.limit_count ? coupon.used_count >= coupon.limit_count : false;
  const isValid = coupon.is_active && !isExpired && !isFull;

  return (
    <div className={`card flex flex-col sm:flex-row overflow-hidden ${!isValid ? "opacity-60" : ""}`}>
      {/* Discount badge */}
      <div className="bg-brand-600 text-white flex flex-col items-center justify-center px-6 py-4 min-w-[120px]">
        <Ticket className="w-7 h-7 mb-1 opacity-80" />
        <span className="text-2xl font-bold">
          {coupon.discount_type === "percent" ? `${coupon.value}%` : `$${coupon.value}`}
        </span>
        <span className="text-xs opacity-80 uppercase tracking-wide">
          {coupon.discount_type === "percent" ? "descuento" : "de descuento"}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-900">{coupon.title}</h3>
            {coupon.description && (
              <p className="text-sm text-gray-500 mt-0.5">{coupon.description}</p>
            )}
          </div>
          <span className={`badge ${isValid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {isValid ? "Válido" : isExpired ? "Expirado" : isFull ? "Agotado" : "Inactivo"}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded font-medium text-gray-800">
              {coupon.code}
            </span>
          </div>
          {coupon.expires_at && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Vence: {format(new Date(coupon.expires_at), "dd/MM/yyyy", { locale: es })}
            </div>
          )}
          {coupon.limit_count && (
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {coupon.used_count}/{coupon.limit_count} usos
            </div>
          )}
        </div>
      </div>

      {/* QR */}
      {showQR && isValid && (
        <div className="flex items-center justify-center p-4 border-l border-dashed border-gray-200">
          <div className="flex flex-col items-center gap-1">
            <QRCodeSVG
              value={coupon.qr_data}
              size={80}
              bgColor="#ffffff"
              fgColor="#1f2937"
              level="M"
            />
            <span className="text-xs text-gray-400">Escanear en tienda</span>
          </div>
        </div>
      )}
    </div>
  );
}
