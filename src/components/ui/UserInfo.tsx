"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Store, User, ChevronDown, Plus } from "lucide-react";
import { getDemoMode, DEMO_BUYER, DEMO_SELLER } from "@/lib/demo-mode";
import { loadOwnedBusinesses, setCurrentBusinessId } from "@/lib/current-business";
import { Business } from "@/types";
import ShareButton from "@/components/ui/ShareButton";
import AccountModeSwitcher from "@/components/ui/AccountModeSwitcher";

export default function UserInfo() {
  const { user, isLoaded } = useUser();
  const [name, setName] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState<"buyer" | "seller" | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<{ id?: string; name: string } | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Si ya hay una sesion real de Clerk, ignora la cookie de demo por
    // completo — no debe tapar la identidad real del usuario logueado.
    if (!isLoaded) return;
    const mode = user ? null : getDemoMode();
    setDemoMode(mode);
    if (mode === "buyer") {
      setName(DEMO_BUYER.name);
      setRole("client");
    } else if (mode === "seller") {
      setName(DEMO_SELLER.name);
      setActiveBusiness({ name: DEMO_SELLER.businessName });
      setRole("business");
    }
  }, [isLoaded, user]);

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
        const { businesses: owned, active } = await loadOwnedBusinesses(supabase, user.id);
        setBusinesses(owned);
        setActiveBusiness(active);
      }
    };
    load();
  }, [isLoaded, user?.id, demoMode]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const switchTo = (id: string) => {
    setCurrentBusinessId(id);
    window.location.reload();
  };

  if (!name) return null;

  const hasMultiple = businesses.length > 1;

  const canPreviewStore = role === "business" && !!activeBusiness?.id;

  return (
    <div ref={containerRef} className="relative px-3 py-3 border-b border-slate-200 dark:border-white/10">
      <div className="flex items-center gap-3">
        {canPreviewStore ? (
          <Link
            href={`/business/${activeBusiness!.id}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Ver mi tienda como la ven los clientes"
            className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center flex-shrink-0 hover:bg-brand-200 dark:hover:bg-brand-500/30 transition-colors"
          >
            <Store className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </Link>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center flex-shrink-0">
            {role === "business"
              ? <Store className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              : <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            }
          </div>
        )}

        <button
          type="button"
          onClick={() => hasMultiple && setOpen((o) => !o)}
          className={`min-w-0 flex-1 flex items-center gap-1.5 ${hasMultiple ? "cursor-pointer" : "cursor-default"}`}
        >
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {activeBusiness?.name ?? name}
            </p>
            {activeBusiness && (
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{name}</p>
            )}
          </div>
          {hasMultiple && (
            <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
          )}
        </button>
      </div>

      {role === "business" && (
        <div className="mt-2">
          <AccountModeSwitcher compact />
        </div>
      )}

      {canPreviewStore && (
        <ShareButton
          businessName={activeBusiness!.name}
          url={typeof window !== "undefined" ? `${window.location.origin}/business/${activeBusiness!.id}` : undefined}
          label="Compartir mi tienda"
          className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        />
      )}

      {open && hasMultiple && (
        <div className="absolute left-3 right-3 top-full mt-1 z-50 bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden">
          {businesses.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => switchTo(b.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${
                b.id === activeBusiness?.id ? "font-semibold text-brand-600 dark:text-brand-400" : "text-slate-700 dark:text-slate-300"
              }`}
            >
              <Store className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{b.name}</span>
            </button>
          ))}
          <Link
            href="/perfil/crear-tienda"
            className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm text-brand-600 dark:text-brand-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-t border-slate-100 dark:border-white/10"
          >
            <Plus className="w-3.5 h-3.5 flex-shrink-0" />
            Agregar otra tienda
          </Link>
        </div>
      )}
    </div>
  );
}
