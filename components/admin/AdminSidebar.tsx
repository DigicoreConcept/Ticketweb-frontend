"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Ticket,
  Banknote,
  Receipt,
  Settings,
  ShieldAlert,
  LogOut
} from "lucide-react";
import { motion } from "framer-motion";
import { SPRING } from "@/lib/admin/motion";

const navItems = [
  { label: "PLATFORM", items: [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Events", href: "/admin/events", icon: CalendarDays },
    { name: "Orders", href: "/admin/orders", icon: Ticket },
  ]},
  { label: "FINANCE", items: [
    { name: "Payouts", href: "/admin/payouts", icon: Banknote },
    { name: "Transactions", href: "/admin/transactions", icon: Receipt },
  ]},
  { label: "SYSTEM", items: [
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Audit Log", href: "/admin/audit-log", icon: ShieldAlert },
  ]}
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed top-0 left-0 h-full w-[260px] bg-[#0f0f0f] border-r border-white/[0.06] flex flex-col z-50 hidden lg:flex">
      <div className="p-6">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <span className="font-black tracking-tight text-white text-lg">Admin Panel</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8">
        {navItems.map((section) => (
          <div key={section.label}>
            <h3 className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
              {section.label}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? "text-rose-500" : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeAdminNav"
                        className="absolute inset-0 bg-rose-600/10 rounded-xl"
                        transition={SPRING}
                      />
                    )}
                    <item.icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white truncate max-w-[120px]">{user?.full_name || "Admin"}</span>
            <span className="text-xs text-neutral-500 truncate max-w-[120px]">{user?.email}</span>
          </div>
          <button
            onClick={logout}
            className="p-2 text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
