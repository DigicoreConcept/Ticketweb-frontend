"use client";

import React, { useEffect, useState } from "react";
import { getWalletStats, getRevenueSeries, WalletStats } from "@/lib/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowUpRight, Coins, Ticket, Users } from "lucide-react";

const StatCard = ({ title, value, change, icon: Icon }: any) => (
  <div className="bg-white/5 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon className="w-16 h-16 text-white" />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-white/5 rounded-lg text-neutral-400">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-neutral-400">{title}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-white tracking-tight">
          {value}
        </span>
        {change && (
          <span className="text-xs font-medium text-neutral-500 mb-1">
            {change}
          </span>
        )}
      </div>
    </div>
  </div>
);

export const StatsOverview = () => {
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [chartData, setChartData] = useState<{name: string, revenue: number}[]>([]);
  const [period, setPeriod] = useState("7d");

  useEffect(() => {
    getWalletStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getRevenueSeries(period).then(setChartData).catch(() => {});
  }, [period]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Revenue"
          value={stats ? `₦${stats.total_revenue.toLocaleString()}` : "—"}
          change="Lifetime"
          icon={Coins}
        />
        <StatCard
          title="Tickets Sold"
          value={stats ? stats.total_tickets_sold.toLocaleString() : "—"}
          change="Lifetime"
          icon={Ticket}
        />
        <StatCard
          title="Recent Sales"
          value={stats ? stats.recent_sales_count.toLocaleString() : "—"}
          change="Last 30 days"
          icon={Users}
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-6 h-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-white">Revenue Overview</h3>
            <p className="text-sm text-neutral-400">
              Revenue performance
            </p>
          </div>
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-lg text-sm text-neutral-400 px-3 py-1 outline-none"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>

        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fb2d00" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#fb2d00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#333"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#666", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#666", fontSize: 12 }}
              tickFormatter={(value) => `₦${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#000",
                border: "1px solid #333",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "#fff" }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#fb2d00"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
