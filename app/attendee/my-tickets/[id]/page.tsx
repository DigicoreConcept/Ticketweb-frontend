"use client";

import { useEffect, useState } from "react";
import { getMyOrderById, api } from "@/lib/api";
import { motion } from "framer-motion";
import { Calendar, MapPin, Download, Ticket, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "@/lib/store/toastStore";

export default function MyTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const orderId = params.id as string;

  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await getMyOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.error("Failed to fetch order:", err);
        toast.error("Could not load order details.");
        router.push("/my-tickets");
      } finally {
        setLoading(false);
      }
    }
    if (orderId) fetchOrder();
  }, [orderId, router]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await api.get(`/orders/${orderId}/download`, {
        responseType: "blob",
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data as any]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `tickets_${orderId.split('-')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download tickets:", error);
      toast.error("Failed to download tickets.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </main>
    );
  }

  if (!order) return null;

  const eventDate = new Date(order.event.start_time);
  const isPast = eventDate < new Date();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Order #{order.id.split('-')[0]}</h1>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden mb-8">
          {/* Event Header */}
          <div className="relative h-48 md:h-64 bg-neutral-900">
            <img 
              src={order.event.image_url || order.event.banner_image_url || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80"} 
              alt={order.event.title}
              className={`w-full h-full object-cover ${isPast ? 'grayscale opacity-70' : 'opacity-80'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6">
              <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold uppercase tracking-widest mb-2 ${order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                {order.status}
              </span>
              <h2 className="text-3xl font-black text-white">{order.event.title}</h2>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8 border-b border-white/5 pb-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 font-medium mb-0.5">Date & Time</p>
                    <p className="text-white font-medium">{eventDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-neutral-400 text-sm">{eventDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 font-medium mb-0.5">Location</p>
                    <p className="text-white font-medium">{order.event.location || "TBA"}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 md:border-l md:border-white/5 md:pl-8">
                <div>
                  <p className="text-sm text-neutral-500 font-medium mb-0.5">Order Total</p>
                  <p className="text-2xl font-black text-white">₦{(order.total_amount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 font-medium mb-0.5">Purchased On</p>
                  <p className="text-white">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Tickets Section */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                Your Tickets ({order.tickets?.length || 0})
              </h3>
              
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
              >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download PDF
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {order.tickets?.map((ticket: any, i: number) => (
                <div key={ticket.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 items-center">
                  <div className="w-16 h-16 bg-white/10 rounded-xl shrink-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Ticket</span>
                    <span className="text-lg font-black text-white">#{i + 1}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{ticket.attendee_name || "Guest"}</p>
                    <p className="text-xs text-primary truncate font-bold uppercase tracking-widest mb-1">{ticket.tier?.name || "General"}</p>
                    {ticket.seat_number && (
                      <p className="text-xs text-neutral-400">Seat {ticket.seat_number} {ticket.table_number ? `| Table ${ticket.table_number}` : ''}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>
    </div>
  );
}
