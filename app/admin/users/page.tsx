"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, User as UserIcon, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

import { useUsers } from "@/lib/admin/hooks/useUsers";
import { DataTable } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { FADE_UP } from "@/lib/admin/motion";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");

  const { data, isLoading } = useUsers({
    page,
    page_size: 20,
    search: search || undefined,
    is_active: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
    is_verified: verifiedFilter === "verified" ? true : verifiedFilter === "unverified" ? false : undefined,
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "full_name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              {user.full_name ? (
                <span className="text-sm font-bold">{user.full_name.charAt(0)}</span>
              ) : (
                <UserIcon className="w-5 h-5 text-neutral-400" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white">{user.full_name || "Unknown"}</span>
              <span className="text-xs text-neutral-500">{user.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ getValue }) => (
        <span className="text-neutral-400">
          {formatDistanceToNow(new Date(getValue() as string), { addSuffix: true })}
        </span>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ getValue }) => {
        const isActive = getValue() as boolean;
        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-neutral-500/10 text-neutral-500"
          }`}>
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      accessorKey: "is_verified",
      header: "Verified",
      cell: ({ getValue }) => {
        const isVerified = getValue() as boolean;
        return (
          <div className="flex items-center gap-1.5">
            {isVerified ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-500" />
            )}
            <span className={isVerified ? "text-emerald-500" : "text-amber-500"}>
              {isVerified ? "Yes" : "No"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "is_superuser",
      header: "Role",
      cell: ({ getValue }) => {
        const isAdmin = getValue() as boolean;
        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isAdmin ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : "bg-white/5 text-neutral-400"
          }`}>
            {isAdmin ? "Superuser" : "User"}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Link
            href={`/admin/users/${user.id}`}
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
        <h1 className="text-3xl font-black text-white tracking-tight">Users</h1>
        <p className="text-neutral-500 mt-1">Manage platform users and roles.</p>
      </div>

      <FilterBar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Search users by name or email...",
        }}
        filters={[
          {
            label: "Status: All",
            key: "status",
            options: [
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
            value: statusFilter,
            onChange: setStatusFilter,
          },
          {
            label: "Verification: All",
            key: "verified",
            options: [
              { label: "Verified", value: "verified" },
              { label: "Unverified", value: "unverified" },
            ],
            value: verifiedFilter,
            onChange: setVerifiedFilter,
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
