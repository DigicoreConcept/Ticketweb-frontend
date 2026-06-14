import { api } from "@/lib/api";

export const adminApi = {
  // Stats
  getStats: async (period?: string) => {
    const params = period ? { period } : {};
    const res = await api.get("/admin/stats", { params });
    return res.data;
  },

  // Users
  getUsers: async (params?: any) => {
    const res = await api.get("/admin/users", { params });
    return res.data;
  },
  getUser: async (id: string) => {
    const res = await api.get(`/admin/users/${id}`);
    return res.data;
  },
  updateUser: async (id: string, body: any) => {
    const res = await api.patch(`/admin/users/${id}`, body);
    return res.data;
  },
  deleteUser: async (id: string) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },
  verifyUser: async (id: string) => {
    const res = await api.post(`/admin/users/${id}/verify`);
    return res.data;
  },
  deactivateUser: async (id: string) => {
    const res = await api.post(`/admin/users/${id}/deactivate`);
    return res.data;
  },
  promoteUser: async (id: string, body: any) => {
    const res = await api.post(`/admin/users/${id}/promote`, body);
    return res.data;
  },

  // Events
  getEvents: async (params?: any) => {
    const res = await api.get("/admin/events", { params });
    return res.data;
  },
  getEvent: async (id: string) => {
    const res = await api.get(`/admin/events/${id}`);
    return res.data;
  },
  publishEvent: async (id: string) => {
    const res = await api.post(`/admin/events/${id}/publish`);
    return res.data;
  },
  unpublishEvent: async (id: string) => {
    const res = await api.post(`/admin/events/${id}/unpublish`);
    return res.data;
  },
  featureEvent: async (id: string) => {
    const res = await api.post(`/admin/events/${id}/feature`);
    return res.data;
  },
  deleteEvent: async (id: string) => {
    const res = await api.delete(`/admin/events/${id}`);
    return res.data;
  },

  // Orders
  getOrders: async (params?: any) => {
    const res = await api.get("/admin/orders", { params });
    return res.data;
  },
  getOrder: async (id: string) => {
    const res = await api.get(`/admin/orders/${id}`);
    return res.data;
  },
  refundOrder: async (id: string, body: any) => {
    const res = await api.post(`/admin/orders/${id}/refund`, body);
    return res.data;
  },

  // Payouts
  getPayouts: async (params?: any) => {
    const res = await api.get("/admin/payouts", { params });
    return res.data;
  },
  approvePayout: async (ref: string) => {
    const res = await api.post(`/admin/payouts/${ref}/approve`);
    return res.data;
  },
  rejectPayout: async (ref: string, body: any) => {
    const res = await api.post(`/admin/payouts/${ref}/reject`, body);
    return res.data;
  },

  // Transactions
  getTransactions: async (params?: any) => {
    const res = await api.get("/admin/transactions", { params });
    return res.data;
  },

  // Platform settings
  getSettings: async () => {
    const res = await api.get("/admin/settings");
    return res.data;
  },
  updateSettings: async (body: any) => {
    const res = await api.patch("/admin/settings", body);
    return res.data;
  },

  // Audit log
  getAuditLog: async (params?: any) => {
    const res = await api.get("/admin/audit-log", { params });
    return res.data;
  },

  // Broadcasts
  sendBroadcast: async (body: any) => {
    const res = await api.post("/admin/broadcast", body);
    return res.data;
  },
};
