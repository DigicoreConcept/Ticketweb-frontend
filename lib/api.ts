import axios from "axios";
import {
  EventCreate,
  TicketTierCreate,
  Event,
  TicketTier,
  EventUpdate,
} from "./schema/eventTied";
import { ReservationItem, ReservationResponse } from "./schema/orderTied";
import { toast } from "@/lib/store/toastStore";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'https://ticketweb.gogoaltv.com'}/api/v1`;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    const resData = response.data;
    if (resData && typeof resData === "object" && "status" in resData && "data" in resData) {
      if (resData.status === false) {
        const errMsg = resData.message || "Operation failed";
        toast.error(errMsg);
        return Promise.reject({
          response: {
            ...response,
            data: resData
          }
        });
      }
      return {
        ...response,
        data: resData.data
      };
    }
    return response;
  },
  (error) => {
    if (typeof window !== "undefined") {
      if (error.response) {
        // 401 Unauthorized or 403 Forbidden globally
        if (error.response.status === 401 || error.response.status === 403) {
          localStorage.removeItem("token");
          toast.error("Session expired or unauthorized. Please login again.");

          const currentPath = window.location.pathname + window.location.search;
          if (
            !currentPath.includes("/auth/login") &&
            !currentPath.includes("/auth/register")
          ) {
            window.location.href = `/auth/login?_r=${encodeURIComponent(currentPath)}`;
          }
        } else if (
          error.response.status >= 400 &&
          error.config.method !== "get"
        ) {
          // Automatically fire error toast for 400+ failing mutations
          const msg =
            error.response.data?.message ||
            error.response.data?.detail ||
            "Internal server error, try again";
          toast.error(msg);
        }
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      }
    }
    return Promise.reject(error);
  },
);

export const getPublicEvents = async (): Promise<Event[]> => {
  const response = await api.get("/public/events");
  return response.data;
};

export const getEventBySlug = async (slug: string): Promise<Event> => {
  const response = await api.get(`/public/events/${slug}`);
  return response.data;
};

export const getEventById = async (id: string): Promise<Event> => {
  const response = await api.get(`/events/${id}`);
  return response.data;
};

export const createReservation = async (
  eventId: string,
  items: { tier_id: string; quantity: number }[],
) => {
  const response = await api.post("/orders/hold", {
    event_id: eventId,
    items,
  });
  return response.data;
};

export const releaseReservation = async (reserve_id: string) => {
  const response = await api.post(`/orders/release/${reserve_id}`);
  return response.data;
};

export const checkoutOrder = async (
  reservationId: string,
  data: {
    name: string;
    email: string;
    paymentToken?: string;
    send_to_attendees?: boolean;
  },
) => {
  const response = await api.post("/orders/checkout", {
    reservation_id: reservationId,
    guest_email: data.email,
    guest_name: data.name,
    payment_token: data.paymentToken,
    send_to_attendees: data.send_to_attendees ?? false,
  });
  return response.data;
};

export const verifyPayment = async (reference: string) => {
  const response = await api.get(`/orders/verify/${reference}`);
  return response.data;
};

export type PublicEvent = Event;

export const getMyEvents = async (): Promise<Event[]> => {
  const response = await api.get("/events");
  return response.data;
};

export const createEvent = async (event: EventCreate): Promise<Event> => {
  const response = await api.post("/events", event);
  return response.data;
};

export const createBulkTicketTier = async (
  event_id: string,
  tiers: TicketTierCreate[],
): Promise<TicketTier> => {
  const response = await api.post(`/events/${event_id}/tiers/bulk`, {
    tiers: tiers,
  });
  return response.data;
};

export const deleteBulkTicketTiers = async (
  event_id: string,
  tier_ids: string[],
): Promise<void> => {
  await api.delete(`/events/${event_id}/tiers/bulk`, {
    data: { tier_ids },
  });
};

export const createTicketTier = async (
  event_id: string,
  tier: TicketTierCreate,
): Promise<TicketTier> => {
  const response = await api.post(`/events/${event_id}/tiers`, tier);
  return response.data;
};

export const publishEvent = async (event_id: string): Promise<any> => {
  const response = await api.post(`/events/${event_id}/publish`);
  return response.data;
};

export const updateEvent = async (
  event_id: string,
  event: EventUpdate,
): Promise<Event> => {
  const response = await api.put(`/events/${event_id}`, event);
  return response.data;
};

export const holdTickets = async (
  eventId: string,
  items: ReservationItem[],
): Promise<ReservationResponse> => {
  const response = await api.post("/orders/hold", {
    event_id: eventId,
    items,
  });
  return response.data;
};

export const uploadImage = async (
  event_id: string,
  file: Blob,
  fieldName: "banner_image" | "event_image" = "banner_image",
): Promise<Event> => {
  const formData = new FormData();
  formData.append(fieldName, file, `${fieldName.split("_")[0]}.jpg`);
  const response = await api.put(`/events/${event_id}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export default api;
