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

const isServer = typeof window === "undefined";
const BACKEND_URL = process.env.BACKEND_URL || "https://ticket.gogoalive.com";

const API_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : isServer
    ? `${BACKEND_URL}/api/v1`
    : '/api/v1';

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

export interface PublicEventsParams {
  category?: string;
  tags?: string;
  location?: string;
  name?: string;
}

export const getPublicEvents = async (params?: PublicEventsParams): Promise<Event[]> => {
  const response = await api.get("/public/events/", { params });
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

export const getTakenSeats = async (eventId: string): Promise<{tier_id: string, seat_number: string | number, status: string}[]> => {
  const response = await api.get(`/public/events/${eventId}/seats`);
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
  const response = await api.get("/events/");
  return response.data;
};

export const createEvent = async (event: EventCreate): Promise<Event> => {
  const response = await api.post("/events/", event);
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
  userId?: string | null,
): Promise<ReservationResponse> => {
  const response = await api.post("/orders/hold", {
    event_id: eventId,
    items,
    user_id: userId,
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

// ── Orders (Attendee) ─────────────────────────────────────────────────────

export const getMyOrders = async () => (await api.get("/orders/me")).data;
export const getMyOrderById = async (id: string) => (await api.get(`/orders/${id}`)).data;
// Note: for download we'll handle the Blob response in the UI component

// ── Wallet & Stats ────────────────────────────────────────────────────────

export interface WalletStats {
  total_events: number;
  total_tickets_sold: number;
  total_revenue: number;
  pending_balance: number;
  available_balance: number;
  recent_sales_count: number;
}

export interface WalletBalance {
  available_balance: number;
  pending_balance: number;
  lifetime_earnings: number;
}

export interface Transaction {
  id: string;
  type: "TICKET_SALE" | "PAYOUT" | "PLATFORM_FEE" | "REFUND";
  amount: number;          // positive = credit, negative = debit
  status: "PENDING" | "COMPLETED" | "FAILED";
  description: string;
  reference_id: string;
  created_at: string;
}

export const getRevenueSeries = async (period: string = "7d"): Promise<{name: string, revenue: number}[]> =>
  (await api.get(`/wallet/revenue-series?period=${period}`)).data;

export const getWalletStats   = async (): Promise<WalletStats>       => (await api.get("/wallet/stats")).data;
export const getWallet        = async (): Promise<WalletBalance>     => (await api.get("/wallet/me")).data;
export const getTransactions  = async (skip = 0, limit = 20): Promise<Transaction[]> =>
  (await api.get(`/wallet/transactions?skip=${skip}&limit=${limit}`)).data;

export const requestWithdrawal = async (payload: {
  amount: number;
  bank_name?: string;
  account_number?: string;
}): Promise<{ reference: string; amount: number; message: string }> =>
  (await api.post("/wallet/withdraw", payload)).data;

// ── User profile ──────────────────────────────────────────────────────────

export const updateProfile = async (payload: { full_name: string }) =>
  (await api.patch("/users/me", payload)).data;

export const changePassword = async (payload: {
  current_password: string;
  new_password: string;
}) => (await api.post("/auth/change-password", payload)).data;

// ── Admin Endpoints ────────────────────────────────────────────────────────

export const getAdminOrders = async (params?: any) => (await api.get("/admin/orders/", { params })).data;
export const getAdminOrder = async (id: string) => (await api.get(`/admin/orders/${id}`)).data;
export const refundAdminOrder = async (id: string, payload: { amount: number; reason: string }) => 
  (await api.post(`/admin/orders/${id}/refund`, payload)).data;

export const getAdminPayouts = async (params?: any) => (await api.get("/admin/payouts/", { params })).data;
export const approveAdminPayout = async (ref: string) => (await api.post(`/admin/payouts/${ref}/approve`)).data;
export const rejectAdminPayout = async (ref: string, reason: string) => 
  (await api.post(`/admin/payouts/${ref}/reject`, { reason })).data;

export const getAdminTransactions = async (params?: any) => (await api.get("/admin/transactions/", { params })).data;

export const getAdminAuditLogs = async (params?: any) => (await api.get("/admin/audit-log/", { params })).data;

export const getAdminPlatformSettings = async () => (await api.get("/admin/settings/")).data;
export const updateAdminPlatformSettings = async (payload: any) => (await api.patch("/admin/settings/", payload)).data;

export default api;
