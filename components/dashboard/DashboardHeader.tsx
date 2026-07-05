"use client";

import React from "react";
import { useAuth } from "@/app/context/AuthContext";
import { User, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const DashboardHeader = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const url = `/${pathSegments.slice(0, index + 1).join("/")}`;
    return {
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      url,
    };
  });

  return (
    <header className="h-14 sm:h-16 border-b border-white/5 bg-black/50 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      {/* Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors shrink-0"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-neutral-400 min-w-0 overflow-hidden whitespace-nowrap">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.url}>
              {index > 0 && <span className="text-neutral-600 shrink-0">/</span>}
              <Link
                href={crumb.url}
                className={`truncate transition-colors ${
                  index === breadcrumbs.length - 1
                    ? "text-white font-medium"
                    : "hover:text-white shrink-0"
                }`}
                title={crumb.name}
              >
                {crumb.name}
              </Link>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0 pl-2">
        <Link href="/dashboard/settings" className="flex items-center gap-2 sm:gap-3 sm:pl-4 sm:border-l border-white/5 group">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">{user?.full_name}</p>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Creator</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-neutral-800 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 group-hover:text-primary transition-colors" />
          </div>
        </Link>
      </div>
    </header>
  );
};
