"use client";

import dynamic from "next/dynamic";
import { Business } from "@/types";

// Google Maps (requiere NEXT_PUBLIC_GOOGLE_MAPS_KEY)
const BusinessMapGoogle = dynamic(() => import("./BusinessMapGoogle"), { ssr: false });

// Fallback: OpenStreetMap/Leaflet (sin key, siempre disponible)
const BusinessMapLeaflet = dynamic(() => import("./BusinessMap"), { ssr: false });

interface Props {
  businesses: Business[];
}

export default function MapWrapper({ businesses }: Props) {
  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";
  const useGoogle = !!googleKey && googleKey.startsWith("AIza");

  return (
    <div className="h-full w-full">
      {useGoogle ? (
        <BusinessMapGoogle businesses={businesses} apiKey={googleKey} />
      ) : (
        <BusinessMapLeaflet businesses={businesses} />
      )}
    </div>
  );
}
