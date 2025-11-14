import api from "../util/axios";

// ✅ Create Deposit or Withdrawal
export const createBankTransaction = async (data) => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) formData.append(key, value);
    });

    const res = await api.post("/bank-transaction", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.transaction;
  } catch (error) {
    console.error("Failed to create bank transaction:", error);
    throw (
      error.response?.data || { message: "Failed to create bank transaction" }
    );
  }
};

// ✅ Transfer Between Accounts
export const transferBetweenAccounts = async (data) => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) formData.append(key, value);
    });

    const res = await api.post("/bank-transaction/transfer", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.transfer;
  } catch (error) {
    console.error("Failed to transfer between accounts:", error);
    throw (
      error.response?.data || { message: "Failed to transfer between accounts" }
    );
  }
};

// ✅ Get all bank transactions
export const getBankTransactions = async () => {
  try {
    const res = await api.get("/bank-transaction");
    console.log("Fetched bank transactions:", res.data);
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
