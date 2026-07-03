"use client";

import { useEffect, useState } from "react";
import { getMyOrders } from "@/lib/api";
import { motion } from "framer-motion";
import { Calendar, MapPin, Ticket, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function MyTicketsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">My Tickets</h1>
      </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-neutral-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No tickets yet</h2>
            <p className="text-neutral-400 mb-6 max-w-sm mx-auto">
              You haven't purchased any tickets. Discover amazing events happening near you!
            </p>
            <Link 
              href="/events"
              className="bg-primary hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-all"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const eventDate = new Date(order.event.start_time);
              const isPast = eventDate < new Date();
              
              return (
                <Link key={order.id} href={`/my-tickets/${order.id}`}>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col sm:flex-row gap-6 p-4 rounded-2xl border transition-all hover:bg-white/[0.04] cursor-pointer ${
                      isPast ? "border-white/5 bg-white/[0.02]" : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    {/* Event Image */}
                    <div className="w-full sm:w-40 aspect-video sm:aspect-square rounded-xl overflow-hidden shrink-0 bg-neutral-900">
                      <img 
                        src={order.event.image_url || order.event.banner_image_url || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80"} 
                        alt={order.event.title}
                        className={`w-full h-full object-cover ${isPast ? 'grayscale opacity-70' : ''}`}
                      />
                    </div>
                    
                    {/* Event Details */}
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`text-xl font-bold ${isPast ? 'text-white/60' : 'text-white'}`}>
                          {order.event.title}
                        </h3>
                        {isPast && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 bg-white/5 px-2 py-1 rounded">
                            Past Event
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center text-sm text-neutral-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          {eventDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center text-sm text-neutral-400">
                          <MapPin className="w-4 h-4 mr-2" />
                          {order.event.location || "TBA"}
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                        <div className="text-sm">
                          <span className="text-neutral-500">Order:</span> <span className="text-neutral-300 font-mono text-xs">{order.id.split('-')[0]}</span>
                        </div>
                        <div className="text-sm font-bold text-white">
                          {order.tickets?.length || 0} Ticket{(order.tickets?.length || 0) !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        )}
    </div>
  );
}
