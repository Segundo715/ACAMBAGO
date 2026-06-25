"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/client";

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

  useEffect(() => {
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
  }, [isLoaded, user?.id]);

  return {
    userId: user?.id ?? null,
    name,
    role,
    loading: !isLoaded || !profileLoaded,
  };
}
