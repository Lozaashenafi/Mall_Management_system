// src/services/overdueService.js
import api from "../util/axios";

export const runOverdueCacheUpdate = async () => {
  try {
    const res = await api.post("/overdue/cache-update");
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update overdue cache" };
  }
};

export const getOverdueTenants = async () => {
  try {
    const res = await api.get("/overdue/tenants");
    return res.data.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch overdue tenants" }
    );
  }
};

export const getMostOverdueTenants = async () => {
  try {
    const res = await api.get("/overdue/tenants/most-overdue");
    return res.data.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch most overdue tenants",
      }
    );
  }
};

export const getFrequentOverdueTenants = async () => {
  try {
    const res = await api.get("/overdue/tenants/frequent");
    return res.data.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch frequent overdue tenants",
      }
    );
  }
};

export const getOverdueStats = async () => {
  try {
    const res = await api.get("/overdue/stats");
    return res.data.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch overdue statistics" }
    );
  }
};

export const getOverdueInvoices = async () => {
  try {
    const res = await api.get("/overdue/invoices");
    return res.data.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch overdue invoices" }
    );
  }
};
