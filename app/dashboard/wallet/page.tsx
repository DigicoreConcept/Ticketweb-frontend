"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  TrendingUp,
  ChevronRight,
  Banknote,
  CircleDot,
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/lib/store/toastStore";

const transactions = [
  { id: 1, type: "Ticket Sale",    amount: "+₦85,000",   date: "Oct 27, 2026", status: "Completed",  credit: true  },
  { id: 2, type: "Ticket Sale",    amount: "+₦120,000",  date: "Oct 26, 2026", status: "Completed",  credit: true  },
  { id: 3, type: "Platform Fee",   amount: "-₦12,500",   date: "Oct 26, 2026", status: "Completed",  credit: false },
  { id: 4, type: "Payout",         amount: "-₦450,000",  date: "Oct 28, 2026", status: "Completed",  credit: false },
  { id: 5, type: "Ticket Sale",    amount: "+₦200,000",  date: "Oct 25, 2026", status: "Pending",    credit: true  },
];

const STAT_CARDS = [
  {
    label: "Available Balance",
    value: "₦1,240,000",
    sub: "+12.5% from last month",
    subColor: "text-green-400",
    icon: Wallet,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    highlight: true,
  },
  {
    label: "Pending Clearance",
    value: "₦320,500",
    sub: "Expected within 3–5 days",
    subColor: "text-white/40",
    icon: Clock,
    iconBg: "bg-yellow-500/10",
    iconColor: "text-yellow-400",
    highlight: false,
  },
  {
    label: "Lifetime Earnings",
    value: "₦8,450,000",
    sub: "Across 12 hosted events",
    subColor: "text-white/40",
    icon: TrendingUp,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    highlight: false,
  },
];

export default function WalletPage() {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [amount, setAmount] = useState("");

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsWithdrawing(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Withdrawal request submitted!");
    setAmount("");
    setIsWithdrawing(false);
  };

  return (
    <div className="space-y-8 pb-20 max-w-5xl">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Wallet</h1>
        <p className="text-white/40 mt-1 text-sm">
          Manage earnings, view transactions, and request payouts.
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STAT_CARDS.map(({ label, value, sub, subColor, icon: Icon, iconBg, iconColor, highlight }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`relative rounded-2xl border p-6 flex flex-col justify-between overflow-hidden ${
              highlight
                ? "border-primary/20 bg-primary/5"
                : "border-white/5 bg-white/[0.03]"
            }`}
          >
            {highlight && (
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            )}
            <div className="flex items-center justify-between mb-5">
              <span className="text-white/50 text-sm font-medium">{label}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
            </div>
            <div>
              <p className="text-3xl font-black text-white tracking-tight">{value}</p>
              <p className={`text-xs mt-1.5 ${subColor}`}>{sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Ledger + Payout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Transactions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white uppercase tracking-widest">
              Recent Transactions
            </h2>
            <button className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.03] overflow-hidden">
            {transactions.map((tx, idx) => (
              <div
                key={tx.id}
                className={`flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors ${
                  idx !== transactions.length - 1 ? "border-b border-white/[0.04]" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.credit ? "bg-green-500/10" : "bg-white/5"
                    }`}
                  >
                    {tx.credit ? (
                      <ArrowDownLeft className="w-4 h-4 text-green-400" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-white/40" />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">{tx.type}</p>
                    <p className="text-xs text-white/30">{tx.date}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${
                      tx.credit ? "text-green-400" : "text-white/70"
                    }`}
                  >
                    {tx.amount}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                      tx.status === "Pending" ? "text-yellow-400" : "text-white/30"
                    }`}
                  >
                    <CircleDot className="w-2.5 h-2.5" />
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payout Panel */}
        <div>
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] overflow-hidden sticky top-8">
            {/* Top accent */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Banknote className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">
                    Request Payout
                  </h3>
                </div>
                <p className="text-xs text-white/40 pl-[calc(28px+10px)]">
                  Withdraw to your connected bank account.
                </p>
              </div>

              <form onSubmit={handleWithdrawal} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                    Amount (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm font-bold">
                      ₦
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white text-sm placeholder-white/20 outline-none focus:border-primary/40 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(251,45,0,0.08)] transition-all"
                    />
                  </div>
                </div>

                {/* Quick amounts */}
                <div className="flex gap-2">
                  {["10,000", "50,000", "100,000"].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAmount(q.replace(",", ""))}
                      className="flex-1 py-1.5 rounded-lg bg-white/5 border border-white/[0.06] text-white/50 hover:text-white hover:border-white/20 text-[11px] font-semibold transition-all"
                    >
                      ₦{q}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isWithdrawing || !amount}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(251,45,0,0.2)] hover:shadow-[0_0_28px_rgba(251,45,0,0.35)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {isWithdrawing ? "Processing…" : "Withdraw Funds"}
                </button>
              </form>

              <p className="text-[11px] text-center text-white/25 pt-2 border-t border-white/[0.04]">
                Processing time: 2–3 business days
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}