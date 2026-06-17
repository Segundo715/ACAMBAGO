import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { business_id, rating, comment } = await request.json();

    if (!business_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({ business_id, user_id: user.id, rating, comment })
      .select("*, profiles(name)")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Ya dejaste una reseña" }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ review: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
