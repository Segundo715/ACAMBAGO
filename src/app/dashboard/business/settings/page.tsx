"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/client";
import { Business, BUSINESS_CATEGORIES } from "@/types";
import { Settings, MapPin, Save, Upload } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [business, setBusiness] = useState<Partial<Business>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!isLoaded || !user) return;
    const load = async () => {
      const { data } = await supabase.from("businesses").select("*").eq("owner_id", user.id).single();
      if (data) {
        setBusiness(data as Business);
      } else {
        setIsNew(true);
        setBusiness({ category: "Restaurante", latitude: 20.0319, longitude: -100.7273 });
      }
      setLoading(false);
    };
    load();
  }, [isLoaded, user?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
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
      owner_id: user.id,
      name: business.name!,
      description: business.description,
      category: business.category!,
      address: business.address!,
      latitude: business.latitude,
      longitude: business.longitude,
      whatsapp: business.whatsapp,
      image_url,
    };

    if (isNew) {
      // Ensure profile exists
      await supabase.from("profiles").upsert({ id: user.id, name: user.fullName ?? user.firstName ?? user.emailAddresses[0]?.emailAddress ?? "Usuario", role: "business" });

      const { error } = await supabase.from("businesses").insert({ ...payload, is_approved: false });
      if (!error) {
        toast.success("Negocio registrado. Pendiente de aprobación.");
        setIsNew(false);
      } else {
        toast.error("Error al registrar el negocio: " + error.message);
      }
    } else {
      const { error } = await supabase.from("businesses").update(payload).eq("owner_id", user.id);
      if (!error) {
        toast.success("Cambios guardados");
      } else {
        toast.error("Error al guardar: " + error.message);
      }
    }

    setSaving(false);
  };

  const update = (key: keyof Business, val: string | number) =>
    setBusiness((prev) => ({ ...prev, [key]: val }));

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map((i) => <div key={i} className="h-12 bg-slate-100 dark:bg-white/5 rounded-xl" />)}</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-slate-100 dark:bg-white/10 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isNew ? "Registrar negocio" : "Configuración del negocio"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{isNew ? "Completa los datos de tu negocio" : "Actualiza la información de tu negocio"}</p>
        </div>
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
            <select required value={business.category ?? ""} onChange={(e) => update("category", e.target.value)} className="input">
              {BUSINESS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
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
            Ingresa las coordenadas de tu negocio. Puedes obtenerlas en Google Maps haciendo clic en tu ubicación.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Latitud</label>
              <input type="number" step="any" value={business.latitude ?? ""} onChange={(e) => update("latitude", parseFloat(e.target.value))} className="input" placeholder="20.0319" />
            </div>
            <div>
              <label className="label">Longitud</label>
              <input type="number" step="any" value={business.longitude ?? ""} onChange={(e) => update("longitude", parseFloat(e.target.value))} className="input" placeholder="-100.7273" />
            </div>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Acámbaro centro: 20.0319, -100.7273
          </p>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Guardando..." : isNew ? "Registrar negocio" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
