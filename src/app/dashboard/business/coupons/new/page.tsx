"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/client";
import { generateCouponCode } from "@/lib/utils";
import { QRPayload } from "@/types";
import { ArrowLeft, Ticket } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { loadOwnedBusinesses } from "@/lib/current-business";
import CouponForm, { CouponFormValues } from "../CouponForm";

export default function NewCouponPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const supabase = createClient();

  const handleSubmit = async (values: CouponFormValues) => {
    if (!isLoaded || !user) { toast.error("No autorizado"); return; }

    const { active: biz } = await loadOwnedBusinesses(supabase, user.id);
    if (!biz) { toast.error("No tienes un negocio registrado"); return; }

    const code = generateCouponCode();
    const payload: QRPayload = { coupon_code: code, business_id: biz.id };
    const qr_data = JSON.stringify(payload);

    const { error } = await supabase.from("coupons").insert({
      business_id: biz.id,
      title: values.title,
      description: values.description,
      discount_type: values.discountType,
      value: parseFloat(values.value),
      code,
      qr_data,
      limit_count: values.limitCount ? parseInt(values.limitCount) : null,
      expires_at: values.expiresAt || null,
      is_active: true,
    });

    if (error) {
      toast.error("Error al crear el cupón");
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

      <CouponForm submitLabel="Crear cupón con QR" savingLabel="Creando..." onSubmit={handleSubmit} />
    </div>
  );
}
