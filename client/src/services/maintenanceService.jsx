import api from "../util/axios";

export const createMaintenance = async (recordData) => {
  try {
    const res = await api.post("/maintenance", recordData);
    return res.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to create maintenance record" }
    );
  }
};

export const updateMaintenance = async (maintenanceId, recordData) => {
  const allowedFields = [
    "roomId",
    "description",
    "cost",
    "maintenanceStartDate",
    "maintenanceEndDate",
    "status",
    "recordedBy",
  ];

  const payload = Object.fromEntries(
    Object.entries(recordData).filter(([key]) => allowedFields.includes(key))
  );

  try {
    const res = await api.put(`/maintenance/${maintenanceId}`, payload);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update maintenance" };
  }
};

export const getRequests = async () => {
  try {
    const res = await api.get("/maintenance/request");
    return res.data.requests;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch requests" };
  }
};

export const updateRequestStatus = async (requestId, status) => {
  try {
    const res = await api.put(`/maintenance/requests/${requestId}`, {
      status,
    });
    console.log(res.data);
    return res.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to update request status" }
    );
  }
};

export const getMaintenances = async () => {
  try {
    const res = await api.get("/maintenance");
    return res.data.maintenances;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch maintenances" };
  }
};
export const deleteMaintenance = async (maintenanceId) => {
  try {
    const res = await api.delete(`/maintenance/${maintenanceId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete maintenance" };
  }
};

// tenant side
export const createMaintenanceRequest = async (requestData) => {
  try {
    console.log("Creating maintenance request with data:", requestData);
    const res = await api.post("/maintenance/request", requestData);
    console.log("Maintenance request created:", res.data);
    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to create maintenance request",
      }
    );
  }
};

export const getTenantRequests = async (tenantId) => {
  try {
    const res = await api.get(`/maintenance/requests/${tenantId}`);
    console.log("Fetched tenant requests:", res.data);
    return res.data.requests;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch requests" };
  }
};
export const deleteRequest = async (requestId) => {
  try {
    const res = await api.delete(`/maintenance/requests/${requestId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete request" };
  }
};
