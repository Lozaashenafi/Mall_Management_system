import api from "../util/axios";

export const terminateRequest = async (data) => {
  try {
    const res = await api.post(`/terminate`, data);
    console.log("Response from server:", res);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Account termination failed" };
  }
};

export const fetchTerminateRequestsByUser = async (userId) => {
  try {
    const res = await api.get(`/terminate/${userId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch tenant rentals" };
  }
};

export const deleteTerminateRequest = async (requestId) => {
  try {
    const res = await api.delete(`/terminate/${requestId}`);
    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to delete termination request",
      }
    );
  }
};

export const editTerminateRequest = async (requestId, data) => {
  try {
    const res = await api.put(`/terminate/${requestId}`, data);
    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to edit termination request",
      }
    );
  }
};

export const fetchTerminateRequests = async () => {
  try {
    const res = await api.get(`/terminate`);
    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch termination requests",
      }
    );
  }
};

export const adminUpdateTerminateRequestStatus = async (requestId, data) => {
  try {
    const res = await api.put(`/terminate/admin/${requestId}`, data);
    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to update termination request status",
      }
    );
  }
};
