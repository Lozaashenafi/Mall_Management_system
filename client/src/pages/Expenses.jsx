import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Pencil, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getExpenses,
  createExpense,
  deleteExpense,
  updateExpense,
} from "../services/expenseService";
import { useAuth } from "../context/AuthContext";

export default function Expenses() {
  const { user } = useAuth();

  const utilityTypes = [
    "Generator",
    "Water",
    "Electricity",
    "Service",
    "Other",
  ];
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [detailExpense, setDetailExpense] = useState(null);

  const [expenses, setExpenses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    type: "",
    description: "",
    amount: "",
    date: "",
    invoice: null,
  });

  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editExpense, setEditExpense] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const expensesPerPage = 5;

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch (err) {
      toast.error("Failed to fetch expenses");
      console.error(err);
    }
  };

  // Input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewExpense((prev) => ({ ...prev, invoice: e.target.files[0] }));
  };

  // Add Expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("type", newExpense.type);
      formData.append("description", newExpense.description);
      formData.append("amount", parseFloat(newExpense.amount) || 0);
      formData.append("date", new Date(newExpense.date).toISOString());
      formData.append("createdBy", user.userId);
      if (newExpense.invoice) formData.append("invoice", newExpense.invoice);

      const res = await createExpense(formData);
      setExpenses((prev) => [res.expense, ...prev]);
      setNewExpense({
        type: "",
        description: "",
        amount: "",
        date: "",
        invoice: null,
      });
      setShowAddForm(false);
      toast.success(res.message || "Expense added!");
    } catch (err) {
      toast.error(err.message || "Failed to add expense");
      console.error(err);
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this expense?"
    );
    if (!confirm) return;
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.expenseId !== id));
      toast.success("Expense deleted!");
    } catch (err) {
      toast.error("Failed to delete expense");
      console.error(err);
    }
  };

  // Edit Expense
  const handleEditClick = (expense) => {
    setEditExpense({
      ...expense,
      date: expense.date.split("T")[0],
      invoice: null,
    });
    setShowEditPopup(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditExpense((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("type", editExpense.type);
      formData.append("description", editExpense.description);
      formData.append("amount", parseFloat(editExpense.amount) || 0);
      formData.append("date", new Date(editExpense.date).toISOString());
      if (editExpense.invoice) formData.append("invoice", editExpense.invoice);

      const res = await updateExpense(editExpense.expenseId, formData);
      setExpenses((prev) =>
        prev.map((exp) =>
          exp.expenseId === editExpense.expenseId ? res.expense : exp
        )
      );
      setShowEditPopup(false);
      toast.success(res.message || "Expense updated!");
    } catch (err) {
      toast.error(err.message || "Failed to update expense");
      console.error(err);
    }
  };
  const handleViewDetail = (expense) => {
    setDetailExpense(expense);
    setShowDetailPopup(true);
  };

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
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500 transition-colors"
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
              name="type"
              value={newExpense.type}
              onChange={handleInputChange}
              required
              className="col-span-1 md:col-span-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            >
              <option value="">Select Type</option>
              {utilityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
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
                  onChange={(e) => {
                    handleFileChange(e);
                    setNewExpense((prev) => ({
                      ...prev,
                      invoice: e.target.files[0],
                    }));
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="submit"
              className="col-span-1 md:col-span-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
            >
              Save Expense
            </button>
          </form>
        </div>
      )}

      {/* Expense List */}
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
                  <td className="p-3 font-medium">{exp.type}</td>
                  <td className="p-3">{exp.description}</td>
                  <td className="p-3">${exp.amount.toFixed(2)}</td>
                  <td className="p-3">
                    {new Date(exp.date).toLocaleDateString()}
                  </td>

                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleEditClick(exp)}
                      className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(exp.expenseId)}
                      className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleViewDetail(exp)}
                      className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-green-600"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
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

      {/* Edit Expense Popup */}
      {showEditPopup && editExpense && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 dark:bg-black/60 bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Edit Expense</h2>
            <form onSubmit={handleEditSave} className="space-y-4">
              <select
                name="type"
                value={editExpense.type}
                onChange={handleEditChange}
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              >
                <option value="">Select Type</option>
                {utilityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="description"
                value={editExpense.description}
                onChange={handleEditChange}
                placeholder="Description"
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              />
              <input
                type="number"
                name="amount"
                value={editExpense.amount}
                onChange={handleEditChange}
                placeholder="Amount"
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              />
              <input
                type="date"
                name="date"
                value={editExpense.date}
                onChange={handleEditChange}
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              />
              <div>
                <label className="block text-sm font-medium mb-1">
                  Invoice
                </label>
                <label className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                  📎{" "}
                  {newExpense.invoice
                    ? newExpense.invoice.name
                    : "Choose Invoice"}
                  <input
                    type="file"
                    name="invoice"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      handleFileChange(e);
                      setNewExpense((prev) => ({
                        ...prev,
                        invoice: e.target.files[0],
                      }));
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {editExpense.invoice &&
                typeof editExpense.invoice === "string" && (
                  <a
                    href={`http://localhost:3000/${editExpense.invoice}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View current invoice
                  </a>
                )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditPopup(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDetailPopup && detailExpense && (
        <div className="fixed inset-0 flex items-center justify-center  bg-black/50 dark:bg-black/60 bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Expense Details</h2>

            <p>
              <strong>Type:</strong> {detailExpense.type}
            </p>
            <p>
              <strong>Description:</strong> {detailExpense.description}
            </p>
            <p>
              <strong>Amount:</strong> ${detailExpense.amount.toFixed(2)}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(detailExpense.date).toLocaleDateString()}
            </p>

            {detailExpense.invoice && (
              <div className="mt-3">
                <strong>Invoice:</strong>
                {detailExpense.invoice.endsWith(".pdf") ? (
                  <a
                    href={`http://localhost:3000/${detailExpense.invoice}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline ml-2"
                  >
                    View PDF
                  </a>
                ) : (
                  <img
                    src={`http://localhost:3000/${detailExpense.invoice}`}
                    alt="Invoice"
                    className="w-full mt-2 rounded border"
                  />
                )}
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowDetailPopup(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800"
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
