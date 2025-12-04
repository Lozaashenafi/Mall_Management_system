// services/securityExitRequestService.js
import api from "../util/axios";

// Get approved exit requests for security verification
export const getApprovedExitRequests = async (page = 1, limit = 20) => {
  try {
    const res = await api.get(`/exit/security/approved`, {
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch approved exit requests",
      }
    );
  }
};

// Verify/Block exit request
export const verifyExitRequest = async (requestId, verificationData) => {
  try {
    const res = await api.patch(`/exit/${requestId}/verify`, verificationData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to verify exit request" };
  }
};

// Get exit request by tracking number
export const getExitRequestByTracking = async (trackingNumber) => {
  try {
    const res = await api.get(`/exit/tracking/${trackingNumber}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch exit request" };
  }
};
