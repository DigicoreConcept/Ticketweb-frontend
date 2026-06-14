"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Check, X, AlertCircle } from "lucide-react";

import { usePayouts, useApprovePayout, useRejectPayout } from "@/lib/admin/hooks/usePayouts";
import { DataTable } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { FADE_UP } from "@/lib/admin/motion";
import { toast } from "@/lib/store/toastStore";

export default function PayoutsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = usePayouts({
    page,
    page_size: 20,
    status: statusFilter || undefined,
  });

  const approveMutation = useApprovePayout();
  const rejectMutation = useRejectPayout();

  const [rejectingRef, setRejectingRef] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = async (ref: string) => {
    if (confirm("Are you sure you want to approve this payout?")) {
      try {
        await approveMutation.mutateAsync(ref);
        toast.success("Payout approved successfully");
      } catch (err: any) {
        toast.error(err.response?.data?.detail || "Failed to approve payout");
      }
    }
  };

  const handleReject = async () => {
    if (!rejectingRef || !rejectReason) return;
    try {
      await rejectMutation.mutateAsync({ ref: rejectingRef, body: { reason: rejectReason } });
      toast.success("Payout rejected successfully");
      setRejectingRef(null);
      setRejectReason("");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to reject payout");
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "reference_id",
      header: "Reference",
      cell: ({ getValue }) => {
        const ref = getValue() as string;
        return <span className="font-mono text-xs text-neutral-400">{ref || "N/A"}</span>;
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ getValue }) => {
        const amount = getValue() as number;
        return <span className="text-white font-medium">₦{(Math.abs(amount) / 100).toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "wallet_id",
      header: "Wallet ID",
      cell: ({ getValue }) => {
        const id = getValue() as string;
        return <span className="font-mono text-[10px] text-neutral-500">{id?.split("-")[0]}...</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        let color = "bg-neutral-500/10 text-neutral-500";
        if (status === "COMPLETED") color = "bg-emerald-500/10 text-emerald-500";
        if (status === "PENDING") color = "bg-amber-500/10 text-amber-500";
        if (status === "FAILED") color = "bg-rose-500/10 text-rose-500";
        
        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${color}`}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ getValue }) => {
        const val = getValue() as string;
        if (!val) return null;
        return <span className="text-neutral-400 text-sm">{format(new Date(val), "MMM d, yyyy")}</span>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const payout = row.original;
        if (payout.status !== "PENDING") return <span className="text-xs text-neutral-600">-</span>;
        
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApprove(payout.reference_id)}
              disabled={approveMutation.isPending}
              className="p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-md transition-colors"
              title="Approve"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRejectingRef(payout.reference_id)}
              className="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-md transition-colors"
              title="Reject"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <motion.div variants={FADE_UP} initial="initial" animate="animate" className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Payouts</h1>
        <p className="text-neutral-500 mt-1">Review and manage organizer withdrawal requests.</p>
      </div>

      <FilterBar
        filters={[
          {
            label: "Status: All",
            key: "status",
            options: [
              { label: "Pending", value: "PENDING" },
              { label: "Completed", value: "COMPLETED" },
              { label: "Failed", value: "FAILED" },
            ],
            value: statusFilter,
            onChange: setStatusFilter,
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        pagination={{
          page,
          pageSize: 20,
          total: data?.total || 0,
        }}
        onPageChange={setPage}
      />

      {rejectingRef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-xl font-bold text-white">Reject Payout</h3>
            </div>
            
            <div className="space-y-2 mb-6">
              <label className="text-xs font-semibold text-neutral-400 uppercase">Reason for Rejection</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-rose-500"
                placeholder="e.g. Invalid bank details"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setRejectingRef(null);
                  setRejectReason("");
                }}
                className="px-4 py-2 text-sm font-bold text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason || rejectMutation.isPending}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
