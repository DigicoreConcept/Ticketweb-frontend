"use client";

import React, { useState, useEffect } from "react";
import { Event } from "@/lib/schema/eventTied";
import { Calendar, MapPin, BarChart2, Edit, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getMyEvents } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

const EventPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      if (!user) return;
      try {
        const data = await getMyEvents();
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setLoadingEvents(false);
      }
    }
    fetchEvents();
  }, [user]);
  return (
    <>
      {events.length === 0 ? (
        <div className="text-center py-20 rounded-2xl">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-neutral-600" />
          </div>
          <h3 className="text-lg font-medium text-white">No events found</h3>
          <p className="text-neutral-500 mt-2 max-w-sm mx-auto">
            You haven't created any events yet. Launch your first event to start
            selling tickets.
          </p>
          <Link href="/dashboard/events/create" className="mt-6 inline-block">
            <Button className="bg-white text-black hover:bg-neutral-200">
              Create Event
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden hover:border-white/10 transition-colors group"
            >
              <div className="h-72 bg-neutral-900 relative overflow-hidden">
                {event.image_url ? (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-white/20">
                    No Image
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-md ${
                      event.status === "PUBLISHED"
                        ? "bg-green-500/20 text-green-400 border border-green-500/20"
                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-white truncate mb-1">
                  {event.title}
                </h3>
                <div className="space-y-2 mb-6">
                  {event.start_time && (
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.start_time).toLocaleDateString(
                        undefined,
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-auto">
                  <Link
                    href={`/dashboard/events/${event.id}`}
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full h-9 px-2 border-white/10 hover:bg-white/5 text-neutral-300 hover:text-white text-xs"
                    >
                      <BarChart2 className="w-3.5 h-3.5 sm:mr-1.5" />
                      <span className="hidden sm:inline">Stats</span>
                    </Button>
                  </Link>
                  <Link
                    href={`/events/${event.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full h-9 px-2 border-white/10 hover:bg-white/5 text-neutral-300 hover:text-white text-xs"
                    >
                      <Eye className="w-3.5 h-3.5 sm:mr-1.5" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                  </Link>
                  <Link
                    href={`/dashboard/events/${event.id}/edit`}
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full h-9 px-2 border-white/10 hover:bg-white/5 text-neutral-300 hover:text-white text-xs"
                    >
                      <Edit className="w-3.5 h-3.5 sm:mr-1.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default EventPage;
