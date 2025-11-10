import api from "../util/axios";

export const createExpense = async (expenseData) => {
  try {
    const res = await api.post("/expenses", expenseData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create expense" };
  }
};
export const getUtilityTypes = async () => {
  try {
    const res = await api.get("/expenses/type");
    console.log(res.data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch utility type " };
  }
};

export const getExpenses = async () => {
  try {
    const res = await api.get("/expenses");
    console.log(res.data.expenses);
    return res.data.expenses;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch expenses" };
  }
};

export const updateExpense = async (expenseId, expenseData) => {
  try {
    const res = await api.put(`/expenses/${expenseId}`, expenseData);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update expense" };
  }
};

export const deleteExpense = async (expenseId) => {
  try {
    await api.delete(`/expenses/${expenseId}`);
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete expense" };
  }
};
