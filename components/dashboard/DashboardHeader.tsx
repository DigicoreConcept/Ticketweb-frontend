"use client";

import React from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Bell, ChevronDown, User, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const DashboardHeader = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const breadcrumbs = pathname
    .split("/")
    .filter((segment) => segment !== "")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1));

  return (
    <header className="h-16 border-b border-white/5 bg-black/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb}>
              {index > 0 && <span className="text-neutral-600">/</span>}
              <span className={index === breadcrumbs.length - 1 ? "text-white font-medium" : ""}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button className="relative w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-2 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-white/5">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-white">{user?.full_name}</p>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Creator</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center border border-white/10 hover:border-primary/50 transition-colors cursor-pointer group">
            <User className="w-5 h-5 text-neutral-400 group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
};
