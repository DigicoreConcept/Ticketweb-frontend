"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Ticket } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";

type State = "loading" | "success" | "error";

function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [state, setState] = useState<State>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setState("error");
      setErrorMsg("No verification token found in the link.");
      return;
    }

    api
      .get(`/auth/verify-email?token=${token}`)
      .then(async () => {
        await refreshUser(); // sync the auth context immediately
        setState("success");
        // Auto-redirect to dashboard after 3s
        setTimeout(() => router.push("/dashboard"), 3000);
      })
      .catch((err) => {
        setState("error");
        setErrorMsg(
          err.response?.data?.detail ||
            "This link is invalid or has expired. Please request a new one."
        );
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-12">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(251,45,0,0.3)]">
          <Ticket className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-black text-white">
          Ticket<span className="text-primary">web</span>
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden"
      >
        {/* Top accent */}
        <div
          className={`h-[2px] w-full ${
            state === "success"
              ? "bg-gradient-to-r from-transparent via-green-500/50 to-transparent"
              : state === "error"
              ? "bg-gradient-to-r from-transparent via-red-500/50 to-transparent"
              : "bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          }`}
        />

        <div className="p-10 text-center space-y-5">
          {/* Icon */}
          <div className="flex justify-center">
            {state === "loading" && (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}
            {state === "success" && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center"
              >
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </motion.div>
            )}
            {state === "error" && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center"
              >
                <XCircle className="w-8 h-8 text-red-400" />
              </motion.div>
            )}
          </div>

          {/* Text */}
          {state === "loading" && (
            <>
              <h1 className="text-xl font-black text-white">Verifying your email…</h1>
              <p className="text-white/40 text-sm">Just a moment.</p>
            </>
          )}
          {state === "success" && (
            <>
              <h1 className="text-xl font-black text-white">Email verified!</h1>
              <p className="text-white/50 text-sm leading-relaxed">
                Your account is now fully active. You can create events,
                sell tickets, and request payouts.
              </p>
              <p className="text-white/30 text-xs">
                Redirecting you to the dashboard…
              </p>
            </>
          )}
          {state === "error" && (
            <>
              <h1 className="text-xl font-black text-white">Verification failed</h1>
              <p className="text-white/50 text-sm leading-relaxed">{errorMsg}</p>
              <Link
                href="/dashboard/settings"
                className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-sm transition-all"
              >
                Resend verification email
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    }>
      <VerifyEmailPage />
    </Suspense>
  );
}