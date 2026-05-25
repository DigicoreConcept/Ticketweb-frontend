"use client";

import { useState, useEffect } from "react";
import {
  TicketTier,
  TicketType,
  TableTicketConfig,
  AssignedSeatingConfig,
  Event,
} from "@/lib/schema/eventTied";
import { ReservationItem } from "@/lib/schema/orderTied";
import { getTakenSeats } from "@/lib/api";
import { Ticket as TicketIcon, Check, Users, Sofa, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TYPE_META: Record<string, { label: string; color: string; icon: any }> = {
  [TicketType.GENERAL_ADMISSION]: {
    label: "General Admission",
    color: "#3b82f6",
    icon: TicketIcon,
  },
  [TicketType.ASSIGNED_SEATING]: {
    label: "Assigned Seating",
    color: "#a855f7",
    icon: Sofa,
  },
  [TicketType.TABLE]: { 
    label: "Table Booking", 
    color: "#ec4899",
    icon: Users,
  },
};

export default function TicketSelection({
  event,
  onCheckout,
}: {
  event: Event;
  onCheckout: (
    items: ReservationItem[],
    quantities: Record<string, number>,
    selectedSeats: Record<string, string[]>
  ) => void;
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedTierIds, setSelectedTierIds] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Record<string, string[]>>({});
  const [takenSeats, setTakenSeats] = useState<{tier_id: string, seat_number: string | number, status: string}[]>([]);

  useEffect(() => {
    getTakenSeats(event.id).then(setTakenSeats).catch(console.error);
  }, [event.id]);

  const calculateTotal = () => {
    return event.ticket_tiers?.reduce((sum, tier) => {
      const isSelected = selectedTierIds.includes(tier.id);
      if (!isSelected) return sum;

      if (tier.type === TicketType.ASSIGNED_SEATING) {
        const seats = selectedSeats[tier.id] || [];
        return sum + tier.base_price * seats.length;
      } else {
        const qty = quantities[tier.id] || 1; // Default to 1 if selected but no qty yet
        return sum + tier.base_price * qty;
      }
    }, 0) || 0;
  };

  const total = calculateTotal();

  const handleSelectTier = (tierId: string) => {
    setSelectedTierIds((prev) => {
      const isCurrentlySelected = prev.includes(tierId);
      if (isCurrentlySelected) {
        return prev.filter((id) => id !== tierId);
      } else {
        // Auto set qty to 1 for non-seating tickets
        const tier = event.ticket_tiers?.find(t => t.id === tierId);
        if (tier && tier.type !== TicketType.ASSIGNED_SEATING && !quantities[tierId]) {
          setQuantities(q => ({ ...q, [tierId]: 1 }));
        }
        return [...prev, tierId];
      }
    });
  };

  const toggleSeat = (tierId: string, seatLabel: string) => {
    setSelectedSeats(prev => {
      const current = prev[tierId] || [];
      const next = current.includes(seatLabel) 
        ? current.filter(s => s !== seatLabel)
        : [...current, seatLabel];
      
      // Sync with quantities for simplicity in handleCheckout
      setQuantities(q => ({ ...q, [tierId]: next.length }));
      
      return { ...prev, [tierId]: next };
    });
  };

  const handleCheckout = () => {
    const items = selectedTierIds.map(tierId => {
      const qty = quantities[tierId] || 0;
      return { tier_id: tierId, quantity: qty };
    }).filter(item => item.quantity > 0);

    if (items.length > 0) {
      onCheckout(items, quantities, selectedSeats);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2 text-white/50 text-xs px-1">
        <Info className="w-3 h-3" />
        <span>Select one or more ticket types to proceed</span>
      </div>

      {event.ticket_tiers?.map((tier) => {
        const meta = TYPE_META[tier.type] || {
          label: tier.type,
          color: "#f97316",
          icon: TicketIcon,
        };
        const tableConfig = tier.config as TableTicketConfig;
        const seatingConfig = tier.config as AssignedSeatingConfig;
        const selected = selectedTierIds.includes(tier.id);
        const Icon = meta.icon;

        return (
          <div key={tier.id} className="group">
            {/* Ticket Card */}
            <div
              onClick={() => handleSelectTier(tier.id)}
              className={`relative overflow-hidden flex justify-between items-center rounded-2xl p-5 cursor-pointer transition-all duration-300 border backdrop-blur-md ${
                selected
                  ? "border-primary/50 bg-white/[0.08] shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
              }`}
            >
              {/* Glass Highlight */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
              
              <div className="flex items-center gap-5">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                    selected ? "bg-primary/20" : "bg-white/5 group-hover:bg-white/10"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 transition-colors duration-300 ${
                      selected ? "text-primary" : "text-white/40 group-hover:text-white/60"
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-4 w-full">
                    <h3 className="font-bold text-base text-white tracking-tight">{tier.name}</h3>
                    <span
                        className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border"
                        style={{
                          background: `${meta.color}15`,
                          color: meta.color,
                          borderColor: `${meta.color}30`
                        }}
                      >
                        {meta.label}
                      </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-lg font-bold text-white/90">
                      ₦{tier.base_price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interaction Area */}
              <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                {selected ? (
                  tier.type !== TicketType.ASSIGNED_SEATING ? (
                    <div className="flex items-center bg-black/40 rounded-lg p-1 border border-white/5">
                      <button
                        className="w-8 h-8 rounded-md hover:bg-white/10 flex items-center justify-center transition"
                        onClick={() =>
                          setQuantities((prev) => ({
                            ...prev,
                            [tier.id]: Math.max((prev[tier.id] || 0) - 1, 0),
                          }))
                        }
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-bold text-sm">
                        {quantities[tier.id] || 1}
                      </span>
                      <button
                        className="w-8 h-8 rounded-md hover:bg-white/10 flex items-center justify-center transition"
                        onClick={() =>
                          setQuantities((prev) => ({
                            ...prev,
                            [tier.id]: (prev[tier.id] || 0) + 1,
                          }))
                        }
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                      <Check className="w-4 h-4" />
                      <span>{selectedSeats[tier.id]?.length || 0} selected</span>
                    </div>
                  )
                ) : (
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 transition">
                    <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white/40 transition" />
                  </div>
                )}
              </div>
            </div>

            {/* Expanded Content: Assigned Seating */}
            <AnimatePresence>
              {selected && tier.type === TicketType.ASSIGNED_SEATING && seatingConfig && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                    <div className="flex justify-between items-end">
                      <p className="text-sm font-semibold text-white/90">Select Your Seats</p>
                      <div className="flex gap-4 text-[10px] text-white/40 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full border border-white/30" /> Free</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Chosen</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-white/10" /> Sold</div>
                      </div>
                    </div>
                    
                    <div className="relative py-4 px-2 bg-black/20 rounded-xl overflow-x-auto scrollbar-hide">
                      <div className="min-w-max space-y-3">
                        {/* Stage Indicator */}
                        <div className="w-full h-1 bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 rounded-full mb-8 relative">
                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary/60 tracking-widest uppercase">Stage</span>
                        </div>

                        {Array.from({ length: seatingConfig.row_count }).map((_, rowIndex) => {
                          const rowLetter = String.fromCharCode(65 + rowIndex);
                          return (
                            <div key={rowIndex} className="flex justify-center items-center gap-3">
                              <span className="w-4 text-[10px] font-bold text-white/20">{rowLetter}</span>
                              <div className="flex gap-2">
                                {Array.from({ length: seatingConfig.seats_per_row }).map((_, seatIndex) => {
                                  const label = `${rowLetter}${seatIndex + 1}`;
                                  const isSeatSelected = selectedSeats[tier.id]?.includes(label);
                                  
                                  const takenSeat = takenSeats.find(s => s.tier_id === tier.id && String(s.seat_number) === label);
                                  
                                  if (takenSeat) {
                                    return (
                                      <div
                                        key={seatIndex}
                                        className="w-7 h-7 rounded-lg text-[9px] font-bold flex items-center justify-center bg-white/10 text-white/20 cursor-not-allowed"
                                        title={takenSeat.status === 'HELD' ? 'Held by another user' : 'Sold'}
                                      >
                                        {label}
                                      </div>
                                    );
                                  }

                                  return (
                                    <button
                                      key={seatIndex}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSeat(tier.id, label);
                                      }}
                                      className={`w-7 h-7 rounded-lg text-[9px] font-bold flex items-center justify-center transition-all duration-300 ${
                                        isSeatSelected 
                                          ? "bg-primary text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                                          : "bg-white/5 border border-white/10 hover:border-white/30 text-white/40"
                                      }`}
                                    >
                                      {label}
                                    </button>
                                  );
                                })}
                              </div>
                              <span className="w-4 text-[10px] font-bold text-white/20 text-right">{rowLetter}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expanded Content: Table Info */}
            <AnimatePresence>
              {selected && tier.type === TicketType.TABLE && tableConfig && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-white/40" />
                      <span className="text-xs text-white/60">
                        Each table seats <span className="text-white font-bold">{tableConfig.seats_per_table} guests</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-white/30 uppercase tracking-tighter">
                      {tier.quantity_available} tables left
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Floating Summary & Checkout */}
      <AnimatePresence>
        {total > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-80 z-50"
          >
            <div className="p-5 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Estimated Total</p>
                  <p className="text-2xl font-black text-white">₦{total.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <TicketIcon className="w-5 h-5 text-primary" />
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full py-4 rounded-xl bg-primary hover:bg-blue-600 text-white font-black tracking-wide text-sm transition-all duration-300 shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_25px_rgba(59,130,246,0.4)] active:scale-[0.98]"
              >
                SECURE TICKETS
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

