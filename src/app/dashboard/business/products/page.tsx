"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/types";
import { Plus, Pencil, Trash2, Package, Upload, X } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: biz } = await supabase.from("businesses").select("id").eq("owner_id", user.id).single();
      if (!biz) return;
      setBusinessId(biz.id);
      const { data } = await supabase.from("products").select("*").eq("business_id", biz.id).order("created_at", { ascending: false });
      setProducts((data ?? []) as Product[]);
    };
    load();
  }, []);

  const openNew = () => {
    setEditing(null); setName(""); setDescription(""); setPrice("");
    setImageFile(null); setImagePreview(null); setShowForm(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p); setName(p.name); setDescription(p.description ?? "");
    setPrice(String(p.price)); setImageFile(null);
    setImagePreview(p.image_url ?? null); setShowForm(true);
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(editing?.image_url ?? null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    setSaving(true);

    let image_url = editing?.image_url;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${businessId}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("product-images").upload(path, imageFile, { upsert: true });
      if (!uploadErr) {
        const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
        image_url = publicUrl;
      } else {
        toast.error("Error al subir la imagen");
      }
    }

    if (editing) {
      const { error } = await supabase.from("products").update({ name, description, price: parseFloat(price), image_url }).eq("id", editing.id);
      if (!error) {
        setProducts((prev) => prev.map((p) => p.id === editing.id ? { ...p, name, description, price: parseFloat(price), image_url } : p));
        toast.success("Producto actualizado");
      }
    } else {
      const { data, error } = await supabase.from("products").insert({ business_id: businessId, name, description, price: parseFloat(price), image_url }).select().single();
      if (!error && data) {
        setProducts((prev) => [data as Product, ...prev]);
        toast.success("Producto agregado");
      }
    }

    setShowForm(false); setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    await supabase.from("products").delete().eq("id", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Producto eliminado");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} productos publicados</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-gray-900">
                {editing ? "Editar producto" : "Nuevo producto"}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              {/* Image preview */}
              <div>
                <label className="label">Foto del producto</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative cursor-pointer border-2 border-dashed border-gray-200 rounded-xl overflow-hidden hover:border-brand-400 transition-colors"
                >
                  {imagePreview ? (
                    <div className="relative h-44">
                      <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                        <p className="text-white text-sm font-medium flex items-center gap-1.5">
                          <Upload className="w-4 h-4" /> Cambiar foto
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-44 flex flex-col items-center justify-center gap-2 text-gray-400">
                      <Upload className="w-8 h-8" />
                      <p className="text-sm font-medium">Toca para subir foto</p>
                      <p className="text-xs">JPG, PNG — máx. 5 MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                />
                {imageFile && (
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <span className="truncate">{imageFile.name}</span>
                    <button type="button" onClick={() => handleImageChange(null)} className="text-red-400 hover:text-red-600 ml-2 flex-shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="label">Nombre del producto / servicio *</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Ej: Taladro percutor, Servicio de pintura..." />
              </div>
              <div>
                <label className="label">Descripción</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input resize-none" rows={2} placeholder="Descripción breve del producto o servicio" />
              </div>
              <div>
                <label className="label">Precio (MXN) *</label>
                <input required type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="input" placeholder="0.00" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Guardando...</>
                  ) : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product list */}
      {products.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-1">Sin productos todavía</p>
          <p className="text-gray-400 text-sm mb-4">Agrega tus primeros productos o servicios</p>
          <button onClick={openNew} className="btn-primary text-sm">Agregar el primero</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="card overflow-hidden">
              <div className="h-36 bg-gray-50 relative flex items-center justify-center">
                {p.image_url ? (
                  <Image src={p.image_url} alt={p.name} fill className="object-cover" />
                ) : (
                  <Package className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-900">{p.name}</p>
                {p.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{p.description}</p>}
                <p className="text-brand-600 font-bold mt-1">${Number(p.price).toLocaleString("es-MX")} MXN</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(p)} className="btn-secondary flex-1 text-xs flex items-center justify-center gap-1 py-2">
                    <Pencil className="w-3 h-3" /> Editar
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="flex-1 text-xs flex items-center justify-center gap-1 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3 h-3" /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
