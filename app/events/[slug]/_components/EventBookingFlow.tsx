"use client";
import { useState } from "react";
import { PublicEvent, holdTickets } from "@/lib/api";
import { ReservationItem, ReservationResponse, Attendee } from "@/lib/schema/orderTied";
import { TicketType } from "@/lib/schema/eventTied";
import buildAttendeeSlots from "@/lib/store/orderBuilderStore";
import TicketSelection from "./TicketSelection";
import CheckoutForm from "./CheckoutForm";
import { CheckCircle2, Ticket, ArrowLeft } from "lucide-react";
import Link from "next/link";
import AttendeeForm from "./AttendeeForm";
import { motion, AnimatePresence } from "framer-motion";

export default function EventBookingFlow({ event }: { event: PublicEvent }) {
  const [step, setStep] = useState<
    "SELECT" | "CONTACT" | "CHECKOUT" | "SUCCESS"
  >("SELECT");
  const [reservation, setReservation] = useState<ReservationResponse | null>(
    null,
  );
  const [order, setOrder] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [slots, setSlots] = useState<any[]>([]);

  const handleHoldTicketsStep = async (
    items: ReservationItem[],
    quantities: Record<string, number>,
    selectedSeats: Record<string, string[]>,
  ) => {
    setQuantities(quantities);
    const generatedSlots = buildAttendeeSlots(event, quantities, selectedSeats);
    setSlots(generatedSlots);
    setStep("CONTACT");
  };

  const handleAttendeesSubmit = async (
    allAttendees: Record<number, Attendee>, 
    sharedTableStatus: Record<string, boolean>
  ) => {
    try {
      setError(null);
      
      const items: ReservationItem[] = [];

      // Iterate through the selected tiers
      (event.ticket_tiers || []).forEach(tier => {
        const qty = quantities[tier.id] || 0;
        if (qty <= 0) return;

        if (tier.type === TicketType.TABLE) {
          // For tables, check each table's shared status
          for (let t = 0; t < qty; t++) {
            const tableId = `${tier.id}_table_${t}`;
            const isShared = sharedTableStatus[tableId];
            
            // Find attendee indices for this specific table
            const tableAttendeeIndices = slots
              .map((s, i) => s.table_id === tableId ? i : -1)
              .filter(idx => idx !== -1);
            
            const tableAttendees: Attendee[] = [];
            if (isShared && tableAttendeeIndices.length > 0) {
              // Only first attendee for this table as per backend requirement
              const first = allAttendees[tableAttendeeIndices[0]];
              tableAttendees.push({
                name: first.name,
                email: first.email,
                phone: first.phone,
                table_number: t + 1,
                seat_number: 1, // Default to 1 if shared
              });
            } else {
              tableAttendeeIndices.forEach((idx, sIdx) => {
                const att = allAttendees[idx];
                if (att) {
                  tableAttendees.push({
                    name: att.name,
                    email: att.email,
                    phone: att.phone,
                    table_number: t + 1,
                    seat_number: sIdx + 1,
                  });
                }
              });
            }

            items.push({
              tier_id: tier.id,
              quantity: 1,
              shared_attendee: isShared,
              attendees: tableAttendees,
            });
          }
        } else {
          // General Admission or Assigned Seating
          const tierAttendees: Attendee[] = [];
          slots.forEach((slot, index) => {
            if (slot.tier_id === tier.id && allAttendees[index]) {
              const att = allAttendees[index];
              tierAttendees.push({
                name: att.name,
                email: att.email,
                phone: att.phone,
                seat_number: slot.seat_number,
              });
            }
          });

          items.push({
            tier_id: tier.id,
            quantity: qty,
            shared_attendee: false,
            attendees: tierAttendees,
          });
        }
      });

      const res = await holdTickets(event.id, items);
      setReservation(res);
      setStep("CHECKOUT");
    } catch (err: any) {
      setError("Failed to reserve tickets. They might be sold out or the session expired.");
    }
  };

  const handleSuccess = (completedOrder: any) => {
    setOrder(completedOrder);
    setStep("SUCCESS");
  };

  if (step === "SUCCESS" && order) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-neutral-950 p-8 md:p-10 rounded-3xl shadow-2xl border border-white/10 text-center space-y-8 max-w-lg w-full overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
          
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(251,45,0,0.2)]">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">Order Confirmed!</h2>
            <p className="text-neutral-400 font-medium">
              Your tickets have been sent to <strong className="text-white font-bold">{order.customer_email || 'your email'}</strong>.
            </p>
          </div>

          <div className="bg-white/[0.03] p-6 rounded-2xl text-left border border-white/5 space-y-4">
            <div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">
                Order Reference
              </p>
              <p className="font-mono text-xl font-bold text-white">{order.id || order.reference}</p>
            </div>
            <div className="h-[1px] bg-white/5 w-full" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-400 font-semibold">Total Paid</span>
              <span className="font-bold text-white text-xl">₦{(order.total_amount || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(251,45,0,0.3)] hover:shadow-[0_0_30px_rgba(251,45,0,0.5)] flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Ticket className="w-5 h-5" />
              View My Tickets
            </Link>
            <Link
              href="/"
              className="text-neutral-500 hover:text-white font-bold text-sm py-2 transition-colors"
            >
              Return to Events
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Step Indicator */}
      {step !== "SUCCESS" && (
        <div className="flex items-center gap-4 mb-8 px-2">
          {step !== "SELECT" && (
            <button 
              onClick={() => setStep(step === "CONTACT" ? "SELECT" : "CONTACT")}
              className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex gap-2">
            {["SELECT", "CONTACT", "CHECKOUT"].map((s, i) => (
              <div 
                key={s} 
                className={`h-1 rounded-full transition-all duration-500 ${
                  step === s ? "w-8 bg-primary" : (
                    ["SELECT", "CONTACT", "CHECKOUT"].indexOf(step) > i ? "w-4 bg-primary/40" : "w-4 bg-white/10"
                  )
                }`} 
              />
            ))}
          </div>
        </div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 text-red-500 p-4 rounded-2xl border border-red-500/20 mb-8 flex items-center gap-3 text-sm font-medium"
        >
          <Info className="w-5 h-5" />
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {step === "SELECT" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <TicketSelection event={event} onCheckout={handleHoldTicketsStep} />
          </motion.div>
        )}

        {step === "CONTACT" && (
          <motion.div
            key="contact"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <AttendeeForm slots={slots} onSubmit={handleAttendeesSubmit} />
          </motion.div>
        )}

        {step === "CHECKOUT" && reservation && (
          <motion.div
            key="checkout"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CheckoutForm
              reservation={reservation}
              onSuccess={handleSuccess}
              onCancel={() => setStep("SELECT")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Info({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

