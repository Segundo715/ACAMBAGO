import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

// Mercado Pago llama esta URL server-to-server cuando cambia el estado de un
// pago (aprobado, rechazado, pendiente). No hay sesión de usuario aquí: la
// autenticidad se basa en volver a consultar el pago directo con el Access
// Token, nunca se confía en los datos del body tal cual llegan.
export async function POST(request: Request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: "Mercado Pago no está configurado" }, { status: 503 });
    }

    const body = await request.json();
    const paymentId = body?.data?.id;
    if (!paymentId || body?.type !== "payment") {
      return NextResponse.json({ ok: true });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const payment = await new Payment(client).get({ id: paymentId });

    const orderId = payment.external_reference;
    if (!orderId) {
      return NextResponse.json({ ok: true });
    }

    const paymentStatus =
      payment.status === "approved" ? "pagado" :
      payment.status === "rejected" ? "fallido" :
      "pendiente";

    const supabase = await createClient();
    await supabase
      .from("orders")
      .update({ payment_status: paymentStatus, mp_payment_id: String(payment.id) })
      .eq("id", orderId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error procesando webhook de Mercado Pago:", err);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
