"use client";

import { useState } from "react";
import { useEventBuilderStore } from "@/lib/store/eventBuilderStore";
import { createEvent, createTicketTier, publishEvent } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Calendar,
  MapPin,
  Ticket,
  ArrowLeft,
  ImageIcon,
  Zap,
  CheckCircle2,
} from "lucide-react";
import FormSection from "@/components/ui/FormSection";

export default function StepPreview() {
  const store = useEventBuilderStore();
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);
    try {
      if (store.eventId) {
        await publishEvent(store.eventId);
        store.reset();
      }

      router.push("/dashboard?success=event-published");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Failed to publish event. Please try again.",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const bannerUrl = store.bannerImageUrl ? `${store.bannerImageUrl}` : null;

  const sectionTitle = "text-xs font-bold tracking-widest uppercase mb-3";
  const sectionTitleColor = "text-white/30";

  return (
    <div className="mx-auto">
      <div className="p-4 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

        <div className="relative">
          <FormSection title="Review & Publish">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Event Info */}
              <div className="space-y-6">
                {/* Title + Slug */}
                <div>
                  <p className={`${sectionTitle} ${sectionTitleColor}`}>
                    Event
                  </p>
                  <p className="text-2xl font-black">
                    {store.title || (
                      <span className="text-white/20">Untitled</span>
                    )}
                  </p>
                  <p className="text-orange-400/60 text-xs font-mono mt-1">
                    /{store.slug}
                  </p>
                </div>

                {/* Dates */}
                <div
                  className="flex items-start gap-3 p-4 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <Calendar className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm space-y-1">
                    <p className="text-white/70">
                      <span className="text-white/30 text-xs">Starts: </span>
                      <span className="font-semibold">
                        {store.startTime
                          ? new Date(store.startTime).toLocaleString()
                          : "Not set"}
                      </span>
                    </p>
                    <p className="text-white/70">
                      <span className="text-white/30 text-xs">Ends: </span>
                      <span className="font-semibold">
                        {store.endTime
                          ? new Date(store.endTime).toLocaleString()
                          : "Not set"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div
                  className="flex items-center gap-3 p-4 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <p className="text-white/70 text-sm font-semibold">
                    {store.location || "No location set"}
                  </p>
                </div>

                {/* Description */}
                {store.description && (
                  <div>
                    <p className={`${sectionTitle} ${sectionTitleColor}`}>
                      Description
                    </p>
                    <div
                      className="text-white/50 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: store.description }}
                    />
                  </div>
                )}
              </div>

              {/* Right: Media Previews */}
              <div className="space-y-6">
                <div>
                  <p className={`${sectionTitle} ${sectionTitleColor}`}>
                    Banner Image (16:9)
                  </p>
                  {bannerUrl ? (
                    <img
                      src={bannerUrl}
                      alt="Banner Preview"
                      className="w-full h-40 object-cover rounded-xl object-top"
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                  ) : (
                    <div
                      className="w-full h-40 rounded-xl flex flex-col items-center justify-center gap-2"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px dashed rgba(255,255,255,0.08)",
                      }}
                    >
                      <ImageIcon className="w-8 h-8 text-white/15" />
                      <p className="text-white/20 text-xs">No banner uploaded</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className={`${sectionTitle} ${sectionTitleColor}`}>
                    Portrait Image (4:5 / 9:16)
                  </p>
                  {store.eventImageUrl ? (
                    <img
                      src={store.eventImageUrl}
                      alt="Portrait Preview"
                      className="w-32 h-40 object-cover rounded-xl mx-auto"
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                    />
                  ) : (
                    <div
                      className="w-32 h-40 rounded-xl mx-auto flex flex-col items-center justify-center gap-2"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px dashed rgba(255,255,255,0.08)",
                      }}
                    >
                      <ImageIcon className="w-8 h-8 text-white/15" />
                      <p className="text-white/20 text-xs">None</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </FormSection>

          {/* Ticket Tiers */}
          <FormSection title="Ticket Tiers">
            {store.ticketTiers.length === 0 ? (
              <p className="text-red-400 text-sm font-medium italic">
                ⚠ No ticket tiers added — required before publishing.
              </p>
            ) : (
              <div
                className="overflow-x-auto rounded-xl"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <table className="w-full text-left text-sm min-w-[500px]">
                  <thead style={{ background: "rgba(255,255,255,0.04)" }}>
                    <tr>
                      {["Name", "Type", "Price", "Quantity"].map((h) => (
                        <th
                          key={h}
                          className="p-3 text-xs font-bold tracking-wider uppercase text-white/30"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {store.ticketTiers.map((tier, i) => (
                      <tr
                        key={i}
                        style={{
                          borderTop: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <td className="p-3 font-bold text-white/80">
                          {tier.name}
                        </td>
                        <td className="p-3">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400">
                            {tier.type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="p-3 text-white/60 font-mono">
                          {tier.is_free ? "Free" : `₦${tier.base_price.toLocaleString()}`}
                        </td>
                        <td className="p-3 text-white/60">
                          {tier.quantity_available}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </FormSection>

          {/* Error */}
          {error && (
            <div
              className="p-4 rounded-xl text-sm font-medium text-red-400"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              ⚠ {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-2">
            <button
              onClick={() => store.setStep(4)}
              disabled={isPublishing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white/50 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing || store.ticketTiers.length === 0}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100 bg-orange-700"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" /> Publish Event
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
