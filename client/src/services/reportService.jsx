import api from "../util/axios";

export const getReportsData = async () => {
  try {
    const res = await api.get("/report/summary");
    console.log(res.data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to get data" };
  }
};
