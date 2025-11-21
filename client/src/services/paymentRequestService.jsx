import api from "../util/axios";

export const createPaymentRequest = async (formData) => {
  try {
    const response = await api.post("/payments/request", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.paymentRequest;
  } catch (error) {
    console.error("Error creating payment request:", error);
    throw error.response?.data || error;
  }
};

export const createUtilityPaymentRequest = async (formData) => {
  try {
    const response = await api.post("/payments/utility/request", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.paymentRequest;
  } catch (error) {
    console.error("Error creating utility payment request:", error);
    throw error.response?.data || error;
  }
};

// ✅ Get Invoice by ID
export const getInvoiceById = async (id) => {
  try {
    const res = await api.get(`/invoice/${id}`);
    return res.data.invoice;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch invoice" };
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

export const getPaymentRequests = async () => {
  try {
    const res = await api.get(`/payments/request`);
    console.log(res);
    return res.data.requests || res.data || [];
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch payment request" }
    );
  }
};

export const updatePaymentRequestStatus = async (id, formData) => {
  try {
    const res = await api.put(`/payments/request/${id}`, formData);
    return res.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch payment request" }
    );
  }
};

export const updateUtilityPaymentRequestStatus = async (id, formData) => {
  try {
    const res = await api.put(`/payments/utility/request/${id}`, formData);
    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch utility payment request",
      }
    );
  }
};
