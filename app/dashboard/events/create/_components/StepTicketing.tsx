"use client";

import {
  useEventBuilderStore,
  TicketTier,
} from "@/lib/store/eventBuilderStore";
import { Plus, Trash2, ArrowRight, ArrowLeft, Ticket, Zap, Edit2 } from "lucide-react";
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
import { createBulkTicketTier, deleteBulkTicketTiers, updateBulkTicketTiers, getEventById } from "@/lib/api";
import { useState } from "react";
import { ClipLoader } from "@/components/ui/ClipLoader";
import { toast } from "@/lib/store/toastStore";

// NaN guard: disabled/hidden inputs return NaN with valueAsNumber — coerce to 0
const nanToZero = (v: unknown) =>
  typeof v === "number" && isNaN(v) ? 0 : v;

const ticketTierSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    type: z.nativeEnum(TicketType),
    // Price can be NaN when the input is disabled (isFree). Coerce to 0 first.
    price: z.preprocess(nanToZero, z.number().min(0, "Price must be positive")),
    quantity: z.preprocess(nanToZero, z.number().min(1, "Quantity must be at least 1")),
    seatsPerTable: z.preprocess(nanToZero, z.number().optional()).optional(),
    row_count: z.preprocess(nanToZero, z.number().optional()).optional(),
    seats_per_row: z.preprocess(nanToZero, z.number().optional()).optional(),
    allowCombinedNames: z.boolean().optional(),
    isFree: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // Skip price validation when ticket is free
    if (!data.isFree && data.price < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Price must be 0 or greater",
        path: ["price"],
      });
    }

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
    updateTicketTier,
  } = useEventBuilderStore();

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedMobileIndex, setSelectedMobileIndex] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TicketTierFormValues>({
    resolver: zodResolver(ticketTierSchema) as any,
    defaultValues: {
      type: TicketType.GENERAL_ADMISSION,
      price: 0,
      quantity: 100,
      seatsPerTable: 5,
      allowCombinedNames: false,
      isFree: false,
    },
  });

  const selectedType = watch("type");
  const isFreeTicket = watch("isFree");

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

    const newTier = {
      name: data.name,
      type: data.type,
      base_price: data.price,
      quantity_available: data.quantity,
      is_free: data.isFree,
      config: config,
      allow_combined_names: data.allowCombinedNames,
    };

    console.log(newTier)
    if (editingIndex !== null) {
      updateTicketTier(editingIndex, {
        ...ticketTiers[editingIndex],
        ...newTier
      });
      setEditingIndex(null);
    } else {
      addTicketTier(newTier);
    }

    // Reset only the name and price, keep type for convenience
    reset({
      ...data,
      name: "",
      price: 0,
    });
  };

  const handleEditClick = (index: number) => {
    const tier = ticketTiers[index];
    setEditingIndex(index);
    
    const config = tier.config || {};
    
    reset({
      name: tier.name,
      type: tier.type,
      price: tier.base_price,
      quantity: tier.quantity_available,
      isFree: tier.is_free || false,
      seatsPerTable: (config as TableTicketConfig)?.seats_per_table || 5,
      row_count: (config as AssignedSeatingConfig)?.row_count || undefined,
      seats_per_row: (config as AssignedSeatingConfig)?.seats_per_row || undefined,
      allowCombinedNames: tier.allow_combined_names || false,
    });
    
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      const updatedTiers = ticketTiers.filter((t) => t.id);

      const promises = [];

      if (deletedTicketTierIds.length > 0) {
        promises.push(deleteBulkTicketTiers(eventId, deletedTicketTierIds));
      }

      if (newTiers.length > 0) {
        promises.push(createBulkTicketTier(eventId, newTiers));
      }
      
      if (updatedTiers.length > 0) {
        promises.push(updateBulkTicketTiers(eventId, updatedTiers as any));
      }

      if (promises.length > 0) {
        await Promise.all(promises);
      }

      // Fetch the latest tiers from the server to save the generated tier IDs in state
      const eventData = await getEventById(eventId);
      useEventBuilderStore.setState({
        ticketTiers: eventData.ticket_tiers || [],
        deletedTicketTierIds: []
      });

      toast.success("Ticket tiers saved successfully!");
      setStep(3); // Move to Media phase
    } catch (error: any) {
      console.error("Bulk upload failed:", error);
      toast.error(error.response?.data?.detail || "Failed to save tiers to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8">
      <div className="p-0 sm:p-8 relative overflow-hidden">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={isFreeTicket ? "opacity-50 pointer-events-none" : ""}>
                <label className={labelClass}>Price</label>
                <input
                  type="number"
                  {...register("price", { valueAsNumber: true })}
                  className={inputClass}
                  placeholder="Price ₦"
                  disabled={isFreeTicket}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <p className="text-sm font-bold text-white">Free Ticket</p>
                <p className="text-xs text-white/40">This ticket tier will be free of charge</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  {...register("isFree")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>

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

            <div className="flex gap-4">
              <button
                disabled={isSubmitting}
                className="flex flex-1 items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100 bg-primary/20 text-primary hover:bg-primary hover:text-white"
              >
                {editingIndex !== null ? "Update Ticket" : "Add Ticket"}{" "}
                {isSubmitting ? <ClipLoader /> : (editingIndex !== null ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
              </button>
              {editingIndex !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingIndex(null);
                    reset({
                      name: "",
                      price: 0,
                      quantity: 100,
                      seatsPerTable: 5,
                      allowCombinedNames: false,
                      isFree: false,
                    });
                  }}
                  className="flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm transition-all bg-white/10 text-white hover:bg-white/20"
                >
                  Cancel
                </button>
              )}
            </div>
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
                      onClick={() => setSelectedMobileIndex(selectedMobileIndex === index ? null : index)}
                      className={`block sm:flex justify-between items-center rounded-xl p-4 transition-all group cursor-pointer sm:cursor-default`}
                      style={{
                        background: selectedMobileIndex === index ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
                        border: selectedMobileIndex === index ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-6 sm:w-10 h-6 sm:h-10 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: `${meta.color}18` }}
                        >
                          <Ticket
                            className="w-5 h-5"
                            style={{ color: meta.color }}
                          />
                        </div>
                        <div>
                          <div  className="flex gap-2">
                            <p className="font-bold text-sm">{tier.name}</p>
                             <span
                              className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full block sm:hidden"
                              style={{
                                background: `${meta.color}20`,
                                color: meta.color,
                              }}
                            >
                              {meta.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-full hidden sm:block"
                              style={{
                                background: `${meta.color}20`,
                                color: meta.color,
                              }}
                            >
                              {meta.label}
                            </span>
                            <span className="text-white/40 text-xs font-medium">
                              {tier.is_free ? "Free" : `₦${tier.base_price.toLocaleString()}`}
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
                      <div className={`flex justify-end text-end items-center transition-all ${selectedMobileIndex === index ? 'opacity-100 mt-3 sm:mt-0' : 'opacity-0 sm:group-hover:opacity-100 h-0 overflow-hidden sm:h-auto sm:overflow-visible'}`}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditClick(index); }}
                          className="p-2 rounded-lg text-blue-400 hover:bg-blue-400/10 mr-1"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeTicketTier(index); }}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
            {eventId ? "Save & Next: Questions" : "Next: Questions"}{" "}
            {isSubmitting ? <ClipLoader /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
