import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Business } from "@/types";
import AdminApproveButton from "./AdminApproveButton";
import { CheckCircle, XCircle, Store, Users } from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const [pendingRes, approvedRes, usersRes] = await Promise.all([
    supabase.from("businesses").select("*, profiles(name)").eq("is_approved", false).order("created_at", { ascending: false }),
    supabase.from("businesses").select("id", { count: "exact" }).eq("is_approved", true),
    supabase.from("profiles").select("id", { count: "exact" }),
  ]);

  const pending = (pendingRes.data ?? []) as (Business & { profiles: { name: string } })[];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel Admin</h1>
            <p className="text-gray-500 text-sm">AcambaGo — Control total</p>
          </div>
          <Link href="/" className="btn-secondary text-sm">Ver sitio</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card p-5">
            <div className="w-9 h-9 bg-yellow-50 rounded-xl flex items-center justify-center mb-2">
              <Store className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{pending.length}</p>
            <p className="text-sm text-gray-500">Pendientes de aprobación</p>
          </div>
          <div className="card p-5">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{approvedRes.count ?? 0}</p>
            <p className="text-sm text-gray-500">Negocios aprobados</p>
          </div>
          <div className="card p-5">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{usersRes.count ?? 0}</p>
            <p className="text-sm text-gray-500">Usuarios registrados</p>
          </div>
        </div>

        {/* Pending businesses */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Negocios pendientes de aprobación</h2>
          {pending.length === 0 ? (
            <div className="card p-8 text-center">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p className="text-gray-500">Todo al día, sin pendientes.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((b) => (
                <div key={b.id} className="card p-5 flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-gray-900">{b.name}</p>
                    <p className="text-sm text-gray-500">{b.category} · {b.address}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Dueño: {b.profiles?.name}</p>
                  </div>
                  <AdminApproveButton businessId={b.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
