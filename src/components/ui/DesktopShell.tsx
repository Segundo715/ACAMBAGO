"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DesktopSidebar from "./DesktopSidebar";

const STORAGE_KEY = "sidebar_hidden";

export default function DesktopShell({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setHidden(localStorage.getItem(STORAGE_KEY) === "1"));
  }, []);

  const toggle = () => {
    setHidden((h) => {
      const next = !h;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <>
      <DesktopSidebar hidden={hidden} />

      {/* Flecha para ocultar/mostrar el sidebar, solo en escritorio */}
      <button
        onClick={toggle}
        aria-label={hidden ? "Mostrar menú" : "Ocultar menú"}
        title={hidden ? "Mostrar menú" : "Ocultar menú"}
        className={`hidden md:flex fixed top-1/2 -translate-y-1/2 z-[60] w-6 h-14 items-center justify-center rounded-r-lg bg-white dark:bg-[#0a1628] border border-l-0 border-slate-200 dark:border-white/10 shadow-md hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-200 ${
          hidden ? "left-0" : "left-64"
        }`}
      >
        {hidden ? (
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 dark:text-gray-400" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 text-slate-500 dark:text-gray-400" />
        )}
      </button>

      <div className={`flex flex-col min-h-screen transition-[margin] duration-200 ${hidden ? "md:ml-0" : "md:ml-64"}`}>
        {children}
      </div>
    </>
  );
}
