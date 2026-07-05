"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarPlus,
  LogOut,
  Ticket,
  Settings,
  Wallet,
  X,
  ArrowRightLeft,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { VerificationBanner } from "@/components/dashboard/VerificationBanner";
import { toast } from "@/lib/store/toastStore";

export default function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/auth/login?_r=${encodeURIComponent(pathname)}`);
    } else if (!loading && isAuthenticated && user?.role === "ATTENDEE") {
      toast.error("You do not have permission to access the Organizer Dashboard");
      router.replace("/attendee/dashboard");
    }
  }, [loading, isAuthenticated, user, router, pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Events", href: "/dashboard/events", icon: Ticket },
    { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
    {
      name: "Create Event",
      href: "/dashboard/events/create",
      icon: CalendarPlus,
    },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex text-neutral-400 font-sans selection:bg-primary/30">
      {/* Sidebar - Glassmorphic (desktop) */}
      <aside className="w-72 hidden lg:flex flex-col border-r border-white/5 bg-black/50 backdrop-blur-xl relative z-50">
        <div className="h-20 flex items-center px-8 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(251,45,0,0.3)]">
            <Ticket className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            Ticket<span className="text-primary">web</span>
          </span>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1">
          <p className="px-4 text-xs font-semibold text-neutral-600 uppercase tracking-widest mb-4">
            Organizer Portal
          </p>

          <div className="mb-6 px-2 space-y-2">
            <Link
              href="/attendee/dashboard"
              className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-sm font-bold text-white/80 w-full"
            >
              <ArrowRightLeft className="w-4 h-4 text-primary" />
              Switch to Attendee
            </Link>
            {(user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-sm font-bold text-white/80 w-full"
              >
                <ArrowRightLeft className="w-4 h-4 text-primary" />
                Switch to Admin
              </Link>
            )}
          </div>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname.startsWith(item.href) && item.href !== "/dashboard");
            return (
              <Link
                key={item.name}
                href={item.href}
                className="block relative group"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <div
                  className={`relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-neutral-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${isActive ? "text-primary" : "text-neutral-500 group-hover:text-white"}`}
                  />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all group"
          >
            <LogOut className="mr-3 h-5 w-5 group-hover:text-red-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer (with AnimatePresence) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-[#0A0A0A] flex flex-col border-r border-white/5 p-4 lg:hidden shadow-2xl"
            >
              <div className="h-16 flex items-center justify-between px-4 mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(251,45,0,0.3)]">
                    <Ticket className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-white tracking-tight">
                    Ticket<span className="text-primary">web</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-2 space-y-1">
                <p className="px-4 text-xs font-semibold text-neutral-600 uppercase tracking-widest mb-4">
                  Organizer Portal
                </p>
                <div className="mb-6 px-2 space-y-2">
                  <Link
                    href="/attendee/dashboard"
                    className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-sm font-bold text-white/80 w-full"
                  >
                    <ArrowRightLeft className="w-4 h-4 text-primary" />
                    Switch to Attendee
                  </Link>
                  {(user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors text-sm font-bold text-white/80 w-full"
                    >
                      <ArrowRightLeft className="w-4 h-4 text-primary" />
                      Switch to Admin
                    </Link>
                  )}
                </div>
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (pathname.startsWith(item.href) && item.href !== "/dashboard");
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block relative group"
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-primary/10 rounded-xl" />
                      )}
                      <div
                        className={`relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                          isActive
                            ? "text-white"
                            : "text-neutral-500 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <item.icon
                          className={`mr-3 h-5 w-5 ${isActive ? "text-primary" : "text-neutral-500 group-hover:text-white"}`}
                        />
                        {item.name}
                      </div>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-2 border-t border-white/5 mt-auto">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all group"
                >
                  <LogOut className="mr-3 h-5 w-5 group-hover:text-red-500" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0A] relative">
        <DashboardHeader onMenuClick={() => setMobileMenuOpen(true)} />
        <VerificationBanner />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative z-10 scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
}
