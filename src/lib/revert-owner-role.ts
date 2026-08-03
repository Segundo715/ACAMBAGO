import { createClient } from "@/lib/supabase/client";

// Al rechazar/eliminar un negocio desde el admin, si esa era la unica
// tienda del dueño, su rol se queda atorado en "business" para siempre
// (sin ningun negocio real detras) porque nada mas lo revertia. Se llama
// justo despues de borrar el negocio para que el rol vuelva a "client"
// cuando ya no le queda ninguna tienda.
export async function revertRoleIfNoBusinesses(supabase: ReturnType<typeof createClient>, ownerId: string) {
  const { count } = await supabase
    .from("businesses")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId);
  if (!count) {
    await supabase.from("profiles").update({ role: "client" }).eq("id", ownerId);
  }
}
