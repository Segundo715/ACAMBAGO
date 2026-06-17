import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "AcambaGo - Marketplace Local de Acámbaro",
  description:
    "Descubre negocios locales, productos y cupones exclusivos en Acámbaro, Guanajuato.",
  keywords: "Acámbaro, Guanajuato, negocios locales, cupones, marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: "12px", fontSize: "14px" },
          }}
        />
      </body>
    </html>
  );
}
