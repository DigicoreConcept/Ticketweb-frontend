"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/context/AuthContext";
import { Ticket, Menu, X, ChevronDown, User, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { toast } from "@/lib/store/toastStore";

export function Header() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  const handleCreateEventClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push("/auth/register?tab=organizer");
    } else if (user?.role === "ATTENDEE") {
      toast.error("You don't have permission. Please log out and register as an Organizer.");
    } else {
      router.push("/dashboard/events/create");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dashboardPath = (user?.role === "SUPER_ADMIN") 
    ? "/admin/dashboard" 
    : user?.role === "ATTENDEE" 
      ? "/attendee/dashboard" 
      : "/dashboard";
  const settingsPath = (user?.role === "SUPER_ADMIN") 
    ? "/admin/settings" 
    : user?.role === "ATTENDEE" 
      ? "/attendee/settings" 
      : "/dashboard/settings";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group relative z-50">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(251,45,0,0.4)] group-hover:scale-105 transition-transform">
            <Ticket className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <span className="text-xl md:text-2xl font-black text-white tracking-tight">
            Ticket<span className="text-primary">web</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/events"
            className="text-sm font-bold text-neutral-300 hover:text-white transition-colors"
          >
            Discover Events
          </Link>
          <Link
            href="/dashboard/events/create"
            onClick={handleCreateEventClick}
            className="text-sm font-bold text-neutral-300 hover:text-white transition-colors"
          >
            Create Event
          </Link>
        </nav>

        {/* Auth / CTA */}
        <div className="hidden md:flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-bold text-white hover:text-primary transition-colors px-4 py-2"
              >
                Login
              </Link>
              <Link
                href="/auth/register?tab=attendee"
                className="bg-primary hover:bg-orange-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-[0_0_20px_rgba(251,45,0,0.3)] hover:shadow-[0_0_30px_rgba(251,45,0,0.5)] transition-all hover:scale-105 active:scale-95"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href={dashboardPath}
                className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all"
              >
                Dashboard
              </Link>

              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full p-1.5 pr-4 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-white max-w-[100px] truncate">
                    {user?.full_name?.split(" ")[0] || "User"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50"
                    >
                      <Link
                        href={dashboardPath}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link
                        href={settingsPath}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <div className="h-px w-full bg-white/10" />
                      <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden relative z-50 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-full left-0 right-0 bg-[#0a0a0a] border-b border-white/10 shadow-2xl p-6 flex flex-col gap-6"
          >
            <nav className="flex flex-col gap-4">
              <Link
                href="/events"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-bold text-white"
              >
                Discover Events
              </Link>
              <Link
                href="/dashboard/events/create"
                onClick={(e) => {
                  handleCreateEventClick(e);
                  setIsMobileMenuOpen(false);
                }}
                className="text-lg font-bold text-white"
              >
                Create Event
              </Link>
              
              <div className="h-px w-full bg-white/10 my-2" />

              {!isAuthenticated ? (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-bold text-white"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register?tab=attendee"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-bold text-primary"
                  >
                    Sign Up Free
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={dashboardPath}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-bold text-white flex items-center gap-3"
                  >
                    <LayoutDashboard className="w-5 h-5 text-neutral-400" />
                    Dashboard
                  </Link>
                  <Link
                    href={settingsPath}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-bold text-white flex items-center gap-3"
                  >
                    <Settings className="w-5 h-5 text-neutral-400" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-lg font-bold text-red-400 flex items-center gap-3 text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Log Out
                  </button>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
