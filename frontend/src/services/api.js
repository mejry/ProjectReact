// api.js

import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// Export individual services
export const authService = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response;
  },
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response;
  },
  updatePassword: async (passwordData) => {
    const response = await api.post("/auth/update-password", passwordData);
    return response;
  },
};

export const employeeService = {
  getAll: async (params) => {
    const response = await api.get("/employees", { params });
    return response;
  },
  getById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response;
  },
  create: async (employeeData) => {
    const response = await api.post("/users", employeeData);
    return response;
  },
  update: async (id, employeeData) => {
    const response = await api.put(`/users/${id}`, employeeData);
    return response;
  },
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response;
  },
};

export const leaveService = {
  getAll: async (params) => {
    const response = await api.get("/leaves", { params });
    return response;
  },
  getMyLeaves: async () => {
    const response = await api.get("/leaves/my-leaves");
    return response;
  },
  create: async (leaveData) => {
    const response = await api.post("/leaves", leaveData);
    return response;
  },
  updateStatus: async (id, status) => {
    console.log(id, status);
    const response = await api.put(`/leaves/${id}/status`, { status });

    return response;
  },
  delete: async (id) => {
    const response = await api.delete(`/leaves/${id}`);
    return response;
  },
};

export const timesheetService = {
  getWeek: async (startDate) => {
    try {
      // Format date to ISO string
      const formattedDate =
        startDate instanceof Date ? startDate.toISOString() : startDate;
      const response = await api.get("/timesheet", {
        params: { date: formattedDate },
      });
      return response;
    } catch (error) {
      console.error("getWeek error:", error);
      throw error;
    }
  },

  submit: async (entries) => {
    try {
      let entry = entries.entries;
      console.log("entries", entry);
      // Use bulk update endpoint for multiple entries
      const response = await api.put("/timesheet/bulk", { entry });
      return response;
    } catch (error) {
      console.error("submit error:", error);
      throw error;
    }
  },

  submitSingle: async (entryData) => {
    try {
      const response = await api.post("/timesheet", entryData);
      return response;
    } catch (error) {
      console.error("submitSingle error:", error);
      throw error;
    }
  },

  updateEntry: async (id, entryData) => {
    try {
      const response = await api.put(`/timesheet/${id}`, entryData);
      return response;
    } catch (error) {
      console.error("updateEntry error:", error);
      throw error;
    }
  },

  deleteEntry: async (id) => {
    try {
      const response = await api.delete(`/timesheet/${id}`);
      return response;
    } catch (error) {
      console.error("deleteEntry error:", error);
      throw error;
    }
  },

  getAllTimesheets: async (params) => {
    try {
      const response = await api.get("/timesheet/all", { params });
      return response;
    } catch (error) {
      console.error("getAllTimesheets error:", error);
      throw error;
    }
  },

  getTimesheetSummary: async (startDate, endDate) => {
    try {
      const response = await api.get("/timesheet/summary", {
        params: {
          startDate:
            startDate instanceof Date ? startDate.toISOString() : startDate,
          endDate: endDate instanceof Date ? endDate.toISOString() : endDate,
        },
      });
      return response;
    } catch (error) {
      console.error("getTimesheetSummary error:", error);
      throw error;
    }
  },
};

export const performanceService = {
  getMyEvaluations: async () => {
    const response = await api.get("/performance/my-evaluations");
    return response;
  },
  create: async (evaluationData) => {
    const response = await api.post("/performance", evaluationData);
    return response;
  },
  update: async (id, evaluationData) => {
    const response = await api.put(`/performance/${id}`, evaluationData);
    return response;
  },
  delete: async (id) => {
    const response = await api.delete(`/performance/${id}`);
    return response;
  },
};
