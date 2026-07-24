"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Business, BUSINESS_CATEGORIES } from "@/types";
import { Settings, MapPin, Save, Upload, LocateFixed, CreditCard, CheckCircle2, Plus } from "lucide-react";
import { loadOwnedBusinesses } from "@/lib/current-business";
import CategorySelect from "@/components/ui/CategorySelect";
import toast from "react-hot-toast";

function SettingsContent() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const [business, setBusiness] = useState<Partial<Business>>({});
  const [loading, setLoading] = useState(true);
  const [noBusiness, setNoBusiness] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [locating, setLocating] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const supabase = createClient();

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalización");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusiness((prev) => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        setLocating(false);
        toast.success("Ubicación detectada");
      },
      () => {
        setLocating(false);
        toast.error("No se pudo obtener tu ubicación. Revisa los permisos del navegador.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (!isLoaded || !user) return;
    const load = async () => {
      const { active } = await loadOwnedBusinesses(supabase, user.id);
      if (active) {
        setBusiness(active);
      } else {
        setNoBusiness(true);
      }
      setLoading(false);
    };
    load();
  }, [isLoaded, user?.id]);

  useEffect(() => {
    const returnBusinessId = searchParams.get("business_id");
    if (!user || !searchParams.get("stripe_return") || !returnBusinessId) return;
    fetch(`/api/stripe/connect?business_id=${returnBusinessId}`).then((res) => res.json()).then((data) => {
      if (data.chargesEnabled) {
        toast.success("¡Stripe conectado! Ya puedes recibir pagos con tarjeta.");
        setBusiness((prev) => ({ ...prev, stripe_charges_enabled: true }));
      } else if (data.connected) {
        toast.error("Stripe aún no terminó de verificar tu cuenta. Completa el proceso para poder recibir pagos.");
      }
    });
  }, [user, searchParams]);

  const handleConnectStripe = async () => {
    if (!business.id) return;
    setConnectingStripe(true);
    const res = await fetch("/api/stripe/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business_id: business.id }),
    });
    const data = await res.json();
    if (!res.ok || !data.url) {
      toast.error("No se pudo iniciar la conexión con Stripe.");
      setConnectingStripe(false);
      return;
    }
    window.location.href = data.url;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const mpPublicKey = business.mp_public_key?.trim() || "";
    const mpAccessToken = business.mp_access_token?.trim() || "";
    if ((mpPublicKey && !mpAccessToken) || (!mpPublicKey && mpAccessToken)) {
      toast.error("Para usar Mercado Pago necesitas llenar Public Key y Access Token, los dos.");
      return;
    }

    setSaving(true);

    let image_url = business.image_url;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("business-images").upload(path, imageFile, { upsert: true });
      if (!uploadErr) {
        const { data: { publicUrl } } = supabase.storage.from("business-images").getPublicUrl(path);
        image_url = publicUrl;
      }
    }

    const payload = {
      name: business.name!,
      description: business.description,
      category: business.category!,
      address: business.address!,
      latitude: business.latitude,
      longitude: business.longitude,
      whatsapp: business.whatsapp,
      image_url,
      bank_name: business.bank_name || null,
      bank_holder: business.bank_holder || null,
      bank_clabe: business.bank_clabe || null,
      mp_public_key: business.mp_public_key || null,
      mp_access_token: business.mp_access_token || null,
    };

    const { error } = await supabase.from("businesses").update(payload).eq("id", business.id);
    if (!error) {
      toast.success("Cambios guardados");
    } else {
      toast.error("Error al guardar: " + error.message);
    }

    setSaving(false);
  };

  const update = (key: keyof Business, val: string | number) =>
    setBusiness((prev) => ({ ...prev, [key]: val }));

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map((i) => <div key={i} className="h-12 bg-slate-100 dark:bg-white/5 rounded-xl" />)}</div>;

  if (noBusiness) {
    return (
      <div className="max-w-2xl text-center py-12 space-y-3">
        <Settings className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
        <p className="text-slate-500 dark:text-slate-400">No encontramos ninguna tienda tuya todavía.</p>
        <Link href="/perfil/crear-tienda" className="btn-primary inline-flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Crear tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 dark:bg-white/10 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configuración del negocio</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Actualiza la información de tu negocio</p>
          </div>
        </div>
        <Link href="/perfil/crear-tienda" className="btn-secondary flex items-center gap-2 text-sm flex-shrink-0">
          <Plus className="w-4 h-4" /> Agregar otra tienda
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Información general</h2>

          <div>
            <label className="label">Nombre del negocio *</label>
            <input required value={business.name ?? ""} onChange={(e) => update("name", e.target.value)} className="input" placeholder="Ej: Taquería El Charro" />
          </div>

          <div>
            <label className="label">Descripción</label>
            <textarea value={business.description ?? ""} onChange={(e) => update("description", e.target.value)} className="input resize-none" rows={3} placeholder="Cuéntales a los clientes qué ofreces..." />
          </div>

          <div>
            <label className="label">Categoría *</label>
            <CategorySelect
              value={business.category ?? BUSINESS_CATEGORIES[0]}
              onChange={(c) => update("category", c)}
              options={BUSINESS_CATEGORIES}
            />
          </div>

          <div>
            <label className="label">Dirección *</label>
            <input required value={business.address ?? ""} onChange={(e) => update("address", e.target.value)} className="input" placeholder="Calle, colonia, Acámbaro, Gto." />
          </div>

          <div>
            <label className="label">WhatsApp (sin +52)</label>
            <input type="tel" value={business.whatsapp ?? ""} onChange={(e) => update("whatsapp", e.target.value)} className="input" placeholder="4181234567" />
          </div>

          <div>
            <label className="label">Foto del negocio</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer btn-secondary text-sm">
                <Upload className="w-4 h-4" />
                Subir imagen
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} className="hidden" />
              </label>
              {(imageFile || business.image_url) && (
                <span className="text-xs text-green-600">✓ {imageFile ? imageFile.name : "Imagen actual"}</span>
              )}
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600" />
            Ubicación en el mapa
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Para que tu negocio aparezca en el mapa, usa tu ubicación actual (párate en tu negocio y da clic).
          </p>
          <button
            type="button"
            onClick={handleUseLocation}
            disabled={locating}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
          >
            {locating ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Detectando ubicación...</>
            ) : (
              <><LocateFixed className="w-4 h-4" /> Usar mi ubicación actual</>
            )}
          </button>
          {business.latitude != null && business.longitude != null && (
            <p className="text-xs text-green-600 dark:text-green-400 text-center">
              ✓ Ubicación guardada: {business.latitude.toFixed(5)}, {business.longitude.toFixed(5)}
            </p>
          )}
          <details className="text-xs text-slate-400 dark:text-slate-500">
            <summary className="cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">¿Prefieres poner las coordenadas a mano?</summary>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="label">Latitud</label>
                <input type="number" step="any" value={business.latitude ?? ""} onChange={(e) => update("latitude", parseFloat(e.target.value))} className="input" placeholder="20.0319" />
              </div>
              <div>
                <label className="label">Longitud</label>
                <input type="number" step="any" value={business.longitude ?? ""} onChange={(e) => update("longitude", parseFloat(e.target.value))} className="input" placeholder="-100.7273" />
              </div>
            </div>
          </details>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Datos bancarios (opcional)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Si los llenas, tus clientes podrán pagarte por transferencia directo en el checkout, con tu cuenta real.
          </p>
          <div>
            <label className="label">Banco</label>
            <input value={business.bank_name ?? ""} onChange={(e) => update("bank_name", e.target.value)} className="input" placeholder="Ej: BBVA" />
          </div>
          <div>
            <label className="label">Titular de la cuenta</label>
            <input value={business.bank_holder ?? ""} onChange={(e) => update("bank_holder", e.target.value)} className="input" placeholder="Nombre del titular" />
          </div>
          <div>
            <label className="label">CLABE interbancaria</label>
            <input value={business.bank_clabe ?? ""} onChange={(e) => update("bank_clabe", e.target.value)} className="input" placeholder="18 dígitos" maxLength={18} />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white">Mercado Pago (opcional)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Si las llenas, tus clientes podrán pagarte con tarjeta, OXXO o SPEI directo en el checkout, y el dinero cae en tu propia cuenta de Mercado Pago, no en la de AcambaGo. Consigue tus llaves en{" "}
            <a href="https://www.mercadopago.com.mx/developers/es/docs/your-integrations/credentials" target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 underline">
              mercadopago.com.mx → Tus integraciones → Credenciales
            </a>.
          </p>
          <div>
            <label className="label">Public Key</label>
            <input value={business.mp_public_key ?? ""} onChange={(e) => update("mp_public_key", e.target.value)} className="input" placeholder="APP_USR-..." />
          </div>
          <div>
            <label className="label">Access Token</label>
            <input type="password" value={business.mp_access_token ?? ""} onChange={(e) => update("mp_access_token", e.target.value)} className="input" placeholder="APP_USR-..." />
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Usa tus llaves de <strong>producción</strong> (empiezan con <code>APP_USR-</code>). Las de prueba (<code>TEST-...</code>) no van a cobrar dinero real y AcambaGo no puede detectar la diferencia automáticamente.
          </p>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand-600" />
            Stripe (opcional)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Conecta tu propia cuenta de Stripe para recibir pagos con tarjeta directo en el checkout. El dinero cae en tu cuenta, no en la de AcambaGo. Stripe te pedirá datos de identidad y de tu cuenta bancaria (proceso de Stripe, no de AcambaGo).
          </p>
          {business.stripe_charges_enabled ? (
            <div className="flex items-center gap-2 p-2.5 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/20">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-xs text-green-700 dark:text-green-300">Stripe conectado y listo para recibir pagos.</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConnectStripe}
              disabled={connectingStripe}
              className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
            >
              {connectingStripe ? "Conectando..." : business.stripe_account_id ? "Continuar verificación de Stripe" : "Conectar con Stripe"}
            </button>
          )}
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}
