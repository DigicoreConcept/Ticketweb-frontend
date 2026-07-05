"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAdminStats } from "@/lib/admin/hooks/useAdminStats";
import { StatCard } from "@/components/admin/StatCard";
import { STAGGER, FADE_UP } from "@/lib/admin/motion";
import { RevenueChart } from "@/components/admin/RevenueChart";
import {
  Banknote,
  Users,
  CalendarDays,
  Ticket,
  Receipt,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState("30d");
  const { data, isLoading, error } = useAdminStats(period);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-white/5 w-64 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500">
        Failed to load dashboard stats.
      </div>
    );
  }

  return (
    <motion.div
      variants={STAGGER}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      <div className="flex items-end justify-between">
        <div>
          <motion.h1 variants={FADE_UP} className="text-3xl font-black text-white tracking-tight">
            Platform Overview
          </motion.h1>
          <motion.p variants={FADE_UP} className="text-neutral-500 mt-1">
            System metrics and performance at a glance.
          </motion.p>
        </div>
        
        <motion.div variants={FADE_UP} className="flex bg-[#0f0f0f] border border-white/[0.06] rounded-lg p-1">
          {["7d", "30d", "90d", "1y"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-colors ${
                period === p ? "bg-white/10 text-white" : "text-neutral-500 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          label="Total Revenue"
          value={data.total_revenue_gross}
          prefix="₦"
          changePeriod="Gross Lifetime"
          icon={Banknote}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-500/10"
        />
        <StatCard
          label="Total Users"
          value={data.total_users}
          change={data.new_users_this_week > 0 ? undefined : 0}
          changePeriod={data.new_users_this_week > 0 ? `+${data.new_users_this_week} this week` : "Stable"}
          icon={Users}
          iconColor="text-blue-500"
          iconBg="bg-blue-500/10"
        />
        <StatCard
          label="Active Events"
          value={data.active_events}
          changePeriod={`${data.pending_review_events} pending review`}
          icon={CalendarDays}
          iconColor="text-amber-500"
          iconBg="bg-amber-500/10"
        />
        <StatCard
          label="Tickets Sold"
          value={data.tickets_sold_total}
          changePeriod="All time"
          icon={Ticket}
          iconColor="text-purple-500"
          iconBg="bg-purple-500/10"
        />
        <StatCard
          label="Platform Fees"
          value={data.total_platform_fees}
          prefix="₦"
          changePeriod="All time earned"
          icon={Receipt}
          iconColor="text-indigo-500"
          iconBg="bg-indigo-500/10"
        />
        <StatCard
          label="Pending Payouts"
          value={data.pending_payouts_amount}
          prefix="₦"
          changePeriod={`${data.pending_payouts_count} requests`}
          icon={Banknote}
          iconColor="text-rose-500"
          iconBg="bg-rose-500/10"
          highlight={data.pending_payouts_count > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <motion.div variants={FADE_UP} className="bg-[#0f0f0f] border border-white/[0.06] rounded-2xl p-6 h-[400px]">
          <RevenueChart />
        </motion.div>

        {/* Pending Actions */}
        <motion.div variants={FADE_UP} className="bg-[#0f0f0f] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Pending Actions</h2>
            <Link href="/admin/payouts" className="text-sm text-rose-500 hover:text-rose-400 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {data.pending_payouts_count === 0 ? (
            <div className="text-center text-neutral-500 py-12">
              No pending actions. You're all caught up!
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Review Payout Requests</p>
                  <p className="text-sm text-neutral-400 mt-1">{data.pending_payouts_count} requests waiting for approval</p>
                </div>
                <Link href="/admin/payouts" className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors text-sm">
                  Review
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
