"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { verifyPayment } from "@/lib/api";
import { CheckCircle2, Ticket, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TubesBackground } from "@/components/ui/TubesBackground";

function PaymentCallback() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const [status, setStatus] = useState<"VERIFYING" | "SUCCESS" | "ERROR">(
    "VERIFYING",
  );
  const [order, setOrder] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setStatus("ERROR");
      setErrorMsg("No payment reference found.");
      return;
    }

    const verify = async () => {
      try {
        const data = await verifyPayment(reference);
        setOrder(data);
        setStatus("SUCCESS");
      } catch (err: any) {
        console.error(err);
        setStatus("ERROR");
        setErrorMsg(
          err.response?.data?.detail || "Payment verification failed.",
        );
      }
    };

    verify();
  }, [reference]);

  if (status === "VERIFYING") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center space-y-6">
        <TubesBackground className="absolute inset-0 opacity-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Verifying Payment
          </h2>
          <p className="text-neutral-500 font-medium text-sm mt-2">
            Please do not close this window...
          </p>
        </div>
      </div>
    );
  }

  if (status === "ERROR") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-red-500/20 text-center space-y-6 max-w-md w-full relative z-10 shadow-2xl"
        >
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Payment Failed
            </h2>
            <p className="text-neutral-400 mt-2 text-sm">{errorMsg}</p>
          </div>
          <Link
            href="/"
            className="inline-block w-full px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-colors"
          >
            Return Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none"></div>
      <TubesBackground className="absolute inset-0 opacity-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-neutral-950/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/10 text-center space-y-8 max-w-lg w-full relative z-10 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

        <div className="flex justify-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(251,45,0,0.2)]">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            Order Confirmed!
          </h2>
          <p className="text-neutral-400 mt-3 text-sm leading-relaxed">
            Thank you for your purchase. Your tickets have been sent to{" "}
            <strong className="text-white font-bold">
              {order?.guest_email}
            </strong>
            .
          </p>
        </div>

        <div className="bg-white/[0.03] p-6 rounded-2xl text-left border border-white/5 space-y-4">
          <div>
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
              Order Reference
            </p>
            <p className="font-mono text-lg font-bold text-white">
              {order?.id}
            </p>
          </div>
          <div className="h-[1px] w-full bg-white/5" />
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-neutral-400">
              Total Amount
            </p>
            <p className="font-mono text-xl font-bold text-white">
              {(order?.total_amount || 0).toLocaleString("en-NG", {
                style: "currency",
                currency: "NGN",
              })}
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-primary text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(251,45,0,0.3)] hover:shadow-[0_0_30px_rgba(251,45,0,0.5)] active:scale-[0.98]"
          >
            <Ticket className="w-5 h-5" />
            View My Tickets
          </Link>
          <Link
            href="/"
            className="text-sm font-bold text-neutral-500 hover:text-white transition-colors py-2"
          >
            Return to Events
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <PaymentCallback />
    </Suspense>
  );
}
