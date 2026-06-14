"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { useOrder, useRefundOrder } from "@/lib/admin/hooks/useOrders";
import { FADE_UP } from "@/lib/admin/motion";
import { toast } from "@/lib/store/toastStore";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading } = useOrder(id);
  const refundMutation = useRefundOrder();

  const [isRefunding, setIsRefunding] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || !data.order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-white mb-2">Order not found</h2>
        <Link href="/admin/orders" className="text-rose-500 hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const order = data.order;

  const handleRefund = async () => {
    if (!refundReason) {
      toast.error("Please provide a reason for the refund.");
      return;
    }

    try {
      await refundMutation.mutateAsync({
        id,
        body: { amount: order.total_amount / 100, reason: refundReason },
      });
      toast.success("Order refunded successfully");
      setIsRefunding(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to refund order");
    }
  };

  return (
    <motion.div variants={FADE_UP} initial="initial" animate="animate" className="max-w-4xl mx-auto space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Order Details</h1>
          <p className="text-neutral-500 mt-1 font-mono text-xs">{order.id}</p>
        </div>
        
        {order.status === "COMPLETED" && (
          <button
            onClick={() => setIsRefunding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl font-bold text-sm transition-colors border border-rose-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            Issue Refund
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Customer Info</h3>
          <div>
            <p className="text-sm text-neutral-500">Name</p>
            <p className="text-white font-medium">{order.guest_name || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Email</p>
            <p className="text-white font-medium">{order.guest_email || "N/A"}</p>
          </div>
          {order.user_id && (
            <div>
              <p className="text-sm text-neutral-500">Registered User ID</p>
              <Link href={`/admin/users/${order.user_id}`} className="text-rose-500 hover:underline font-mono text-xs">
                {order.user_id}
              </Link>
            </div>
          )}
        </div>

        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Payment Details</h3>
          <div>
            <p className="text-sm text-neutral-500">Amount</p>
            <p className="text-emerald-400 font-bold text-xl">₦{(order.total_amount / 100).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Status</p>
            <span className={`inline-block px-2.5 py-1 mt-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              order.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-500" :
              order.status === "PENDING" ? "bg-amber-500/10 text-amber-500" :
              "bg-rose-500/10 text-rose-500"
            }`}>
              {order.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Reference / Intent ID</p>
            <p className="text-white font-mono text-xs">{order.payment_intent_id || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Created At</p>
            <p className="text-white text-sm">{format(new Date(order.created_at), "PPP p")}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Event Information</h3>
        <div>
          <p className="text-sm text-neutral-500">Event ID</p>
          <Link href={`/admin/events/${order.event_id}`} className="text-rose-500 hover:underline font-mono text-xs">
            {order.event_id}
          </Link>
        </div>
      </div>

      {isRefunding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-xl font-bold text-white">Issue Refund</h3>
            </div>
            <p className="text-sm text-neutral-400 mb-6">
              You are about to refund <strong className="text-white">₦{(order.total_amount / 100).toLocaleString()}</strong> to this customer. This action will cancel the order and deduct the amount from the organizer's wallet.
            </p>
            
            <div className="space-y-2 mb-6">
              <label className="text-xs font-semibold text-neutral-400 uppercase">Reason for refund</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-rose-500"
                placeholder="e.g. Customer requested cancellation"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsRefunding(false)}
                className="px-4 py-2 text-sm font-bold text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={refundMutation.isPending}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
              >
                {refundMutation.isPending ? "Processing..." : "Confirm Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
