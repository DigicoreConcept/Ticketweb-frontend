"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

import { useOrders } from "@/lib/admin/hooks/useOrders";
import { DataTable } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { FADE_UP } from "@/lib/admin/motion";

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useOrders({
    page,
    page_size: 20,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ getValue }) => {
        const id = getValue() as string;
        return <span className="font-mono text-xs text-neutral-400">{id.split("-")[0]}...</span>;
      },
    },
    {
      accessorKey: "guest_email",
      header: "Customer",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-bold text-white">{order.guest_name || "Guest"}</span>
            <span className="text-xs text-neutral-500">{order.guest_email || "No email"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "total_amount",
      header: "Amount",
      cell: ({ getValue }) => {
        const amount = getValue() as number;
        return <span className="text-emerald-400 font-medium">₦{(amount / 100).toLocaleString()}</span>;
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
        if (status === "CANCELLED" || status === "FAILED") color = "bg-rose-500/10 text-rose-500";
        
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
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <Link
            href={`/admin/orders/${order.id}`}
            className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors inline-flex"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Link>
        );
      },
    },
  ];

  return (
    <motion.div variants={FADE_UP} initial="initial" animate="animate" className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Orders</h1>
        <p className="text-neutral-500 mt-1">View and manage all platform ticket orders.</p>
      </div>

      <FilterBar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Search by email, name or ref...",
        }}
        filters={[
          {
            label: "Status: All",
            key: "status",
            options: [
              { label: "Completed", value: "COMPLETED" },
              { label: "Pending", value: "PENDING" },
              { label: "Cancelled", value: "CANCELLED" },
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
