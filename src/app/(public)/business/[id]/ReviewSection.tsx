"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/client";
import { Review } from "@/types";
import StarRating from "@/components/business/StarRating";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MessageSquare, User } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  businessId: string;
  initialReviews: Review[];
}

export default function ReviewSection({ businessId, initialReviews }: Props) {
  const { user } = useUser();
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Debes iniciar sesión para dejar una reseña");
      return;
    }
    setSubmitting(true);

    const { data, error } = await supabase
      .from("reviews")
      .insert({ business_id: businessId, user_id: user.id, rating, comment })
      .select("*, profiles(name, avatar_url)")
      .single();

    if (error) {
      if (error.code === "23505") {
        toast.error("Ya dejaste una reseña para este negocio");
      } else {
        toast.error("Error al enviar reseña");
      }
    } else {
      setReviews([data as Review, ...reviews]);
      setComment("");
      setRating(5);
      toast.success("Reseña enviada");
    }
    setSubmitting(false);
  };

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-brand-600" />
        Reseñas ({reviews.length})
      </h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-4 mb-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dejar una reseña</p>
        <div className="mb-3">
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Comparte tu experiencia..."
          rows={3}
          className="input resize-none mb-3"
        />
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary text-sm w-full"
        >
          {submitting ? "Enviando..." : "Publicar reseña"}
        </button>
      </form>

      {/* List */}
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-brand-100 dark:bg-brand-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm text-gray-900 dark:text-white">
                    {r.profiles?.name ?? "Usuario"}
                  </p>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {format(new Date(r.created_at), "dd MMM yyyy", { locale: es })}
                  </span>
                </div>
                <StarRating value={r.rating} readonly size="sm" />
                {r.comment && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{r.comment}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
