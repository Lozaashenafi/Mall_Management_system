import { useState } from "react";
import { Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AddPayment() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    invoiceId: "",
    paymentDate: new Date().toISOString().split("T")[0],
    amountPaid: "",
    method: "Cash",
    lateFee: "",
    status: "Completed",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Payment Added:", formData);

    // 🚀 Replace with API call
    // await axios.post("/api/payments", formData);

    navigate("/manage-payments");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-gray-900 dark:text-gray-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add Payment</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Fill in payment details for the invoice
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Invoice ID</label>
          <input
            type="number"
            name="invoiceId"
            value={formData.invoiceId}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Date
            </label>
            <input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Amount Paid
            </label>
            <input
              type="number"
              name="amountPaid"
              value={formData.amountPaid}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Method
            </label>
            <select
              name="method"
              value={formData.method}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-800"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Late Fee (optional)
            </label>
            <input
              type="number"
              name="lateFee"
              value={formData.lateFee}
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
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
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
            <Save className="w-4 h-4" /> Add Payment
          </button>
        </div>
      </form>
    </div>
  );
}
