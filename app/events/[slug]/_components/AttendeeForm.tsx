"use client";

import { useState, useEffect } from "react";
import {
  Check,
  User,
  Mail,
  Phone,
  Users,
  ChevronRight,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface CustomQuestion {
  id: string;
  label: string;
  type: "text" | "select" | "checkbox";
  options?: string[];
  is_required: boolean;
}

type Attendee = {
  name: string;
  email: string;
  phone: string;
  seat_number?: number;
  table_number?: number;
  answers?: Record<string, string | boolean>;
};

interface Slot {
  tier_id: string;
  label: string;
  table_id?: string;
  table_number?: number;
  seat_number?: number;
  allow_combined_names?: boolean;
}

export default function AttendeeForm({
  slots,
  customQuestions,
  onSubmit,
}: {
  slots: Slot[];
  customQuestions?: CustomQuestion[];
  onSubmit: (
    attendees: Record<number, Attendee>,
    sharedTableStatus: Record<string, boolean>,
  ) => void;
}) {
  const [attendees, setAttendees] = useState<Record<number, Attendee>>({});
  const [useSameTableDetails, setUseSameTableDetails] = useState<
    Record<string, boolean>
  >({});
  const [useBuyerDetails, setUseBuyerDetails] = useState(false);

  // Initialize attendees with empty values
  useEffect(() => {
    const initial: Record<number, Attendee> = {};
    slots.forEach((slot, i) => {
      initial[i] = {
        name: "",
        email: "",
        phone: "",
        seat_number: slot.seat_number,
        table_number: slot.table_number,
        answers: {},
      };
    });
    setAttendees(initial);
  }, [slots]);

  const updateAnswer = (index: number, questionId: string, value: string | boolean) => {
    setAttendees((prev) => {
      const currentAttendee = prev[index] || { name: "", email: "", phone: "", answers: {} };
      const currentAnswers = currentAttendee.answers || {};
      const updatedAttendee = {
        ...currentAttendee,
        answers: {
          ...currentAnswers,
          [questionId]: value
        }
      };
      
      const updated = {
        ...prev,
        [index]: updatedAttendee
      };

      // Sync other table details if needed
      const currentSlot = slots[index];
      if (currentSlot.table_id && useSameTableDetails[currentSlot.table_id]) {
        slots.forEach((slot, i) => {
          if (slot.table_id === currentSlot.table_id) {
            updated[i] = {
              ...updated[i],
              answers: { ...(updated[i].answers || {}), [questionId]: value }
            };
          }
        });
      }

      return updated;
    });
  };

  const update = (index: number, field: keyof Attendee, value: string) => {
    setAttendees((prev) => {
      const updated = {
        ...prev,
        [index]: {
          ...prev[index],
          [field]: value,
        },
      };

      // If "same table details" is on, sync other seats in the same table
      const currentSlot = slots[index];
      if (currentSlot.table_id && useSameTableDetails[currentSlot.table_id]) {
        slots.forEach((slot, i) => {
          if (slot.table_id === currentSlot.table_id) {
            updated[i] = {
              ...updated[i],
              name: updated[index].name,
              email: updated[index].email,
              phone: updated[index].phone,
            };
          }
        });
      }

      return updated;
    });
  };

  const handleToggleSameTable = (tableId: string, firstIndex: number) => {
    setUseSameTableDetails((prev) => {
      const isOn = !prev[tableId];
      if (isOn) {
        // Copy first seat details to all other seats in this table
        const firstDetails = attendees[firstIndex];
        setAttendees((att) => {
          const updated = { ...att };
          slots.forEach((slot, i) => {
            if (slot.table_id === tableId) {
              updated[i] = { ...firstDetails };
            }
          });
          return updated;
        });
      }
      return { ...prev, [tableId]: isOn };
    });
  };

  const handleToggleBuyerDetails = () => {
    setUseBuyerDetails(!useBuyerDetails);
  };

  // Group slots by table if applicable
  const groupedSlots: {
    type: "single" | "table";
    tableId?: string;
    slots: { slot: Slot; index: number }[];
  }[] = [];

  slots.forEach((slot, index) => {
    if (slot.table_id) {
      let group = groupedSlots.find((g) => g.tableId === slot.table_id);
      if (!group) {
        group = { type: "table", tableId: slot.table_id, slots: [] };
        groupedSlots.push(group);
      }
      group.slots.push({ slot, index });
    } else {
      groupedSlots.push({ type: "single", slots: [{ slot, index }] });
    }
  });

  const isFormValid = slots.every(
    (_, i) => {
      const att = attendees[i];
      if (!att?.name?.trim() || !att?.email?.trim() || !att?.email?.includes("@")) {
        return false;
      }
      if (customQuestions) {
        for (const q of customQuestions) {
          if (q.is_required) {
            const ans = att.answers?.[q.id];
            if (ans === undefined || ans === null || ans === "" || ans === false) {
              return false;
            }
          }
        }
      }
      return true;
    }
  );

  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-20">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-white tracking-tight">
          Attendee Details
        </h2>
        <p className="text-white/50 text-sm">
          Please provide information for each ticket holder.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Buyer Details Shortcut (Optional Enhancement) */}
        <label className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.03] cursor-pointer hover:bg-white/[0.05] transition-colors">
          <input
            type="checkbox"
            checked={useBuyerDetails}
            onChange={handleToggleBuyerDetails}
            className="w-5 h-5 rounded border-white/20 bg-transparent text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium text-white/80">
            Use buyer details for first attendee
          </span>
        </label>

        {groupedSlots.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-4">
            {group.type === "table" ? (
              <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-6 relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 w-1 h-full bg-ec4899"
                  style={{ backgroundColor: "#ec4899" }}
                />

                <div className="bloack sm:flex justify-between items-center">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#ec4899]/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#ec4899]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">
                        {group.slots[0].slot.label.split(" — ")[0]}
                      </h3>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                        Table Reservation
                      </p>
                    </div>
                  </div>

                  {group.slots[0].slot.allow_combined_names && (
                    <label className="flex items-center justify-end gap-2 cursor-pointer">
                      <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
                        Shared Seat Details
                      </span>
                      <div
                        onClick={() =>
                          group.tableId &&
                          handleToggleSameTable(
                            group.tableId,
                            group.slots[0].index,
                          )
                        }
                        className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${useSameTableDetails[group.tableId!] ? "bg-primary" : "bg-white/10"}`}
                      >
                        <div
                          className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${useSameTableDetails[group.tableId!] ? "left-6" : "left-1"}`}
                        />
                      </div>
                    </label>
                  )}
                </div>

                <div className="space-y-6">
                  {group.slots.map(({ slot, index }, i) => {
                    // If "same table details" is on, only show the first form
                    if (useSameTableDetails[group.tableId!] && i > 0)
                      return null;

                    return (
                      <div
                        key={index}
                        className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500"
                      >
                        <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
                          {useSameTableDetails[group.tableId!]
                            ? "Table Guest Details"
                            : `Seat ${i + 1}`}
                        </p>
                        <AttendeeInputs
                          index={index}
                          values={
                            attendees[index] || {
                              name: "",
                              email: "",
                              phone: "",
                              answers: {},
                            }
                          }
                          onChange={update}
                          customQuestions={customQuestions}
                          onAnswerChange={updateAnswer}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-bold text-white text-base">
                    {group.slots[0].slot.label}
                  </h3>
                </div>
                <AttendeeInputs
                  index={group.slots[0].index}
                  values={
                    attendees[group.slots[0].index] || {
                      name: "",
                      email: "",
                      phone: "",
                      answers: {},
                    }
                  }
                  onChange={update}
                  customQuestions={customQuestions}
                  onAnswerChange={updateAnswer}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => onSubmit(attendees, useSameTableDetails)}
          disabled={!isFormValid}
          className="w-full bg-primary border border-primary hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          CONTINUE TO CHECKOUT
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="flex items-center justify-center gap-2 text-white/30 text-[10px] font-bold uppercase tracking-widest">
          <Info className="w-3 h-3" />
          <span>Your information is secured with 256-bit encryption</span>
        </div>
      </div>
    </div>
  );
}

function AttendeeInputs({
  index,
  values,
  onChange,
  customQuestions,
  onAnswerChange,
}: {
  index: number;
  values: Attendee;
  onChange: (index: number, field: keyof Attendee, value: string) => void;
  customQuestions?: CustomQuestion[];
  onAnswerChange: (index: number, questionId: string, value: string | boolean) => void;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="relative group">
        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
        <input
          placeholder="Full Name"
          value={values.name}
          className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white outline-none focus:border-primary/50 focus:bg-black/60 transition-all"
          onChange={(e) => onChange(index, "name", e.target.value)}
        />
      </div>

      <div className="relative group">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
        <input
          placeholder="Email Address"
          type="email"
          value={values.email}
          className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white outline-none focus:border-primary/50 focus:bg-black/60 transition-all"
          onChange={(e) => onChange(index, "email", e.target.value)}
        />
      </div>

      <div className="relative group md:col-span-2">
        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
        <input
          placeholder="Phone Number (Optional)"
          value={values.phone}
          className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white outline-none focus:border-primary/50 focus:bg-black/60 transition-all"
          onChange={(e) => onChange(index, "phone", e.target.value)}
        />
      </div>

      {customQuestions && customQuestions.length > 0 && (
        <div className="md:col-span-2 pt-2 space-y-4">
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Additional Information</p>
          {customQuestions.map((q) => {
            const answerValue = values.answers?.[q.id] ?? "";
            
            return (
              <div key={q.id} className="space-y-2">
                <label className="block text-xs font-semibold text-white/70 pl-1">
                  {q.label} {q.is_required && <span className="text-red-400">*</span>}
                </label>
                
                {q.type === "text" && (
                  <input
                    value={answerValue as string}
                    onChange={(e) => onAnswerChange(index, q.id, e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-primary/50 transition-all"
                    placeholder="Enter answer"
                    required={q.is_required}
                  />
                )}
                
                {q.type === "select" && (
                  <div className="relative">
                    <select
                      value={answerValue as string}
                      onChange={(e) => onAnswerChange(index, q.id, e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                      required={q.is_required}
                    >
                      <option value="" className="text-neutral-900">Select option...</option>
                      {q.options?.map((opt, i) => (
                        <option key={i} value={opt} className="text-neutral-900">{opt}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                {q.type === "checkbox" && (
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.01] cursor-pointer hover:bg-white/[0.03]">
                    <input
                      type="checkbox"
                      checked={!!answerValue}
                      onChange={(e) => onAnswerChange(index, q.id, e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-transparent text-primary focus:ring-primary"
                    />
                    <span className="text-xs text-white/70">Yes, confirm</span>
                  </label>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
