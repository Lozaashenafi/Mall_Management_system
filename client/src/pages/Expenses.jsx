import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Pencil, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getExpenses,
  createExpense,
  deleteExpense,
  updateExpense,
  getUtilityTypes,
} from "../services/expenseService";
import { getBankAccounts } from "../services/bankService";
import { useAuth } from "../context/AuthContext";

export default function Expenses() {
  const { user } = useAuth();

  const [utilityTypes, setUtilityTypes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [newExpense, setNewExpense] = useState({
    utilityTypeId: "",
    description: "",
    amount: "",
    date: "",
    invoice: null,
    bankAccountId: "",
    receiverName: "",
    receiverAccount: "",
  });

  const [detailExpense, setDetailExpense] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const expensesPerPage = 5;
  const fetchBankAccounts = async () => {
    try {
      const res = await getBankAccounts(); // call your API
      setBankAccounts(res || []);
    } catch (err) {
      toast.error("Failed to fetch bank accounts");
      console.error(err);
    }
  };

  // Fetch expenses and utility types
  useEffect(() => {
    fetchUtilityTypes();
    fetchBankAccounts();
    fetchExpenses();
  }, []);

  const fetchUtilityTypes = async () => {
    try {
      const res = await getUtilityTypes();
      console.log(res);
      setUtilityTypes(res.utilityTypes || []);
    } catch (err) {
      toast.error("Failed to fetch utility types");
      console.error(err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const data = await getExpenses();
      console.log(data);
      setExpenses(data);
    } catch (err) {
      toast.error("Failed to fetch expenses");
      console.error(err);
    }
  };
  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("utilityTypeId", newExpense.utilityTypeId);
      formData.append("description", newExpense.description);
      formData.append("amount", parseFloat(newExpense.amount) || 0);
      formData.append("date", new Date(newExpense.date).toISOString());
      formData.append("createdBy", user.userId);
      formData.append("bankAccountId", newExpense.bankAccountId); // <-- add this
      formData.append("receiverName", newExpense.receiverName || "");
      formData.append("receiverAccount", newExpense.receiverAccount || "");
      if (newExpense.invoice) formData.append("invoice", newExpense.invoice);

      const res = await createExpense(formData);
      setExpenses((prev) => [res.expense, ...prev]);
      setNewExpense({
        utilityTypeId: "",
        description: "",
        amount: "",
        date: "",
        invoice: null,
        bankAccountId: "", // reset after submit
        receiverName: "",
        receiverAccount: "",
      });
      setShowAddForm(false);
      toast.success(res.message || "Expense added!");
    } catch (err) {
      toast.error(err.message || "Failed to add expense");
      console.error(err);
    }
  };

  // Input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewExpense((prev) => ({ ...prev, invoice: e.target.files[0] }));
  };

  // View details
  const handleViewDetail = (expense) => {
    setDetailExpense(expense);
    setShowDetailPopup(true);
  };

  // Pagination
  const indexOfLast = currentPage * expensesPerPage;
  const indexOfFirst = indexOfLast - expensesPerPage;
  const currentExpenses = expenses.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(expenses.length / expensesPerPage);

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expense Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track and manage all recorded expenses
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          {showAddForm ? "Cancel" : "Add Expense"}
        </button>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">New Expense</h2>
          <form
            onSubmit={handleAddExpense}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <select
              name="utilityTypeId"
              value={newExpense.utilityTypeId}
              onChange={handleInputChange}
              required
              className="col-span-1 md:col-span-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            >
              <option value="">Select Type</option>
              {utilityTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="description"
              placeholder="Description"
              value={newExpense.description}
              onChange={handleInputChange}
              required
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            />
            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={newExpense.amount}
              onChange={handleInputChange}
              required
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            />
            <input
              type="date"
              name="date"
              value={newExpense.date}
              onChange={handleInputChange}
              required
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            />
            <select
              name="bankAccountId"
              value={newExpense.bankAccountId}
              onChange={handleInputChange} // use the same handler
              required
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
            >
              <option value="">Select Bank Account</option>
              {bankAccounts.map((acc) => (
                <option key={acc.bankAccountId} value={acc.bankAccountId}>
                  {acc.bankName} - {acc.accountNumber}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="receiverName"
              placeholder="Receiver Name"
              value={newExpense.receiverName || ""}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
            />

            <input
              type="text"
              name="receiverAccount"
              placeholder="Receiver Account"
              value={newExpense.receiverAccount || ""}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md bg-white dark:bg-gray-800"
            />

            <div>
              <label className="block text-sm font-medium mb-1">Invoice</label>
              <label className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                📎{" "}
                {newExpense.invoice
                  ? newExpense.invoice.name
                  : "Choose Invoice"}
                <input
                  type="file"
                  name="invoice"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="submit"
              className="col-span-1 md:col-span-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
            >
              Save Expense
            </button>
          </form>
        </div>
      )}

      {/* Expense Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Expense List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3">Description</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentExpenses.map((exp) => (
                <tr
                  key={exp.expenseId}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="p-3 font-medium">{exp.utilityType?.name}</td>
                  <td className="p-3">{exp.description}</td>
                  <td className="p-3">${exp.amount.toFixed(2)}</td>
                  <td className="p-3">
                    {new Date(exp.date).toLocaleDateString()}
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleViewDetail(exp)}
                      className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-green-600"
                    >
                      <Eye className="w-4 h-4 text-indigo-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {showDetailPopup && detailExpense && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 dark:bg-black/60 z-50 p-4">
          {/* SMALL MODAL */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-6 text-center">
              Expense Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LEFT COLUMN */}
              <div className="space-y-3 text-gray-100">
                <div>
                  <p className="font-semibold text-gray-400">Type:</p>
                  <p>{detailExpense.utilityType?.name || detailExpense.type}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-400">Description:</p>
                  <p>{detailExpense.description}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-400">Amount:</p>
                  <p>${detailExpense.amount.toFixed(2)}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-400">Date:</p>
                  <p>{new Date(detailExpense.date).toLocaleDateString()}</p>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="flex flex-col items-center">
                <p className="font-semibold text-gray-400 mb-2">Invoice:</p>

                {detailExpense.invoice &&
                !detailExpense.invoice.endsWith(".pdf") ? (
                  <img
                    src={`http://localhost:3300/${detailExpense.invoice}`}
                    alt="Invoice"
                    className="max-h-[40vh] w-auto rounded-lg object-contain shadow-md"
                  />
                ) : (
                  <a
                    href={`http://localhost:3300/${detailExpense.invoice}`}
                    target="_blank"
                    className="text-indigo-500 underline"
                  >
                    View PDF
                  </a>
                )}
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowDetailPopup(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
