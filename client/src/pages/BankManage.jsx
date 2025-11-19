import { useState, useEffect } from "react";
import {
  PlusCircle,
  Trash2,
  Pencil,
  Banknote,
  Landmark,
  ListPlus,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deactivateBankAccount,
} from "../services/bankService";
import {
  getBankTransactions,
  createBankTransaction,
  transferBetweenAccounts,
} from "../services/transactionService";
import { BASE_URL } from "../config";

// Helper to format currency
const formatCurrency = (amount, currency = "ETB") => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
};

export default function BankManage() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("accounts");
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferData, setTransferData] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: 0,
    description: "",
    receiptImage: null,
  });
  const [newTransaction, setNewTransaction] = useState({
    bankAccountId: "",
    type: "Deposit",
    amount: 0,
    description: "",
    name: "",
    account: "",
    receiptImage: null,
    transactionDate: new Date().toISOString().split("T")[0],
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [newAccount, setNewAccount] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
    balance: 0,
    currency: "ETB",
  });
  const closeTransactionDetail = () => setSelectedTransaction(null);

  const handleTransferChange = (e) => {
    const { name, value } = e.target;
    setTransferData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTransferBetweenAccounts = async (e) => {
    e.preventDefault();
    try {
      const result = await transferBetweenAccounts(transferData);
      setTransactions((prev) => [result, ...prev]);
      toast.success("Transfer successful!");
      setShowTransferForm(false);
      setTransferData({
        fromAccountId: "",
        toAccountId: "",
        amount: 0,
        description: "",
        receiptImage: null,
      });
    } catch (err) {
      toast.error(err.message || "Transfer failed");
    }
  };
  const TransactionDetailPopup = ({ tx }) => {
    if (!tx) return null;

    const account = getAccountInfo(tx.bankAccountId);

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-2xl shadow-lg border dark:border-gray-700 max-h-[70vh] flex flex-col">
          {/* Header - Fixed */}
          <div className="flex justify-between items-center mb-6 flex-shrink-0">
            <h2 className="text-xl font-bold">Transaction Details</h2>
            <button
              className="text-gray-500 hover:text-red-500 text-lg"
              onClick={closeTransactionDetail}
            >
              ✕
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Transaction Info */}
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Transaction Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Type
                      </p>
                      <p className="font-medium">{tx.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Amount
                      </p>
                      <p className="font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(tx.amount, account?.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Date
                      </p>
                      <p className="font-medium">
                        {new Date(tx.transactionDate).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Description
                      </p>
                      <p className="font-medium">{tx.description || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* From Account */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    From Account
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Account Name
                      </p>
                      <p className="font-medium">
                        {account?.accountName || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Account Number
                      </p>
                      <p className="font-medium">
                        {account?.accountNumber || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Bank
                      </p>
                      <p className="font-medium">{account?.bankName || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Right Column - Receiver Info & Receipt */}
              <div className="space-y-4">
                {/* Receiver Information */}
                {(tx.name || tx.account) && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Receiver Information
                    </h3>
                    <div className="space-y-3">
                      {tx.name && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Receiver Name
                          </p>
                          <p className="font-medium">{tx.Name}</p>
                        </div>
                      )}
                      {tx.account && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Receiver Account
                          </p>
                          <p className="font-medium">{tx.account}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Receipt Image */}
                {tx.receiptImage && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Receipt
                    </h3>
                    <div>
                      <img
                        src={`${BASE_URL}${tx.receiptImage}`}
                        alt="Receipt"
                        className="w-full h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex-shrink-0 mt-6">
            <button
              onClick={closeTransactionDetail}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  const resetAccountForm = () => {
    setNewAccount({
      accountName: "",
      accountNumber: "",
      bankName: "",
      balance: 0,
      currency: "ETB",
    });
    setEditingAccount(null);
    setShowAddAccount(false);
  };

  const resetTransactionForm = () => {
    setNewTransaction({
      bankAccountId: "",
      type: "Deposit",
      amount: 0,
      description: "",
      transactionDate: new Date().toISOString().split("T")[0],
    });
    setEditingTransaction(null);
    setShowAddTransaction(false);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const accsData = await getBankAccounts();
      setAccounts(accsData || []);
      const transData = await getBankTransactions();
      setTransactions(transData.transactions || []);
    } catch (err) {
      toast.error(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    if (editingAccount) {
      setEditingAccount((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewAccount((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTransactionChange = (e) => {
    const { name, value } = e.target;
    const updateValue = name === "amount" ? parseFloat(value) : value;
    setNewTransaction((prev) => ({ ...prev, [name]: updateValue }));
    if (editingTransaction)
      setEditingTransaction((prev) => ({ ...prev, [name]: updateValue }));
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    try {
      const created = await createBankAccount(newAccount);
      setAccounts((prev) => [created, ...prev]);
      resetAccountForm();
      toast.success("Bank account created!");
    } catch (err) {
      toast.error(err.message || "Failed to create account");
    }
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    try {
      const { accountName, accountNumber, bankName } = editingAccount;

      const updated = await updateBankAccount(editingAccount.bankAccountId, {
        accountName,
        accountNumber,
        bankName,
      });

      setAccounts((prev) =>
        prev.map((a) =>
          a.bankAccountId === updated.bankAccountId ? updated : a
        )
      );
      resetAccountForm();
      toast.success("Account updated!");
    } catch (err) {
      toast.error(err.message || "Failed to update account");
    }
  };

  const handleDeactivateAccount = async (account) => {
    if (account.balance > 0) {
      return toast.error("Cannot deactivate account with non-zero balance");
    }
    try {
      const deactivated = await deactivateBankAccount(account.bankAccountId);
      setAccounts((prev) =>
        prev.map((a) =>
          a.bankAccountId === deactivated.bankAccountId ? deactivated : a
        )
      );
      toast.success("Account deactivated!");
    } catch (err) {
      toast.error(err.message || "Failed to deactivate account");
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      const created = await createBankTransaction(newTransaction);
      setTransactions((prev) => [created, ...prev]);
      resetTransactionForm();
      toast.success("Transaction added!");
    } catch (err) {
      toast.error(err.message || "Failed to create transaction");
    }
  };

  const handleUpdateTransaction = async (e) => {
    e.preventDefault();
    toast.error("Transaction editing is not yet implemented.");
    resetTransactionForm();
  };

  const getAccountInfo = (accountId) =>
    accounts.find((a) => a.bankAccountId === accountId);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
        Loading bank data...
      </div>
    );

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <header className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Financial Management
        </h1>
      </header>

      {/* Tabs */}
      <div className="flex border-b-2 border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab("accounts")}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition duration-200 ${
            activeTab === "accounts"
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
              : "text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
          }`}
        >
          <Landmark className="w-5 h-5" /> Bank Accounts
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition duration-200 ${
            activeTab === "transactions"
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
              : "text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
          }`}
        >
          <Banknote className="w-5 h-5" /> Transactions
        </button>
      </div>

      {/* --- ACCOUNTS SECTION --- */}
      {activeTab === "accounts" && (
        <section className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Accounts Summary
            </h2>
            <button
              onClick={() => setShowAddAccount((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
            >
              <PlusCircle className="w-4 h-4" />
              {showAddAccount ? "Close Form" : "Add Account"}
            </button>
          </div>

          {showAddAccount && (
            <form
              onSubmit={editingAccount ? handleUpdateAccount : handleAddAccount}
              className="mb-6 p-4 bg-white dark:bg-gray-700 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Always show accountName, accountNumber, bankName */}
              {["accountName", "accountNumber", "bankName"].map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-medium mb-1">
                    {field.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={
                      editingAccount ? editingAccount[field] : newAccount[field]
                    }
                    onChange={handleAccountChange}
                    required
                    className="p-2 rounded border text-black bg-gray-50 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>
              ))}

              {/* Show balance only when creating a new account */}
              {!editingAccount && (
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1">Balance</label>
                  <input
                    type="number"
                    name="balance"
                    value={newAccount.balance}
                    onChange={handleAccountChange}
                    className="p-2 rounded text-black border bg-gray-50 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>
              )}

              {/* Show currency only when creating a new account */}
              {!editingAccount && (
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1">Currency</label>
                  <input
                    type="text"
                    name="currency"
                    value={newAccount.currency}
                    onChange={handleAccountChange}
                    required
                    className="p-2 rounded border text-black bg-gray-50 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>
              )}

              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={resetAccountForm}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                >
                  {editingAccount ? "Save Changes" : "Add Account"}
                </button>
              </div>
            </form>
          )}

          {/* Accounts Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">
                  <th className="p-4 font-semibold">Name</th>
                  <th className="p-4 font-semibold">Number</th>
                  <th className="p-4 font-semibold text-right">Bank</th>
                  <th className="p-4 font-semibold text-right">Balance</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {accounts.length > 0 ? (
                  accounts.map((a) => (
                    <tr key={a.bankAccountId}>
                      <td className="p-4 font-medium">{a.accountName}</td>
                      <td className="p-4">{a.accountNumber}</td>
                      <td className="p-4">
                        <span className="font-semibold">{a.bankName}</span>
                      </td>
                      <td className="p-4 font-bold text-right text-green-600 dark:text-green-400">
                        {formatCurrency(a.balance, a.currency)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                            a.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                              : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                          }`}
                        >
                          {a.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      {a.isActive ? (
                        <td className="p-4 flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              setEditingAccount(a);
                              setShowAddAccount(true);
                            }}
                            className="p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400 transition duration-150"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeactivateAccount(a)}
                            disabled={!a.isActive}
                            className={`p-2 rounded-full ${
                              a.isActive
                                ? "hover:bg-red-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                                : "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      ) : null}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      No bank accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {activeTab === "transactions" && (
        <section className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Transaction History
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddTransaction((prev) => !prev);
                  setShowTransferForm(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-150"
              >
                <PlusCircle className="w-4 h-4" />
                {showAddTransaction ? "Close Form" : "Add Transaction"}
              </button>

              <button
                onClick={() => {
                  setShowTransferForm((prev) => !prev);
                  setShowAddTransaction(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
              >
                <Landmark className="w-4 h-4" />
                {showTransferForm ? "Close Form" : "Self Transfer"}
              </button>
            </div>
          </div>

          {showAddTransaction && (
            <form
              onSubmit={
                editingTransaction
                  ? handleUpdateTransaction
                  : handleAddTransaction
              }
              className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Select Account */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Account</label>
                <select
                  name="bankAccountId"
                  value={newTransaction.bankAccountId}
                  onChange={handleTransactionChange}
                  required
                  className="p-2 rounded border bg-gray-50 text-gray-800 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                >
                  <option value="">Select Account</option>
                  {accounts.map((a) => (
                    <option key={a.bankAccountId} value={a.bankAccountId}>
                      {a.accountName} ({a.accountNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Type</label>
                <select
                  name="type"
                  value={newTransaction.type}
                  onChange={handleTransactionChange}
                  required
                  className="p-2 rounded border bg-gray-50 text-gray-800 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                >
                  <option value="Deposit">Deposit</option>
                  <option value="Withdrawal">Withdrawal</option>
                </select>
              </div>

              {/* Amount */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={newTransaction.amount}
                  onChange={handleTransactionChange}
                  required
                  className="p-2 rounded border bg-gray-50 text-gray-800 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                />
              </div>

              {/* Receipt Image */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">
                  Receipt Image
                </label>
                <input
                  type="file"
                  name="receiptImage"
                  accept="image/*"
                  onChange={(e) =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      receiptImage: e.target.files[0],
                    }))
                  }
                  className="p-2 rounded border bg-gray-50 text-gray-800 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                />
              </div>

              {/* Receiver Name */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">
                  Receiver Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newTransaction.name || ""}
                  onChange={handleTransactionChange}
                  className="p-2 rounded border bg-gray-50 text-gray-800 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                />
              </div>

              {/* Receiver Account */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">
                  Receiver Account
                </label>
                <input
                  type="text"
                  name="account"
                  value={newTransaction.account || ""}
                  onChange={handleTransactionChange}
                  className="p-2 rounded border bg-gray-50 text-gray-800 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  name="description"
                  value={newTransaction.description}
                  onChange={handleTransactionChange}
                  className="p-2 rounded border bg-gray-50 text-gray-800 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                />
              </div>

              {/* Buttons */}
              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={resetTransactionForm}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400  dark:hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  {editingTransaction ? "Save Changes" : "Add Transaction"}
                </button>
              </div>
            </form>
          )}

          {/* 🔁 Self Transfer Form */}
          {showTransferForm && (
            <form
              onSubmit={handleTransferBetweenAccounts}
              className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">From Account</label>
                <select
                  name="fromAccountId"
                  value={transferData.fromAccountId}
                  onChange={handleTransferChange}
                  required
                  className="p-2 rounded border bg-gray-50 text-gray-800 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                >
                  <option value="">Select Source</option>
                  {accounts.map((a) => (
                    <option key={a.bankAccountId} value={a.bankAccountId}>
                      {a.accountName} ({a.accountNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">To Account</label>
                <select
                  name="toAccountId"
                  value={transferData.toAccountId}
                  onChange={handleTransferChange}
                  required
                  className="p-2 rounded border bg-gray-50 text-gray-800 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                >
                  <option value="">Select Destination</option>
                  {accounts.map((a) => (
                    <option key={a.bankAccountId} value={a.bankAccountId}>
                      {a.accountName} ({a.accountNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={transferData.amount}
                  onChange={handleTransferChange}
                  required
                  className="p-2 rounded border bg-gray-50 text-gray-800 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">
                  Receipt Image
                </label>
                <input
                  type="file"
                  name="receiptImage"
                  accept="image/*"
                  onChange={(e) =>
                    setTransferData((prev) => ({
                      ...prev,
                      receiptImage: e.target.files[0],
                    }))
                  }
                  className="p-2 rounded border bg-gray-50 text-gray-800 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                />
              </div>

              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  name="description"
                  value={transferData.description}
                  onChange={handleTransferChange}
                  className="p-2 rounded border bg-gray-50 text-gray-800 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferForm(false)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                >
                  Transfer
                </button>
              </div>
            </form>
          )}
          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-gray-600 dark:text-gray-400 uppercase tracking-wider text-xs">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">From</th>
                  <th className="p-4 font-semibold">To</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold text-right">Amount</th>
                  <th className="p-4 font-semibold">Description</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {transactions.length > 0 ? (
                  transactions.map((t) => {
                    return (
                      <tr key={t.transactionId}>
                        <td className="p-4">
                          {new Date(t.transactionDate).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          {t?.bankAccount?.accountName || "-"}
                        </td>
                        <td className="p-4">{t?.name}</td>
                        <td className="p-4 font-medium">{t.type}</td>
                        <td className="p-4 text-right font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(t.amount, t.currency)}
                        </td>
                        <td className="p-4">{t.description || "-"}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedTransaction(t)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg 
            bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
                          >
                            <ListPlus className="w-4 h-4 mr-1" />
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {selectedTransaction && (
        <TransactionDetailPopup tx={selectedTransaction} />
      )}
    </div>
  );
}
