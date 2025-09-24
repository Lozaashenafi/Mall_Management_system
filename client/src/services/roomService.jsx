import api from "../util/axios";

// ✅ Get all rooms
export const getRooms = async () => {
  try {
    const res = await api.get("/rooms");
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch rooms" };
  }
};

// ✅ Get single room by ID
export const getRoomById = async (id) => {
  try {
    const res = await api.get(`/rooms/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch room" };
  }
};

export const getRoomTypes = async () => {
  try {
    const res = await api.get("/rooms/types");
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch room types" };
  }
};

export const addRoom = async (formData) => {
  try {
    console.log("FormData being sent:", formData);
    const res = await api.post("/rooms", formData);
    console.log("Response from server:", res.data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to add room" };
  }
};

// ✅ Update room
export const updateRoom = async (id, roomData) => {
  try {
    const res = await api.put(`/rooms/${id}`, roomData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update room" };
  }
};

// ✅ Delete room
export const deleteRoom = async (id) => {
  try {
    const res = await api.delete(`/rooms/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete room" };
  }
};
