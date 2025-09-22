import api from "../util/axios";

// Login request
export const loginRequest = async (email, password) => {
  try {
    const res = await api.post("/auth/login", { email, password });
    // print(res.data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

export const registerRequest = async (userData) => {
  try {
    const res = await api.post("/auth/register", userData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Registration failed" };
  }
};
export const allUsers = async () => {
  try {
    const res = await api.get("/auth/all-users");
    return res.data.users;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch users" };
  }
};

export const editProfileRequest = async (formData) => {
  try {
    const res = await api.put("/auth/edit-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Profile update failed" };
  }
};
export const changePasswordRequest = async (data) => {
  try {
    const res = await api.put("/auth/change-password", data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to change password" };
  }
};
