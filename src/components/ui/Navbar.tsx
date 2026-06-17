"use client";

import Link from "next/link";
import { useState } from "react";
import { MapPin, Menu, X, Store, UserPlus } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">
              Acamba<span className="text-brand-600">Go</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
              Inicio
            </Link>
            <Link href="/map" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
              Mapa
            </Link>
            <Link href="/?category=Servicios+del+hogar" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
              Servicios
            </Link>
            <Link href="/?category=Ferretería" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
              Tiendas
            </Link>
          </div>

          {/* Auth + Dashboard buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/register" className="btn-secondary flex items-center gap-1.5 text-sm py-2 px-4">
              <UserPlus className="w-4 h-4" />
              Registrarse
            </Link>
            <Link href="/dashboard/business" className="btn-primary flex items-center gap-1.5 text-sm">
              <Store className="w-4 h-4" />
              Panel Negocio
            </Link>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white py-4 px-4 flex flex-col gap-3">
          <Link href="/" className="text-sm font-medium py-2" onClick={() => setIsOpen(false)}>Inicio</Link>
          <Link href="/map" className="text-sm font-medium py-2" onClick={() => setIsOpen(false)}>Mapa</Link>
          <Link href="/?category=Servicios+del+hogar" className="text-sm font-medium py-2" onClick={() => setIsOpen(false)}>Servicios</Link>
          <Link href="/?category=Ferretería" className="text-sm font-medium py-2" onClick={() => setIsOpen(false)}>Tiendas</Link>
          <hr className="border-gray-100" />
          <Link href="/register" className="btn-secondary text-center text-sm flex items-center justify-center gap-2" onClick={() => setIsOpen(false)}>
            <UserPlus className="w-4 h-4" /> Registrarse
          </Link>
          <Link href="/dashboard/business" className="btn-primary text-center text-sm flex items-center justify-center gap-2" onClick={() => setIsOpen(false)}>
            <Store className="w-4 h-4" /> Panel Negocio
          </Link>
        </div>
      )}
    </nav>
  );
}
