import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();
    const { name, description, category, address, latitude, longitude, whatsapp } = body;

    if (!name || !category || !address) {
      return NextResponse.json({ error: "Nombre, categoría y dirección son requeridos" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("businesses")
      .insert({
        owner_id: userId,
        name,
        description,
        category,
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        whatsapp,
        is_approved: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update profile role to business
    await supabase.from("profiles").update({ role: "business" }).eq("id", userId);

    return NextResponse.json({ business: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
