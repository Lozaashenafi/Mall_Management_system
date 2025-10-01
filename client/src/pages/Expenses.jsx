import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Pencil } from "lucide-react";
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

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([
    { id: 1, name: "Utilities" },
    { id: 2, name: "Maintenance" },
    { id: 3, name: "Supplies" },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: "",
    description: "",
    amount: "",
    date: "",
  });
  const [newCategory, setNewCategory] = useState("");

  // Edit popup state
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editExpense, setEditExpense] = useState(null);

  // Pagination
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

  // Add Expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const expenseToAdd = {
        ...newExpense,
        amount: parseFloat(newExpense.amount) || 0,
        recordedBy: user.userId,
        date: new Date(newExpense.date).toISOString(),
      };
      const res = await createExpense(expenseToAdd);
      setExpenses((prev) => [res.expense, ...prev]);
      setNewExpense({ category: "", description: "", amount: "", date: "" });
      setShowAddForm(false);
      toast.success(res.message || "Expense added!");
    } catch (err) {
      toast.error(err.message || "Failed to add expense");
      console.error(err);
    }
  };

  // Add Category
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    const newId = categories.length + 1;
    setCategories((prev) => [...prev, { id: newId, name: newCategory }]);
    setNewCategory("");
    toast.success("Category added!");
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
      date: expense.date.split("T")[0], // format for input[type=date]
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
      const updatedData = {
        category: editExpense.category,
        description: editExpense.description,
        amount: parseFloat(editExpense.amount) || 0,
        date: new Date(editExpense.date).toISOString(),
      };

      const res = await updateExpense(editExpense.expenseId, updatedData);
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

  // Pagination logic
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
            {/* Category Dropdown */}
            <div className="flex gap-2 col-span-1 md:col-span-2">
              <select
                name="category"
                value={newExpense.category}
                onChange={handleInputChange}
                required
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="New Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-500"
              >
                Add
              </button>
            </div>

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
                <th className="p-3">Category</th>
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
                  <td className="p-3 font-medium">{exp.category}</td>
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Edit Expense</h2>
            <form onSubmit={handleEditSave} className="space-y-4">
              <select
                name="category"
                value={editExpense.category}
                onChange={handleEditChange}
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
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
    </div>
  );
}
