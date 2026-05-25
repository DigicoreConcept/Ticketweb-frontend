"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, X, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/lib/api";

export function VerificationBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // Only show for logged-in, unverified users
  if (!user || user.is_verified || dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    setError("");
    try {
      await api.post("/auth/resend-verification");
      setSent(true);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(detail || "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className="w-full bg-amber-500/10 border-b border-amber-500/20"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-2.5 flex items-center gap-3">
          {/* Icon */}
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
            <Mail className="w-3.5 h-3.5 text-amber-400" />
          </div>

          {/* Message */}
          <p className="flex-1 text-sm text-amber-200/80 min-w-0">
            {sent ? (
              <span className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Verification email sent — check your inbox (and spam folder).
              </span>
            ) : (
              <>
                <span className="font-semibold text-amber-300">Verify your email</span>
                {" "}to unlock event publishing and payouts.{" "}
                {error ? (
                  <span className="text-red-400 text-xs">{error}</span>
                ) : null}
              </>
            )}
          </p>

          {/* Resend CTA */}
          {!sent && (
            <button
              onClick={handleResend}
              disabled={sending}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 text-xs font-bold transition-all disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Sending…
                </>
              ) : (
                "Resend link"
              )}
            </button>
          )}

          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 p-1 rounded-md text-amber-500/50 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}