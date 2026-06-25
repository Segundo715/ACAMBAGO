"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, XCircle, PauseCircle, PlayCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  businessId: string;
  isApproved: boolean;
  isActive: boolean;
}

export default function AdminBusinessActions({ businessId, isApproved, isActive }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    try { await fn(); } finally { setLoading(false); }
  };

  const approve = () => run(async () => {
    const { error } = await supabase.from("businesses").update({ is_approved: true, is_active: true }).eq("id", businessId);
    if (!error) { toast.success("Negocio aprobado"); router.refresh(); }
    else toast.error("Error al aprobar");
  });

  const reject = () => run(async () => {
    if (!confirm("¿Rechazar y eliminar este negocio permanentemente?")) return;
    await supabase.from("businesses").delete().eq("id", businessId);
    toast.success("Negocio eliminado");
    router.refresh();
  });

  const toggleActive = () => run(async () => {
    const { error } = await supabase.from("businesses").update({ is_active: !isActive }).eq("id", businessId);
    if (!error) { toast.success(isActive ? "Negocio suspendido" : "Negocio reactivado"); router.refresh(); }
  });

  const deleteForever = () => run(async () => {
    if (!confirm("¿Eliminar este negocio permanentemente? Esta acción no se puede deshacer.")) return;
    await supabase.from("businesses").delete().eq("id", businessId);
    toast.success("Negocio eliminado");
    router.refresh();
  });

  return (
    <div className="flex gap-2 flex-wrap">
      {!isApproved ? (
        <>
          <button onClick={approve} disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20 border border-green-200 dark:border-green-500/30 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50">
            <CheckCircle className="w-3.5 h-3.5" /> Aprobar
          </button>
          <button onClick={reject} disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/30 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50">
            <XCircle className="w-3.5 h-3.5" /> Rechazar
          </button>
        </>
      ) : (
        <>
          <button onClick={toggleActive} disabled={loading}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border transition-colors disabled:opacity-50 ${
              isActive
                ? "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30 hover:bg-yellow-100"
                : "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30 hover:bg-green-100"
            }`}>
            {isActive
              ? <><PauseCircle className="w-3.5 h-3.5" /> Suspender</>
              : <><PlayCircle className="w-3.5 h-3.5" /> Reactivar</>
            }
          </button>
          <button onClick={deleteForever} disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/30 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50">
            <Trash2 className="w-3.5 h-3.5" /> Eliminar
          </button>
        </>
      )}
    </div>
  );
}
