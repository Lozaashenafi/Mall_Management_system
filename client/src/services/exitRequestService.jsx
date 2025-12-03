import api from "../util/axios";

// Create exit request
export const createExitRequest = async (exitRequestData) => {
  try {
    const res = await api.post("/exit", exitRequestData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create exit request" };
  }
};

// Get tenant's exit requests
export const getMyExitRequests = async (userId) => {
  try {
    const res = await api.get(`/exit/tenant/${userId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch exit requests" };
  }
};

// Get single exit request by ID
export const getExitRequestById = async (requestId) => {
  try {
    const res = await api.get(`/exit/${requestId}`);
    console.log(res);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch exit request" };
  }
};

// Get active rentals for tenant
export const getMyActiveRentals = async () => {
  try {
    const res = await api.get("/rentals/my-active");
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch rentals" };
  }
};

// Cancel exit request
export const cancelExitRequest = async (requestId) => {
  try {
    const res = await api.put(`/exit/${requestId}/cancel`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to cancel exit request" };
  }
};
