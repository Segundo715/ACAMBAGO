import Navbar from "@/components/ui/Navbar";
import DesktopSidebar from "@/components/ui/DesktopSidebar";
import Footer from "@/components/ui/Footer";
import MobileNav from "@/components/ui/MobileNav";
import CartRoot from "@/components/ui/CartRoot";
import DemoBanner from "@/components/ui/DemoBanner";
import { CartProvider } from "@/lib/cart-context";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen">
        <DemoBanner />

        {/* Sidebar izquierdo solo en desktop (fixed, fuera de flujo) */}
        <DesktopSidebar />

        {/* Contenido: bloque normal con ml-64 en desktop → ancho = 100vw - 256px */}
        <div className="md:ml-64 flex flex-col min-h-screen">
          {/* Navbar solo en mobile */}
          <Navbar />
          <main className="flex-1 pb-24 md:pb-0">{children}</main>
          <Footer />
        </div>

        {/* Nav inferior solo en mobile */}
        <MobileNav />
        <CartRoot />
      </div>
    </CartProvider>
  );
}
