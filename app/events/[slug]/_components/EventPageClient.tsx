"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Info } from "lucide-react";
import { PublicEvent } from "@/lib/api";
import { formatEventPrice } from "@/lib/utils";
import EventDetails from "./EventDetails";
import EventBookingFlow from "./EventBookingFlow";
import BackButton from "@/components/ui/BackButton";

const COLLAPSE_AT = 80;
const EXPAND_AT = 8;

export default function EventPageClient({
  event,
  formattedDate,
}: {
  event: PublicEvent;
  formattedDate: any;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedOccurrence, setSelectedOccurrence] = useState("");
  const [occurrences, setOccurrences] = useState<string[]>([]);

  useEffect(() => {
    if ((event as any).is_recurring) {
      const frequency = (event as any).recurring_frequency || "daily";
      const start = new Date(event.start_time);
      const end = (event as any).recurring_end_date ? new Date((event as any).recurring_end_date) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
      const list: string[] = [];
      
      let current = new Date(start);
      for (let i = 0; i < 7; i++) {
        if (current > end) break;
        list.push(current.toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        }));
        
        if (frequency === "daily") {
          current.setDate(current.getDate() + 1);
        } else if (frequency === "weekly") {
          current.setDate(current.getDate() + 7);
        } else if (frequency === "monthly") {
          current.setMonth(current.getMonth() + 1);
        } else {
          current.setDate(current.getDate() + 1);
        }
      }
      setOccurrences(list);
      if (list.length > 0) {
        setSelectedOccurrence(list[0]);
      }
    }
  }, [event]);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      if (y > COLLAPSE_AT) setIsCollapsed(true);
      else if (y < EXPAND_AT) setIsCollapsed(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen pb-20 font-sans">
      {/* ── FIXED collapsed bar — sits above everything when scrolled ── */}
      <AnimatePresence>
        {isCollapsed && (
          <motion.div
            initial={{ y: -64 }}
            animate={{ y: 0 }}
            exit={{ y: -64 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.07]"
          >
            <div className="max-w-7xl mx-auto px-6 md:px-12 h-24 flex items-center gap-3">
              <BackButton />

              <div className="w-8 h-8 md:h-20 md:w-20 rounded-lg overflow-hidden shrink-0 border border-white/10">
                <img
                  src={event.image_url || event.banner_image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate leading-tight">
                  {event.title}
                </p>
                <p className="text-white/40 text-[11px] truncate">
                  {formattedDate} · {event.location}
                </p>
              </div>

              {event.ticket_tiers && event.ticket_tiers.length > 0 && (
                <span className="shrink-0 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                  {formatEventPrice(event.ticket_tiers)}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO — collapses height, stays in page flow ── */}
      <section className="relative w-full">
        <div className="absolute top-6 left-6 z-40">
          <BackButton />
        </div>

        <motion.div
          animate={{ height: isCollapsed ? "0px" : "60vh" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full overflow-hidden bg-gray-900 shadow-2xl relative"
        >
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                {event.banner_image_url ? (
                  <img
                    src={event.banner_image_url}
                    alt={event.title}
                    className="w-full h-full object-cover object-top opacity-60"
                  />
                ) : (
                  <></>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-end pb-8">
            <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
              <motion.div
                animate={{
                  width: isCollapsed ? "120px" : "200px",
                  height: isCollapsed ? "auto" : "250px",
                  marginBottom: isCollapsed ? "0px" : "20px",
                }}
                className="hidden aspect-4/5 md:block shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              >
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover opacity-80"
                />
              </motion.div>

              <motion.div className="flex-1 space-y-3">
                <motion.h1
                  animate={{
                    fontSize: isCollapsed ? "20px" : "48px",
                    lineHeight: isCollapsed ? "28px" : "56px",
                  }}
                  className="font-black text-white tracking-tight drop-shadow-2xl max-w-3xl"
                >
                  {event.title}
                </motion.h1>
                <div className="flex flex-col md:flex-row gap-3 md:gap-6 text-white/70 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className={isCollapsed ? "text-xs" : "text-lg"}>
                      {formattedDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className={isCollapsed ? "text-xs" : "text-lg"}>
                      {event.location}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── MAIN CONTENT ── */}
      {/* pt shifts up when fixed bar appears so content isn't hidden under it */}
      <main
        className="max-w-[1320px] mx-auto px-6 transition-[padding-top] duration-300"
        style={{ paddingTop: isCollapsed ? "calc(3rem + 56px)" : "3rem" }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* LEFT — scrolls naturally with the page (the illusion of scrolling past) */}
          <div className="lg:col-span-7">
            <EventDetails
              event={event}
              formattedDate={formattedDate}
              isCollapsed={isCollapsed}
            />
          </div>

          {/* RIGHT — sticky booking panel, offset from fixed bar when collapsed */}
          <div
            className="lg:col-span-5 lg:sticky lg:self-start transition-[top] duration-300"
            style={{ top: isCollapsed ? "70px" : "20px" }}
          >
            <div className="px-0 sm:px-6 py-8 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <div className="mb-8">
                <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Info className="w-4 h-4 text-primary" />
                  </div>
                  Secure Booking
                </h2>
              </div>
              
              {/* Occurrence Picker */}
              {(event as any).is_recurring && occurrences.length > 0 && (
                <div className="mb-6 bg-white/[0.02] border border-white/10 rounded-2xl p-4">
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Select Date & Time</label>
                  <select 
                    value={selectedOccurrence}
                    onChange={(e) => setSelectedOccurrence(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-xs text-white outline-none focus:border-primary/50 appearance-none cursor-pointer"
                  >
                    {occurrences.map((occ, idx) => (
                      <option key={idx} value={occ} className="text-neutral-900">
                        {occ}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <EventBookingFlow event={event} />
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 opacity-30">
              <div className="h-[1px] flex-1 bg-white/20" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                Verified Experience
              </span>
              <div className="h-[1px] flex-1 bg-white/20" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
