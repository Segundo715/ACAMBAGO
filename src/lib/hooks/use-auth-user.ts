"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/client";
import { getDemoMode, DEMO_BUYER, DEMO_SELLER } from "@/lib/demo-mode";

interface AuthUser {
  userId: string | null;
  name: string | null;
  role: string | null;
  loading: boolean;
}

export function useAuthUser(): AuthUser {
  const { user, isLoaded } = useUser();
  const [name, setName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [demoMode, setDemoMode] = useState<"buyer" | "seller" | null>(null);

  // Read demo cookie once on mount (client-only)
  useEffect(() => {
    const mode = getDemoMode();
    setDemoMode(mode);
    if (mode) setProfileLoaded(true);
  }, []);

  useEffect(() => {
    if (demoMode) return;
    if (!isLoaded) return;
    if (!user) {
      setName(null);
      setRole(null);
      setProfileLoaded(true);
      return;
    }
    const supabase = createClient();
    const load = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, role")
        .eq("id", user.id)
        .single();
      if (profile) {
        setName(profile.name);
        setRole(profile.role);
      } else {
        setName(user.fullName ?? user.firstName ?? user.emailAddresses[0]?.emailAddress ?? null);
        setRole("client");
      }
      setProfileLoaded(true);
    };
    load();
  }, [isLoaded, user?.id, demoMode]);

  if (demoMode === "buyer") {
    return { userId: DEMO_BUYER.userId, name: DEMO_BUYER.name, role: "client", loading: false };
  }
  if (demoMode === "seller") {
    return { userId: DEMO_SELLER.userId, name: DEMO_SELLER.businessName, role: "business", loading: false };
  }

  return { userId: user?.id ?? null, name, role, loading: !isLoaded || !profileLoaded };
}
