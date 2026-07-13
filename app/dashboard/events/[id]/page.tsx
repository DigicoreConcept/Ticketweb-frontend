"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Loader2,
  ArrowLeft,
  Users,
  DollarSign,
  Ticket,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  slug: string;
  banner_image_url?: string;
}

interface EventStats {
  total_revenue: number;
  tickets_sold: number;
  tickets_available: number;
}

interface Guest {
  id: string;
  attendee_name: string;
  attendee_email: string;
  tier: {
    name: string;
    type: string;
  };
  seat_number?: number;
  table_number?: number;
  shared_attendee: boolean;
  status: string;
  created_at: string;
}

export default function EventStatsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    async function fetchData() {
      if (!user || !eventId) return;
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [eventRes, statsRes, guestsRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "https://ticketweb.gogoaltv.com"}/api/v1/events/${eventId}`,
            {
              headers,
            },
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "https://ticketweb.gogoaltv.com"}/api/v1/events/${eventId}/stats`,
            { headers },
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "https://ticketweb.gogoaltv.com"}/api/v1/events/${eventId}/guestlist`,
            { headers },
          ),
        ]);

        if (eventRes.ok && statsRes.ok) {
          const statRes = await statsRes.json();
          const eventsRes = await eventRes.json();
          setEvent(eventsRes.data);
          setStats(statRes.data);
        }
        if (guestsRes.ok) {
          const guests = await guestsRes.json();
          setGuests(guests.data);
        }
      } catch (error) {
        console.error("Failed to fetch event data", error);
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, [user, eventId]);

  const copyLink = () => {
    if (!event) return;
    const url = `${window.location.origin}/events/${event.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || loadingData || !eventId)
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  if (!event || !stats) return <div className="p-8 text-center text-neutral-400">Event not found</div>;

  return (
    <div className="min-h-screen pb-20 text-white">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">{event.title}</h1>
            <p className="text-neutral-400 mt-2 text-sm">Event Performance & Guestlist</p>
          </div>
          <div className="flex items-center gap-3">
            {/* <Link href={`/dashboard/events/${event.id}/template`}>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-orange-600 rounded-lg text-sm font-medium transition-colors text-black">
                <Ticket className="w-4 h-4" />
                Design Ticket
              </button>
            </Link> */}
            <Link href={`/events/${event.slug}`} target="_blank">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors text-white">
                <ExternalLink className="w-4 h-4" />
                View Public Page
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign className="w-16 h-16 text-white" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-neutral-400">Total Revenue</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-white tracking-tight">
                  ₦{stats.total_revenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-16 h-16 text-white" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-neutral-400">Tickets Sold</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-white tracking-tight">
                  {stats.tickets_sold}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Ticket className="w-16 h-16 text-white" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  <Ticket className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-neutral-400">Tickets Available</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-white tracking-tight">
                  {stats.tickets_available}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 overflow-hidden rounded-2xl relative">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h3 className="text-lg font-bold text-white">Guestlist</h3>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest">
              {guests.length} Attendees
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-white/[0.03] text-xs font-semibold text-neutral-400 uppercase tracking-wider border-b border-white/5">
                  <th className="px-6 py-4">Attendee</th>
                  <th className="px-6 py-4">Tier & Type</th>
                  <th className="px-6 py-4">Seat / Table</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {guests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-neutral-500 font-medium"
                    >
                      No tickets sold yet.
                    </td>
                  </tr>
                ) : (
                  guests.map((guest) => (
                    <tr
                      key={guest.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">
                          {guest.attendee_name || "N/A"}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {guest.attendee_email}
                        </p>
                      </td>
                      <td className="px-6 py-4 flex flex-col items-start gap-1.5">
                        <span className="text-xs font-bold px-2.5 py-1 bg-white/10 rounded-lg text-white">
                          {guest.tier.name}
                        </span>
                        {guest.tier.type && (
                          <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
                            {guest.tier.type.replace("_", " ")}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {guest.shared_attendee ? (
                          <span className="text-[10px] font-black px-2 py-1 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20 uppercase tracking-tighter">
                            COMBINED — T-{guest.table_number}
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-neutral-400">
                            {guest.seat_number
                              ? `Seat ${guest.seat_number}`
                              : guest.table_number
                                ? `Table ${guest.table_number}`
                                : "—"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full uppercase tracking-widest">
                          {guest.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 p-8 rounded-2xl relative overflow-hidden">
          <h3 className="text-lg font-bold text-white mb-6">Share Your Event</h3>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              readOnly
              value={`${typeof window !== "undefined" ? window.location.origin : ""}/events/${event.slug}`}
              className="flex-1 w-full p-3 border border-white/10 rounded-xl bg-black/50 text-neutral-300 outline-none focus:border-primary/50 transition-colors"
            />
            <button 
              onClick={copyLink} 
              className="w-full md:w-auto min-w-[140px] flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-sm transition-all"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-sm text-white transition-colors"
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?text=Check out ${event.title}&url=${window.location.origin}/events/${event.slug}`,
                  "_blank",
                )
              }
            >
              Share on Twitter
            </button>
            <button
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-sm text-white transition-colors"
              onClick={() =>
                window.open(
                  `https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/events/${event.slug}`,
                  "_blank",
                )
              }
            >
              Share on Facebook
            </button>
            <button
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-sm text-white transition-colors"
              onClick={() =>
                window.open(
                  `https://wa.me/?text=Check out ${event.title} ${window.location.origin}/events/${event.slug}`,
                  "_blank",
                )
              }
            >
              Share on WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
