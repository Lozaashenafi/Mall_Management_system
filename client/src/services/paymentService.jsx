import api from "../util/axios";

export const createPayment = async (paymentData) => {
  try {
    const res = await api.post("/payments", paymentData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create payment" };
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

export const getPayments = async () => {
  try {
    const res = await api.get("/payments");
    console.log(res.data.payments);
    return res.data.payments;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch payments" };
  }
};

export const updatePayment = async (paymentId, paymentData) => {
  try {
    const res = await api.put(`/payments/${paymentId}`, paymentData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update payment" };
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
