"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, Star, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { useEvents } from "@/lib/admin/hooks/useEvents";
import { DataTable } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { FADE_UP } from "@/lib/admin/motion";

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState("");

  const { data, isLoading } = useEvents({
    page,
    page_size: 20,
    search: search || undefined,
    status: statusFilter || undefined,
    is_featured: featuredFilter === "featured" ? true : featuredFilter === "regular" ? false : undefined,
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "title",
      header: "Event",
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white/10 overflow-hidden relative shrink-0">
              {event.image_url ? (
                <img src={event.image_url} alt={event.title} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-neutral-500" />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white line-clamp-1">{event.title}</span>
              <span className="text-xs text-neutral-500">{event.category || "Uncategorized"}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "start_time",
      header: "Date",
      cell: ({ getValue }) => {
        const val = getValue() as string;
        if (!val) return <span className="text-neutral-500">TBA</span>;
        return <span className="text-neutral-300">{format(new Date(val), "MMM d, yyyy")}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        let color = "bg-neutral-500/10 text-neutral-500";
        if (status === "PUBLISHED") color = "bg-emerald-500/10 text-emerald-500";
        if (status === "DRAFT") color = "bg-amber-500/10 text-amber-500";
        if (status === "CANCELLED") color = "bg-rose-500/10 text-rose-500";
        
        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${color}`}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "is_featured",
      header: "Featured",
      cell: ({ getValue }) => {
        const isFeatured = getValue() as boolean;
        return isFeatured ? (
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
        ) : (
          <Star className="w-5 h-5 text-neutral-600" />
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const event = row.original;
        return (
          <Link
            href={`/admin/events/${event.id}`}
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
        <h1 className="text-3xl font-black text-white tracking-tight">Events</h1>
        <p className="text-neutral-500 mt-1">Manage and moderate all platform events.</p>
      </div>

      <FilterBar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Search events by title...",
        }}
        filters={[
          {
            label: "Status: All",
            key: "status",
            options: [
              { label: "Published", value: "PUBLISHED" },
              { label: "Draft", value: "DRAFT" },
              { label: "Cancelled", value: "CANCELLED" },
              { label: "Ended", value: "ENDED" },
            ],
            value: statusFilter,
            onChange: setStatusFilter,
          },
          {
            label: "Featured: All",
            key: "featured",
            options: [
              { label: "Featured", value: "featured" },
              { label: "Regular", value: "regular" },
            ],
            value: featuredFilter,
            onChange: setFeaturedFilter,
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
