import api from "../util/axios";

// ✅ Fetch Dashboard Summary
export const getDashboardData = async () => {
  try {
    const res = await api.get("/dashboard"); // your backend route
    return res.data;
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    throw error.response?.data || { message: "Failed to load dashboard data" };
  }
};
export const getTenantDashboard = async (userId) => {
  try {
    const res = await api.get(`/dashboard/${userId}`); // your backend route
    return res.data;
  } catch (error) {
    console.error("Failed to fetch tenant dashboard data:", error);
    throw (
      error.response?.data || {
        message: "Failed to load tenant dashboard data",
      }
    );
  }
};
