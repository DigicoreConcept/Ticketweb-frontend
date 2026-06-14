"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ShieldAlert, Server } from "lucide-react";

import { useAuditLogs } from "@/lib/admin/hooks/useAdminLogs";
import { DataTable } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { FADE_UP } from "@/lib/admin/motion";

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [targetFilter, setTargetFilter] = useState("");

  const { data, isLoading } = useAuditLogs({
    page,
    page_size: 20,
    action: actionFilter || undefined,
    target_type: targetFilter || undefined,
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const log = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-xs tracking-wider uppercase">{log.action.replace(/_/g, " ")}</span>
              <span className="text-[10px] text-neutral-500 font-mono">ID: {log.id.split("-")[0]}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "admin",
      header: "Admin",
      cell: ({ row }) => {
        const log = row.original;
        return (
          <div className="flex flex-col">
            <span className="text-sm text-white font-medium">{log.admin_name}</span>
            <span className="text-xs text-neutral-500">{log.admin_email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "target",
      header: "Target",
      cell: ({ row }) => {
        const log = row.original;
        return (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-neutral-300 uppercase tracking-widest">{log.target_type}</span>
            <span className="text-xs text-neutral-500 font-mono">{log.target_id}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "ip_address",
      header: "IP / Network",
      cell: ({ getValue }) => {
        const ip = getValue() as string;
        if (!ip) return <span className="text-neutral-600">-</span>;
        return (
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Server className="w-3 h-3" />
            {ip}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Timestamp",
      cell: ({ getValue }) => {
        const val = getValue() as string;
        if (!val) return null;
        return <span className="text-neutral-400 text-sm">{format(new Date(val), "MMM d, yyyy HH:mm:ss")}</span>;
      },
    },
  ];

  return (
    <motion.div variants={FADE_UP} initial="initial" animate="animate" className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Audit Log</h1>
        <p className="text-neutral-500 mt-1">Immutable record of administrative actions.</p>
      </div>

      <FilterBar
        filters={[
          {
            label: "Target: All",
            key: "target",
            options: [
              { label: "System", value: "system" },
              { label: "User", value: "user" },
              { label: "Event", value: "event" },
              { label: "Order", value: "order" },
              { label: "Payout", value: "payout" },
            ],
            value: targetFilter,
            onChange: setTargetFilter,
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
