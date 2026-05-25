"use client";

import {
  useEventBuilderStore,
  TicketTier,
} from "@/lib/store/eventBuilderStore";
import { Plus, Trash2, ArrowRight, ArrowLeft, Ticket, Zap } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  TicketType,
  TicketConfig,
  TableTicketConfig,
  AssignedSeatingConfig,
} from "@/lib/schema/eventTied";
import FormSection from "@/components/ui/FormSection";
import { createBulkTicketTier, deleteBulkTicketTiers } from "@/lib/api";
import { useState } from "react";
import { ClipLoader } from "@/components/ui/ClipLoader";

const ticketTierSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    type: z.nativeEnum(TicketType),
    price: z.number().min(0, "Price must be positive"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    seatsPerTable: z.number().optional(),
    row_count: z.number().optional(),
    seats_per_row: z.number().optional(),
    allowCombinedNames: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === TicketType.TABLE) {
      if (!data.seatsPerTable || data.seatsPerTable < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Seats per table is required and must be at least 1",
          path: ["seatsPerTable"],
        });
      }
    }
  });

type TicketTierFormValues = z.infer<typeof ticketTierSchema>;

const inputClass = `
  w-full px-4 py-3 rounded-xl text-white placeholder-white/30 font-medium text-sm outline-none
  transition-all duration-200
  bg-white/5 border border-white/10
  focus:border-orange-500/70 focus:bg-white/8 focus:ring-2 focus:ring-orange-500/20
`;

const labelClass =
  "block text-xs font-bold tracking-widest uppercase text-white/50 mb-2";

const TYPE_META: Record<
  string,
  { label: string; color: string; desc: string }
> = {
  [TicketType.GENERAL_ADMISSION]: {
    label: "General Admission",
    color: "#f97316",
    desc: "Open floor access",
  },
  [TicketType.ASSIGNED_SEATING]: {
    label: "Assigned Seating",
    color: "#a855f7",
    desc: "Reserved numbered seats",
  },
  [TicketType.TABLE]: {
    label: "Table Booking",
    color: "#ec4899",
    desc: "Full table reservation",
  },
};

export default function StepTicketing() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    ticketTiers,
    addTicketTier,
    removeTicketTier,
    setStep,
    eventId,
    deletedTicketTierIds,
  } = useEventBuilderStore();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TicketTierFormValues>({
    resolver: zodResolver(ticketTierSchema),
    defaultValues: {
      type: TicketType.GENERAL_ADMISSION,
      price: 0,
      quantity: 100,
      seatsPerTable: 5,
      allowCombinedNames: false,
    },
  });

  const selectedType = watch("type");

  // Logic to ADD a ticket to the local list (Zustand)
  const ticketSubmit = (data: TicketTierFormValues) => {
    let config: TicketConfig = null;

    if (data.type === TicketType.TABLE) {
      config = { seats_per_table: data.seatsPerTable as number };
    } else if (data.type === TicketType.ASSIGNED_SEATING) {
      config = {
        row_count: data.row_count || 0,
        seats_per_row: data.seats_per_row || 0,
      };
    }

    addTicketTier({
      name: data.name,
      type: data.type,
      base_price: data.price,
      quantity_available: data.quantity,
      config: config,
      allow_combined_names: data.allowCombinedNames,
    });

    // Reset only the name and price, keep type for convenience
    reset({
      ...data,
      name: "",
      price: 0,
    });
  };

  // Logic to SEND the bulk list to the Backend
  const onFinalSubmit = async () => {
    if (!eventId) {
      alert("Event ID missing.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newTiers = ticketTiers.filter((t) => !t.id);

      const promises = [];

      if (deletedTicketTierIds.length > 0) {
        promises.push(deleteBulkTicketTiers(eventId, deletedTicketTierIds));
      }

      if (newTiers.length > 0) {
        promises.push(createBulkTicketTier(eventId, newTiers));
      }

      if (promises.length > 0) {
        await Promise.all(promises);
      }

      setStep(3); // Move to Media phase
    } catch (error: any) {
      console.error("Bulk upload failed:", error);
      alert(error.response?.data?.detail || "Failed to save tiers to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8">
      <div className="p-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

        <FormSection title="Create Ticket Tier">
          <form onSubmit={handleSubmit(ticketSubmit)} className="space-y-5">
            {/* NAME */}
            <div>
              <label className={labelClass}>Ticket Name</label>
              <input
                {...register("name")}
                className={inputClass}
                placeholder="VIP Access"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Price</label>
                <input
                  type="number"
                  {...register("price", { valueAsNumber: true })}
                  className={inputClass}
                  placeholder="Price ₦"
                />
              </div>

              <div>
                <label className={labelClass}>Ticket Quantity</label>
                <input
                  type="number"
                  {...register("quantity", { valueAsNumber: true })}
                  className={inputClass}
                  placeholder={
                    selectedType === TicketType.TABLE
                      ? "Total Tables"
                      : "Quantity"
                  }
                />
              </div>
            </div>

            {/* TYPE SELECT */}
            <div>
              <label className={labelClass}>Ticket Type</label>

              <div className="grid grid-cols-1 gap-2">
                {Object.values(TicketType).map((type) => {
                  const meta = TYPE_META[type];

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => reset({ ...watch(), type })}
                      className={`
                        text-left p-3 rounded-xl border transition
                        ${
                          selectedType === type
                            ? "border-orange-500 bg-orange-500/10"
                            : "border-white/10 hover:bg-white/5"
                        }
                      `}
                    >
                      <p className="text-sm font-bold">{meta.label}</p>
                      <p className="text-xs text-white/40">{meta.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedType === TicketType.TABLE && (
              <div>
                <label className={labelClass}>Seats per table</label>
                <input
                  type="number"
                  {...register("seatsPerTable", { valueAsNumber: true })}
                  className={inputClass}
                />
              </div>
            )}
            {selectedType === TicketType.ASSIGNED_SEATING && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Row Count</label>
                  <input
                    type="number"
                    {...register("row_count", { valueAsNumber: true })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Seats Per Row</label>
                  <input
                    type="number"
                    {...register("seats_per_row", { valueAsNumber: true })}
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Allow Combined Names</p>
                <p className="text-xs text-white/40">Enable "use my name for all seats" toggle for this tier</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  {...register("allowCombinedNames")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>

            <button
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100 bg-primary/20 text-primary hover:bg-primary hover:text-white"
            >
              Add Ticket{" "}
              {isSubmitting ? <ClipLoader /> : <Plus className="w-4 h-4" />}
            </button>
          </form>
        </FormSection>
        <div className="relative">
          <FormSection title="Ticketing & Seats">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-white/30 text-xs mt-0.5">
                  {ticketTiers.length} tier
                  {ticketTiers.length !== 1 ? "s" : ""} added
                </p>
              </div>
            </div>

            {ticketTiers.length === 0 ? (
              <div
                className="text-center py-14 rounded-xl mb-6 flex flex-col items-center gap-3"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px dashed rgba(255,255,255,0.1)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(249,115,22,0.1)" }}
                >
                  <Ticket className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-white/40 text-sm">
                  No ticket tiers yet. Add one to get started.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 mb-6">
                {ticketTiers.map((tier, index) => {
                  const meta = TYPE_META[tier.type] || {
                    label: tier.type,
                    color: "#f97316",
                  };
                  const tableConfig = tier.config as TableTicketConfig;
                  const seatingConfig = tier.config as AssignedSeatingConfig;
                  return (
                    <div
                      key={index}
                      className="flex justify-between items-center rounded-xl p-4 transition-all group"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: `${meta.color}18` }}
                        >
                          <Ticket
                            className="w-5 h-5"
                            style={{ color: meta.color }}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{tier.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                background: `${meta.color}20`,
                                color: meta.color,
                              }}
                            >
                              {meta.label}
                            </span>
                            <span className="text-white/40 text-xs font-medium">
                              ₦{(tier.base_price / 100).toFixed(2)}
                            </span>
                            <span className="text-white/30 text-xs">
                              Qty: {tier.quantity_available}
                            </span>
                            <div>
                              {tier.type === TicketType.TABLE &&
                                tableConfig?.seats_per_table && (
                                  <span className="text-white/30 text-xs">
                                    {tableConfig.seats_per_table} seats in table
                                  </span>
                                )}

                              {tier.type === TicketType.ASSIGNED_SEATING &&
                                seatingConfig?.row_count && (
                                  <span className="text-white/30 text-xs">
                                    {seatingConfig.row_count} rows ×{" "}
                                    {seatingConfig.seats_per_row} seats
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeTicketTier(index)}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all text-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </FormSection>
        </div>

        <div className="flex justify-between pt-2">
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={onFinalSubmit}
            disabled={ticketTiers.length === 0 || isSubmitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] bg-orange-700 disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
          >
            {eventId ? "Save & Next: Media" : "Next: Media"}{" "}
            {isSubmitting ? <ClipLoader /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
