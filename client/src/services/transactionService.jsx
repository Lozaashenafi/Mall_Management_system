import api from "../util/axios";

// ✅ Get all bank transactions
export const getBankTransactions = async () => {
  try {
    const res = await api.get("/bank-transaction");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch bank transactions:", error);
    throw (
      error.response?.data || { message: "Failed to load bank transactions" }
    );
  }
};

// ✅ Get a single bank transaction by ID
export const getBankTransactionById = async (id) => {
  try {
    const res = await api.get(`/bank-transaction/${id}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch bank transaction:", error);
    throw (
      error.response?.data || { message: "Failed to load bank transaction" }
    );
  }
};

// ✅ Create a new bank transaction
export const createBankTransaction = async (data) => {
  try {
    const res = await api.post("/bank-transaction", data);
    return res.data;
  } catch (error) {
    console.error("Failed to create bank transaction:", error);
    throw (
      error.response?.data || { message: "Failed to create bank transaction" }
    );
  }
};
export const transferBetweenAccounts = async (data) => {
  try {
    const res = await api.post("/bank-transaction/transfer", data);
    return res.data;
  } catch (error) {
    console.error("Failed to transfer between accounts:", error);
    throw (
      error.response?.data || { message: "Failed to transfer between accounts" }
    );
  }
};
