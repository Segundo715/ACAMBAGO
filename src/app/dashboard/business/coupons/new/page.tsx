"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/client";
import { generateCouponCode } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import { QRPayload } from "@/types";
import { ArrowLeft, Ticket, Download } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { loadOwnedBusinesses } from "@/lib/current-business";

export default function NewCouponPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [limitCount, setLimitCount] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<{ code: string; qr_data: string } | null>(null);
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const supabase = createClient();

  const generatePreview = () => {
    const code = generateCouponCode();
    setPreview({ code, qr_data: "" }); // will be filled on save
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (!isLoaded || !user) { toast.error("No autorizado"); setSaving(false); return; }

    const { active: biz } = await loadOwnedBusinesses(supabase, user.id);
    if (!biz) { toast.error("No tienes un negocio registrado"); setSaving(false); return; }

    const code = generateCouponCode();
    const payload: QRPayload = { coupon_code: code, business_id: biz.id };
    const qr_data = JSON.stringify(payload);

    const { error } = await supabase.from("coupons").insert({
      business_id: biz.id,
      title,
      description,
      discount_type: discountType,
      value: parseFloat(value),
      code,
      qr_data,
      limit_count: limitCount ? parseInt(limitCount) : null,
      expires_at: expiresAt || null,
      is_active: true,
    });

    if (error) {
      toast.error("Error al crear el cupón");
      setSaving(false);
      return;
    }

    toast.success("Cupón creado con QR generado");
    router.push("/dashboard/business/coupons");
  };

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/business/coupons" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver a cupones
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 rounded-xl flex items-center justify-center">
          <Ticket className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Crear cupón</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">Se generará un código QR automáticamente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Información del cupón</h2>

          <div>
            <label className="label">Título del cupón *</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Ej: 20% en toda la tienda" />
          </div>

          <div>
            <label className="label">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input resize-none" rows={2} placeholder="Condiciones o detalles del descuento" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo de descuento *</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value as "percent" | "fixed")} className="input">
                <option value="percent" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Porcentaje (%)</option>
                <option value="fixed" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Monto fijo ($)</option>
              </select>
            </div>
            <div>
              <label className="label">Valor *</label>
              <input required type="number" min="1" max={discountType === "percent" ? "100" : undefined} step={discountType === "percent" ? "1" : "0.01"} value={value} onChange={(e) => setValue(e.target.value)} className="input" placeholder={discountType === "percent" ? "20" : "50.00"} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Límite de usos</label>
              <input type="number" min="1" value={limitCount} onChange={(e) => setLimitCount(e.target.value)} className="input" placeholder="Sin límite" />
            </div>
            <div>
              <label className="label">Fecha de vencimiento</label>
              <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="input" min={new Date().toISOString().split("T")[0]} />
            </div>
          </div>
        </div>

        {/* Preview */}
        {title && value && (
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Vista previa del QR</h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="bg-brand-600 text-white rounded-2xl p-6 text-center">
                <p className="text-4xl font-bold">
                  {discountType === "percent" ? `${value}%` : `$${value}`}
                </p>
                <p className="text-sm opacity-80 mt-1">DESCUENTO</p>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
                {description && <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{description}</p>}
                <div className="mt-3 bg-gray-50 dark:bg-white/5 rounded-xl p-4 flex flex-col items-center gap-2">
                  <QRCodeSVG value={JSON.stringify({ coupon_code: "ACAM-PREVIEW", business_id: "preview" })} size={180} />
                  <p className="text-xs text-gray-400 dark:text-slate-500 font-mono">ACAM-XXXXXX</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500">Se generará al guardar</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
          {saving ? "Creando..." : (
            <>
              <Ticket className="w-4 h-4" />
              Crear cupón con QR
            </>
          )}
        </button>
      </form>
    </div>
  );
}
