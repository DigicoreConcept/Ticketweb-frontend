import { create } from "zustand";
import { TicketType, TicketConfig, Event, LocationData, CustomQuestion } from "../schema/eventTied";

export interface TicketTier {
  id?: string; // Optional for new tiers
  name: string;
  type: TicketType;
  base_price: number; // in naira
  quantity_available: number;
  is_free?: boolean;
  config?: TicketConfig;
  allow_combined_names?: boolean;
}

interface EventBuilderState {
  step: number;
  // Basics
  title: string;
  slug: string;
  description: string;
  country: string;
  location: string;
  locationData?: LocationData;
  category: string;
  tags: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  // Ticketing
  ticketTiers: TicketTier[];
  deletedTicketTierIds: string[]; // Track existing tickets the user removes
  // Media
  bannerImageUrl: string;
  eventImageUrl: string;
  eventId?: string;
  isEditMode: boolean;
  isVirtual: boolean;
  meetingLink: string;
  isRecurring: boolean;
  recurringFrequency: string;
  recurringEndDate: string;
  customQuestions: CustomQuestion[];

  // Actions
  setStep: (step: number) => void;
  updateBasics: (data: Partial<EventBuilderState>) => void;
  updateCustomQuestions: (questions: CustomQuestion[]) => void;
  addTicketTier: (tier: TicketTier) => void;
  updateTicketTier: (index: number, tier: TicketTier) => void;
  removeTicketTier: (index: number) => void;
  setBannerImage: (url: string) => void;
  setEventImage: (url: string) => void;
  setEventId: (id: string) => void;
  loadEventData: (event: Event) => void;
  reset: () => void;
}

export const useEventBuilderStore = create<EventBuilderState>((set) => ({
  step: 1,
  title: "",
  slug: "",
  description: "",
  country: "",
  location: "",
  locationData: undefined,
  category: "",
  tags: "",
  startTime: "",
  endTime: "",
  ticketTiers: [],
  deletedTicketTierIds: [],
  bannerImageUrl: "",
  eventImageUrl: "",
  eventId: "",
  isEditMode: false,
  isVirtual: false,
  meetingLink: "",
  isRecurring: false,
  recurringFrequency: "",
  recurringEndDate: "",
  customQuestions: [],

  setStep: (step) => set({ step }),
  updateBasics: (data) => set((state) => ({ ...state, ...data })),
  updateCustomQuestions: (questions) => set({ customQuestions: questions }),
  addTicketTier: (tier) =>
    set((state) => ({ ticketTiers: [...state.ticketTiers, tier] })),
  updateTicketTier: (index, tier) =>
    set((state) => {
      const newTiers = [...state.ticketTiers];
      newTiers[index] = tier;
      return { ticketTiers: newTiers };
    }),
  removeTicketTier: (index) =>
    set((state) => {
      const tierToRemove = state.ticketTiers[index];
      const newDeletedIds = [...state.deletedTicketTierIds];
      if (tierToRemove.id) {
        newDeletedIds.push(tierToRemove.id);
      }
      return {
        ticketTiers: state.ticketTiers.filter((_, i) => i !== index),
        deletedTicketTierIds: newDeletedIds,
      };
    }),
  setBannerImage: (url) => set({ bannerImageUrl: url }),
  setEventImage: (url) => set({ eventImageUrl: url }),
  setEventId: (id) => set({ eventId: id }),
  loadEventData: (event) =>
    set({
      step: 1,
      title: event.title || "",
      slug: event.slug || "",
      description: event.description || "",
      country: event.country || "Nigeria",
      location: event.location || "",
      locationData: event.location_data,
      category: event.category || "",
      tags: event.tags || "",
      startTime: event.start_time || "",
      endTime: event.end_time || "",
      bannerImageUrl: event.banner_image_url || "",
      eventImageUrl: event.image_url || "",
      eventId: event.id,
      isEditMode: true,
      isVirtual: event.is_virtual || false,
      meetingLink: event.meeting_link || "",
      isRecurring: (event as any).is_recurring || false,
      recurringFrequency: (event as any).recurring_frequency || "",
      recurringEndDate: (event as any).recurring_end_date || "",
      customQuestions: (event as any).custom_questions || [],
      ticketTiers: event.ticket_tiers
        ? event.ticket_tiers.map((t) => ({
            id: t.id,
            name: t.name,
            type: t.type,
            base_price: t.base_price,
            quantity_available: t.quantity_available,
            is_free: t.is_free,
            config: t.config,
            allow_combined_names: t.allow_combined_names,
          }))
        : [],
      deletedTicketTierIds: [],
    }),
  reset: () =>
    set({
      step: 1,
      title: "",
      slug: "",
      description: "",
      country: "",
      location: "",
      locationData: undefined,
      category: "",
      tags: "",
      startTime: "",
      endTime: "",
      ticketTiers: [],
      deletedTicketTierIds: [],
      bannerImageUrl: "",
      eventImageUrl: "",
      isEditMode: false,
      isVirtual: false,
      meetingLink: "",
      isRecurring: false,
      recurringFrequency: "",
      recurringEndDate: "",
      customQuestions: [],
    }),
}));
