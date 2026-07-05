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

// Placeholder data representing the last 7 months or days
const data = [
  { name: "Mon", revenue: 120000, tickets: 40 },
  { name: "Tue", revenue: 210000, tickets: 75 },
  { name: "Wed", revenue: 180000, tickets: 60 },
  { name: "Thu", revenue: 290000, tickets: 95 },
  { name: "Fri", revenue: 350000, tickets: 120 },
  { name: "Sat", revenue: 480000, tickets: 180 },
  { name: "Sun", revenue: 420000, tickets: 150 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 shadow-xl">
        <p className="text-white font-bold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name === "revenue" ? "Revenue" : "Tickets"}:{" "}
            <span className="font-medium text-white">
              {entry.name === "revenue" ? `₦${entry.value.toLocaleString()}` : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function RevenueChart() {
  return (
    <div className="w-full h-full min-h-[300px]">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">Revenue Overview</h2>
        <p className="text-xs text-neutral-500">Platform-wide gross revenue and ticket sales</p>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff4d00" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ff4d00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="rgba(255,255,255,0.2)"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="rgba(255,255,255,0.2)"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₦${(value / 1000)}k`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#ff4d00"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              activeDot={{ r: 6, fill: "#ff4d00", stroke: "#111", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
