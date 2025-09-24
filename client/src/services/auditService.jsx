import api from "../util/axios";

export const getAuditLogs = async () => {
  try {
    const res = await api.get("/audit");
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch audit logs" };
  }
};
export const getRecentAuditLogs = async () => {
  try {
    const res = await api.get("/audit/recent");
    return res.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch recent audit logs" }
    );
  }
};
