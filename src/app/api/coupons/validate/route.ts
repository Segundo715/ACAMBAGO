import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isCouponValid } from "@/lib/utils";
import { QRPayload } from "@/types";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const supabase = await createClient();

    // Parse QR data
    let payload: QRPayload;
    try {
      payload = typeof body.qr_data === "string" ? JSON.parse(body.qr_data) : body.qr_data;
    } catch {
      return NextResponse.json({ error: "QR inválido" }, { status: 400 });
    }

    const { coupon_code, business_id } = payload;

    if (!coupon_code || !business_id) {
      return NextResponse.json({ error: "Datos del QR incompletos" }, { status: 400 });
    }

    // Verify the scanner owns the business
    const { data: business } = await supabase
      .from("businesses")
      .select("id, owner_id, name")
      .eq("id", business_id)
      .eq("owner_id", userId)
      .single();

    if (!business) {
      return NextResponse.json({ error: "No tienes permiso para canjear cupones de este negocio" }, { status: 403 });
    }

    // Get coupon
    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", coupon_code)
      .eq("business_id", business_id)
      .single();

    if (!coupon) {
      return NextResponse.json({ error: "Cupón no encontrado" }, { status: 404 });
    }

    // Validate coupon
    const validation = isCouponValid(coupon);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    // Check if already redeemed by this user (optional, if user_id passed)
    const user_id = body.user_id;
    if (user_id) {
      const { data: existing } = await supabase
        .from("coupon_redemptions")
        .select("id")
        .eq("coupon_id", coupon.id)
        .eq("user_id", user_id)
        .single();

      if (existing) {
        return NextResponse.json({ error: "Este usuario ya canjeó este cupón" }, { status: 400 });
      }
    }

    // Register redemption + increment used_count
    const [{ error: redemptionError }, { error: updateError }] = await Promise.all([
      supabase.from("coupon_redemptions").insert({
        coupon_id: coupon.id,
        user_id: user_id ?? null,
        business_id,
        redeemed_at: new Date().toISOString(),
      }),
      supabase
        .from("coupons")
        .update({ used_count: coupon.used_count + 1 })
        .eq("id", coupon.id),
    ]);

    if (redemptionError || updateError) {
      return NextResponse.json({ error: "Error al procesar la redención" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Cupón canjeado exitosamente",
      coupon: {
        title: coupon.title,
        discount_type: coupon.discount_type,
        value: coupon.value,
        code: coupon.code,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
