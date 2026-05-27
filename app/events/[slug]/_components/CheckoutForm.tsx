"use client";

import { useState, useEffect } from "react";
import { checkoutOrder, releaseReservation } from "@/lib/api";
import { ReservationResponse } from "@/lib/schema/orderTied";
import { Loader2, Timer, CreditCard, ShieldCheck, Mail, User, Info, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { redirectTo } from "./utils";

export default function CheckoutForm({
  reservation,
  onSuccess,
  onCancel,
}: {
  reservation: ReservationResponse;
  onSuccess: (order: any) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sendToAttendees, setSendToAttendees] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const expiring = new Date(reservation.expires_at).getTime();
      const now = Date.now();
      return Math.max(0, Math.floor((expiring - now) / 1000));
    };

    setTimeLeft(calculateTimeLeft());
    
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        // Reservation expired
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation.expires_at]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (timeLeft <= 0) {
      setError("Reservation expired. Please select tickets again.");
      releaseReservation(reservation.reservation_id)
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await checkoutOrder(reservation.reservation_id, {
        name,
        email,
        paymentToken: "paystack",
        send_to_attendees: sendToAttendees === true
      });

      if (response.status === "COMPLETED") {
        onSuccess(response);
      } else if (response.authorization_url) {
        redirectTo(response.authorization_url);
      } else {
        setError("Payment initialization failed. No authorization URL returned.");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isExpired = timeLeft <= 0;

  return (
    <div className="space-y-8 max-w-lg mx-auto pb-10">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white tracking-tight">Checkout</h2>
          <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Secure Payment</p>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors duration-500 ${
          timeLeft < 60 ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-primary/10 border-primary/30 text-primary"
        }`}>
          <Timer className="w-4 h-4" />
          <span className="text-xs font-black tabular-nums">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Order Summary Card */}
      <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Order Summary</p>
        
        <div className="space-y-3">
          {reservation.items?.map((item: any, i: number) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-white/60">{item.name || 'Ticket'} x {item.quantity}</span>
              <span className="text-white font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="h-[1px] bg-white/5 my-2" />
          <div className="flex justify-between items-end pt-1">
            <span className="text-xs font-bold text-white/30 uppercase tracking-tight">Total Due</span>
            <span className="text-2xl font-black text-white">₦{reservation.total_amount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
            <input
              placeholder="Full Name"
              required
              disabled={isExpired}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white outline-none focus:border-primary/50 focus:bg-black/60 transition-all disabled:opacity-50"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
            <input
              placeholder="Email for Digital Tickets"
              required
              type="email"
              disabled={isExpired}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white outline-none focus:border-primary/50 focus:bg-black/60 transition-all disabled:opacity-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Ticket Delivery Preference</p>
            <p className="text-sm text-white/80 leading-relaxed">How should we deliver the digital tickets?</p>
            
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => setSendToAttendees(true)}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                  sendToAttendees === true 
                    ? "bg-primary/10 border-primary text-white" 
                    : "bg-black/20 border-white/5 text-white/40 hover:border-white/20"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${sendToAttendees === true ? "border-primary" : "border-white/20"}`}>
                  {sendToAttendees === true && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold">Individual Delivery</p>
                  <p className="text-[10px] opacity-60">Send each ticket to its respective attendee's email</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSendToAttendees(false)}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                  sendToAttendees === false 
                    ? "bg-primary/10 border-primary text-white" 
                    : "bg-black/20 border-white/5 text-white/40 hover:border-white/20"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${sendToAttendees === false ? "border-primary" : "border-white/20"}`}>
                  {sendToAttendees === false && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold">Bundle Delivery (Me only)</p>
                  <p className="text-[10px] opacity-60">Send all tickets to my email only</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium flex items-center gap-3">
            <Info className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4 pt-2">
          <button
            type="submit"
            disabled={loading || isExpired || !name || !email || sendToAttendees === null}
            className="w-full bg-primary border border-primary hover:bg-orange-700  disabled:opacity-50 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CreditCard className="w-5 h-5" />
            )}
            {isExpired ? "RESERVATION EXPIRED" : "CONFIRM & PAY NOW"}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3 h-3" />
            Go back and change tickets
          </button>
        </div>
      </form>

      <div className="flex items-center justify-center gap-6 mt-10">
        <div className="flex items-center gap-2 text-[9px] font-bold text-white/20 uppercase tracking-widest">
          <ShieldCheck className="w-3 h-3" />
          Secure Checkout
        </div>
        <div className="flex items-center gap-2 text-[9px] font-bold text-white/20 uppercase tracking-widest">
          <Info className="w-3 h-3" />
          No Hidden Fees
        </div>
      </div>
    </div>
  );
}

