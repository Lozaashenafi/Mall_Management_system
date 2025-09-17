import api from "../util/axios";

// Login request
export const loginRequest = async (email, password) => {
  try {
    const res = await api.post("/auth/login", { email, password });
    print(res.data);
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
