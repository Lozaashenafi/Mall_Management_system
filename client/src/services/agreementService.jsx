// agreementService.js (or add in rentalService.js)
import api from "../util/axios";

export const generateAgreement = async (rentId) => {
  try {
    const res = await api.get(`/agreements/${rentId}/generate`, {
      responseType: "blob",
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to generate agreement" };
  }
};
