"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ArrowLeft, UserCheck, UserX, Shield, Briefcase, Mail, Calendar } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useUser, useVerifyUser, useDeactivateUser, usePromoteUser } from "@/lib/admin/hooks/useUsers";
import { FADE_UP } from "@/lib/admin/motion";
import { toast } from "@/lib/store/toastStore";

export default function UserDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: user, isLoading } = useUser(id);
  const verifyMutation = useVerifyUser();
  const deactivateMutation = useDeactivateUser();
  const promoteMutation = usePromoteUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-white mb-2">User not found</h2>
        <Link href="/admin/users" className="text-rose-500 hover:underline">
          Back to users
        </Link>
      </div>
    );
  }

  const handleVerify = async () => {
    try {
      await verifyMutation.mutateAsync(id);
      toast.success("User verified successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to verify user");
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateMutation.mutateAsync(id);
      toast.success(user.is_active ? "User deactivated" : "User activated");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to change status");
    }
  };

  const handlePromote = async () => {
    try {
      await promoteMutation.mutateAsync({ id, body: { is_superuser: !user.is_superuser } });
      toast.success(user.is_superuser ? "Admin rights revoked" : "Promoted to Admin");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update role");
    }
  };

  return (
    <motion.div variants={FADE_UP} initial="initial" animate="animate" className="max-w-4xl mx-auto space-y-6">
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-4xl font-bold text-white uppercase border-2 border-white/10">
            {user.full_name?.charAt(0) || user.email?.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">{user.full_name || "Unknown"}</h1>
            <p className="text-neutral-500 mt-1 font-mono text-sm flex items-center gap-2">
              <Mail className="w-4 h-4" /> {user.email}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                user.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
              }`}>
                {user.is_active ? "Active" : "Inactive"}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                user.is_verified ? "bg-blue-500/10 text-blue-500" : "bg-neutral-500/10 text-neutral-500"
              }`}>
                {user.is_verified ? "Verified" : "Unverified"}
              </span>
              {user.is_superuser && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Superadmin
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleVerify}
            disabled={verifyMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
          >
            <UserCheck className="w-4 h-4" />
            Verify
          </button>
          <button
            onClick={handleDeactivate}
            disabled={deactivateMutation.isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${
              user.is_active ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
            }`}
          >
            <UserX className="w-4 h-4" />
            {user.is_active ? "Deactivate" : "Activate"}
          </button>
          <button
            onClick={handlePromote}
            disabled={promoteMutation.isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${
              user.is_superuser ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20" : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
            }`}
          >
            <Shield className="w-4 h-4" />
            {user.is_superuser ? "Revoke Admin" : "Make Admin"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Profile Information</h3>
          <div>
            <p className="text-sm text-neutral-500">User ID</p>
            <p className="text-white font-mono text-xs">{user.id}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Joined</p>
            <p className="text-white text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(user.created_at || new Date()), "PPP p")}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
