import Link from "next/link";
import { MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">
              Acamba<span className="text-brand-600">Go</span>
            </span>
          </Link>
          <p className="text-sm text-gray-500">
            El marketplace local de Acámbaro, Guanajuato. © {new Date().getFullYear()}
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/map" className="hover:text-brand-600">Mapa</Link>
            <Link href="/login" className="hover:text-brand-600">Negocios</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
