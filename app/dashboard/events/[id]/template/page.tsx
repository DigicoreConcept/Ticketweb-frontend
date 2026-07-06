"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { TemplateEditor } from "@/components/dashboard/TemplateEditor";
import { toast } from "react-hot-toast";

export default function TicketTemplatePage() {
  const { id: eventId } = useParams() as { id: string };
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  
  // Template state
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchEventData();
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      // First get the event
      const res = await api.get(`/events/${eventId}`);
      setEvent(res.data);
      
      // If it already has a template_id, let's just show they have one, 
      // or we can fetch templates and see if they have one assigned
    } catch (err: any) {
      toast.error("Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setBackgroundImage(res.data.url);
      toast.success("Background uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveTemplate = async (schema: any[]) => {
    if (!backgroundImage) return;
    setSaving(true);
    try {
      // 1. Create the template
      const templateRes = await api.post("/templates", {
        event_id: eventId,
        background_image_url: backgroundImage,
        background_width_px: 1200, // Dummy
        background_height_px: 1800, // Dummy
        page_width_in: 4.0,
        page_height_in: 6.0,
        template_schema: schema,
      });

      // 2. Assign to event
      await api.post(`/templates/events/${eventId}/select`, {
        template_id: templateRes.data.id
      });

      toast.success("Ticket Template Saved and Assigned!");
      router.push(`/dashboard/events/${eventId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/events/${eventId}`}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white/60" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Ticket Template</h1>
          <p className="text-white/60 text-sm mt-1">Design the physical/digital ticket for {event?.title}</p>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-8">
        {!backgroundImage ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/10 rounded-2xl bg-black/20">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Upload Ticket Background</h3>
            <p className="text-white/50 text-sm mb-6 text-center max-w-md">
              Upload a high-resolution background image (minimum 300 DPI recommended, 4x6 inches ratio).
            </p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-6 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              {uploading ? "Uploading..." : "Select Image"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Position Your Fields</h3>
              <button 
                onClick={() => setBackgroundImage(null)}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Start Over
              </button>
            </div>
            <TemplateEditor 
              imageUrl={backgroundImage} 
              onSave={handleSaveTemplate}
              loading={saving}
            />
          </div>
        )}
      </div>
    </div>
  );
}
