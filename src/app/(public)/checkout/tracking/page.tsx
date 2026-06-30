"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, Package, Truck, MapPin, Phone, Star } from "lucide-react";

const TRACKING_STEPS = [
  {
    id: "received",
    label: "Pedido recibido",
    sub: "La tienda recibió tu pedido",
    icon: Package,
    color: "brand",
  },
  {
    id: "preparing",
    label: "Preparando",
    sub: "Están preparando tu pedido",
    icon: Clock,
    color: "amber",
  },
  {
    id: "ready",
    label: "Listo para recoger",
    sub: "Tu pedido está listo",
    icon: CheckCircle2,
    color: "blue",
  },
  {
    id: "on_way",
    label: "En camino",
    sub: "Tu pedido va en camino hacia ti",
    icon: Truck,
    color: "purple",
  },
  {
    id: "delivered",
    label: "Entregado",
    sub: "¡Pedido entregado con éxito!",
    icon: Star,
    color: "green",
  },
];

const COLOR_MAP: Record<string, { bg: string; ring: string; text: string; line: string }> = {
  brand:  { bg: "bg-brand-500",  ring: "ring-brand-200 dark:ring-brand-500/30",  text: "text-brand-600 dark:text-brand-400",  line: "bg-brand-500" },
  amber:  { bg: "bg-amber-500",  ring: "ring-amber-200 dark:ring-amber-500/30",  text: "text-amber-600 dark:text-amber-400",  line: "bg-amber-500" },
  blue:   { bg: "bg-blue-500",   ring: "ring-blue-200 dark:ring-blue-500/30",    text: "text-blue-600 dark:text-blue-400",    line: "bg-blue-500" },
  purple: { bg: "bg-purple-500", ring: "ring-purple-200 dark:ring-purple-500/30",text: "text-purple-600 dark:text-purple-400",line: "bg-purple-500" },
  green:  { bg: "bg-green-500",  ring: "ring-green-200 dark:ring-green-500/30",  text: "text-green-600 dark:text-green-400",  line: "bg-green-500" },
};

// Auto-advance interval in ms for demo
const DEMO_INTERVAL = 4000;

function TrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("order") ?? "ACAM-DEMO";

  const [currentStep, setCurrentStep] = useState(0);
  const [times, setTimes] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  // Auto-advance demo steps
  useEffect(() => {
    if (done) return;
    const now = new Date();
    const fmt = (d: Date) =>
      d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

    setTimes((prev) => ({ ...prev, [TRACKING_STEPS[0].id]: fmt(now) }));

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= TRACKING_STEPS.length) {
          clearInterval(interval);
          setDone(true);
          return prev;
        }
        const t = new Date();
        setTimes((p) => ({ ...p, [TRACKING_STEPS[next].id]: fmt(t) }));
        return next;
      });
    }, DEMO_INTERVAL);

    return () => clearInterval(interval);
  }, [done]);

  const isDelivery = true; // demo always shows full timeline

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030810]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-[#060e18] border-b border-slate-200 dark:border-white/10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-gray-300" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-slate-900 dark:text-white text-base">Seguimiento del pedido</h1>
            <p className="text-xs text-brand-600 dark:text-brand-400 font-mono">{orderId}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">En vivo</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Store card */}
        <div className="bg-white dark:bg-[#0a1628] rounded-2xl border border-slate-200 dark:border-white/10 p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-2xl flex-shrink-0">
            🔧
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 dark:text-white text-sm">Ferretería Acámbaro</p>
            <p className="text-xs text-slate-400 dark:text-gray-500">Calle Juárez 45, Centro</p>
          </div>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
          >
            <Phone className="w-3.5 h-3.5" />
            Llamar
          </a>
        </div>

        {/* ETA banner */}
        {!done ? (
          <div className="bg-brand-500 rounded-2xl p-4 text-white flex items-center gap-3">
            <Clock className="w-8 h-8 opacity-80 flex-shrink-0" />
            <div>
              <p className="font-bold text-base">Llegada estimada: 15-20 min</p>
              <p className="text-brand-100 text-xs mt-0.5">Actualizando en tiempo real (demo)</p>
            </div>
          </div>
        ) : (
          <div className="bg-green-500 rounded-2xl p-4 text-white flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 opacity-90 flex-shrink-0" />
            <div>
              <p className="font-bold text-base">¡Pedido entregado!</p>
              <p className="text-green-100 text-xs mt-0.5">Gracias por tu compra en Acom-Di</p>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white dark:bg-[#0a1628] rounded-2xl border border-slate-200 dark:border-white/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500 mb-5">Estado del pedido</p>
          <div className="space-y-0">
            {TRACKING_STEPS.map((s, i) => {
              const isDone = i < currentStep;
              const isActive = i === currentStep;
              const isPending = i > currentStep;
              const colors = COLOR_MAP[s.color];
              const Icon = s.icon;
              const isLast = i === TRACKING_STEPS.length - 1;

              return (
                <div key={s.id} className="flex gap-4">
                  {/* Icon + line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                        isDone
                          ? `${colors.bg} text-white`
                          : isActive
                          ? `${colors.bg} text-white ring-4 ${colors.ring} animate-pulse`
                          : "bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-gray-600"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {!isLast && (
                      <div
                        className={`w-0.5 h-8 mt-1 transition-all duration-700 ${
                          isDone ? colors.line : "bg-slate-200 dark:bg-white/10"
                        }`}
                      />
                    )}
                  </div>

                  {/* Text */}
                  <div className={`pb-8 ${isLast ? "pb-0" : ""} flex-1 pt-1.5`}>
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-semibold transition-colors duration-300 ${
                          isDone || isActive
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-400 dark:text-gray-600"
                        }`}
                      >
                        {s.label}
                      </p>
                      {times[s.id] && (
                        <span className="text-xs text-slate-400 dark:text-gray-500">{times[s.id]}</span>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-0.5 transition-colors duration-300 ${
                        isActive ? colors.text : isDone ? "text-slate-400 dark:text-gray-500" : "text-slate-300 dark:text-gray-700"
                      }`}
                    >
                      {isActive && !done ? (
                        <span className="flex items-center gap-1">
                          <span className="inline-block w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="inline-block w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="inline-block w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
                          {s.sub}
                        </span>
                      ) : (
                        s.sub
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map placeholder */}
        <div className="bg-white dark:bg-[#0a1628] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="relative h-36 bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-500/10 dark:to-blue-500/10 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-brand-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600 dark:text-gray-400">Mapa en vivo</p>
              <p className="text-xs text-slate-400 dark:text-gray-500">(disponible en versión completa)</p>
            </div>
            <div className="absolute inset-0 bg-[url('/acomdi.png')] bg-center bg-no-repeat opacity-5" />
          </div>
          <div className="p-3 flex items-center justify-between border-t border-slate-100 dark:border-white/10">
            <span className="text-xs text-slate-500 dark:text-gray-400">Ferretería Acámbaro → Tu ubicación</span>
            <button className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Ver en Maps
            </button>
          </div>
        </div>

        {/* Rate + back */}
        {done && (
          <div className="bg-white dark:bg-[#0a1628] rounded-2xl border border-slate-200 dark:border-white/10 p-4 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-gray-300">¿Cómo fue tu experiencia?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className="text-2xl hover:scale-110 transition-transform">
                  ⭐
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 dark:text-gray-500">(Función demo)</p>
          </div>
        )}

        <button
          onClick={() => router.push("/")}
          className="w-full py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 font-medium text-sm transition-colors"
        >
          Volver al Marketplace
        </button>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense>
      <TrackingContent />
    </Suspense>
  );
}
