import api from "../util/axios";

export const getSummaryUtilityCharges = async (month) => {
  try {
    const res = await api.get(`/utilities/summary?month=${month}`);
    console.log("Utility charges response:", res);
    return res.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch utility charges" }
    );
  }
};

export const generateUtilityCharge = async (month) => {
  try {
    const res = await api.post(`/utilities/generate`, { month });
    console.log("Generate utility charge response:", res);
    const data = res.data;
    return data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to generate utility charges" }
    );
  }
};

export const getTenantsInvoicesOfMonth = async (month) => {
  try {
    const res = await api.get(`/utilities/invoice?month=${month}`);
    console.log("Tenants invoices response:", res);
    return res.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch tenants' invoices" }
    );
  }
};

export const getUtilityCharges = async (month) => {
  try {
    const res = await api.get(`/utilities/generate?month=${month}`);
    console.log("Utility charges response:", res);
    return res.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch utility charges" }
    );
  }
};

export const getUtilityChargesByMonth = async (month) => {
  try {
    const res = await api.get(`/utilities/charges?month=${month}`);
    console.log("Utility charges by month response:", res);
    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch utility charges by month",
      }
    );
  }
};

export const getUtilityInvoiceById = async (id) => {
  try {
    const res = await api.get(`/utilities/invoice/${id}`);
    console.log("Utility invoice by ID response:", res);
    return res.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch utility invoice" }
    );
  }
};
