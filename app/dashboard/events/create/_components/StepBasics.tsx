"use client";

import { useEventBuilderStore } from "@/lib/store/eventBuilderStore";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { ArrowRight, Sparkles } from "lucide-react";
import FormSection from "@/components/ui/FormSection";
import { EventCreate } from "@/lib/schema/eventTied";
import { createEvent, updateEvent } from "@/lib/api";
import { ClipLoader } from "@/components/ui/ClipLoader";
import LocationPicker from "@/components/ui/LocationPicker";

const basicsSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    slug: z
      .string()
      .min(3, "Slug must be at least 3 characters")
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
    description: z.string().optional(),
    is_virtual: z.boolean().default(false),
    country: z.string().optional(),
    location: z.string().optional(),
    locationData: z.any().optional(),
    meeting_link: z.string().url("Must be a valid meeting URL").optional().or(z.literal("")),
    category: z.string().optional(),
    tags: z.string().optional(),
    startDate: z.string().min(1, "Start date is required"),
    startHour: z.string().min(1, "Hour is required"),
    startMinute: z.string().min(1, "Minute is required"),
    startAmPm: z.enum(["AM", "PM"]),
    endDate: z.string().min(1, "End date is required"),
    endHour: z.string().min(1, "Hour is required"),
    endMinute: z.string().min(1, "Minute is required"),
    endAmPm: z.enum(["AM", "PM"]),
    is_recurring: z.boolean().default(false),
    recurringFrequency: z.string().optional(),
    recurringEndDate: z.string().optional(),
  })
  .refine(
    (data) => {
      // Convert 12-hour format to 24-hour for start
      let startH = parseInt(data.startHour);
      if (data.startAmPm === "PM" && startH !== 12) startH += 12;
      if (data.startAmPm === "AM" && startH === 12) startH = 0;

      // Convert 12-hour format to 24-hour for end
      let endH = parseInt(data.endHour);
      if (data.endAmPm === "PM" && endH !== 12) endH += 12;
      if (data.endAmPm === "AM" && endH === 12) endH = 0;

      const start = new Date(
        `${data.startDate}T${startH.toString().padStart(2, "0")}:${data.startMinute}:00`,
      );
      const end = new Date(
        `${data.endDate}T${endH.toString().padStart(2, "0")}:${data.endMinute}:00`,
      );
      return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start;
    },
    {
      message: "End time must be after start time",
      path: ["endHour"],
    },
  )
  .refine(
    (data) => {
      if (!data.is_virtual) {
        return !!data.country && !!data.location && data.location.trim().length >= 3;
      }
      return true;
    },
    {
      message: "Location details are required for physical events",
      path: ["location"],
    }
  );

type BasicsFormValues = z.infer<typeof basicsSchema>;

const inputClass = `
  w-full px-4 py-3 rounded-xl text-white placeholder-white/30 font-medium text-sm outline-none
  transition-all duration-200
  bg-white/5 border border-white/10
  focus:border-orange-500/70 focus:bg-white/8 focus:ring-2 focus:ring-orange-500/20
`;

const labelClass =
  "block text-xs font-bold tracking-widest uppercase text-white/50 mb-2";

const hoursOptions = Array.from({ length: 12 }).map((_, i) =>
  (i + 1).toString().padStart(2, "0"),
);
const minutesOptions = Array.from({ length: 60 }).map((_, i) =>
  i.toString().padStart(2, "0"),
);

export default function StepBasics() {
  const [loading, setLoading] = useState(false);
  const {
    title,
    slug,
    description,
    country,
    location,
    locationData,
    category,
    tags,
    startTime,
    endTime,
    updateBasics,
    setStep,
    setEventId,
    eventId,
    isVirtual,
    meetingLink,
    isRecurring,
    recurringFrequency,
    recurringEndDate,
  } = useEventBuilderStore();

  
  const parseTime = (isoString: string) => {
    if (!isoString || !isoString.includes("T"))
      return { hour: "12", minute: "00", ampm: "AM" as "AM" | "PM", date: "" };
    const [date, timePart] = isoString.split("T");
    const [h, m] = timePart.split(":");
    let hourNum = parseInt(h);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    if (hourNum === 0) hourNum = 12;
    else if (hourNum > 12) hourNum -= 12;
    return {
      date,
      hour: hourNum.toString().padStart(2, "0"),
      minute: m,
      ampm: ampm as "AM" | "PM",
    };
  };

  const defaultStart = parseTime(startTime);
  const defaultEnd = parseTime(endTime);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm<any>({
    resolver: zodResolver(basicsSchema),
    defaultValues: {
      title,
      slug,
      description,
      country: country || "Nigeria",
      location: location,
      locationData,
      category,
      tags,
      startDate: defaultStart.date,
      startHour: defaultStart.hour,
      startMinute: defaultStart.minute,
      startAmPm: defaultStart.ampm,
      endDate: defaultEnd.date,
      endHour: defaultEnd.hour,
      endMinute: defaultEnd.minute,
      endAmPm: defaultEnd.ampm,
      is_virtual: isVirtual,
      meeting_link: meetingLink,
      is_recurring: isRecurring,
      recurringFrequency,
      recurringEndDate: recurringEndDate ? recurringEndDate.split("T")[0] : "",
    },
  });

  const watchedTitle = watch("title");
  const isVirtualEvent = watch("is_virtual");
  const isRecurringEvent = watch("is_recurring");
  useEffect(() => {
    if (!slug && watchedTitle) {
      const generatedSlug = watchedTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", generatedSlug);
    }
  }, [watchedTitle, slug, setValue]);

  const buildEventPayload = (data: BasicsFormValues): EventCreate => {
    let startH = parseInt(data.startHour);
    if (data.startAmPm === "PM" && startH !== 12) startH += 12;
    if (data.startAmPm === "AM" && startH === 12) startH = 0;

    let endH = parseInt(data.endHour);
    if (data.endAmPm === "PM" && endH !== 12) endH += 12;
    if (data.endAmPm === "AM" && endH === 12) endH = 0;

    return {
      title: data.title,
      slug: data.slug,
      description: data.description || "",
      country: data.is_virtual ? "Virtual" : (data.country || "Nigeria"),
      location: data.is_virtual ? "Virtual Event" : (data.location || ""),
      location_data: data.is_virtual ? undefined : (data.locationData || locationData),
      category: data.category || "",
      tags: data.tags || "",
      start_time: `${data.startDate}T${startH.toString().padStart(2, "0")}:${data.startMinute}:00`,
      end_time: `${data.endDate}T${endH.toString().padStart(2, "0")}:${data.endMinute}:00`,
      banner_image_url: "",
      image_url: "",
      is_virtual: data.is_virtual,
      meeting_link: data.is_virtual ? data.meeting_link : "",
      is_recurring: data.is_recurring,
      recurring_frequency: data.recurringFrequency,
      recurring_end_date: data.recurringEndDate,
    };
  };

  const onSubmit = async (data: BasicsFormValues) => {
    try {
      setLoading(true);

      const payload = buildEventPayload(data);

      if (eventId) {
        var eventResp = await updateEvent(eventId, payload);
      } else {
        var eventResp = await createEvent(payload);
        setEventId(eventResp.id);
      }

      updateBasics({
        title: payload.title,
        slug: payload.slug,
        description: payload.description,
        country: payload.country,
        location: payload.location,
        locationData: payload.location_data,
        category: payload.category,
        tags: payload.tags,
        startTime: payload.start_time,
        endTime: payload.end_time,
        isVirtual: payload.is_virtual,
        meetingLink: payload.meeting_link,
        isRecurring: payload.is_recurring,
        recurringFrequency: payload.recurring_frequency,
        recurringEndDate: payload.recurring_end_date,
      });

      // 3️⃣ save draft id
      setEventId(eventResp.id);

      // 4️⃣ move forward
      setStep(2);
    } catch (err) {
      console.error(err);
      alert("Failed to create draft event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto">
      <div className="p-4 sm:p-8 relative overflow-hidden">
        {/* Subtle glow top-right */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

        <div className="relative">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormSection title="Event Details">
              {/* Title */}
              <div>
                <label className={labelClass}>Event Title</label>
                <input
                  {...register("title")}
                  className={inputClass}
                  placeholder="e.g. Summer Music Festival"
                />
                {errors.title && (
                  <p className="text-orange-400 text-xs mt-1.5 font-medium">
                    {(errors.title as any)?.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className={labelClass}>Describe your event</label>

                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              {/* Slug */}
              <div>
                <label className={labelClass}>Custom URL</label>
                <div className="flex items-center rounded-xl overflow-hidden border border-white/10 bg-white/5 focus-within:border-orange-500/70 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                  <span className="pl-4 text-white/30 text-sm font-medium select-none whitespace-nowrap">
                    vibes-ng
                  </span>
                  <input
                    {...register("slug")}
                    className="flex-1 px-2 py-3 bg-transparent text-white placeholder-white/30 font-medium text-sm outline-none"
                  />
                </div>
                {errors.slug && (
                  <p className="text-orange-400 text-xs mt-1.5 font-medium">
                    {(errors.slug as any)?.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className={labelClass}>Category</label>
                <select
                  {...register("category")}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="" className="text-amber-950">Select a category</option>
                  <option value="Music" className="text-amber-950">Music</option>
                  <option value="Technology" className="text-amber-950">Technology</option>
                  <option value="Business" className="text-amber-950">Business</option>
                  <option value="Arts & Culture" className="text-amber-950">Arts & Culture</option>
                  <option value="Sports & Fitness" className="text-amber-950">Sports & Fitness</option>
                  <option value="Food & Drink" className="text-amber-950">Food & Drink</option>
                  <option value="Other" className="text-amber-950">Other</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className={labelClass}>Tags</label>
                <input
                  {...register("tags")}
                  className={inputClass}
                  placeholder="e.g. concert, outdoor, afrobeats"
                />
                <p className="text-white/30 text-[10px] mt-1.5 uppercase font-medium tracking-wider">Separate tags with commas</p>
              </div>
            </FormSection>

            {/* Virtual Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02] mb-4">
              <div>
                <p className="text-sm font-bold text-white">Virtual Event</p>
                <p className="text-xs text-white/40">Toggle if this event takes place online via video conference</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  {...register("is_virtual")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>

            {/* Conditionally Render Meeting Link */}
            {isVirtualEvent && (
              <div className="mb-4">
                <label className={labelClass}>Meeting Link / Webinar URL</label>
                <input
                  {...register("meeting_link")}
                  className={inputClass}
                  placeholder="https://zoom.us/j/123456789"
                />
                {errors.meeting_link && (
                  <p className="text-orange-400 text-xs mt-1.5 font-medium">
                    {(errors.meeting_link as any)?.message}
                  </p>
                )}
              </div>
            )}

            {!isVirtualEvent && (
              <FormSection title="Event Location">
                {/* Country */}
                <div>
                  <label className={labelClass}>Country</label>
                  <select
                    {...register("country")}
                    className={`${inputClass} appearance-none cursor-pointer`}
                  >
                    <option value="Nigeria">Nigeria</option>
                  </select>
                  {errors.country && (
                    <p className="text-orange-400 text-xs mt-1.5 font-medium">
                      {(errors.country as any)?.message}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className={labelClass}>Venue & Location</label>
                  <Controller
                    name="location"
                    control={control}
                    render={({ field, fieldState }) => (
                      <LocationPicker
                        locationData={watch("locationData")}
                        initialLocation={watch("location")}
                        country={watch("country")}
                        onChange={(newLoc, newLocData) => {
                          field.onChange(newLoc);
                          setValue("locationData", newLocData);
                        }}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </div>
              </FormSection>
            )}

            {/* Date/Time */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Start Date & Time</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative w-full sm:w-1/2">
                    <input
                      type="date"
                      {...register("startDate")}
                      className={`${inputClass} relative cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                      onClick={(e) => {
                        try {
                          if ("showPicker" in HTMLInputElement.prototype) {
                            (e.target as HTMLInputElement).showPicker();
                          }
                        } catch (err) {}
                      }}
                    />
                  </div>
                  <div className="flex w-full sm:w-1/2 gap-1">
                    <select
                      {...register("startHour")}
                      className={`${inputClass} appearance-none cursor-pointer px-2 text-center`}
                    >
                      <option value="" disabled>
                        HH
                      </option>
                      {hoursOptions.map((h) => (
                        <option
                          className="text-amber-950"
                          key={`sh-${h}`}
                          value={h}
                        >
                          {h}
                        </option>
                      ))}
                    </select>
                    <span className="text-white/50 self-center font-bold">
                      :
                    </span>
                    <select
                      {...register("startMinute")}
                      className={`${inputClass} appearance-none cursor-pointer px-2 text-center`}
                    >
                      <option value="" disabled>
                        MM
                      </option>
                      {minutesOptions.map((m) => (
                        <option
                          className="text-amber-950"
                          key={`sm-${m}`}
                          value={m}
                        >
                          {m}
                        </option>
                      ))}
                    </select>
                    <select
                      {...register("startAmPm")}
                      className={`${inputClass} appearance-none cursor-pointer px-2 text-center`}
                    >
                      <option value="AM" className="text-amber-950">
                        AM
                      </option>
                      <option value="PM" className="text-amber-950">
                        PM
                      </option>
                    </select>
                  </div>
                </div>
                {errors.startDate && (
                  <p className="text-orange-400 text-xs mt-1.5 font-medium">
                    {(errors.startDate as any)?.message}
                  </p>
                )}
                {(errors.startHour || errors.startMinute) && (
                  <p className="text-orange-400 text-xs mt-1.5 font-medium">
                    Time is required
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>End Date & Time</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative w-full sm:w-1/2">
                    <input
                      type="date"
                      {...register("endDate")}
                      className={`${inputClass} relative cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                      onClick={(e) => {
                        try {
                          if ("showPicker" in HTMLInputElement.prototype) {
                            (e.target as HTMLInputElement).showPicker();
                          }
                        } catch (err) {}
                      }}
                    />
                  </div>
                  <div className="flex w-full sm:w-1/2 gap-1">
                    <select
                      {...register("endHour")}
                      className={`${inputClass} appearance-none cursor-pointer px-2 text-center`}
                    >
                      <option value="" disabled>
                        HH
                      </option>
                      {hoursOptions.map((h) => (
                        <option
                          key={`eh-${h}`}
                          className="text-amber-950"
                          value={h}
                        >
                          {h}
                        </option>
                      ))}
                    </select>
                    <span className="text-white/50 self-center font-bold">
                      :
                    </span>
                    <select
                      {...register("endMinute")}
                      className={`${inputClass} appearance-none cursor-pointer px-2 text-center`}
                    >
                      <option value="" disabled>
                        MM
                      </option>
                      {minutesOptions.map((m) => (
                        <option
                          key={`em-${m}`}
                          className="text-amber-950"
                          value={m}
                        >
                          {m}
                        </option>
                      ))}
                    </select>
                    <select
                      {...register("endAmPm")}
                      className={`${inputClass} appearance-none cursor-pointer px-2 text-center`}
                    >
                      <option value="AM" className="text-amber-950">AM</option>
                      <option value="PM" className="text-amber-950">PM</option>
                    </select>
                  </div>
                </div>
                {errors.endDate && (
                  <p className="text-orange-400 text-xs mt-1.5 font-medium">
                    {(errors.endDate as any)?.message}
                  </p>
                )}
                {(errors.endHour || errors.endMinute) && (
                  <p className="text-orange-400 text-xs mt-1.5 font-medium">
                    Time is required
                  </p>
                )}
              </div>
            </div>

            {/* Recurring Event Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02] mt-4">
              <div>
                <p className="text-sm font-bold text-white">Recurring Event</p>
                <p className="text-xs text-white/40">Toggle if this event recurs daily, weekly, or monthly</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  {...register("is_recurring")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>

            {/* Recurring Schedule Fields */}
            {isRecurringEvent && (
              <FormSection title="Recurrence Rules (Phase 3)">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Frequency</label>
                    <select
                      {...register("recurringFrequency")}
                      className={`${inputClass} appearance-none cursor-pointer`}
                    >
                      <option value="daily" className="text-amber-950">Daily</option>
                      <option value="weekly" className="text-amber-950">Weekly</option>
                      <option value="monthly" className="text-amber-950">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Recurrence End Date</label>
                    <input
                      type="date"
                      {...register("recurringEndDate")}
                      className={inputClass}
                    />
                  </div>
                </div>
              </FormSection>
            )}

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                disabled={loading}
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] bg-orange-700"
              >
                Next: Ticketing{" "}
                {loading ? <ClipLoader /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
