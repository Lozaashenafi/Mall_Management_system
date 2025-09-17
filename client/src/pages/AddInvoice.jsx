import { useState } from "react";
import { Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AddInvoice() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    agreementId: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date().toISOString().split("T")[0],
    baseRent: "",
    taxPercentage: "",
    status: "Pending",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const taxAmount = (formData.baseRent * formData.taxPercentage) / 100;
    const totalAmount = parseFloat(formData.baseRent) + taxAmount;
    console.log("Invoice Added:", { ...formData, taxAmount, totalAmount });

    // 🚀 Replace with API call
    // await axios.post("/api/invoices", { ...formData, taxAmount, totalAmount });

    navigate("/manage-invoices");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-gray-900 dark:text-gray-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Invoice</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Fill in invoice details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Agreement ID</label>
          <input
            type="number"
            name="agreementId"
            value={formData.agreementId}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Invoice Date
            </label>
            <input
              type="date"
              name="invoiceDate"
              value={formData.invoiceDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Base Rent</label>
            <input
              type="number"
              name="baseRent"
              value={formData.baseRent}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Tax Percentage (%)
            </label>
            <input
              type="number"
              name="taxPercentage"
              value={formData.taxPercentage}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate("/payments")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-500"
          >
            <Save className="w-4 h-4" /> Create Invoice
          </button>
        </div>
      </form>
    </div>
  );
}
