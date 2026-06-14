"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FADE_IN } from "@/lib/admin/motion";
import { X } from "lucide-react";

interface ActionModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit: () => void;
  submitLabel: string;
  variant?: "danger" | "default";
  isLoading?: boolean;
}

export function ActionModal({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel,
  variant = "default",
  isLoading,
}: ActionModalProps) {
  const isDanger = variant === "danger";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            variants={FADE_IN}
            initial="initial"
            animate="animate"
            exit="initial"
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-[#161616] border border-white/[0.06] rounded-3xl w-full max-w-lg pointer-events-auto shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-2 text-neutral-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {children}
              </div>

              <div className="p-6 border-t border-white/[0.06] flex justify-end gap-3 bg-[#0f0f0f] rounded-b-3xl">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onSubmit}
                  disabled={isLoading}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDanger 
                      ? "bg-rose-600 hover:bg-rose-500 text-white" 
                      : "bg-white text-black hover:bg-neutral-200"
                  }`}
                >
                  {isLoading ? "Processing..." : submitLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
