"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ScanLine, CheckCircle, XCircle, Camera } from "lucide-react";
import toast from "react-hot-toast";

const QRScanner = dynamic(() => import("@/components/coupons/QRScanner"), { ssr: false });

interface ScanResult {
  success: boolean;
  message: string;
  coupon?: {
    title: string;
    discount_type: string;
    value: number;
    code: string;
  };
  error?: string;
}

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleScan = async (qrData: string) => {
    setScanning(false);
    setProcessing(true);
    setResult(null);

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_data: qrData }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message, coupon: data.coupon });
        toast.success("Cupón válido");
      } else {
        setResult({ success: false, message: data.error, error: data.error });
        toast.error(data.error);
      }
    } catch {
      setResult({ success: false, message: "Error de conexión", error: "Error de red" });
      toast.error("Error al validar el cupón");
    }

    setProcessing(false);
  };

  const reset = () => {
    setResult(null);
    setProcessing(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-50 dark:bg-green-500/10 rounded-xl flex items-center justify-center">
          <ScanLine className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Escáner QR</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Valida cupones de clientes</p>
        </div>
      </div>

      {/* Scanner trigger */}
      {!scanning && !result && !processing && (
        <div className="card p-8 text-center">
          <div className="w-20 h-20 bg-green-50 dark:bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Camera className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Listo para escanear</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Pide al cliente que muestre su código QR del cupón y presiona el botón para escanearlo.
          </p>
          <button
            onClick={() => setScanning(true)}
            className="btn-primary flex items-center justify-center gap-2 w-full"
          >
            <ScanLine className="w-4 h-4" />
            Iniciar cámara
          </button>
        </div>
      )}

      {/* Processing */}
      {processing && (
        <div className="card p-8 text-center">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">Validando cupón...</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`card p-6 ${result.success
          ? "border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10"
          : "border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10"}`}>
          <div className="flex flex-col items-center text-center gap-3">
            {result.success ? (
              <CheckCircle className="w-16 h-16 text-green-500" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500" />
            )}

            <h2 className={`text-xl font-bold ${result.success
              ? "text-green-800 dark:text-green-300"
              : "text-red-800 dark:text-red-300"}`}>
              {result.success ? "¡Cupón válido!" : "Cupón rechazado"}
            </h2>
            <p className={`text-sm ${result.success
              ? "text-green-700 dark:text-green-400"
              : "text-red-700 dark:text-red-400"}`}>
              {result.message}
            </p>

            {result.success && result.coupon && (
              <div className="w-full bg-white dark:bg-white/10 rounded-xl p-4 mt-2 text-left">
                <p className="font-semibold text-gray-900 dark:text-white">{result.coupon.title}</p>
                <p className="text-brand-600 dark:text-brand-400 font-bold text-lg mt-1">
                  {result.coupon.discount_type === "percent"
                    ? `${result.coupon.value}% de descuento`
                    : `$${result.coupon.value} MXN de descuento`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">{result.coupon.code}</p>
              </div>
            )}

            <button
              onClick={reset}
              className={`w-full mt-2 py-2.5 rounded-xl font-semibold text-sm transition-colors ${result.success
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"}`}
            >
              Escanear otro cupón
            </button>
          </div>
        </div>
      )}

      {/* Scanner modal */}
      {scanning && (
        <QRScanner onScan={handleScan} onClose={() => setScanning(false)} />
      )}

      {/* History hint */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          El sistema valida automáticamente: código único, fecha de vencimiento, límite de usos y duplicados.
        </p>
      </div>
    </div>
  );
}
