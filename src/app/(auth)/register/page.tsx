"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, User, Store, Eye, EyeOff } from "lucide-react";
import { BUSINESS_CATEGORIES } from "@/types";
import toast from "react-hot-toast";

function RegisterForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "business" ? "business" : "client";
  const [role, setRole] = useState<"client" | "business">(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
        emailRedirectTo: `${location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Cuenta creada. Revisa tu correo para confirmar.");
    router.push("/login");
  };

  return (
    <div className="card p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Crear cuenta</h1>
      <p className="text-gray-500 text-sm mb-6">Únete a AcambaGo gratis</p>

      {/* Role selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setRole("client")}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
            role === "client"
              ? "border-brand-600 bg-brand-50 text-brand-700"
              : "border-gray-200 text-gray-500 hover:border-gray-300"
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-sm font-medium">Soy cliente</span>
        </button>
        <button
          type="button"
          onClick={() => setRole("business")}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
            role === "business"
              ? "border-brand-600 bg-brand-50 text-brand-700"
              : "border-gray-200 text-gray-500 hover:border-gray-300"
          }`}
        >
          <Store className="w-6 h-6" />
          <span className="text-sm font-medium">Tengo un negocio</span>
        </button>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="label">
            {role === "business" ? "Nombre del negocio" : "Tu nombre completo"}
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input pl-10"
              placeholder={role === "business" ? "Ej: Taquería El Charro" : "Juan Pérez"}
            />
          </div>
        </div>

        <div>
          <label className="label">Correo electrónico</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-10"
              placeholder="tu@email.com"
            />
          </div>
        </div>

        <div>
          <label className="label">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPw ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-10 pr-10"
              placeholder="Mínimo 6 caracteres"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-brand-600 font-medium hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="card p-8 animate-pulse h-96" />}>
      <RegisterForm />
    </Suspense>
  );
}
