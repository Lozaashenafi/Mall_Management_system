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
export const DownloadUtilityInvoice = async (invoiceId) => {
  try {
    const res = await api.get(`/utilities/invoice/${invoiceId}/pdf`, {
      responseType: "blob", // ensure Axios returns a Blob
    });
    return res.data; // return the PDF blob
  } catch (error) {
    console.error("Error downloading utility invoice:", error);
    throw (
      error.response?.data || { message: "Failed to create utility invoice" }
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
export const payAllUtilityInvoices = async (tenantId, rentId) => {
  const res = await api.post(`/utility/pay-all`, {
    tenantId,
    rentId,
  });
  return res.data;
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
export const InvoiceForTenant = async (userId) => {
  try {
    const res = await api.get(`/utilities/userinvoice/${userId}`);
    return res.data; // ✅ Return the actual data
  } catch (error) {
    console.error("Failed to fetch utility invoices:", error);
    throw error.response?.data || { message: "Failed to fetch invoice" };
  }
};

export const UtilityInvoiceforTenant = async (userId) => {
  // Make sure userId is defined as parameter
  try {
    const res = await api.get(`/utilities/userutilityinvoice/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch utility invoices:", error);
    throw error.response?.data || { message: "Failed to fetch invoice" };
  }
};

export const getPayedUtilityInvoices = async () => {
  try {
    const res = await api.get(`/utilities/payment`);
    console.log("Payed utility invoices response:", res);
    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch payed utility invoices",
      }
    );
  }
};
