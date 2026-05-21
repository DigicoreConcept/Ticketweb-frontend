"use client";

import React from "react";
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

const data = [
  { name: "Mon", revenue: 4000 },
  { name: "Tue", revenue: 3000 },
  { name: "Wed", revenue: 2000 },
  { name: "Thu", revenue: 2780 },
  { name: "Fri", revenue: 1890 },
  { name: "Sat", revenue: 2390 },
  { name: "Sun", revenue: 3490 },
];

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
        <span className="text-xs font-medium text-green-500 flex items-center mb-1">
          +{change}% <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  </div>
);

export const StatsOverview = () => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Revenue"
          value="₦45,231.89"
          change="20.1"
          icon={Coins}
        />
        <StatCard
          title="Tickets Sold"
          value="2,350"
          change="15.3"
          icon={Ticket}
        />
        <StatCard
          title="Active Attendees"
          value="+12,234"
          change="10.5"
          icon={Users}
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-6 h-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-white">Revenue Overview</h3>
            <p className="text-sm text-neutral-400">
              Monthly revenue performance
            </p>
          </div>
          <select className="bg-black/50 border border-white/10 rounded-lg text-sm text-neutral-400 px-3 py-1 outline-none">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={data}>
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
              tickFormatter={(value) => `$${value}`}
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
