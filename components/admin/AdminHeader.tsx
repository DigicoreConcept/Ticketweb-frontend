"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

export function AdminHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  
  const pathSegments = pathname.split("/").filter(Boolean);
  const title = pathSegments.length > 1 
    ? pathSegments[1].charAt(0).toUpperCase() + pathSegments[1].slice(1)
    : "Dashboard";

  return (
    <header className="h-[60px] border-b border-white/[0.06] bg-[#0f0f0f]/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 text-neutral-400 hover:text-white">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black tracking-tight text-white">{title}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-xs font-semibold uppercase tracking-widest text-rose-500 bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20 shadow-[0_0_12px_rgba(225,29,72,0.15)]">
          Superuser Mode
        </div>
      </div>
    </header>
  );
}
