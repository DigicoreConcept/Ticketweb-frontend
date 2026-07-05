"use client";

// @ts-ignore: allow side-effect CSS import without type declarations
import "swiper/css";

import { useEffect, useState } from "react";
import { HeroSection } from "@/components/landing/HeroSection";
import { Footer } from "@/components/landing/Footer";
import { Swiper, SwiperSlide } from "swiper/react";
import { ChevronRight } from "lucide-react";
import { EventCard } from "@/components/landing/EventCard";
import { ArrowRight } from "lucide-react";
import { getPublicEvents } from "@/lib/api";
import { Event } from "@/lib/schema/eventTied";

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await getPublicEvents();
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <HeroSection />

      {/* ── Trending Section ── */}
      <section className="py-20 relative z-10">
        <div className="flex justify-between items-end mb-10 px-6 md:px-12 lg:px-20">
          <div>
            <p className="text-primary text-xs font-black uppercase tracking-[0.2em] mb-2">
              What's Hot
            </p>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Trending Events
            </h2>
            <p className="text-neutral-500 mt-1 text-sm">
              Don't miss out on what everyone's talking about.
            </p>
          </div>
          <a
            href="/events"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-white transition-colors group"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {loading ? (
          /* Skeleton row */
          <div className="flex gap-4 px-6 md:px-12 lg:px-20 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-52 rounded-2xl bg-white/[0.04] animate-pulse"
                style={{ aspectRatio: "3/4" }}
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="text-neutral-600 text-center text-sm">No events yet.</p>
        ) : (
          <div className="relative">
            <Swiper
              spaceBetween={14}
              slidesPerView="auto"
              className="!px-6 md:!px-12 lg:!px-20 !pb-4"
            >
              {events.slice(0, 12).map((event) => (
                <SwiperSlide key={event.id} className="!w-52">
                  <EventCard
                    slug={event.slug}
                    title={event.title}
                    date={new Date(event.start_time).toLocaleDateString(
                      undefined,
                      {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      },
                    )}
                    image={
                      event.image_url ||
                      event.banner_image_url ||
                      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80"
                    }
                    price={
                      event.ticket_tiers && event.ticket_tiers.length > 0
                        ? event.ticket_tiers.some((t) => t.is_free)
                          ? "Free"
                          : `From ₦${Math.min(
                              ...event.ticket_tiers.map((t) => t.base_price),
                            ).toLocaleString()}`
                        : "Free"
                    }
                    location={event.location || "TBA"}
                    category={event.category || "General"}
                    isTrending
                  />
                </SwiperSlide>
              ))}

              {events.length > 12 && (
                <SwiperSlide className="!w-16 !self-stretch">
                  <a
                    href="/events"
                    className="flex h-full items-center justify-center"
                  >
                    <span className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary hover:border-primary transition-all">
                      <ChevronRight className="w-4 h-4 text-primary hover:text-white" />
                    </span>
                  </a>
                </SwiperSlide>
              )}
            </Swiper>

            {/* Edge fades */}
            <div className="pointer-events-none absolute top-0 left-0 h-full w-16 z-10 bg-gradient-to-r from-[#0A0A0A] to-transparent" />
            <div className="pointer-events-none absolute top-0 right-0 h-full w-16 z-10 bg-gradient-to-l from-[#0A0A0A] to-transparent" />
          </div>
        )}

        {/* Mobile view all */}
        <div className="sm:hidden mt-6 text-center">
          <a
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-white transition-colors"
          >
            View All Events <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ── Host Your Event CTA ── */}
      <section className="py-10 px-6 md:px-12 lg:px-20">
        <div className="rounded-3xl border border-white/5 overflow-hidden relative">
          {/* Background grid + glow */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />

          <div className="relative z-10 p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
            {/* Left: copy */}
            <div className="max-w-xl">
              <span className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                For Event Organizers
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                Turn your idea <br />
                into a <span className="text-primary">sold-out</span> event.
              </h2>
              <p className="text-neutral-400 text-base md:text-lg leading-relaxed mb-8">
                Create your event in minutes, set up tickets with multiple
                tiers, collect payments, and send QR tickets — all in one place.
                No extra tools needed.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  href="/auth/register?tab=organizer"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-7 py-3 rounded-full font-bold transition-all shadow-[0_0_25px_rgba(255,77,0,0.3)] hover:shadow-[0_0_35px_rgba(255,77,0,0.5)]"
                >
                  Get Started Free
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
                <a
                  href="/events"
                  className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-7 py-3 rounded-full font-bold transition-all"
                >
                  Browse Events
                </a>
              </div>
            </div>

            {/* Right: stats */}
            <div className="shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: "5 min", label: "to create an event" },
                { value: "₦0", label: "upfront cost" },
                { value: "QR", label: "ticket delivery" },
                { value: "Live", label: "sales dashboard" },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  className="bg-white/5 border border-white/5 rounded-2xl p-5 text-center hover:border-primary/20 hover:bg-primary/5 transition-colors"
                >
                  <p className="text-2xl font-black text-white mb-1">{value}</p>
                  <p className="text-xs text-neutral-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
