"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/client";
import { Store, User } from "lucide-react";
import { getDemoMode, DEMO_BUYER, DEMO_SELLER } from "@/lib/demo-mode";

export default function UserInfo() {
  const { user, isLoaded } = useUser();
  const [name, setName] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState<"buyer" | "seller" | null>(null);

  useEffect(() => {
    const mode = getDemoMode();
    setDemoMode(mode);
    if (mode === "buyer") {
      setName(DEMO_BUYER.name);
      setRole("client");
    } else if (mode === "seller") {
      setName(DEMO_SELLER.name);
      setBusinessName(DEMO_SELLER.businessName);
      setRole("business");
    }
  }, []);

  useEffect(() => {
    if (demoMode || !isLoaded || !user) return;

    const supabase = createClient();
    const load = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, role")
        .eq("id", user.id)
        .single();

      const profileName = profile?.name ?? user.fullName ?? user.firstName ?? null;
      const profileRole = profile?.role ?? "client";
      setName(profileName);
      setRole(profileRole);

      if (profileRole === "business") {
        const { data: biz } = await supabase
          .from("businesses")
          .select("name")
          .eq("owner_id", user.id)
          .single();
        if (biz) setBusinessName(biz.name);
      }
    };
    load();
  }, [isLoaded, user?.id, demoMode]);

  if (!name) return null;

  return (
    <div className="px-3 py-3 border-b border-slate-200 dark:border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center flex-shrink-0">
          {role === "business"
            ? <Store className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            : <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          }
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {businessName ?? name}
          </p>
          {businessName && (
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{name}</p>
          )}
        </div>
      </div>
    </div>
  );
}
