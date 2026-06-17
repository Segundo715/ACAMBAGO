import { createClient } from "@/lib/supabase/server";
import { Business } from "@/types";
import MapWrapper from "@/components/map/MapWrapper";

export const revalidate = 60;

export default async function MapPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("is_approved", true)
    .eq("is_active", true)
    .not("latitude", "is", null);

  const businesses = (data ?? []) as Business[];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="px-4 py-4 border-b border-gray-100 bg-white">
        <h1 className="text-xl font-bold text-gray-900">
          🗺️ Mapa de Negocios — Acámbaro
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {businesses.length} negocios en el mapa
        </p>
      </div>
      <div className="flex-1 p-4">
        <MapWrapper businesses={businesses} />
      </div>
    </div>
  );
}
