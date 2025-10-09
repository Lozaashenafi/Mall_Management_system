import api from "../util/axios";

// ---- Feature Type APIs ----
export const getFeatureTypes = async () => {
  const res = await api.get("/roomfeature/type");
  return res.data;
};

export const createFeatureType = async (data) => {
  const res = await api.post("/roomfeature/type", data);
  return res.data;
};

export const updateFeatureType = async (id, data) => {
  const res = await api.put(`/roomfeature/type/${id}`, data);
  return res.data;
};

export const deleteFeatureType = async (id) => {
  const res = await api.delete(`/roomfeature/type/${id}`);
  return res.data;
};

// ---- Room Feature APIs ----
export const getRoomFeatures = async () => {
  const res = await api.get("/roomfeature");
  return res.data;
};

export const createRoomFeature = async (data) => {
  const res = await api.post("/roomfeature", data);
  return res.data;
};

export const updateRoomFeature = async (id, data) => {
  const res = await api.put(`/roomfeature/${id}`, data);
  return res.data;
};

export const deleteRoomFeature = async (id) => {
  const res = await api.delete(`/roomfeature/${id}`);
  return res.data;
};
