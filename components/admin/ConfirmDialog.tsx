"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FADE_IN } from "@/lib/admin/motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "danger" | "warning" | "default";
  isLoading?: boolean;
  requireTyping?: string;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "default",
  isLoading,
  requireTyping,
}: ConfirmDialogProps) {
  const [typedValue, setTypedValue] = useState("");

  const isConfirmed = !requireTyping || typedValue === requireTyping;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: "text-rose-500 bg-rose-500/10",
          button: "bg-rose-600 hover:bg-rose-500 text-white",
        };
      case "warning":
        return {
          icon: "text-amber-500 bg-amber-500/10",
          button: "bg-amber-600 hover:bg-amber-500 text-white",
        };
      default:
        return {
          icon: "text-blue-500 bg-blue-500/10",
          button: "bg-white text-black hover:bg-neutral-200",
        };
    }
  };

  const styles = getVariantStyles();

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
              className="bg-[#161616] border border-white/[0.06] rounded-3xl w-full max-w-md p-6 pointer-events-auto shadow-2xl relative"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex gap-4">
                <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${styles.icon}`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                    {description}
                  </p>

                  {requireTyping && (
                    <div className="mb-6">
                      <label className="block text-xs font-medium text-neutral-400 mb-2">
                        Type <span className="text-white font-mono font-bold select-all">{requireTyping}</span> to confirm
                      </label>
                      <input
                        type="text"
                        value={typedValue}
                        onChange={(e) => setTypedValue(e.target.value)}
                        className="w-full bg-[#0f0f0f] border border-rose-500/30 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-mono"
                        placeholder={requireTyping}
                      />
                    </div>
                  )}

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={onClose}
                      disabled={isLoading}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (isConfirmed) onConfirm();
                      }}
                      disabled={!isConfirmed || isLoading}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${styles.button}`}
                    >
                      {isLoading ? "Processing..." : confirmLabel}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
