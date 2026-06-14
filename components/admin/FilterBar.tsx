"use client";

import React from "react";
import { Search, Download } from "lucide-react";

interface FilterConfig {
  label: string;
  key: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}

interface FilterBarProps {
  search?: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
  };
  filters?: FilterConfig[];
  onExport?: () => void;
  exportLabel?: string;
}

export function FilterBar({ search, filters, onExport, exportLabel = "Export CSV" }: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-[#0f0f0f] border border-white/[0.06] p-4 rounded-2xl mb-6">
      {search && (
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={search.placeholder}
            className="w-full bg-[#161616] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500/50 transition-colors"
          />
        </div>
      )}

      {filters && filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {filters.map((filter) => (
            <select
              key={filter.key}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="bg-[#161616] border border-white/[0.06] rounded-xl px-4 py-2 text-sm text-neutral-300 focus:outline-none focus:border-rose-500/50 transition-colors"
            >
              <option value="">{filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}

      {onExport && (
        <div className="md:ml-auto">
          <button
            onClick={onExport}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-white/[0.06]"
          >
            <Download className="w-4 h-4" />
            {exportLabel}
          </button>
        </div>
      )}
    </div>
  );
}
