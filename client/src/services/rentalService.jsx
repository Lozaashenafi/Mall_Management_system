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
