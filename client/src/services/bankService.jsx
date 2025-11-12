import api from "../util/axios";

// ✅ Get all bank accounts
export const getBankAccounts = async () => {
  try {
    const res = await api.get("/bank");
    console.log(res.data.accounts);
    return res.data.accounts;
  } catch (error) {
    console.error("Failed to fetch bank accounts:", error);
    throw error.response?.data || { message: "Failed to load bank accounts" };
  }
};

// ✅ Get a single bank account by ID
export const getBankAccountById = async (id) => {
  try {
    const res = await api.get(`/bank/${id}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch bank account:", error);
    throw error.response?.data || { message: "Failed to load bank account" };
  }
};

// ✅ Create a new bank account
export const createBankAccount = async (data) => {
  try {
    const res = await api.post("/bank", data);
    return res.data;
  } catch (error) {
    console.error("Failed to create bank account:", error);
    throw error.response?.data || { message: "Failed to create bank account" };
  }
};

// ✅ Update an existing bank account
export const updateBankAccount = async (id, data) => {
  try {
    const res = await api.put(`/bank/${id}`, data);
    console.log(res);
    return res.data;
  } catch (error) {
    console.error("Failed to update bank account:", error);
    throw error.response?.data || { message: "Failed to update bank account" };
  }
};

// ✅ Deactivate or delete a bank account
export const deactivateBankAccount = async (id) => {
  try {
    const res = await api.delete(`/bank/${id}`);
    return res.data;
  } catch (error) {
    console.error("Failed to delete bank account:", error);
    throw error.response?.data || { message: "Failed to delete bank account" };
  }
};
