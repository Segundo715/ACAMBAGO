"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, Store, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error("Credenciales incorrectas");
      setLoading(false);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
    toast.success("Bienvenido");
    if (profile?.role === "business") router.push("/dashboard/business");
    else if (profile?.role === "admin") router.push("/admin");
    else router.push("/");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido a AcambaGo</h1>
        <p className="text-gray-500 text-sm mt-1">Elige cómo quieres entrar</p>
      </div>

      {/* Quick access demo buttons */}
      <Link href="/" className="card block p-5 hover:shadow-md transition-all group border-2 border-transparent hover:border-blue-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900">Explorar como Cliente</p>
            <p className="text-gray-500 text-xs mt-0.5">Descubre negocios, productos y servicios</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </Link>

      <Link href="/dashboard/business" className="card block p-5 hover:shadow-md transition-all group border-2 border-transparent hover:border-brand-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange-100 transition-colors">
            <Store className="w-6 h-6 text-brand-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900">Panel de Negocio</p>
            <p className="text-gray-500 text-xs mt-0.5">Gestiona productos, cupones y estadísticas</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors" />
        </div>
      </Link>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
        <div className="relative flex justify-center">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-white px-3 text-xs text-gray-400 hover:text-brand-600 transition-colors"
          >
            {showForm ? "Ocultar formulario" : "Iniciar sesión con cuenta"}
          </button>
        </div>
      </div>

      {/* Login form */}
      {showForm && (
        <form onSubmit={handleLogin} className="card p-5 space-y-4">
          <div>
            <label className="label">Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10" placeholder="tu@email.com" />
            </div>
          </div>
          <div>
            <label className="label">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type={showPw ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10 pr-10" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-gray-500 pt-2">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="text-brand-600 font-semibold hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </div>
  );
}
