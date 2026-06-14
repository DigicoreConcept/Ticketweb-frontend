"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle, XCircle, Star, Trash2, Calendar, MapPin, Ticket } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { useEvent, usePublishEvent, useUnpublishEvent, useFeatureEvent, useDeleteEvent } from "@/lib/admin/hooks/useEvents";
import { FADE_UP } from "@/lib/admin/motion";
import { toast } from "@/lib/store/toastStore";

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: event, isLoading } = useEvent(id);
  const publishMutation = usePublishEvent();
  const unpublishMutation = useUnpublishEvent();
  const featureMutation = useFeatureEvent();
  const deleteMutation = useDeleteEvent();

  const [isDeleting, setIsDeleting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-white mb-2">Event not found</h2>
        <Link href="/admin/events" className="text-rose-500 hover:underline">
          Back to events
        </Link>
      </div>
    );
  }

  const handlePublishToggle = async () => {
    try {
      if (event.status === "PUBLISHED") {
        await unpublishMutation.mutateAsync(id);
        toast.success("Event unpublished successfully");
      } else {
        await publishMutation.mutateAsync(id);
        toast.success("Event published successfully");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update status");
    }
  };

  const handleFeatureToggle = async () => {
    try {
      await featureMutation.mutateAsync(id);
      toast.success(event.is_featured ? "Event un-featured" : "Event featured");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to feature event");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Event deleted successfully");
      router.push("/admin/events");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to delete event");
      setIsDeleting(false);
    }
  };

  return (
    <motion.div variants={FADE_UP} initial="initial" animate="animate" className="max-w-5xl mx-auto space-y-6">
      <Link href="/admin/events" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 rounded-2xl bg-white/5 overflow-hidden shrink-0">
            {event.image_url ? (
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-500">
                <Calendar className="w-10 h-10" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">{event.title}</h1>
            <p className="text-neutral-500 mt-1 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {event.location || "Online"}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                event.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-500" :
                event.status === "DRAFT" ? "bg-amber-500/10 text-amber-500" :
                "bg-rose-500/10 text-rose-500"
              }`}>
                {event.status}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-white">
                {event.category || "Uncategorized"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handlePublishToggle}
            disabled={publishMutation.isPending || unpublishMutation.isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${
              event.status === "PUBLISHED" ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
            }`}
          >
            {event.status === "PUBLISHED" ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            {event.status === "PUBLISHED" ? "Unpublish" : "Publish"}
          </button>
          
          <button
            onClick={handleFeatureToggle}
            disabled={featureMutation.isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${
              event.is_featured ? "bg-amber-400/20 text-amber-400 hover:bg-amber-400/30" : "bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            <Star className={`w-4 h-4 ${event.is_featured ? "fill-amber-400" : ""}`} />
            {event.is_featured ? "Unfeature" : "Feature"}
          </button>

          <button
            onClick={() => setIsDeleting(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl text-sm font-bold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Event Information</h3>
          <div>
            <p className="text-sm text-neutral-500">Event ID</p>
            <p className="text-white font-mono text-xs">{event.id}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Description</p>
            <p className="text-white text-sm whitespace-pre-wrap">{event.description || "No description provided."}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Date & Time</p>
            <p className="text-white text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {event.start_time ? format(new Date(event.start_time), "PPP p") : "TBA"}
            </p>
          </div>
          {event.tags && event.tags.length > 0 && (
            <div>
              <p className="text-sm text-neutral-500">Tags</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {event.tags.map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-neutral-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Organizer & Access</h3>
          <div>
            <p className="text-sm text-neutral-500">Organizer ID</p>
            {event.creator_id ? (
              <Link href={`/admin/users/${event.creator_id}`} className="text-rose-500 hover:underline font-mono text-xs">
                {event.creator_id}
              </Link>
            ) : (
              <p className="text-neutral-500 text-sm">System</p>
            )}
          </div>
          <div>
            <p className="text-sm text-neutral-500">Created At</p>
            <p className="text-white text-sm">{format(new Date(event.created_at || new Date()), "PPP p")}</p>
          </div>
        </div>
      </div>

      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-rose-500/20 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-xl font-bold text-white">Delete Event</h3>
            </div>
            <p className="text-sm text-neutral-400 mb-6">
              Are you sure you want to completely delete <strong className="text-white">{event.title}</strong>? This action cannot be undone and will orphan any associated tickets or orders.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsDeleting(false)}
                className="px-4 py-2 text-sm font-bold text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
