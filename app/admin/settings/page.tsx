"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, AlertTriangle, Settings2, ShieldCheck, CreditCard } from "lucide-react";

import { useSettings, useUpdateSettings } from "@/lib/admin/hooks/useAdminLogs";
import { FADE_UP } from "@/lib/admin/motion";
import { toast } from "@/lib/store/toastStore";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(formData);
      toast.success("Platform settings updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update settings");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div variants={FADE_UP} initial="initial" animate="animate" className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Platform Settings</h1>
          <p className="text-neutral-500 mt-1">Configure global platform behavior and rules.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Financial Settings */}
        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Financial Rules</h2>
              <p className="text-xs text-neutral-500">Fees and payout configurations.</p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase">Platform Fee (%)</label>
              <input
                type="number"
                value={formData.platform_fee_percent || ""}
                onChange={(e) => handleChange("platform_fee_percent", parseFloat(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-rose-500 transition-colors"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase">Min Payout Amount (NGN)</label>
              <input
                type="number"
                value={formData.min_payout_amount || ""}
                onChange={(e) => handleChange("min_payout_amount", parseFloat(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-rose-500 transition-colors"
              />
            </div>
            
            <div className="md:col-span-2 flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div>
                <p className="text-sm font-bold text-white">Auto-approve Payouts</p>
                <p className="text-xs text-neutral-500 mt-1">Automatically approve payouts below threshold.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={formData.auto_approve_payouts || false}
                  onChange={(e) => handleChange("auto_approve_payouts", e.target.checked)}
                />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Access Control */}
        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Access Control</h2>
              <p className="text-xs text-neutral-500">Manage user capabilities.</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div>
                <p className="text-sm font-bold text-white">Allow Event Creation</p>
                <p className="text-xs text-neutral-500 mt-1">If disabled, no one can create new events.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={formData.allow_event_creation ?? true}
                  onChange={(e) => handleChange("allow_event_creation", e.target.checked)}
                />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div>
                <p className="text-sm font-bold text-white">Require Verification to Publish</p>
                <p className="text-xs text-neutral-500 mt-1">Users must be KYC verified to publish public events.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={formData.require_verify_to_publish ?? false}
                  onChange={(e) => handleChange("require_verify_to_publish", e.target.checked)}
                />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-rose-500/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-rose-500">Danger Zone</h2>
              <p className="text-xs text-rose-500/70">System-wide critical toggles.</p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-rose-500/10">
              <div>
                <p className="text-sm font-bold text-white">Maintenance Mode</p>
                <p className="text-xs text-neutral-400 mt-1">Disables all public access to the platform.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={formData.maintenance_mode ?? false}
                  onChange={(e) => handleChange("maintenance_mode", e.target.checked)}
                />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
