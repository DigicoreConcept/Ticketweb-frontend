"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { FADE_UP } from "@/lib/admin/motion";

interface StatCardProps {
  label: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  change?: number;
  changePeriod?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  highlight?: boolean;
  animateCount?: boolean;
}

export function StatCard({
  label,
  value,
  prefix = "",
  suffix = "",
  change,
  changePeriod,
  icon: Icon,
  iconColor,
  iconBg,
  highlight,
  animateCount = true,
}: StatCardProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    // Basic formatting for NGN or pure numbers
    if (typeof value === "number") {
      return latest.toLocaleString("en-NG", {
        minimumFractionDigits: value % 1 !== 0 ? 2 : 0,
        maximumFractionDigits: 2,
      });
    }
    return value;
  });

  useEffect(() => {
    if (animateCount && typeof value === "number") {
      const controls = animate(count, value, { duration: 1.2, ease: "easeOut" });
      return controls.stop;
    }
  }, [value, animateCount, count]);

  return (
    <motion.div
      variants={FADE_UP}
      className={`bg-[#0f0f0f] border rounded-2xl p-6 transition-colors ${
        highlight ? "border-rose-500/30 shadow-[0_0_24px_rgba(225,29,72,0.1)]" : "border-white/[0.06]"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-neutral-500 font-semibold uppercase tracking-widest text-[10px] mt-1">
          {label}
        </h3>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-white tracking-tight">
          {prefix}
        </span>
        <motion.span className="text-3xl font-black text-white tracking-tight">
          {typeof value === "number" && animateCount ? rounded : value}
        </motion.span>
        <span className="text-xl font-bold text-neutral-400">
          {suffix}
        </span>
      </div>

      {(change !== undefined || changePeriod) && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          {change !== undefined && (
            <span className={`font-medium ${change >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
              {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
            </span>
          )}
          {changePeriod && (
            <span className="text-neutral-500">{changePeriod}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
