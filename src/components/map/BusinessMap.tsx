"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { Business } from "@/types";
import "leaflet/dist/leaflet.css";

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Props {
  businesses: Business[];
  center?: [number, number];
  zoom?: number;
}

// Acámbaro coordinates
const ACAMBARO_CENTER: [number, number] = [20.0319, -100.7273];

function FitBounds({ businesses }: { businesses: Business[] }) {
  const map = useMap();
  useEffect(() => {
    const valid = businesses.filter((b) => b.latitude && b.longitude);
    if (valid.length > 0) {
      const bounds = L.latLngBounds(valid.map((b) => [b.latitude!, b.longitude!]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [businesses, map]);
  return null;
}

export default function BusinessMap({
  businesses,
  center = ACAMBARO_CENTER,
  zoom = 14,
}: Props) {
  const withCoords = businesses.filter((b) => b.latitude && b.longitude);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-full w-full rounded-xl"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {withCoords.length > 1 && <FitBounds businesses={withCoords} />}
      {withCoords.map((business) => (
        <Marker
          key={business.id}
          position={[business.latitude!, business.longitude!]}
          icon={customIcon}
        >
          <Popup>
            <div className="min-w-[160px]">
              <p className="font-semibold text-gray-900 text-sm">{business.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{business.category}</p>
              <p className="text-xs text-gray-500 mt-0.5">⭐ {Number(business.rating_avg).toFixed(1)}</p>
              <Link
                href={business.id.startsWith("demo") ? `/business/${business.id}` : `/business/${business.id}`}
                className="inline-block mt-2 text-xs font-medium text-brand-600 hover:underline"
              >
                Ver negocio →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
