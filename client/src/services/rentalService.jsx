import api from "../util/axios";

export const createRental = async (rentalData) => {
  try {
    const res = await api.post("/rentals", rentalData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create rental" };
  }
};
export const getRentals = async (filters) => {
  try {
    const res = await api.get("/rentals", { params: filters });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch rentals" };
  }
};
export const getRentalById = async (rentalId) => {
  try {
    const res = await api.get(`/rentals/${rentalId}`);
    // console.log(res.data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch rental" };
  }
};

export const updateRental = async (rentalId, data) => {
  try {
    const res = await api.put(`/rentals/${rentalId}`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update rental" };
  }
};

export const deleteRental = async (rentalId) => {
  try {
    const res = await api.delete(`/rentals/${rentalId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete rental" };
  }
};

export const terminateRental = async (rentalId) => {
  try {
    const res = await api.post(`/rentals/${rentalId}/terminate`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to terminate rental" };
  }
};

export const renewRental = async (rentalId, data) => {
  try {
    const res = await api.post(`/rentals/${rentalId}/renew`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to renew rental" };
  }
};
