// src/services/overdueService.js - UPDATED
import api from "../util/axios";

export const runOverdueCacheUpdate = async () => {
  try {
    const res = await api.post("/overdue/cache-update");
    return res.data;
  } catch (error) {
    console.error(
      "Error in runOverdueCacheUpdate:",
      error.response?.data || error.message
    );
    throw error.response?.data || { message: "Failed to update overdue cache" };
  }
};

export const getOverdueTenants = async () => {
  try {
    const res = await api.get("/overdue/tenants");
    console.log("Overdue tenants API response:", res.data);
    return res.data.data || res.data;
  } catch (error) {
    console.error(
      "Error in getOverdueTenants:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || { message: "Failed to fetch overdue tenants" }
    );
  }
};

export const getMostOverdueTenants = async () => {
  try {
    const res = await api.get("/overdue/tenants/most-overdue");
    return res.data.data || res.data;
  } catch (error) {
    console.error(
      "Error in getMostOverdueTenants:",
      error.response?.data || error.message
    );
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
    return res.data.data || res.data;
  } catch (error) {
    console.error(
      "Error in getFrequentOverdueTenants:",
      error.response?.data || error.message
    );
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
    console.log("Stats API response:", res.data);
    return res.data.data || res.data;
  } catch (error) {
    console.error(
      "Error in getOverdueStats:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || { message: "Failed to fetch overdue statistics" }
    );
  }
};

export const getOverdueInvoices = async () => {
  try {
    const res = await api.get("/overdue/invoices");
    return res.data.data || res.data;
  } catch (error) {
    console.error(
      "Error in getOverdueInvoices:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || { message: "Failed to fetch overdue invoices" }
    );
  }
};
