"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

import { useTransactions } from "@/lib/admin/hooks/useAdminLogs";
import { DataTable } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { FADE_UP } from "@/lib/admin/motion";

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useTransactions({
    page,
    page_size: 20,
    type: typeFilter || undefined,
    status: statusFilter || undefined,
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const tx = row.original;
        const isCredit = tx.amount > 0;
        
        return (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              isCredit ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
            }`}>
              {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm">{tx.type.replace("_", " ")}</span>
              <span className="text-xs text-neutral-500 font-mono">{tx.reference_id || "No Ref"}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const tx = row.original;
        const amount = Number(tx.amount);
        const isCredit = amount > 0;
        
        return (
          <span className={`font-bold ${isCredit ? "text-emerald-400" : "text-white"}`}>
            {isCredit ? "+" : ""}₦{(Math.abs(amount) / 100).toLocaleString()}
          </span>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ getValue }) => {
        const desc = getValue() as string;
        return <span className="text-sm text-neutral-400 line-clamp-1">{desc || "-"}</span>;
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
        return <span className="text-neutral-400 text-sm">{format(new Date(val), "MMM d, yyyy HH:mm")}</span>;
      },
    },
  ];

  return (
    <motion.div variants={FADE_UP} initial="initial" animate="animate" className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Transactions</h1>
        <p className="text-neutral-500 mt-1">Global platform transaction ledger.</p>
      </div>

      <FilterBar
        filters={[
          {
            label: "Type: All",
            key: "type",
            options: [
              { label: "Ticket Sale", value: "TICKET_SALE" },
              { label: "Platform Fee", value: "PLATFORM_FEE" },
              { label: "Payout", value: "PAYOUT" },
              { label: "Refund", value: "REFUND" },
            ],
            value: typeFilter,
            onChange: setTypeFilter,
          },
          {
            label: "Status: All",
            key: "status",
            options: [
              { label: "Completed", value: "COMPLETED" },
              { label: "Pending", value: "PENDING" },
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
    </motion.div>
  );
}
