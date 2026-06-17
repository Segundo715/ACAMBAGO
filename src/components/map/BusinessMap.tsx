"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { Business } from "@/types";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
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

const ACAMBARO_CENTER: [number, number] = [20.0319, -100.7273];

export default function BusinessMap({ businesses, center = ACAMBARO_CENTER, zoom = 14 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Clave estable por montaje — fuerza recreación limpia en HMR
  const [mapKey] = useState(() => `map-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    return () => {
      if (containerRef.current) {
        const el = containerRef.current.querySelector(".leaflet-container") as any;
        if (el?._leaflet_id) delete el._leaflet_id;
      }
    };
  }, []);

  const withCoords = businesses.filter((b) => b.latitude && b.longitude);

  return (
    <div ref={containerRef} style={{ height: "100%", width: "100%" }}>
      <MapContainer
        key={mapKey}
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        className="rounded-xl"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
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
                  href={`/business/${business.id}`}
                  className="inline-block mt-2 text-xs font-medium text-brand-600 hover:underline"
                >
                  Ver negocio →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
