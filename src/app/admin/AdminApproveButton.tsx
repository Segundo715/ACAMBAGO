"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminApproveButton({ businessId }: { businessId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleApprove = async () => {
    setLoading(true);
    const { error } = await supabase.from("businesses").update({ is_approved: true }).eq("id", businessId);
    if (!error) {
      toast.success("Negocio aprobado");
      router.refresh();
    } else {
      toast.error("Error al aprobar");
    }
    setLoading(false);
  };

  const handleReject = async () => {
    if (!confirm("¿Rechazar y eliminar este negocio?")) return;
    setLoading(true);
    await supabase.from("businesses").delete().eq("id", businessId);
    toast.success("Negocio rechazado");
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleApprove}
        disabled={loading}
        className="flex items-center gap-1.5 text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 px-3 py-2 rounded-xl transition-colors"
      >
        <CheckCircle className="w-4 h-4" />
        Aprobar
      </button>
      <button
        onClick={handleReject}
        disabled={loading}
        className="flex items-center gap-1.5 text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors"
      >
        <XCircle className="w-4 h-4" />
        Rechazar
      </button>
    </div>
  );
}
