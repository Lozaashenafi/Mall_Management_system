import api from "../util/axios";

export const DownloadInvoice = async (invoiceId) => {
  try {
    const res = await api.get(`/invoice/${invoiceId}/pdf`, {
      responseType: "blob", // important!
    });
    return res.data; // <- correct
  } catch (error) {
    throw error.response?.data || { message: "Failed to create invoice" };
  }
};

export const createPayment = async (paymentData) => {
  try {
    const res = await api.post("/payments", paymentData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create payment" };
  }
};

export const updatePayment = async (id, data) => {
  try {
    const res = await api.put(`/payments/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("Update Payment Response:", res.data);
    return res.data; // backend returns { success, payment }
  } catch (error) {
    throw error.response?.data || { message: "Failed to update payment" };
  }
};

export const createInvoice = async (invoiceData) => {
  try {
    const res = await api.post("/invoice", invoiceData);
    console.log(res.data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create invoice" };
  }
};

export const deleteInvoice = async (invoiceId) => {
  try {
    await api.delete(`/invoice/${invoiceId}`);
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete invoice" };
  }
};

export const getPayments = async () => {
  try {
    const res = await api.get("/payments");
    console.log(res.data.payments);
    return res.data.payments;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch payments" };
  }
};

export const deletePayment = async (paymentId) => {
  try {
    await api.delete(`/payments/${paymentId}`);
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete payment" };
  }
};

export const getInvoices = async () => {
  try {
    const res = await api.get("/invoice");
    console.log(res.data.invoices);
    return res.data.invoices;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch invoices" };
  }
};

export const getInvoiceById = async (invoiceId) => {
  try {
    const res = await api.get(`/invoice/${invoiceId}`);
    return res.data.invoice;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch invoice" };
  }
};

export const updateInvoice = async (invoiceId, invoiceData) => {
  try {
    const res = await api.put(`/invoice/${invoiceId}`, invoiceData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update invoice" };
  }
};
