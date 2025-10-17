import api from "../util/axios";

export const terminateRequest = async (data) => {
  try {
    const res = await api.post(`/terminate/`, data);
    console.log("Response from server:", res.data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Account termination failed" };
  }
};

export const getAllTerminations = async () => {
  try {
    const res = await api.get("/terminate/");
    return res.data.terminations;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch terminations" };
  }
};

export const getTenantRentals = async (rentalId) => {
  try {
    const res = await api.get(`/terminate/${rentalId}`);
    return res.data.rentals;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch tenant rentals" };
  }
};
