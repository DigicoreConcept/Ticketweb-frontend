"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Flame,
  X,
  Calendar,
  Filter,
  LayoutGrid,
  List,
  ChevronLeft,
} from "lucide-react";
import { Event } from "@/lib/schema/eventTied";
import { EventCard } from "@/components/landing/EventCard";
import { getPublicEvents } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";
import { Suspense } from "react";

const CATEGORIES = [
  "All",
  "Music",
  "Tech",
  "Comedy",
  "Sports",
  "Arts",
  "Nightlife",
  "Conference",
];

const LOCATIONS = ["All Locations", "Lagos", "Abuja", "London", "New York"];

/* ─── Skeleton Card ─── */
function SkeletonCard() {
  return (
    <div className="bg-white/[0.03] rounded-2xl overflow-hidden border border-white/5 animate-pulse">
      <div className="w-full aspect-[4/5] bg-white/5" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 bg-white/5 rounded-full" />
        <div className="h-3 w-1/2 bg-white/5 rounded-full" />
        <div className="h-3 w-2/3 bg-white/5 rounded-full" />
      </div>
    </div>
  );
}

/* ─── Featured Event Card (for trending strip) ─── */
function FeaturedEventCard({ event }: { event: Event }) {
  const date = new Date(event.start_time);
  const month = date
    .toLocaleString(undefined, { month: "short" })
    .toUpperCase();
  const day = date.getDate();

  return (
    <Link href={`/events/${event.slug}`}>
      <div className="group relative flex gap-4 p-3 rounded-2xl hover:bg-white/[0.04] transition-colors cursor-pointer">
        {/* Date badge */}
        <div className="shrink-0 w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center">
          <span className="text-[10px] font-black text-primary tracking-widest">
            {month}
          </span>
          <span className="text-lg font-black text-white leading-none">
            {day}
          </span>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
            {event.title}
          </h4>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-white/40">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{event.location || "TBA"}</span>
          </div>
          {event.ticket_tiers && event.ticket_tiers.length > 0 && (
            <p className="text-xs font-bold text-primary/80 mt-1">
              From ₦
              {Math.min(
                ...event.ticket_tiers.map((t) => t.base_price),
              ).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── Main Page Content ─── */
function EventsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLocation, setActiveLocation] = useState("All Locations");
  const [showFilters, setShowFilters] = useState(false);

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

  // Sync with URL changes
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = events;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q),
      );
    }

    if (activeCategory !== "All") {
      result = result.filter(
        (e) => e.category?.toLowerCase() === activeCategory.toLowerCase(),
      );
    }

    if (activeLocation !== "All Locations") {
      result = result.filter((e) =>
        e.location?.toLowerCase().includes(activeLocation.toLowerCase()),
      );
    }

    return result;
  }, [events, search, activeCategory, activeLocation]);

  const trendingEvents = useMemo(() => events.slice(0, 5), [events]);

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      {/* ── Top Bar ── */}
      <div className="border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between h-16 gap-6">
            {/* Page title */}
            <div className="flex items-center gap-3 shrink-0">
              <BackButton />
              <h1 className="text-lg font-black text-white tracking-tight">
                Events
              </h1>
              {!loading && (
                <span className="text-xs font-bold text-white/30 bg-white/5 px-2.5 py-1 rounded-full">
                  {filtered.length}
                </span>
              )}
            </div>

            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus-within:border-primary/30 transition-colors">
                <Search className="w-4 h-4 text-white/30 mr-2.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Search events, venues..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-white text-sm placeholder-white/30"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="ml-2 p-0.5 rounded-full hover:bg-white/10 text-white/30 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter toggle (mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-8">
        <div className="flex gap-8">
          {/* ── Left Sidebar — Filters + Trending ── */}
          <aside
            className={`shrink-0 w-64 space-y-8 ${
              showFilters
                ? "fixed inset-0 z-50 bg-[#0A0A0A] p-6 overflow-y-auto lg:static lg:p-0 lg:bg-transparent"
                : "hidden lg:block"
            }`}
          >
            {/* Mobile close */}
            {showFilters && (
              <div className="flex justify-between items-center lg:hidden mb-4">
                <h2 className="text-lg font-black text-white">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 rounded-xl bg-white/5 text-white/60"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Category Filter */}
            <div>
              <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.15em] mb-3">
                Category
              </h3>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeCategory === cat
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.15em] mb-3">
                Location
              </h3>
              <div className="space-y-1">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setActiveLocation(loc);
                      setShowFilters(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeLocation === loc
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/5" />

            {/* Trending / Hot Right Now */}
            <div>
              <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-primary" />
                Trending Now
              </h3>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex gap-3 p-3">
                      <div className="w-14 h-14 rounded-xl bg-white/5" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 w-3/4 bg-white/5 rounded-full" />
                        <div className="h-2 w-1/2 bg-white/5 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {trendingEvents.map((event) => (
                    <FeaturedEventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* ── Main Grid Area ── */}
          <div className="flex-1 min-w-0">
            {/* Active filters + result count */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                {activeCategory !== "All" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                    {activeCategory}
                    <button
                      onClick={() => setActiveCategory("All")}
                      className="hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {activeLocation !== "All Locations" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-white/60 text-xs font-bold border border-white/10">
                    <MapPin className="w-3 h-3" />
                    {activeLocation}
                    <button
                      onClick={() => setActiveLocation("All Locations")}
                      className="hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {search && (
                  <span className="text-xs text-white/30">for "{search}"</span>
                )}
              </div>

              <span className="text-xs font-medium text-white/20">
                {!loading &&
                  `${filtered.length} ${
                    filtered.length === 1 ? "result" : "results"
                  }`}
              </span>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white/[0.04] animate-pulse"
                    style={{ aspectRatio: "3/4" }}
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-5">
                  <Search className="w-8 h-8 text-white/15" />
                </div>
                <h3 className="text-xl font-bold text-white/70 mb-2">
                  No events found
                </h3>
                <p className="text-white/30 text-sm max-w-sm">
                  {search
                    ? `Nothing matches "${search}". Try a different search.`
                    : "No events in this category yet."}
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("All");
                    setActiveLocation("All Locations");
                  }}
                  className="mt-5 px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-bold hover:bg-white/10 hover:text-white transition-colors"
                >
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.05 } },
                }}
                className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {filtered.map((event) => (
                  <motion.div
                    key={event.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  >
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
                          ? `From ₦${Math.min(
                              ...event.ticket_tiers.map((t) => t.base_price),
                            ).toLocaleString()}`
                          : "Free"
                      }
                      location={event.location || "TBA"}
                      category="Music"
                      isTrending={false}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ─── Page wrapper with Suspense for useSearchParams ─── */
export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
          <div className="text-white/30 text-sm font-medium">Loading...</div>
        </main>
      }
    >
      <EventsContent />
    </Suspense>
  );
}
