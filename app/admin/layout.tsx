"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/auth/login?_r=/admin/dashboard");
      } else if (!user.is_superuser) {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading || !user?.is_superuser) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <AdminAuthGuard>
      <div data-theme="admin" className="min-h-screen bg-[#080808] text-[#f0f0f0]">
        <AdminSidebar 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />
        <div className="lg:ml-[260px] flex flex-col min-h-screen">
          <AdminHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
          <main className="p-4 lg:p-8 flex-1">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
