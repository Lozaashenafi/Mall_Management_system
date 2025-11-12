import api from "../util/axios";

export const getPriceofCare = async () => {
  try {
    const res = await api.get("/rooms/price");
    console.log("Fetched :", res.data.data);
    return res.data.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message:
          "Failed to fetch floor price " || console.log("Fetched :", res.data),
      }
    );
  }
};

export const addOrUpdatePriceofCare = async (formData) => {
  try {
    console.log("FormData being sent:", formData);
    const res = await api.post("/rooms/price", formData);
    console.log("Response from server:", res.data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to add floor price " };
  }
};
