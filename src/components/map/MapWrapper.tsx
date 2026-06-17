"use client";

import dynamic from "next/dynamic";
import { Business } from "@/types";

const BusinessMap = dynamic(() => import("./BusinessMap"), { ssr: false });

interface Props {
  businesses: Business[];
}

export default function MapWrapper({ businesses }: Props) {
  return <BusinessMap businesses={businesses} />;
}
