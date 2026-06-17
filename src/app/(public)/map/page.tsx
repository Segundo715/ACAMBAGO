import { Business } from "@/types";
import { DEMO_BUSINESSES } from "@/lib/demo-data";
import MapWrapper from "@/components/map/MapWrapper";

export const revalidate = 60;

async function getBusinesses(): Promise<Business[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (!url || url.includes("placeholder")) return [];
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("businesses")
      .select("*")
      .eq("is_approved", true)
      .eq("is_active", true)
      .not("latitude", "is", null);
    return (data ?? []) as Business[];
  } catch {
    return [];
  }
}

export default async function MapPage() {
  const supabaseBusinesses = await getBusinesses();
  const businesses: Business[] = [
    ...DEMO_BUSINESSES.filter((b) => b.latitude && b.longitude),
    ...supabaseBusinesses.filter((b) => !b.id.startsWith("demo")),
  ];

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
