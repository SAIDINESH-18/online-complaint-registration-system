import axios from "axios";

// Create reusable Axios instance
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("complaint_system_token");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch authorization and network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401 || status === 403) {
        // Clear token on authorization failure to force re-login if needed
        const token = localStorage.getItem("complaint_system_token");
        if (token) {
          localStorage.removeItem("complaint_system_token");
          localStorage.removeItem("complaint_system_user");
          // Optionally trigger page reload or let context handle it
          window.dispatchEvent(new Event("auth-logout"));
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data: any) => api.put("/auth/profile", data),
};

export const complaintAPI = {
  create: (data: any) => api.post("/complaints", data),
  getAll: (params?: any) => api.get("/complaints", { params }),
  getById: (id: string) => api.get(`/complaints/${id}`),
  update: (id: string, data: any) => api.put(`/complaints/${id}`, data),
  delete: (id: string) => api.delete(`/complaints/${id}`),
  updateStatus: (id: string, data: { status: string; resolutionNotes?: string }) =>
    api.put(`/complaints/${id}/status`, data),
};

export const adminAPI = {
  assignAgent: (data: { complaintId: string; agentId: string }) =>
    api.put("/admin/assign-agent", data),
  getDashboardStats: () => api.get("/admin/dashboard"),
  getUsers: () => api.get("/admin/users"),
  updateUserRole: (id: string, role: string) =>
    api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getAgents: () => api.get("/admin/agents"),
};

export const feedbackAPI = {
  submit: (data: { complaintId: string; rating: number; comments: string }) =>
    api.post("/feedback", data),
  getAll: () => api.get("/feedback"),
};

export default api;
